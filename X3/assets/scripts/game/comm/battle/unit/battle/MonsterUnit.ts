import { Vec2, v2 } from "cc";
import { MonsterType, UnitType, WorldUnitTeam } from "../../enum/BattleEnum";
import { BattleUnit } from "./BattleUnit";
import { IResourceParam } from "../../interface/BattleInterface";
import { MathUtils } from "../../../../../core/utils/MathUtils";
import BattleConstantConfig from "../../config/BattleConstantConfig";
import { BattleManager } from "../../BattleManager";
import { IBattleUnitData } from "../../../../modules/battle/vo/IBattleUnitData";
import { DamageVo } from "../../DamageVo";
import { BattleDebugManager } from "../../BattleDebugManager";
import { Graphics } from "cc";
import { BattleUtils } from "../../BattleUtils";
import { AbnormalType, EffectLayer, SkillEffectPos } from "../../skill/SkillEnum";
import { BattleCommandType } from "../../BattleCommand";
import { ISummonData } from "./ISummonData";
import { Handler } from "../../../../../core/utils/Handler";
import { FightType } from "../../enum/FightType";
import { MonsterShowUnit } from "../../show/MonsterShowUnit";
import FacadeManager from "../../../../../core/mvc/FacadeManager";
import NotificationKey from "../../../../event/NotificationKey";
import { MonsterBattleAttr } from "../../attribute/MonsterBattleAttr";
import { TableManager } from "db://assets/scripts/core/table/TableManager";
import { MonsterEcapeComp } from "./comp/MonsterEcapeComp";

export class MonsterUnit extends BattleUnit implements IResourceParam {
    protected _type: UnitType = UnitType.Monster;
    private _cfg: table.monster.MonsterAttributeConfig;

    protected _originPos: Vec2 = v2();

    /***IResourceParam */
    public resourceId: number;
    public resourceIdx: number;
    /***是否首杀过 */
    public firstKill: boolean = false;
    /***掉落奖励 */
    public dropRewards: { itemId: any, num: number }[];
    private randomMoveIndex: number = -1

    protected _attr: MonsterBattleAttr;
    /***受击掉落标记表 */
    private dropHurtMap: { [hp: number]: { items: number[], isDrop: boolean } };
    /***逃跑组件 */
    private ecapeComp: MonsterEcapeComp;

    /**初始化怪物数据 */
    init(data: table.monster.MonsterAttributeConfig, battleData?: IBattleUnitData, attr?: { [key: number]: number }) {
        this.initRandomMoveTime()
        this._cfg = data;
        if (battleData && battleData.resourceId) {
            this.resourceId = battleData.resourceId
        }
        if (battleData && battleData.resourceIdx) {
            this.resourceIdx = battleData.resourceIdx
        }

        if (!this._attr)
            this._attr = new MonsterBattleAttr(this);
        if (attr)//直接使用属性
            this._attr.initByMonsterAttr(data, attr);
        else
            this._attr.initByMonster(data, battleData);
        this._originPos.set(this._pos);
        this.disposeDelayTime = 2500;
        this.initModelCfg(data.modelId)
        this.initDropByHurt()
        this.initComps();
    }

    protected initComps(): void {
        let exCfg = TableManager.getDataById(table.monster.MonsterExConfig, this._cfg.id)
        if (exCfg?.escapeHurtNum)
            this.ecapeComp = this.addComps(new MonsterEcapeComp(this, exCfg.escapeTime, exCfg.escapeHurtNum, exCfg.escapeSpeed));
    }

    /***是否算作1个英雄 */
    public isHero(): boolean {
        return this.attr.heroId > 0
    }


    get attr() {
        return this._attr;
    }

    /***可触发超过仇恨范围回阵容的时间间隔（帧） */
    protected hateToMoveFormation: number = 0;
    protected updateHateTime(): void {
    }

    /**移动距离 */
    get moveDistance() {
        if (this._cfg.noMove)
            return 0;
        return this._attr.moveSpeed * BattleUtils.frameDeltaMs;
    }

    /***判断路径位移 */
    protected checkPathMove(): void {
        if (this._cfg.noMove)
            return
        super.checkPathMove()
    }

    get cfg(): table.monster.MonsterAttributeConfig {
        return this._cfg
    }

    /***种族 */
    public get camp(): number {
        return this._cfg.camp;
    }

    /***是否飞行单位 */
    get isFlyUnit(): boolean {
        return this._cfg.isFly
    }

    get isBoss(): boolean {
        return this._cfg.monsterType == MonsterType.Boss
    }

    get monsterType() {
        return this._cfg.monsterType;
    }

    public searchRange() {
        if (this.battleLogic.monsterHateInfinite && this.isBeginToFight) {
            return Number.MAX_SAFE_INTEGER;
        }
        if (this.battleLogic.mapCfg.monsterSearchRange) {
            return this.battleLogic.mapCfg.monsterSearchRange + this.battleLogic.buffMgr.getSearchRange(this);
        }
        return super.searchRange();
    }

    /**仇恨距离 */
    get hateDistance() {
        if (this.battleLogic.monsterHateInfinite)
            return Number.MAX_SAFE_INTEGER;
        if (this.battleLogic.battleSetting.infiniteHate)
            return Number.MAX_SAFE_INTEGER;
        return BattleConstantConfig.monsterHateMaxRadius;
    }

    /**仇恨计算原点 */
    get originPos(): Vec2 {
        if (this.summon) {
            if (!this.summonOriginPosVec)
                this.summonOriginPosVec = v2(0, 0)
            let summonParentOwner = this.battleLogic.getUnitByUid(this.summon.byUid)
            if (summonParentOwner)
                return this.summonOriginPosVec.set(summonParentOwner.pos.x + this.summonRandomX, summonParentOwner.pos.y + this.summonRandomY)
        }
        return this._originPos;
    }

    get formationPos() {
        return this._originPos;
    }

    /***处理怪物的属性修正值 */
    public initAttrMod(): void {
        if (!this._attr)
            this._attr = new MonsterBattleAttr(this);

        if (this.battleLogic.battleCfg) {
            this._attr.setAttrMod(this.battleLogic.battleCfg.atkMod, this.battleLogic.battleCfg.defMod, this.battleLogic.battleCfg.hpMod, this.battleLogic.battleCfg.secondAttrAddition)
        }
    }

    protected debugGraphics2: Graphics
    /**受击点 */
    get hurtPoint() {
        let x = this.pos.x + this.modelFixX * this.scaleX;
        let y = this.pos.y + this.modelFixY * this.scaleY + this.modelHeight * 0.5;
        if (this._cfg.hurtPoint) {
            x += +this._cfg.hurtPoint.x || 0;
            y += +this._cfg.hurtPoint.y || 0;
        }
        // if (BattleDebugManager.ins().isDebug)
        //     this.debugGraphics2 = WorldManager.ins().effectLayer.addComponent(Graphics)

        // if (this.debugGraphics2) {
        //     let g = this.debugGraphics2
        //     g.clear()
        //     g.lineWidth = 5;
        //     g.strokeColor.fromHEX('#ffff00')
        //     g.circle(p.x, p.y, 10)
        //     g.stroke();
        //     g.fill();
        // }
        return v2(x, y);
    }

    /***召唤物是否受父类的移动控制 */
    public summonIsCtrlMove: boolean = true;
    private summonMoveIndex: number = 0;
    /***是否回到原地，是的话会不断闪避直到回到原点为止 */
    private isMoveToFormation: boolean = false;
    /**向阵位移动 */
    moveToFormation(force: boolean = false): void {
        if (!this.summon && this.battleLogic.battleSetting.isStaticCreate)
            return

        if (this.summon && !this.summonIsCtrlMove)
            return

        if (this.ecapeComp?.esapeing) {
            //逃跑中的怪物不会阵营
            return
        }

        let dis = Vec2.distance(this.originPos, this._pos);
        if (this.summon) {
            if (dis > 20) {
                if (this.summonMoveIndex == 0) {
                    this.summonMoveIndex = 10;
                    let radians = MathUtils.getRadians(this._pos.x, this._pos.y, this.originPos.x, this.originPos.y);
                    let moveDistance = Math.min(this.moveDistance, dis);
                    let tempVec = MathUtils.tempVec2(moveDistance * Math.cos(radians), moveDistance * Math.sin(radians))
                    this._moveVec.sustainVec.set(tempVec.x, tempVec.y)
                }
                this._moveVec.setMoveVec(this._moveVec.sustainVec);
                this.summonMoveIndex--
                if (force) {
                    this.forceMovePathHandler();
                }
            }
            else {
                this.summonMoveIndex = 0;
            }
        }
        else {
            if (dis > 50 && !this.isRandomMove) {
                if (force) {
                    //无敌且回满血
                    this.isMoveToFormation = true;
                }
                this._attr.heal(this._attr.maxHp);
                //this.battleLogic.effectMgr.createNum(HurtNumType.Heal, this._attr.maxHp, this.pos, this.hurtNumHight);
                this.updateHpBar()
                let percent = (this.isMoveToFormation ? this.moveDistance * 2 : this.moveDistance) / dis;
                let tempVec2 = MathUtils.tempVec2((this.originPos.x - this._pos.x) * percent, (this.originPos.y - this._pos.y) * percent);
                this._moveVec.setMoveVec(tempVec2);
                if (force) {
                    this.forceMovePathHandler();
                }
            }
            this.isMoveToFormation = false;
            this.checkRandomMove()
        }
    }

    private checkRandomMove(): void {
        if (this.randomMoveIndex == 0) {
            this.initRandomMoveTime()
            this.moveToRandomPos();
        }
        this.randomMoveIndex--;
    }

    /**设置异常状态 */
    public setAbnormalStatus(type: AbnormalType, param?: any) {
        if (this.isMoveToFormation)
            return
        super.setAbnormalStatus(type, param)
    }

    protected initRandomMoveTime(): void {
        this.randomMoveIndex = BattleUtils.getFrameByTime(this.battleLogic.randomMgr.randomInt(BattleConstantConfig.monsterRandomMoveMinTime, BattleConstantConfig.monsterRandomMoveMaxTime))
    }

    private isRandomMove: boolean = false;
    /***移动到附近1个坐标 */
    private moveToRandomPos() {
        if (this.cfg.noFreeMove)
            return
        if (this.battleLogic.isStopFightAi)
            return
        if (this.battleLogic.unitCollisionsManager.isInBlock(this.pos))
            return
        let range = BattleConstantConfig.monsterRandomMoveRange;
        let tryTimes = 5;
        while (--tryTimes > 0) {
            let newPos = this.battleLogic.randomMgr.createRandomCoordinate(this.originPos, range.w, range.h, range.a)
            if (!this.battleLogic.unitCollisionsManager.isInBlock(newPos)) {
                let b = this.setMoveTarget(newPos, true)
                if (b != 0 && b != -1) {
                    this.isRandomMove = true
                    this.checkPathMove()
                    break
                }
            }
        }
    }

    /***进入战斗 */
    public enterFight(): boolean {
        if (this.isBeginToFight)
            return false
        let b = super.enterFight(false);
        this.isRandomMove = false
        return b;
    }

    /****是否能收到伤害 */
    public canBeHurt(): boolean {
        let b = super.canBeHurt()
        if (this.isMoveToFormation) {
            return false
        }
        return b;
    }

    /***检查是否进入战斗 */
    public checkEnterFight(): void {
        if (!this.isMoveToFormation)
            super.checkEnterFight()
    }

    /**修正移动位置 */
    onBeforUpdatePos(): void {
        let b = false
        if (this.summon) {
            //召唤物要判断主人是否进战
            let unit = this.battleLogic.getBatteUintByUid(this.summon.byUid)
            if (unit) {
                if (!unit.isBeginToFight || !unit.selectHatredTarget || !unit.selectMainTarget || unit.getMoveVec().isCrtl) {
                    b = true;
                }
            }
        }

        if (b || !this._moveVec.isMoving && !this.isBeginToFight) {
            this.clearMainTarget()
            this.clearHatredTarget();
            this.moveToFormation();
        }
    }

    hurt(damageVo: DamageVo, hurterUid?: number) {
        if (this.isMoveToFormation)//回原地过程中无敌
            return
        super.hurt(damageVo, hurterUid)
        this.checkDropByHurt()
    }

    /***初始化受击掉落 */
    protected initDropByHurt(): void {
        let cfg = TableManager.getDataById(table.monster.MonsterDropConfig, this.cfg.dropModelId);
        if (cfg?.type == 2) {
            this.dropHurtMap = {}
            for (let hpKey in cfg.param) {
                this.dropHurtMap[hpKey] = { items: cfg.param[hpKey], isDrop: false };
            }
        }
    }

    /***是否存在收到伤害的掉落 */
    protected checkDropByHurt(): void {
        if (this.dropHurtMap) {
            let itemsIds: { itemId: any, num: number }[] = []
            for (let hpKey in this.dropHurtMap) {
                if (!this.dropHurtMap[hpKey]?.isDrop && this.attr.hpPercentage <= +hpKey) {
                    this.dropHurtMap[hpKey].isDrop = true;
                    let dropItems = this.dropHurtMap[hpKey].items;
                    for (let i = 0; i < dropItems.length; i++) {
                        itemsIds.push({ itemId: dropItems[i], num: 1 })
                    }
                }
            }

            if (itemsIds.length)
                BattleManager.ins().createSuperDrop(itemsIds, this.pos, 10000, true);
        }
    }

    private summonOriginPosVec: Vec2
    private summonRandomX: number = 0;//召唤物的初始坐标随机
    private summonRandomY: number = 0;
    public setSummonData(data: ISummonData): void {
        super.setSummonData(data)
        if (data) {
            if (data.possess) {
                this.envActive = false
                this.visible = false;
            }
            let target = this.battleLogic.getBatteUintByUid(this.summon.byUid)
            if (target.isToHide) {
                this.showUnit()?.setOtherVisible(false)
                this.showUnit()?.setAlpha(0);
            }
            else {
                this.showUnit()?.fadeIn(500);
            }
            this.summonRandomX = this.battleLogic.randomMgr.randomInt(-50, 50);
            this.summonRandomY = this.battleLogic.randomMgr.randomInt(-50, 50);
            this.showSummonEffect()
        }
    }

    private showSummonEffect(): void {

        if (this.summon.delay) {
            // this.showUnit()?.node.fadeIn(this.summon.delay)
            this.setAbnormalStatus(AbnormalType.notSelect);
            this.setAbnormalStatus(AbnormalType.NotMove);
            this.setAbnormalStatus(AbnormalType.NotAttack);
            this.battleLogic.createTimeCheck(this.summon.delay, new Handler(this, () => {
                if (!this.isDisposed) {
                    this.clearAbnormalStatus(AbnormalType.notSelect)
                    this.clearAbnormalStatus(AbnormalType.NotMove)
                    this.clearAbnormalStatus(AbnormalType.NotAttack)
                }
            }, null, false))
        }
    }

    protected updateOtherPos(): void {
        super.updateOtherPos();
        if (this.summon?.possess) {
            //附身召唤物跟随被附身的目标
            let target = this.battleLogic.getBatteUintByUid(this.summon.byUid)
            if (target)
                this.setPosXY(target.pos.x, target.pos.y)
            else if (!target || !target.isActive) {
                //不存在或者不活跃，自身也消失
                this.dispose()
            }
        }
    }

    /**死亡 */
    protected onDie(damageVo?: DamageVo): void {
        super.onDie(damageVo);
        this.drop();
        this.needDispose()
        if (this.summon?.possess) {
            //移除对应的附身BUFF
            let target = this.battleLogic.getBatteUintByUid(this.summon.byUid)
            if (target)
                target.attr.removeBuffById(this.summon.possess);
        }
    }

    /***获取当前绑定的对应显示单位，不一定有值 */
    public showUnit(): MonsterShowUnit {
        return super.showUnit() as MonsterShowUnit;
    }

    protected onRebirth(): void {
        super.onRebirth();
        this.showUnit()?.onRebirth();
    }

    /**掉落 */
    drop(unit: MonsterUnit = null) {
        if (this.splitMonsterDieFromUnit) {
            //这个怪的死亡是分裂怪引起的话，改成分裂怪的最后1个死亡掉落
            this.dropBySplitMonsterDie(this)
            return
        }

        if (this.summon)
            return

        let dropRewards = this.dropRewards;
        let resourceId = this.resourceId;
        let resourceIdx = this.resourceIdx;
        let dropModelId = this.cfg.dropModelId
        let firstKill = this.firstKill
        let cfgId = this.cfg.id
        let uid = this.uid
        if (unit) {
            dropRewards = unit.dropRewards;
            resourceId = unit.resourceId;
            resourceIdx = unit.resourceIdx;
            dropModelId = unit.cfg.dropModelId;
            firstKill = unit.firstKill;
            cfgId = unit.cfg.id;
            uid = unit.uid;
        }

        this.battleLogic.command.send(BattleCommandType.drop, uid)
        if (!this.battleLogic.isNotShowBattleEffect() && this.battleLogic.battleSetting.isCtrlMonsterDrop) {
            this.battleLogic.dropManager.pushDelayDropByMonsterId(cfgId)
        }
        else if (this.fightType == FightType.TRUNK_MAP && dropRewards?.length) {
            if (!firstKill) {
                if (!this.battleLogic.isNotShowBattleEffect())
                    BattleManager.ins().createSuperDrop(dropRewards, this.pos, 5000);
                BattleManager.ins().getDrop(resourceId, resourceIdx)
            }
        }
        else if (dropRewards?.length) {
            BattleManager.ins().createSuperDrop(dropRewards, this.pos, 5000);
            FacadeManager.ins().emit(NotificationKey.BATTLE_DROP, dropRewards);
        }
        else {
            if (dropModelId) {
                this.battleLogic.effectMgr.createDrop(dropModelId, 1, this.pos, this._attackerUid);
            }
            BattleManager.ins().getDrop(resourceId, resourceIdx)
        }
    }

    /***是分裂怪死亡的话回溯到最后1只死亡怪开始掉落 */
    protected dropBySplitMonsterDie(fatherUnit: MonsterUnit): void {
        if (this.splitMonsterDieFromUnit instanceof MonsterUnit) {
            this.splitMonsterDieFromUnit.dropBySplitMonsterDie(fatherUnit)
        }
        else {
            this.drop(fatherUnit);
        }
    }

    /***是否能脱战 */
    public canExitBattle(): boolean {
        if (this.isDeath)
            return true
        let b = this.isInBlock || (!this.selectHatredTarget && !this.isAttacking)
        if (this.battleLogic.fightType == FightType.TRUNK_MAP && b) {
            //主线地图，假如英雄全部死亡则不脱战
            let heros = this.battleLogic.getUnitsByTeamId(WorldUnitTeam.Self)
            let allDie = true
            for (let i = 0; i < heros.length; i++) {
                if (heros[i].attr.isAlive()) {
                    allDie = false
                    break
                }
            }
            if (allDie) {
                return false
            }
        }
        return b
    }

    /**是否能攻击 */
    protected canAttack(): boolean {
        return super.canAttack() && !this.isInBlock;
    }

    /**更新AI */
    protected updateAI() {
        if (BattleDebugManager.ins().isMonsterNotAttack)
            return

        //回原点过程不处理战斗逻辑
        if (this.isMoveToFormation)
            return

        super.updateAI()
    }

    /***脱离战斗 */
    public exitFight(): void {
        if (this.ecapeComp?.esapeing) {
            return
        }
        super.exitFight()
        if (this.isActive) {
            this.moveToFormation();
        }
    }

    protected markVerify(): void {
        if ((this.monsterType == MonsterType.Boss || this.monsterType == MonsterType.Elite) && !this.summon)
            this.battleLogic.markVerify(this);
    }

    /***强制移动路径的处理 */
    protected forceMovePathHandler(): void {
        if (this.ecapeComp?.esapeMoveing) {
            // this.ecapeComp.esapeMoveing = false;
            // this._originPos.set(this._pos);
            // this.moveToRandomPos();
            let newVec = this.battleLogic.unitCollisionsManager.getBlockNewVec(this.pos, this.ecapeComp.moveVec)
            if (newVec) {
                this.ecapeComp.moveVec = newVec
                this.setMoveVec(newVec)
            }
            return
        }
        super.forceMovePathHandler()
    }

    /****判断能否发动技能 */
    protected checkCanActivateSkills(): boolean {
        if (this.ecapeComp?.esapeing) {
            if (!this.ecapeComp.esapeMoveing) {
                this._originPos.set(this._pos);
                this.checkRandomMove()
            }
            return false;
        }
        let b = super.checkCanActivateSkills();
        return b;
    }
}
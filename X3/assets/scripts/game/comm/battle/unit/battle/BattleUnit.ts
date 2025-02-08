import { Vec2 } from "cc";
import { ActorState, DirctionType, WorldUnitTeam } from "../../enum/BattleEnum";
import { ActorUnit } from "../ActorUnit";
import { CollisionUtils } from "../../../math/CollisionUtils";
import { SkillUtils } from "../../skill/SkillUtils";
import { BattleAttr } from "../../attribute/BattleAttr";
import { ICaster } from "../../skill/ICaster";
import { AbnormalType, BuffEffectPos, BuffGroupFlagType, BuffType, LeaderSkillTriggerType as LeaderSkillTriggerType, PassivitySkillFlag, PassivitySkillType, SkillSubType, SkillTargetType, SkillType, TargetFaction } from "../../skill/SkillEnum";
import { SkillData } from "../../skill/SkillData";
import { PassivitySkillUtils } from "../../skill/PassivitySkillUtils";
import { ITarget } from "../../skill/ITarget";
import UnitSearchUtils from "../../collisions/UnitSearchUtils";
import { BattleUtils } from "../../BattleUtils";
import { SkillBuff } from "../../skill/SkillBuff";
import { MathUtils } from "../../../../../core/utils/MathUtils";
import { SkillBuffGroup } from "../../skill/SkillBuffGroup";
import { DamageVo } from "../../DamageVo";
import { SkillBehavior } from "../../skill/SkillBehavior";
import BattleConstantConfig from "../../config/BattleConstantConfig";
import { HeroCareerType } from "../../../../modules/hero/HeroEnum";
import { BattleDebugManager } from "../../BattleDebugManager";
import { AttrEnum } from "../../attribute/AttrEnum";
import { PointTarget } from "../../skill/PointTarget";
import { ISummonData } from "./ISummonData";
import { Handler } from "../../../../../core/utils/Handler";
import { FightTimeCheck } from "../../FightTimeCheck";
import { v2 } from "cc";
import { BattleCommandType } from "../../BattleCommand";
import { BattleShowUnit } from "../../show/BattleShowUnit";
import { TableManager } from "../../../../../core/table/TableManager";
import { SortUtils } from "../../../../../core/utils/SortUtils";
import GIns from "../../../../GIns";
import BattleTimer from "../../../../../core/timer/BattleTimer";
import { FightType } from "../../enum/FightType";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import NotificationKey from "../../../../event/NotificationKey";
import { BattleUnitComp } from "./comp/BattleUnitComp";


export class BattleUnit extends ActorUnit implements ICaster, ITarget {
    /**所属队伍Id */
    public teamId: number;
    /***当前的锁定目标 */
    public selectMainTarget: ITarget;
    /***存起来的仇恨目标 */
    public selectHatredTarget: ITarget;

    /**已经选择的技能 */
    public skillInfo: SkillData;
    /**主动选择的技能 */
    protected skillInfoCtrl: SkillData;

    protected _width = 60;
    protected _height = 60;

    protected _attr: BattleAttr;

    /***离攻击动作结束还有多少帧，0则表示可以攻击 */
    protected _attackEndTime: number = 0;


    /**攻击自己的人Uid */
    protected _attackerUid: number;
    /***分裂怪的召唤者 */
    public splitMonsterFatherUid: number
    /***分裂怪数量 */
    protected splitMonsterNum: number = 0

    /***是否重新进入战斗 */
    public isBeginToFight: boolean = false;
    /***是否自动战斗 */
    public isAutoFight: boolean = true;
    /***是否结束战斗，如回城的时候暂停所有动作 */
    protected isEndFight: boolean = false
    /***是否幽灵角色，只会移动不会被打和打别人 */
    public isGhost: boolean = false;

    /***延迟销毁模型的时间 */
    protected disposeDelayTime: number = 0;

    protected _envActive: boolean = true;

    /***阵位 */
    public formationPosition: number;
    /***服务器阵位 */
    public formationPositionByServer: number;
    /***是否召唤物 */
    public summon: ISummonData;
    /***是否不统计血量 */
    public isNotStatisticsHp: boolean = false;

    /***仇恨分组 */
    public hatredGroup: number = 0;

    protected modelCfg: table.model.ModelConfig;
    public modelFixX: number = 1;
    public modelFixY: number = 1;
    public modelHeight: number = 100;

    /***是否调用过隐藏中 */
    public isToHide: boolean = false
    /***助攻数，key是助攻这的uid,值是造成伤害的帧 */
    protected assistUidMap: { [uid: number]: number } = {}

    protected comps: BattleUnitComp[];

    constructor () {
        super();
        this._width = BattleConstantConfig.unitCollisionWidth;
        this._height = BattleConstantConfig.unitCollisionHeight;
        this.hateToMoveFormation = BattleConstantConfig.heroHateMaxRadiusTime
    }

    public addComps<T extends BattleUnitComp>(comp: T): T {
        if (!this.comps)
            this.comps = []
        this.comps.push(comp)
        return comp
    }

    public checkComps(checkFlag: string, ...arg): void {
        if (this.comps) {
            for (let i = 0; i < this.comps.length; i++) {
                if (this.comps[i][checkFlag]) {
                    (this.comps[i][checkFlag] as Function).call(this.comps[i], ...arg)
                }
            }
        }
    }

    public updateComps(): void {
        if (this.comps) {
            for (let i = 0; i < this.comps.length; i++) {
                this.comps[i].update();
            }
        }
    }

    protected initModelCfg(modelId: number): void {
        this.modelCfg = TableManager.getDataById(table.model.ModelConfig, modelId)
        this.modelFixX = this.modelCfg.pos?.x || 0;
        this.modelFixY = this.modelCfg.pos?.y || 0;
        this.scaleX = this.modelCfg.scale?.scaleX || 1;
        this.scaleY = this.modelCfg.scale?.scaleY || 1;
    }

    public getSummonParentUnit(): BattleUnit {
        if (this.summon && this.summon.byUid) {
            return this.battleLogic.getBatteUintByUid(this.summon.byUid);
        }
        return null;
    }

    get isSummon(): number {
        return this.summon ? 1 : 0;
    }

    get casterUid() {
        return this._uid;
    }

    /***种族 */
    public get camp(): number {
        return 0;
    }

    /***职业 */
    public get career(): number {
        return 0;
    }

    /***性别 */
    public get sex(): string {
        return null;
    }

    /***近战远程 */
    public getAttackRange(): string {
        return ""
    }

    /***是否拥有移动攻击的特性 */
    public get isMoveAttack(): boolean {
        if (this.career == HeroCareerType.HeavyCavalry && this._attr.getPassiveSkillFlag(PassivitySkillFlag.PRider_Collision_s01)) {
            //坐骑拥有冲锋被动相当于拥有移动攻击特性
            return true;
        }
        else if (this._attr.getPassiveSkillFlag(PassivitySkillFlag.PMove_Attack_s01)) {
            //其他职业拥有移动攻击被动则可以移动攻击
            return true;
        }
        return false;
    }

    get hpMax() {
        return this._attr.maxHp;
    }

    get hp() {
        return this._attr.hp;
    }

    get hpPercen() {
        return this._attr.hp / this._attr.maxHp;
    }

    get attr() {
        return this._attr;
    }

    get atk() {
        return this.getAttrValue(AttrEnum.ATK)
    }

    /***初始攻击力 */
    get atkInit() {
        return this.attr.attrs[AttrEnum.ATK]
    }

    get def() {
        return this.getAttrValue(AttrEnum.DEF);
    }

    /**
    * 攻速系数 (每秒攻击次数)
    */
    get atkTimeScale() {
        return this._attr.atkTimeScale;
    }

    get isAttacking() {
        return this._attackEndTime// && this._attackEndTime > TimeManager.battleNow;
    }

    get isActive() {
        return !this.isDisposed && this.attr?.isAlive();
    }

    get isDeath() {
        return this.attr?.isDeath();
    }

    /** 是否受环境影响 */
    get envActive() {
        if (GIns.battleDebugMgr.isNotEnvActive)
            return false
        return this._envActive;
    }

    /** 是否受环境影响 */
    set envActive(v: boolean) {
        this._envActive = v;
    }

    /**索敌范围 */
    public searchRange() {
        return this._attr.searchRange + this.battleLogic.buffMgr.getSearchRange(this);
    }

    /**移动距离 */
    get moveDistance() {
        return this._attr.moveSpeed * BattleUtils.frameDeltaMs;
    }

    /**仇恨距离 */
    get hateDistance() {
        return 600;
    }

    /**攻击点 */
    get atkPoint() {
        if (this.skillInfo && this.skillInfo.atkPoint) {
            let atkPoint = this.isAttackBack ? this.skillInfo.atkPointBack : this.skillInfo.atkPoint
            if (this.atkPointRotate != 0) {
                let dis = Math.abs(atkPoint.x)
                let angle = this._dirction == -1 ? (-this.atkPointRotate + 180) : this.atkPointRotate
                let p = MathUtils.getCoordinates(angle, dis) as Vec2
                p.y += atkPoint.y;
                return this.changeAtkPoint(p)
            }
            else {
                return this.changeAtkPoint(atkPoint);
            }
        }
        else
            return this.pos;
    }

    getAtkPoint(isAttackBack: boolean, dirction: DirctionType = null, atkPointRotate: number = 0) {
        if (this.skillInfo && this.skillInfo.atkPoint) {
            let atkPoint = isAttackBack ? this.skillInfo.atkPointBack : this.skillInfo.atkPoint
            if (atkPointRotate != 0) {
                let dis = Math.abs(atkPoint.x)
                let angle = (dirction == null ? this._dirction : dirction) == -1 ? (-atkPointRotate + 180) : atkPointRotate
                let p = MathUtils.getCoordinates(angle, dis) as Vec2
                p.y += atkPoint.y;
                return this.changeAtkPoint(p, dirction)
            }
            else {
                return this.changeAtkPoint(atkPoint, dirction);
            }
        }
        else
            return this.pos;
    }

    /***通过配置的左边转换攻击点左边 */
    protected changeAtkPoint(point: Vec2, dirction: DirctionType = null): { x: number, y: number } {
        let offsetX = point.x;
        let offsetY = point.y;

        offsetX = ((offsetX * this.scaleX + this.modelFixX) * ((dirction == null ? this.dirction : dirction) == DirctionType.Rigth ? 1 : -1)) + this.pos.x;
        offsetY = ((offsetY * this.scaleY + this.modelFixY)) + this.pos.y;
        return { x: offsetX, y: offsetY };
    }

    /**受击点 */
    get hurtPoint() {
        let x = this.pos.x + this.modelFixX * this.scaleX;
        let y = this.pos.y + this.modelFixY * this.scaleY + this.modelHeight * 0.5;
        return v2(x, y);
    }

    /****飘字的高度 */
    get hurtNumHight(): number {
        return this.modelHeight
    }

    private summonTimeOutCheck: FightTimeCheck
    public setSummonData(data: ISummonData): void {
        this.summon = data
        this.attr.initMoveSpeed = BattleConstantConfig.summonMoveSpeed
        if (data?.time) {
            this.summonTimeOutCheck = this.battleLogic.createTimeCheck(data.time, Handler.create(this, this.onSummonTimeOut, null, false))
        }
    }

    private onSummonTimeOut(): void {
        PassivitySkillUtils.checkPassSkillCon(PassivitySkillType.ConType_14, this, this);
        PassivitySkillUtils.checkDiePassSkill(this)
        this._attr.hp = 0;
        this.updateHpBar()
        this.onDie()
    }

    public toDie(): void {
        this._attr.hp = 0;
        this.updateHpBar()
        this.onDie()
    }

    /***根据属性类型获取属性，包含战斗中所有加成 */
    getAttrValue(key: AttrEnum): number {
        if (key == AttrEnum.ATK) {
            return this._attr.getBuffValue(AttrEnum.ATK) * Math.max(0, 1 + (this.getAttrValue(AttrEnum.ATK_INC) - this.getAttrValue(AttrEnum.ATK_DEC)) / BattleConstantConfig.getRandBase);
        }
        return this._attr.getBuffValue(key)
    }

    /***获取非BUFF的属性(原始属性) */
    getAttrValueNoBuff(key: AttrEnum): number {
        return this._attr.getAttrValue(key)
    }

    /***获取这时刻英雄的所有属性值包括加成后 */
    getNowAllAttr(amount: number): { [key: number]: number } {
        let attr: { [key: number]: number } = {}
        for (let key in this.attr.attrs) {
            attr[+key] = Math.ceil(this.getAttrValue(+key) * amount / BattleConstantConfig.getRandBase)
        }
        return attr
    }

    setHpNotEvent(hp: number): void {
        this.attr.setHpNotEvent(hp)
        if (this.isDeath) {
            this.onDie();
        }
    }

    hurt(damageVo: DamageVo, hurterUid?: number) {

        this.checkComps("hurt", damageVo);

        if (hurterUid) {
            this._attackerUid = hurterUid;
        }

        if (damageVo.isKill)
            damageVo.value = damageVo.target.hp;

        this.battleLogic.logManager.hurt(damageVo, "hurt")
        this.battleLogic.easyLogManager.hurt(damageVo, "hurt")

        if (damageVo?.hurtEffect) {
            //受击特效
            this.showUnit()?.showHurtEfect(damageVo.hurtEffect)
        }

        if (!BattleDebugManager.ins().isAllNotHurt) {
            this._attr.hurt(damageVo, damageVo.originalCaster);
        }
        this.battleLogic.command.send(BattleCommandType.hurt, this.uid, damageVo)

        this.updateHpBar()

        var attacker = this.battleLogic.getBatteUintByUid(this._attackerUid)//攻击者
        if (attacker) {
            attacker.onTargetHurt(damageVo)
            this.assistUidMap[attacker.uid] = this.battleLogic.frameIndex;
            if (damageVo && damageVo.subType != BattleConstantConfig.SubType_AtkByHurt && damageVo.skillInfo) {
                this.battleLogic.buffMgr.checkAtkByHurt(attacker, damageVo.skillInfo.skillIndex)
            }
        }
        PassivitySkillUtils.checkPassSkillCon(PassivitySkillType.ConType_4, attacker, this, damageVo.skillInfo);
        if (attacker)
            PassivitySkillUtils.checkLeaderSkillCon(LeaderSkillTriggerType.Damage, attacker.teamId, attacker, this, damageVo.value);
        if (damageVo.status == BattleConstantConfig.Crit) {
            PassivitySkillUtils.checkPassSkillCon(PassivitySkillType.ConType_17, attacker, this, damageVo.skillInfo);
        }
        else if (damageVo.status == BattleConstantConfig.Block) {
            PassivitySkillUtils.checkPassSkillCon(PassivitySkillType.ConType_18, this, attacker, damageVo.skillInfo);

            PassivitySkillUtils.updatePassSkillFunction(this, PassivitySkillType.ConType_25, "setBlockNum", 1);
            PassivitySkillUtils.checkPassSkillCon(PassivitySkillType.ConType_25, this, this);
        }
        PassivitySkillUtils.checkPassSkillCon(PassivitySkillType.ConType_3, this, attacker, damageVo.skillInfo);
        PassivitySkillUtils.updatePassSkillFunction(this, PassivitySkillType.ConType_19, "setTotalHurt", damageVo.value);
        PassivitySkillUtils.checkPassSkillCon(PassivitySkillType.ConType_19, this, this);
        if (attacker)
            PassivitySkillUtils.checkLeaderSkillCon(LeaderSkillTriggerType.Hurt, attacker.teamId, attacker, this)

        //受击进入战斗
        if (attacker && attacker.isActive)
            this.enterFight()
        if (this.selectHatredTarget == null && attacker && this.teamId != attacker.teamId) {
            //无仇恨目标的话，第1个攻击目标就是仇恨目标
            let hurtHatredType = 0;
            if (damageVo.skillInfo)
                hurtHatredType = damageVo.skillInfo.getNotHatred();

            if (!hurtHatredType) {
                this.selectHatredTarget = attacker;
                this.battleLogic.checkBattleUnitHateGroup(this, attacker)
            }
            else if (hurtHatredType == 1) {
                //不还击
            }
            else if (hurtHatredType == 2) {
                //攻击者队伍距离我最近的目标
                let teamUnits = this.battleLogic.getUnitsByTeamId(attacker.teamId)
                if (teamUnits?.length) {
                    teamUnits = SkillUtils.behaviorFilterNearsetOrFarthest(SkillTargetType.Nearset, this, teamUnits)
                    if (teamUnits?.length) {
                        this.selectHatredTarget = teamUnits[0]
                        this.battleLogic.checkBattleUnitHateGroup(this, teamUnits[0])
                    }
                }
            }
        }

        if (this._attr.isDeath()) {
            if (attacker) {
                PassivitySkillUtils.updatePassSkillFunction(attacker, PassivitySkillType.ConType_31, "setKillNum");
                PassivitySkillUtils.checkPassSkillCon(PassivitySkillType.ConType_31, attacker, attacker, this);
                for (let uid in this.assistUidMap) {
                    if (this.assistUidMap[uid] && +uid != this._attackerUid) {
                        var assister = this.battleLogic.getBatteUintByUid(+uid)//攻击者
                        if (assister) {
                            let assistTime = BattleUtils.getTimeByFrame(this.battleLogic.frameIndex - this.assistUidMap[uid])
                            if (assistTime < BattleConstantConfig.assistKillTime) {
                                //1秒内的伤害判断有助攻
                                PassivitySkillUtils.updatePassSkillFunction(assister, PassivitySkillType.ConType_35, "setAssistNum");
                                PassivitySkillUtils.checkPassSkillCon(PassivitySkillType.ConType_35, assister, assister, this);
                            }
                        }
                    }
                    this.assistUidMap[uid] = 0;
                }
            }
            this.onDie(damageVo);
        }
    }

    /***目标收到伤害后回调被攻击者 */
    public onTargetHurt(damageVo?: DamageVo): void {
        if (damageVo)
            damageVo.skillInfo?.fightSkillInfo?.onTargetHurt(damageVo)
    }

    heal(damageVo: DamageVo) {
        if (damageVo.caster) {
            this.battleLogic.buffMgr.getHealToShield(damageVo.caster, this, damageVo.value, damageVo.status)
        }
        this._attr.heal(damageVo.value);
        PassivitySkillUtils.checkPassSkillCon(PassivitySkillType.ConType_26, damageVo.originalCaster, this, damageVo.skillInfo);
        this.battleLogic.logManager.hurt(damageVo, "heal")
        this.battleLogic.easyLogManager.hurt(damageVo, "heal")
        this.updateHpBar()
    }

    public updateHpBar(): void {
        this.battleLogic.command.send(BattleCommandType.updateHp, this.uid)
    }

    protected onDie(damageVo?: DamageVo) {
        if (this.summonTimeOutCheck)
            this.summonTimeOutCheck.isReadyToRemove = true;
        this.attackActionComplete(true)
        this.battleLogic.command.send(BattleCommandType.onDie, this.uid, damageVo)
        FacadeManager.ins().emit(NotificationKey.BATTLE_PLAY_UNIT_DIE, this);
        this.markVerify()
        this.battleLogic.markDead(this.uid, this.teamId, this._type, this._attr.getConfigId());
        this.battleLogic.haloMgr.removeHaloByHeroDie(this.uid)
        this.checkSummonDieByHero()
        this.exitFight();
    }

    protected markVerify(): void {
    }

    protected checkSummonDieByHero(): void {
        //判断召唤者死亡是否召唤物也死亡
        this.battleLogic.summonDieByHero(this.uid)
        //判断召唤物死亡，召唤者是否死亡
        if (this.splitMonsterFatherUid) {
            let fromUnit = this.battleLogic.unitProcessor.getBattleUnitByUid(this.splitMonsterFatherUid)
            if (fromUnit) {
                fromUnit.splitMonsterDieFromUnit = this;
                fromUnit.removeSplitMonsterNum(1)
            }
        }
    }

    /***引起分裂怪死亡的上1级目标 */
    protected splitMonsterDieFromUnit: BattleUnit
    /***添加分裂怪的数量 */
    public addSplitMonsterNum(num: number): void {
        this.splitMonsterNum += num;
        this.setAbnormalStatus(AbnormalType.disappear);
        this.setAbnormalStatus(AbnormalType.notSelect);
    }

    /***移除分裂怪数量，等于0是死亡 */
    public removeSplitMonsterNum(num: number): void {
        this.splitMonsterNum -= num;
        if (this.splitMonsterNum <= 0) {
            this.toDie()
        }
    }

    protected onRebirth() {
    }

    public rebirth(isFull: boolean = true) {
        this.attr.rebirth(isFull);
        this.onRebirth();
    }

    /**更新位置前 */
    protected onBeforUpdatePos() {
    }

    public update(): boolean {
        if (this.checkPetrifaction()) {
            this.updateSkillCD();
            return false
        }

        //更新目标状态
        this.checkTargetStatue();
        if (!this.checkSelfState()) return false;

        if (this.battleLogic.isEndFight) {
            this.updateNode()
            return false
        }

        if (!this.battleLogic.isNerverbegin) {
            //检查是否进入战斗
            this.checkEnterFight();
            this.updateSkillCD();
        }
        //更新已经释放技能的行为逻辑
        this.updateSkillBehavior();
        //更新蓄力动作
        this.updateChargedHandler();
        //更新冲撞动作
        this.checkCollisionHandler();


        if (!this.battleLogic.isStopFightAi && !this.isForcePathMove && !this.repelHandler() && !this.isGhost) {
            //更新战斗AI
            this.updateAI();
            this.doOther();
        }
        //判断路径位移
        this.checkPathMove()
        //更新位移
        this.updatePos();
        //更新节点
        this.updateNode();
        //检查仇恨范围时间
        this.updateHateTime();

        this.updateComps();

        return true
    }

    protected updateSkillCD(): void {
        //更新技能CD
        this._attr.updateSkillCD();
    }

    /***判断是否石化状态，石化要暂停逻辑并暂停动画，之后恢复 */
    private checkPetrifaction(): boolean {
        return this._attr.isPetrifaction() || this._attr.isFrost() || this._attr.isTimeStop()
    }

    /***击退的帧数 */
    private repelTime: number = 0;
    private repelSpeed: Vec2
    /***击退 */
    public repel(pos: Vec2, dis: number): void {
        if (!this.attr.canForceMove()) {
            this.showUnit()?.showOtherNum("bati")
            return
        }
        this.stopAction()
        this.stopMove()
        this.repelTime = 10;
        let radians = MathUtils.radian(pos, this.pos)
        let speed = dis / this.repelTime;
        this.repelSpeed = v2(speed * Math.cos(radians), speed * Math.sin(radians))
    }

    protected tryMove(pos: Vec2, moveVec: Vec2): boolean {
        let b = super.tryMove(pos, moveVec)
        if (!b) {
            this.repelTime = 0;
            if (this.collisonTargetPoint) {
                //冲撞中有障碍物，则转为跑步动作
                this.setState(ActorState.Running)
            }
        }

        return b;
    }

    /***击退处理 */
    private repelHandler(): boolean {
        if (this.repelTime > 0) {
            this.repelTime--
            this.forceMove(this.repelSpeed)
            return true
        }
        return false;
    }

    setCtrlVec(vec: Vec2) {
        super.setCtrlVec(vec)
        if (!this.canMoveAttack()) {
            this.clearMainTarget()
            this.clearHatredTarget()
        }
    }

    /**检测对方状态 */
    protected checkTargetStatue(): void {
        if (this.selectMainTarget) {
            //主目标死亡了 或者对方处于不可选择的状态
            if (this.selectMainTarget.unit && (this.selectMainTarget.unit.attr.isDeath() || !this.selectMainTarget.unit.canSelect()))
                this.clearMainTarget();
            else {
                let dis = MathUtils.distance(this.pos, this.selectMainTarget.pos)
                if (dis >= this.searchRange()) {
                    //大于队伍的仇恨距离
                    this.selectMainTarget = null;
                }
            }
        }

        if (this.selectHatredTarget) {
            if (this.selectHatredTarget.unit?.attr.isDeath() || this.checkHateDis(this.selectHatredTarget.pos)) {
                //大于队伍的仇恨距离
                this.selectHatredTarget = null;
            }
        }
    }

    /**检测状态 */
    protected checkSelfState() {
        return this.attr.isAlive();
    }

    /***检查其余的条件,在checkSkill之前的 */
    protected checkOtherCondition(): boolean {
        return true;
    }

    /***清除主目标，假如清除的目标为仇恨目标，那也清除仇恨目标 */
    public clearMainTarget(): void {
        if (this.selectMainTarget == this.selectHatredTarget)
            this.clearHatredTarget();

        if (this.selectHatredTarget) {
            if (!this.checkHateDis(this.selectHatredTarget.pos)) {
                this.selectMainTarget = this.selectHatredTarget;
                return
            }
        }
        this.selectMainTarget = null;
    }

    public clearHatredTarget(): void {
        //检查有附近有无目标，无就清除仇恨目标
        var enemy = UnitSearchUtils.getNearestBattleUnit(this, SkillUtils.getTeamIdByFaction(this.teamId, TargetFaction.EnemySide), this.searchRange());
        if (enemy) {
            this.selectHatredTarget = enemy;
            this.battleLogic.checkBattleUnitHateGroup(this, enemy)
        }
        else
            this.selectHatredTarget = null;
    }

    /***
     * 移动到阵位
     *  */
    public moveToFormation(force: boolean = false): void {

    }

    /***检测选中的技能 */
    protected checkSkill(): void {
        if (this.skillInfoCtrl) {
            this.skillInfo = this.skillInfoCtrl;
            this.skillInfoCtrl = null;
            this.clearMainTarget()
        }
        else if (this.isAutoFight) {
            if (!this.skillInfo) {
                this.skillInfo = this.getActiveSkill();
                this.selectMainTarget = null;
            }
        }

        // if (this.skillInfo && !this.skillInfo.isActive()) {
        //     this.skillInfo = null
        // }

        if (this._moveVec.isCrtl) {
            if (!this.canMoveAttack())
                this.skillInfo = null

            // if (this.skillInfo && this.skillInfo.skillIndex == 0 && this.riderCollisionBuff) {
            //     this.skillInfo = null;//主动移动时假如是重骑冲锋中的普攻，取消技能选择
            // }
        }
    }

    protected getActiveSkill(): SkillData {
        return this._attr.getActiveSkill(null, false, this.skillOtherConditionCheckHandler.bind(this));
    }

    /****技能释放的其他条件检查 */
    protected skillOtherConditionCheckHandler(skill: SkillData): boolean {
        let isNotCharm = this.battleLogic.buffMgr.checkCharmSkill(this, skill)
        return isNotCharm;
    }

    private pointTargetChangeTimeFrame: number = 100;
    /***选择目标 */
    protected checkSelectTarget(): void {
        if (!this.skillInfo)
            return;

        if (this.selectMainTarget) {
            //已经存在主目标，判断是否丢失
            let dis = MathUtils.distance(this.selectMainTarget.pos, this.pos)
            if (dis > this.searchRange() + 40) {
                //大于索敌范围
                this.clearMainTarget();
            }
        }

        let ridiculeTarget = this.battleLogic.buffMgr.getRidiculeTarget(this);//嘲讽目标
        if (ridiculeTarget) {
            this.selectMainTarget = ridiculeTarget
        }
        else {
            if (this.selectMainTarget instanceof PointTarget) {
                if (this.pointTargetChangeTimeFrame == 0) {
                    this.selectMainTarget = SkillUtils.searchTarget(this.skillInfo, this);
                    this.pointTargetChangeTimeFrame = 100;
                }
                else {
                    this.pointTargetChangeTimeFrame--
                }
            }
            else
                this.selectMainTarget = SkillUtils.searchTarget(this.skillInfo, this);
        }

        if (this.selectMainTarget) {
            //目标超出仇恨范围
            if (this.checkHateDis(this.selectMainTarget.pos)) {
                this.clearMainTarget();
                return
            }
        }

        if (!this.selectHatredTarget && (this.selectMainTarget && !(this.selectMainTarget instanceof PointTarget) && this.selectMainTarget.teamId && this.selectMainTarget.teamId != this.teamId))
            this.selectHatredTarget = this.selectMainTarget;//非相同队伍的才记录仇恨目标
    }

    public charged: number = 0
    /***是否蓄力中 */
    public isCharged: boolean = false;
    /***攻击时，是否背面动作 */
    public isAttackBack: boolean = false;
    /***攻击点的旋转偏移值 */
    public atkPointRotate: number = 0;
    /***进行攻击 */
    protected attack(): boolean {
        this.moveAttackType = 0;
        if (!this.checkAttack())//检查攻击条件是否满足
            return false

        if (!this.isEnemyHeavyMoveAttact()) {
            this.clearPathMove()
        }

        let isInvalidSkill = this.battleLogic.buffMgr.getInvalidSkill(this, this.skillInfo.skillIndex, this.skillInfo.skillId);
        if (isInvalidSkill) {
            //技能无效
            this.skillInfo.refreshCD()
            return
        }

        // 使用技能！！！！
        if (this.selectMainTarget.pos.x != this.pos.x)
            this.setDirction(this.selectMainTarget.pos.x > this.pos.x ? -1 : 1)

        //方向
        let angle = MathUtils.getAngle(this.pos.x, this.pos.y, this.selectMainTarget.pos.x, this.selectMainTarget.pos.y);
        if (this.selectMainTarget instanceof PointTarget && this.selectMainTarget.angle != null) {
            angle = MathUtils.adjustmentAngle(this.selectMainTarget.angle);
            if ((angle <= 90 && angle >= 0) || (angle <= 360 && angle >= 270)) {
                this.setDirction(DirctionType.Left)
            }
            else
                this.setDirction(DirctionType.Rigth)
        }


        let skill = this.skillInfo;
        let backAnimData = skill.getBackActionEffectData();//背面动作
        this.isAttackBack = false;
        if (backAnimData && angle >= 45 && angle <= 135) {
            this.isAttackBack = true;
        }

        this.atkPointRotate = 0;
        if (skill.cfg.rotateBoneName) {
            //旋转骨骼
            this.atkPointRotate = angle;
        }

        let atkTimeScale = null;
        this._attackEndTime = skill.castTime;
        if (!this.isCharged && SkillUtils.checkSkillSubType(SkillSubType.Charged, skill.getSubType()) && skill.cfg.subTypeParm) {
            //释放蓄力技能
            this.isCharged = true;
            let chargedParm: { time: number } = skill.cfg.subTypeParm;
            this.charged = BattleUtils.getFrameByTime(+chargedParm.time);
        }
        else {
            if (skill.castTime) {
                if (skill.type == SkillType.ATTACK) {
                    //普攻 计算攻速
                    atkTimeScale = this.getSkillAtkSpeed(this.atkTimeScale, skill)
                    this._attackEndTime = Math.ceil(skill.castTime / atkTimeScale);
                } else {
                    //技能
                    atkTimeScale = this.getSkillAtkSpeed(1, skill)
                    if (skill.cfg.isByAtkSpeed || this.battleLogic.buffMgr.isSkillBeAttackSpeed(skill.owner, skill.skillIndex)) {
                        atkTimeScale = this.getSkillAtkSpeed(this.atkTimeScale, skill)
                    }
                    this._attackEndTime = Math.ceil(skill.castTime / atkTimeScale);
                }
            }
            else {
                //瞬发技能，不打断当前本身
                this.skillInfo.refreshCD()
            }
        }
        this.battleLogic.command.send(BattleCommandType.attack, this.uid);
        this._attr.actionSkill(skill, this.selectMainTarget);
        this.showTalk(BattleUtils.getUnitTalk(skill.cfg.talk, skill.cfg.talkProbability))



        if (!skill.castTime) {
            this.skillInfo = null;
        }
        return true
    }

    public getSkillAtkSpeed(atkTimeScale: number, skill: SkillData): number {
        return atkTimeScale * (1 + (skill.cfg.atkSpeed || 0) / BattleConstantConfig.getRandBase)
    }

    /***冲撞的坐标 */
    private collisonTargetPoint: Vec2;
    /***冲撞的速度 */
    private collisonSpeed: number;
    /***冲撞参数 */
    private collisonParam: { behavior: string };
    /***开始冲撞 */
    public beginCollision(speed: number, p: Vec2, effectParam: { behavior: string }): void {
        this.collisonSpeed = speed;
        this.collisonTargetPoint = p;
        this.collisonParam = effectParam;
        this.checkCollisionHandler();
    }

    /***是否冲撞中 */
    public get isCollison(): boolean {
        return this.collisonTargetPoint ? true : false
    }

    private checkCollisionHandler(): void {
        if (this.collisonTargetPoint) {
            let v_scale = this.collisonSpeed * BattleUtils.frameDeltaMs;
            let dis = MathUtils.getDistance(this.collisonTargetPoint.x, this.collisonTargetPoint.y, this.pos.x, this.pos.y);
            if (dis > 20) {
                let radian = MathUtils.getRadians(this.pos.x, this.pos.y, this.collisonTargetPoint.x, this.collisonTargetPoint.y);
                let v = Math.min(dis, v_scale);
                CollisionUtils.tempVec.set(v * Math.cos(radian), v * Math.sin(radian));
                this.forceMove(CollisionUtils.tempVec);
            }
            else {
                if (this.collisonTargetPoint) {
                    this.collisonBehaviorAction();
                    this.setState(ActorState.Idle);
                }
                this.collisonTargetPoint = null;
            }
        }
    }

    private collisonBehaviorAction(): void {
        if (this.collisonParam && this.skillInfo && this.collisonParam.behavior) {
            SkillBehavior.createBehaviorAndActionEffect(this.collisonParam.behavior, this, this.selectMainTarget, this.skillInfo);
        }
    }

    /***蓄力行为 */
    private chargeBehaviorParam: { behavior: string, delay: number };
    /***当前蓄力行为的目标点 */
    private chargeTarget: PointTarget;
    private chargeDelayTimeCheck: FightTimeCheck;
    /***开始蓄力 */
    public beginCharge(behavior: SkillBehavior): void {
        this.chargeBehaviorParam = behavior.effectParam;
        if (this.selectMainTarget instanceof PointTarget)
            this.chargeTarget = this.selectMainTarget
        else if (this.selectMainTarget) {
            let pointTarget = new PointTarget(this.battleLogic)
            pointTarget.teamId = this.selectMainTarget.teamId;
            pointTarget.setPoint(this.selectMainTarget.pos.x, this.selectMainTarget.pos.y);
            this.selectMainTarget = this.chargeTarget = pointTarget;
        }
        this.battleLogic.command.send(BattleCommandType.beginCharge, this.uid, behavior)
    }

    /***更新蓄力动作 */
    protected updateChargedHandler(): void {
        if (this.isCharged) {
            this.charged--;
            this.battleLogic.command.send(BattleCommandType.updateCharge, this.uid)
            if (this.charged <= 0) {
                this.endChargedAction();
            }
        }
    }

    /***结束蓄力动作 */
    public endChargedAction(): void {
        this.charged = 0;
        this.isCharged = false;
        //蓄力结束
        this.battleLogic.command.send(BattleCommandType.endCharge, this.uid)
        if (this.chargeBehaviorParam && this.chargeTarget && this.skillInfo) {
            if (this.chargeBehaviorParam.delay) {
                if (this.chargeDelayTimeCheck)
                    this.chargeDelayTimeCheck.isReadyToRemove = true;
                this.chargeDelayTimeCheck = this.battleLogic.createTimeCheck(this.chargeBehaviorParam.delay, new Handler(this, () => {
                    SkillBehavior.createBehaviorAndActionEffect(this.chargeBehaviorParam.behavior, this, this.chargeTarget, this.skillInfo);
                }))
            }
            else {
                SkillBehavior.createBehaviorAndActionEffect(this.chargeBehaviorParam.behavior, this, this.chargeTarget, this.skillInfo);
            }
        }
    }

    /***创建战斗特效 */
    public createFightEffect(modelId: number, posType: number, target: BattleUnit, layer: number, isLoop: boolean, fightDir: number, timeScale: number = null, fighter?: BattleUnit): void {
        this.battleLogic.command.send(BattleCommandType.createFightEffect, this.uid, modelId, posType, target, layer, isLoop, fightDir, timeScale, fighter);
    }

    /***主动使用技能 */
    public useSkill(skillid: string): void {
        this.skillInfoCtrl = this._attr.getActiveSkill(skillid, true);
    }

    /***主动扩展使用技能 */
    public useExSkill(skillid: string, exSkillOwneId: string): void {
        this.skillInfoCtrl = this._attr.getExSkill(skillid, exSkillOwneId);
    }

    /***主动使用技能 */
    public useSkillByIndex(index: number): void {
        this.skillInfoCtrl = this._attr.getSkillByIndex(index, true);
    }

    /***
     * 被动触发主动技能
     * parm[0]=0 只有待机和普攻能打断
     * parm[0]=1 打断任何，但等下1个技能可释放时再释放
     * parm[0]=2 打断任何，马上释放
     * 
     * parm[1]=1 使用技能ID
     * parm[2]=1 使用扩展技能的ID
     *  */
    public usePassActiveSkillSkill(skillId: string, parm: any[] = null): void {
        let b = false;
        if ((parm && parm[0] == 2) || (this._state == ActorState.Idle) || (this.skillInfo && this.skillInfo.skillIndex == 0)) {
            //只有待机或者普攻才能被强制释放其他主动技能
            this.stopAction()
            b = true
        }

        if ((!parm || parm[0] == 0 || parm[0] == 2) || b) {
            if ((parm && parm[1] == 1) || skillId.indexOf("_s") == -1) {
                if ((parm && parm[2])) {
                    this.useExSkill(skillId, parm[2] + "")
                }
                else {
                    this.useSkill(skillId)
                }
            }
            else {
                let skillIndex = +skillId.split("_s")[1] - 1
                this.useSkillByIndex(skillIndex)
            }
            // if (!this.skillInfoCtrl || (this.skillInfoCtrl.cfg.targetType != SkillTargetType.SELF && !this.selectMainTarget)) {
            //     this.skillInfoCtrl = null;
            // }
        }
    }

    /***根据双方体型获取实际的攻击距离 */
    public getSkillDistance(skillInfo: SkillData): number {
        let targetSize = this.selectMainTarget?.unit?.attr.getSize() || 0;
        let mySize = this.attr.getSize()
        return skillInfo.castingRange + targetSize * 0.5 + mySize * 0.5;
    }

    /***
     * 判断当前状态能否攻击
     * isIgnoreDis 是否忽略距离
     *  */
    protected checkAttack(isIgnoreDis: boolean = false): boolean {

        if (!this.selectMainTarget || !this.skillInfo)
            return

        //检查自身状态
        // if (!this.canMove())//无法移动基本就是无法攻击的，除了定身
        //     return false;

        if (!this.canAttack())
            return false;

        if (!isIgnoreDis) {
            //检查距离
            let isPointTarget = false;
            if (this.selectMainTarget instanceof PointTarget && this.selectMainTarget.isMoveToPoint) {
                if (MathUtils.distance(this.selectMainTarget.pos, this.pos) <= this.moveDistance * 1.5)
                    return true
                isPointTarget = true;
            }

            if (!isPointTarget && MathUtils.distance(this.selectMainTarget.pos, this.pos) <= this.getSkillDistance(this.skillInfo)) {
                return true
            }
            else {

                //需要移动时判断有无骑乘冲锋技能
                let horseSkill = this.attr.getHorseSkill(this.skillInfo.skillId)
                if (horseSkill) {
                    //有的话，替换为冲锋技能
                    this.skillInfo = horseSkill;
                }

                if (!this._moveVec.isCrtl) {
                    let b: number = 0
                    // if (this.isEnemyHeavyMoveAttact()) {
                    //     b = this.setMoveTarget(v2(this.selectMainTarget.pos.x + this.battleLogic.randomMgr.randomInt(-100, 100), this.selectMainTarget.pos.y + this.battleLogic.randomMgr.randomInt(-100, 100)))
                    // }
                    // else {
                    //     b = this.setMoveTarget(this.selectMainTarget.pos)
                    // }
                    b = this.setMoveTarget(this.selectMainTarget.pos)

                    // if (b == 0 || b == -1) {
                    if (b == 0) {
                        //路径寻不了则清除当前目标
                        // if (this.enterFight) {
                        //     //尝试直接靠近
                        // }
                        if (b == 0) {
                            // let radians = MathUtils.getRadians(this.pos.x, this.pos.y, this.selectMainTarget.pos.x, this.selectMainTarget.pos.y);
                            // let tryMoveVec = v2(this.moveDistance * Math.cos(radians), this.moveDistance * Math.sin(radians));
                            // if (this.tryMove(this.pos, tryMoveVec)) {
                            // }
                            let vec = CollisionUtils.calVecTemp(this.pos, this.selectMainTarget.pos, this.moveDistance);
                            this._moveVec.setMoveVec(vec);
                        }
                        // else
                        //     this.clearMainTarget()
                    }
                }
                return false;
            }
        }

        //原地可以释放
        return true;
    }

    /**更新技能行为 */
    protected updateSkillBehavior() {
        this._attr.update();
    }

    /**设置异常状态 */
    public setAbnormalStatus(type: AbnormalType, param?: any) {
        if (type == AbnormalType.ImmuneControl) {
            //添加霸体移除控制技能
            let b = false;
            if (this.hasAbnormalStatus(AbnormalType.NotMove)) {
                b = true
                this.clearAllAbnormalStatusByType(AbnormalType.NotMove)
            }
            if (this.hasAbnormalStatus(AbnormalType.dizziness)) {
                b = true
                this.clearAllAbnormalStatusByType(AbnormalType.dizziness)
            }
            if (this.hasAbnormalStatus(AbnormalType.petrifaction)) {
                b = true
                this.clearAllAbnormalStatusByType(AbnormalType.petrifaction)
            }
            if (this.hasAbnormalStatus(AbnormalType.NotAttack)) {
                b = true
                this.clearAllAbnormalStatusByType(AbnormalType.NotAttack)
            }
            if (this.hasAbnormalStatus(AbnormalType.Silent)) {
                b = true
                this.clearAllAbnormalStatusByType(AbnormalType.Silent)
            }
            if (b)
                this.showUnit()?.showOtherNum("bati")
        }
        else if (type == AbnormalType.NotMove || type == AbnormalType.dizziness || type == AbnormalType.petrifaction || type == AbnormalType.NotAttack || type == AbnormalType.Silent) {
            if (this._attr.isImmuneControl()) {
                this.showUnit()?.showOtherNum("bati")
                return
            }

            if (type == AbnormalType.NotMove || type == AbnormalType.dizziness) {
                this.stopAction()
            }
            else if (type == AbnormalType.petrifaction) {

            }
            else if (type == AbnormalType.Silent) {
                if (this.skillInfo && this._attackEndTime && this.skillInfo.type != SkillType.ATTACK) {
                    this.stopAttacAction();//沉默只打断普攻外的技能
                }
            }
            else if (type == AbnormalType.NotAttack) {
                this.stopAttacAction()
            }
        }
        else if (type == AbnormalType.disappear) {
            this.stopAttacAction();
            this.showUnit()?.setVisible(false);
        }

        this.showUnit()?.showAbnormalStatus(type)
        this._attr.setAbnormalStatus(type, param);
    }

    public hasAbnormalStatus(type: AbnormalType) {
        return this._attr.hasAbnormalStatus(type);
    }

    /**清除1个异常状态 */
    public clearAbnormalStatus(type: AbnormalType) {
        this._attr.clearAbnormalStatus(type);
    }

    /**清除所有1个异常状态 */
    public clearAllAbnormalStatusByType(type: AbnormalType) {
        this._attr.clearAllAbnormalStatusByType(type);
    }

    /**是否能移动 */
    protected canMove(): boolean {
        return this.attr.canMove();
    }

    /**是否能攻击 */
    protected canAttack(): boolean {
        return this.attr.canAttack();
    }

    /**是否能放技能*/
    protected canSkill(): boolean {
        return this.attr.canSkill();
    }

    /***是否处于障碍物里 !UnitCollisionsManager.ins().isInBlock(this.pos)*/
    protected isInBlock: boolean = false;
    /***是否可以选中 */
    public canSelect(): boolean {
        return this.attr.canSelect() && !this.attr.isLowHatred() && !this.isInBlock && !this.isGhost;
    }

    /****是否能收到伤害 */
    public canBeHurt(): boolean {
        return this.attr.isLowHatred() || this.canSelect()
    }

    /****收到伤害前的自定义条件判断 */
    public checkBeHurtHandler(...param): boolean {
        return true
    }

    public setPosXY(x: number, y: number): void {
        super.setPosXYForce(x, y)
        this.updateBlockStatue()
    }

    /***更新当前是否处于不可走点的状态 */
    public updateBlockStatue(): void {
        if (this.isAttacking)
            return
        this.isInBlock = this.battleLogic.unitCollisionsManager.isInBlock(this.pos)
    }

    /***0不处于任何1个动作，1处于移动攻击，2处于站立攻击 */
    public moveAttackType: number = 0;
    protected onMove(notBreakAttack: boolean = false): void {
        if (this.checkCanBreakAttackAction() && !notBreakAttack) {
            this.attackActionComplete(true)//不存在环境因素的才终止战斗
        }
        this.setMoveAttackState(1)
        this.checkRiderCollisionBuff();
        PassivitySkillUtils.updatePassSkillFunction(this, PassivitySkillType.ConType_12, "setMoveTime", this.battleLogic.frameIndex);
        PassivitySkillUtils.checkPassSkillCon(PassivitySkillType.ConType_12, this, this);

        PassivitySkillUtils.updatePassSkillFunction(this, PassivitySkillType.ConType_21, "setMoveDistance", this.pos);
        PassivitySkillUtils.checkPassSkillCon(PassivitySkillType.ConType_21, this, this);
        PassivitySkillUtils.checkLeaderSkillCon(LeaderSkillTriggerType.Move, this.teamId, this, this, this.pos)

        this.battleLogic.buffMgr.updateMoveRemoveBuff(this, this.pos)
    }

    /***判断是否打断攻击动作 */
    protected checkCanBreakAttackAction(): boolean {
        if (!this._moveVec.hasEnvVec() && !this.canMoveAttack()) {
            //不是环境造成的移动，而且不是骑乘攻击，且当前技能无坐骑技能，则可以打断
            return true
        }
        return false;
    }

    /***当前状态是否能移动攻击 */
    public canMoveAttack(): boolean {
        if (this.skillInfo && SkillUtils.checkSkillSubType(SkillSubType.Collison, this.skillInfo.getSubType()))
            return false;

        if (this.isMoveAttack && (!this.skillInfo || !this.skillInfo.cfg.horseSkill)) {
            return true
        }
        return false;
    }

    private riderCollisionBuff: SkillBuffGroup;
    private moveSpeedDamageBuff: SkillBuffGroup;
    /***设置骑乘战斗状态 */
    protected setMoveAttackState(type: number): void {
        if (this.canMoveAttack() && this.isAttacking) {
            if (this.moveAttackType != type) {
                this.moveAttackType = type;
                this.changeMoveAttackAction();
            }
        }
    }

    protected checkRiderCollisionBuff(): void {
        if (this.career == HeroCareerType.HeavyCavalry && !this.isAttacking && !this.riderCollisionBuff) {
            let PRider_Collision_s01: { buff: string } = this._attr.getPassiveSkillFlag(PassivitySkillFlag.PRider_Collision_s01)
            if (PRider_Collision_s01 && PRider_Collision_s01.buff && this.getAttackRange() != "RANGED") {
                //坐骑移动中会有1个持续伤害,结束移动会移除
                let skillBehaviro = this._attr.getPassiveSkillFlagSkillBehavior(PassivitySkillFlag.PRider_Collision_s01)
                this.riderCollisionBuff = this.battleLogic.buffMgr.buffControlByGroup(PRider_Collision_s01.buff, this, this, skillBehaviro);
            }
        }

        if (!this.moveSpeedDamageBuff) {
            let PMoveSpeedDamage: { buff: string } = this._attr.getPassiveSkillFlag(PassivitySkillFlag.PMoveSpeedDamage)
            if (PMoveSpeedDamage && PMoveSpeedDamage.buff) {
                //坐骑移动中会有1个持续伤害,结束移动会移除
                let skillBehaviro = this._attr.getPassiveSkillFlagSkillBehavior(PassivitySkillFlag.PMoveSpeedDamage)
                this.moveSpeedDamageBuff = this.battleLogic.buffMgr.buffControlByGroup(PMoveSpeedDamage.buff, this, this, skillBehaviro);
            }
        }
    }

    /***终止冲锋BUFF */
    public breakRiderCollisionBuff(): void {
        if (this.riderCollisionBuff) {
            this.riderCollisionBuff.removeAll()
            this.riderCollisionBuff = null;
        }

        if (this.moveSpeedDamageBuff) {
            this.moveSpeedDamageBuff.removeAll()
            this.moveSpeedDamageBuff = null;
        }
    }

    /***切换骑乘战斗动作 */
    protected changeMoveAttackAction(): void {
        if (!this.selectMainTarget)
            return

        if (!this.skillInfo)
            return

        if (this.selectMainTarget.pos.x != this.pos.x)
            this.setDirction(this.selectMainTarget.pos.x > this.pos.x ? -1 : 1)

        this.battleLogic.command.send(BattleCommandType.changeMoveAttack, this.uid)
    }

    /***可触发超过仇恨范围回阵容的时间间隔（帧） */
    protected hateToMoveFormation: number = 0;
    protected updateHateTime(): void {
        if (this.hateToMoveFormation <= 0) {
            // this.hateToMoveFormation = Math.floor(BattleConstantConfig.heroHateMaxRadiusTime / BattleTimer.battleTickFrame);
        }
        else
            this.hateToMoveFormation--;
    }

    /***判断仇恨范围 */
    protected checkHateDis(targetPos: Vec2, isNotCheckFrame: boolean = false): boolean {
        if (!isNotCheckFrame && this.hateToMoveFormation > 0) {
            return false;
        }
        let dis = MathUtils.distance(this.originPos, targetPos)
        if (dis >= this.hateDistance) {
            return true
        }
        return false
    }

    /***增加攻击的持续时间 */
    public addAttackEndTime(time: number): void {
        if (this._attackEndTime) {
            this._attackEndTime += time;
        }
    }

    /**更新AI */
    protected updateAI() {
        if (this._attackEndTime > 0) {
            this._attackEndTime--;
            if (this._attackEndTime <= 0)
                this.attackActionComplete(false)
        }

        if (this.checkCanActivateSkills()) {
            if (this.checkHateDis(this.pos)) {
                //大于仇恨距离不攻击
                this.hateToMoveFormation = Math.floor(BattleConstantConfig.heroHateMaxRadiusTime / BattleTimer.battleTickFrame);
                this.clearMainTarget();
                this.moveToFormation(true)
                return
            }

            this.checkSkill();
            this.checkSelectTarget();
            if (this.skillInfo && !this._moveVec.isCrtl && !this.selectMainTarget && this.selectHatredTarget) {
                //如果无目标，则靠近仇恨目标
                let isCharm = this.battleLogic.buffMgr.checkIsCharm(this);
                if (!isCharm) {
                    let vec = CollisionUtils.calVecTemp(this.pos, this.selectHatredTarget.pos, this.moveDistance);
                    this._moveVec.setMoveVec(vec);
                }
            }
            else {
                this.attack();
            }
        }
    }

    /****判断能否发动技能 */
    protected checkCanActivateSkills(): boolean {
        if (this.summon) {
            let unit = this.battleLogic.getBatteUintByUid(this.summon.byUid)
            if (unit && (unit.getMoveVec().isCrtl || !unit.isBeginToFight || !unit.selectHatredTarget || !unit.selectMainTarget)) {
                return false;
            }
        }
        return this.isBeginToFight && !this.battleLogic.isSafe && !this.isAttacking && (!this._moveVec.isCrtl || this.canMoveAttack())
    }

    /**处理其他事情 */
    protected doOther() {
    }

    public isMoveing: boolean = false
    /**更新节点表现 */
    public updateNode() {
        let dirScale = this._moveVec.getDirectionScale();
        if (dirScale) {
            if (this.isAttacking && this.canMoveAttack() && this.selectMainTarget && this.getAttackRange() == "RANGED") {
                //假如骑乘攻击状态就保持面向敌人方向
                if (this.selectMainTarget.pos.x != this.pos.x)
                    this.setDirction(this.selectMainTarget.pos.x > this.pos.x ? -1 : 1)
            }
            else
                this.setDirction(dirScale)
        }

        this.isMoveing = false;
        if (this._moveVec.isCrtl || this._moveVec.isMoving) {
            if (!this.isAttacking)
                this.setState(ActorState.Running);
            this.isMoveing = true;
        } else {
            if (!this.isAttacking && !this.isDeath && this._state != ActorState.Vertigo) {
                this.setState(ActorState.Idle);
            }
        }
        super.updateNode();
    }

    /***攻击完成 */
    protected attackActionComplete(isForce: boolean): void {
        this.battleLogic.gunGroupMgr.clearByCasterStop(this);
        if (!isForce || this._attackEndTime) {
            this._attackEndTime = 0;
            this.isCharged = false;
            this.charged = 0;
            if (this.chargeDelayTimeCheck)
                this.chargeDelayTimeCheck.isReadyToRemove = true;
            if (this.collisonTargetPoint && !isForce) {
                this.collisonBehaviorAction();
                this.collisonTargetPoint = null;
            }
            let tempSkillInfo = this.skillInfo
            if (this.skillInfo) {
                //移除当前技能的行为
                this.skillInfo.skillCompleteHandler(isForce);
                this._attr.removeSkillBehavoirs()
                if (this.skillInfo.cfg.clearTarget == 1) {
                    this.clearHatredTarget();
                }
                this.selectMainTarget = this.selectHatredTarget;//设回仇恨目标
            }
            this.skillInfo = null;
            this.battleLogic.command.send(BattleCommandType.attackComplete, this.uid, isForce, tempSkillInfo)
        }
    }

    protected onStopMove(): void {
        super.onStopMove()
        if (!this.isAttacking)
            this.setMoveAttackState(2)
        this.breakRiderCollisionBuff();
        this.checkRideMove();
    }

    /***坐骑移动攻击AI计数器 */
    private moveAttackIndex = 0
    private moveAttackUidMap: { [uid: number]: boolean } = {};
    private moveAttackUidNum = 0;
    /**检查重骑存在冲锋被动时，敌方执行移动的AI */
    protected checkRideMove(): void {
        if (this.isBeginToFight && this.isEnemyHeavyMoveAttact()) {
            if (this.moveAttackIndex == 0) {
                let ridiculeTarget = this.battleLogic.buffMgr.getRidiculeTarget(this);//嘲讽目标
                if (!ridiculeTarget) {
                    this.moveAttackIndex = 0
                    let teamUnit = this.battleLogic.getTeamByTeamId(this.teamId)
                    let searchRange = Math.min(500, Math.min(this.searchRange(), this.hateDistance))
                    let enemys = this.battleLogic.unitCollisionsManager.getCircleUnits(SkillUtils.getTeamIdByFaction(this.teamId, TargetFaction.EnemySide), this.battleLogic.battleSetting.isStaticCreate ? this.pos : teamUnit.pos, searchRange);
                    let hasEnemy = false;
                    if (enemys?.length) {
                        for (let i = 0; i < enemys.length; i++) {
                            if (!this.moveAttackUidMap[enemys[i].uid]) {
                                hasEnemy = true;
                                this.moveAttackUidMap[enemys[i].uid] = true;
                                this.selectHatredTarget = this.selectMainTarget = enemys[i] as BattleUnit;
                                this.setMoveTarget(v2(this.selectHatredTarget.pos.x + this.battleLogic.randomMgr.randomInt(-50, 50), this.selectHatredTarget.pos.y + this.battleLogic.randomMgr.randomInt(-50, 50)))
                                this.moveAttackUidNum++;
                                if (this.moveAttackUidNum >= enemys.length) {
                                    this.clearMoveAttackUidMap()
                                }
                                break
                            }
                        }
                    }

                    if (!hasEnemy) {
                        this.clearMoveAttackUidMap()
                        this.setMoveTarget(v2(teamUnit.pos.x + this.battleLogic.randomMgr.randomInt(-50, 50), teamUnit.pos.y + this.battleLogic.randomMgr.randomInt(-50, 50)))
                    }
                }
            }
            else
                this.moveAttackIndex--;
        }
        else {
            PassivitySkillUtils.updatePassSkillFunction(this, PassivitySkillType.ConType_12, "setMoveTime", 0);
        }
    }

    private clearMoveAttackUidMap(): void {
        this.moveAttackUidNum = 0;
        this.moveAttackUidMap = {};
    }


    /***是否敌方重骑拥有移动攻击 */
    protected isEnemyHeavyMoveAttact(): boolean {
        return this.career == HeroCareerType.HeavyCavalry && this.canMoveAttack()
    }

    /***打断动作 */
    public stopAction(): void {
        if (this._state != ActorState.Die && this._state != ActorState.Vertigo)
            this.setState(ActorState.Idle)
        this.attackActionComplete(true)
    }

    /***打断攻击 */
    protected stopAttacAction(): void {
        this.setState(ActorState.Idle)
        this.attackActionComplete(true)
    }

    /***获取当前绑定的对应显示单位，不一定有值 */
    public showUnit(): BattleShowUnit {
        return super.showUnit() as BattleShowUnit;
    }

    /***获取当前绑定的对应显示单位，无的话强制生成 */
    public showCreateUnit(): BattleShowUnit {
        let showUnit = this.showUnit()
        if (!showUnit) {
            showUnit = this.battleLogic.showMgr.createOneShowUnit(this) as BattleShowUnit;
        }
        return showUnit;
    }

    /***死亡动作播放完回调 */
    protected onDieActionComplete(): void {

    }

    public addBuff(buff: SkillBuff): void {
        this._attr.addBuff(buff)
        if (buff.effectType == BuffType.Ridicule) {
            let ridiculeTarget = this.battleLogic.buffMgr.getRidiculeTarget(this)
            if (ridiculeTarget) {
                if (this.selectMainTarget && this.selectMainTarget.teamId != this.teamId) {
                    //假如是敌方目标，打断当前攻击
                    this.stopAction();
                }
                this.selectMainTarget = this.selectHatredTarget = ridiculeTarget;
                this.showUnit()?.showOtherNum("chaofeng")
            }
        }
        else if (buff.effectType == BuffType.Charm) {
            //魅惑打断当前动作
            this.stopAction();
        }
        else if (buff.effectType == BuffType.Tie) {
            //束缚
            this.stopAction();
        }
        this.battleLogic.command.send(BattleCommandType.addBuff, this.uid, buff)
    }

    public updateBuff(buff: SkillBuff): void {
        this.battleLogic.command.send(BattleCommandType.updateBuff, this.uid, buff)
    }

    public removeBuff(buff: SkillBuff): void {
        if (buff.skillBuffGroup.cfg.flag == BuffGroupFlagType.ANuBiSi) {
            buff.target.attr.setSizeScale(1)
            buff.target?.showUnit()?.fadeScale(1)
        }
        this.battleLogic.command.send(BattleCommandType.removeBuff, this.uid, buff)
    }

    /***添加BUFF特效 */
    public addBuffEff(buff: SkillBuffGroup): void {
        if (buff.cfg.param?.delay) {
            this.battleLogic.createTimeCheck(buff.cfg.param.delay, new Handler(this, this.addBuffEffectHandler, [buff]))
        }
        else
            this.addBuffEffectHandler(buff)
    }

    protected addBuffEffectHandler(buff: SkillBuffGroup): void {
        if (buff.cfg.modelId) {
            this.battleLogic.command.send(BattleCommandType.addBuffEff, this.uid, buff.cfg.modelId, buff.cfg.upLow1, buff.cfg.animPosType)
        }
        if (buff.cfg.modelId2) {
            this.battleLogic.command.send(BattleCommandType.addBuffEff, this.uid, buff.cfg.modelId2, buff.cfg.upLow2, buff.cfg.animPosType2)
        }
    }

    public clearBuffEffect(buff: SkillBuffGroup): void {
        if (!buff.isCanRemoveEffect())
            return;

        if (buff.cfg.modelId) {
            if (buff.cfg.animPosType == BuffEffectPos.OnceNotEnd || buff.cfg.animPosType == BuffEffectPos.OnceForAct) {

            }
            else
                this.battleLogic.command.send(BattleCommandType.clearBuffEff, this.uid, buff.cfg.modelId)
        }

        if (buff.cfg.modelId2) {
            if (buff.cfg.animPosType2 == BuffEffectPos.OnceNotEnd || buff.cfg.animPosType2 == BuffEffectPos.OnceForAct) {

            }
            else
                this.battleLogic.command.send(BattleCommandType.clearBuffEff, this.uid, buff.cfg.modelId2)
        }
    }

    /***buff执行前 */
    public buffBeforce(buff: SkillBuff): void {

    }

    /***buff执行后 */
    public buffAfter(buff: SkillBuff): void {

    }

    /***获取移动路径的目标点 */
    protected getForceMovePathTarget(): Vec2 {
        if (this.selectMainTarget)
            return this.selectMainTarget.pos
    }

    /***检查是否进入战斗 */
    public checkEnterFight(): void {
        if (this.battleLogic.isSafe)
            return

        if (this.isBeginToFight)
            return

        if (this._moveVec.isCrtl && !this.canMoveAttack())//骑乘攻击状态可以在移动中攻击，所以忽略这个判断
            return

        if (this.battleLogic.isStopFightAi)
            return

        // if (!this.summon) {
        if (this.summon?.byUid) {
            let summonFatherUnit = this.battleLogic.getBatteUintByUid(this.summon.byUid);
            if (!summonFatherUnit.isBeginToFight) {
            }
            else {
                //召唤物主人进战，则自己也进战，且锁定主人的目标
                this.selectHatredTarget = summonFatherUnit.selectHatredTarget;
                this.enterFight();
            }
            return
        }
        var enemys = UnitSearchUtils.getUnitsByCircle(this, SkillUtils.getTeamIdByFaction(this.teamId, TargetFaction.EnemySide), this.searchRange());
        if (enemys) {
            let nearestEnemys: BattleUnit[] = []
            for (let i = 0; i < enemys.length; i++) {
                if (!this.checkHateDis(enemys[i].pos)) {
                    let dis: number = Vec2.distance(enemys[i].pos, this.pos)
                    enemys[i]["findLatelyEntity_dis"] = dis;
                    nearestEnemys.push(enemys[i])
                }
            }
            if (nearestEnemys.length > 0) {
                SortUtils.sortBy2(nearestEnemys, ["findLatelyEntity_dis"], [true], false)
                this.selectHatredTarget = nearestEnemys[0];
                this.battleLogic.checkBattleUnitHateGroup(this, nearestEnemys[0])
                this.enterFight();
            }
        }
        // }

        // var enemy = UnitSearchUtils.getNearestBattleUnit(this, SkillUtils.getTeamIdByFaction(this.teamId, TargetFaction.EnemySide), this.searchRange());
        // if (enemy) {
        //     this.selectHatredTarget = enemy;
        //     this.enterFight();
        // }
    }

    /***
     * 进入战斗
     * teamEnter 是否全队进战
     *  */
    public enterFight(teamEnter: boolean = true): boolean {
        if (this.isBeginToFight)
            return false
        this.isBeginToFight = true;
        if (teamEnter)
            this.battleLogic.enterFight(this.teamId)
        this.battleLogic.enterBattleState();
        this.attr.resetSkillCd();
        this.attr.resetSkillPreCd();
        PassivitySkillUtils.checkPassSkillCon(PassivitySkillType.ConType_5, this, this);
        PassivitySkillUtils.checkHpChangePassSkill(this);
        PassivitySkillUtils.checkLeaderSkillCon(LeaderSkillTriggerType.EnemyNum, SkillUtils.getTeamIdByFaction(this.teamId, TargetFaction.EnemySide), this, this)
        return true
    }

    /***脱离战斗 */
    public exitFight(): void {
        if (this.isBeginToFight) {
            this.isBeginToFight = false;
            PassivitySkillUtils.updatePassSkillFunction(this, PassivitySkillType.ConType_19, "setTotalHurt", 0);
            this.battleLogic.haloMgr.removeHaloByHeroDie(this.uid)
            // HaloManager.ins().removeHaloByHeroDie(this.uid)
            this.attr.resetBuff(true)
            this.attr.resetSkillPreCd();
            this.attr.resetSkillCd();
            this.attr.resetSkill()
            this.clearHatredTarget();
            this.clearMainTarget();
            this.battleLogic.command.send(BattleCommandType.exitFight, this.uid)
            this.clearMoveAttackUidMap()
        }
        // this.skillInfo = null;
        // this.skillInfoCtrl = null;
    }

    /***结束战斗 */
    public endFight(): void {
        this.stopAction();
        this._moveVec.resetVec();
    }

    /***开始战斗 */
    public startFight(): void {
        if (!this.isDeath)
            this.setState(ActorState.Idle);
    }

    get unit(): BattleUnit {
        return this;
    }

    public setIsGhost(v: boolean): void {
        this.isGhost = v;
    }

    /***是否算作1个英雄 */
    public isHero(): boolean {
        return false
    }

    /***是否能脱战 */
    public canExitBattle(): boolean {
        return this.isDeath || !this.selectHatredTarget
    }

    /***移除单位 */
    public removeUnit(): void {
        this.attr.resetBuff()
        this.toDie()
        if (this.showUnit()) {
            this.showUnit().visible = false;
        }
        // this.needDispose()
    }

    public get caster(): BattleUnit {
        return this.battleLogic.getUnitByUid(this.casterUid) as BattleUnit
    }

    /***是否存在场景中，false的话证明被移除了Uid */
    public inScene(): boolean {
        let unit = this.battleLogic.getBatteUintByUid(this.uid)
        if (unit)
            return true
        return false;
    }

    /**销毁 */
    dispose() {
        if (this.comps) {
            for (let i = 0; i < this.comps.length; i++) {
                this.comps[i].dispose()
            }
            this.comps = null;
        }
        this.attackActionComplete(true)
        this.battleLogic.summonDieByHero(this.uid)
        if (this.attr)
            this.attr.hp = 0;
        if (this.summonTimeOutCheck)
            this.summonTimeOutCheck.isReadyToRemove = true;
        this.exitFight();
        super.dispose();
    }
}

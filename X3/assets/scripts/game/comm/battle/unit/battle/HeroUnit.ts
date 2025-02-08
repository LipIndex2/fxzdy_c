import { ActorState, UnitType } from "../../enum/BattleEnum";
import { BattleUnit } from "./BattleUnit";
import { BattleAttr } from "../../attribute/BattleAttr";
import { Vec2 } from "cc";
import { MathUtils } from "../../../../../core/utils/MathUtils";
import { MineralUnit } from "../MineralUnit";
import { CollisionUtils } from "../../../math/CollisionUtils";
import BattleConstantConfig from "../../config/BattleConstantConfig";
import UnitSearchUtils from "../../collisions/UnitSearchUtils";
import { IBattleUnitData } from "../../../../modules/battle/vo/IBattleUnitData";
import { BattleUtils } from "../../BattleUtils";
import { DamageVo } from "../../DamageVo";
import { FormationType } from "../../skill/SkillEnum";
import { ServerEnums } from "../../../../../libs/extras/ServerEnums";
import { BattleDebugManager } from "../../BattleDebugManager";
import { BattleCommandType } from "../../BattleCommand";
import { HeroShowUnit } from "../../show/HeroShowUnit";
import { DropUnit } from "../DropUnit";

export class HeroUnit extends BattleUnit {
    protected _type: UnitType = UnitType.Hero;
    private _cfg: table.hero.HeroConfig;
    /***是否助战英雄 */
    public isHelpHero: boolean = false

    constructor () {
        super();
    }

    init(cfg: table.hero.HeroConfig, data: IBattleUnitData) {
        this._cfg = cfg;
        this._attr = BattleAttr.create(this);
        this._attr.initByHero(cfg, data);
        this.initModelCfg(cfg.modelId)
    }

    updateAttr(data: IBattleUnitData) {
        this._attr.updateHeroAttr(data);
        this.updateHpBar()
    }

    updateSkills(skills: string[]) {
        this._attr.updateSkills(skills);
    }

    get camp() {
        return this._cfg.camp;
    }

    get heroName() {
        return this._cfg?.name
    }

    /***性别 */
    public get sex(): string {
        return this._cfg.gender;
    }

    /***职业 */
    public get career(): ServerEnums.Career {
        return ServerEnums.Career[this._cfg.career];
    }

    /***近战远程 */
    public getAttackRange(): string {
        return this._cfg.attackRange
    }

    /**索敌范围 */
    public searchRange() {
        if (this.battleLogic.battleSetting.isPvpModel) {
            return 9999999
        }
        else if (this.battleLogic.mapCfg.heroSearchRange) {
            return this.battleLogic.mapCfg.heroSearchRange + this.battleLogic.buffMgr.getSearchRange(this);
        }
        return super.searchRange();
    }

    get seatType() {
        return this._cfg.type;
    }

    get seatSort() {
        return this._cfg.sort;
    }

    get heroId() {
        return this._cfg.id;
    }

    /***是否飞行单位 */
    get isFlyUnit(): boolean {
        return this._cfg.isFly
    }

    get formationSort(): number {
        return this._cfg.sort;
    }

    /***前中后排 */
    get formationType(): FormationType {
        return Math.floor(this._cfg.sort / 100);
    }

    /**仇恨距离 */
    get hateDistance() {
        if (this.battleLogic.battleSetting.isPvpModel) {
            return Number.MAX_SAFE_INTEGER;
        }
        if (this.battleLogic.battleSetting.lockCamera) {
            return Number.MAX_SAFE_INTEGER;
        }
        if (this.battleLogic.battleSetting.infiniteHate)
            return Number.MAX_SAFE_INTEGER;

        if (this.battleLogic.mapCfg.heroSearchRange)
            return this.battleLogic.mapCfg.heroSearchRange;
        return BattleConstantConfig.heroHateMaxRadius;
    }

    /**采矿的仇恨距离 */
    get collectHateDistance() {
        return BattleConstantConfig.heroCollectHateMaxRadius;
    }

    /**仇恨计算原点 */
    get originPos(): Vec2 {
        return this.battleLogic.getTeamPosByTeamId(this.teamId);
    }

    /**移动距离 */
    get moveDistance() {
        let baseSpeed = this._attr.moveSpeed * BattleUtils.frameDeltaMs
        if (this.isForcePathMove)
            return baseSpeed + BattleConstantConfig.heroMoveFormationSpeed * BattleUtils.frameDeltaMs
        return baseSpeed;
    }

    /***获取当前绑定的对应显示单位，不一定有值 */
    public showUnit(): HeroShowUnit {
        return super.showUnit() as HeroShowUnit;
    }

    protected onDie(damageVo?: DamageVo): void {
        super.onDie(damageVo);
        this.showUnit()?.showRebirthBar();
        this.showTalk(BattleUtils.getUnitTalk(this._cfg.talk, this._cfg.talkProbability))
    }

    isCanRebirth() {
        if (this.attr.isCanRebirth() && this.attr.isDeath()) {
            if (this.battleLogic.isSafe || this.attr.rebirthTime == 0) {
                return true
            }
            this.attr.updateRebirthTime();
            this.showUnit()?.updateRebirthBar(this.attr.rebirthTime)
        }
        return false;
    }

    protected onRebirth(): void {
        super.onRebirth();
        this.showUnit()?.onRebirth();
    }

    /***是否能走回阵位，只有攻击和采矿后的行为触发后，才能回阵位 */
    private canMoveToFormation: boolean = true;
    /**向阵位移动 */
    moveToFormation(force: boolean = false): void {
        if (this.battleLogic.battleSetting.isPvpModel)
            return
        let dis = Vec2.distance(this._formationPos, this._pos);
        if (dis <= 100 && !this.battleLogic.aStar.checkPointPassByPix(this._formationPos)) {
            //和阵容位置小于100时，且阵容位置是不可走点，那么就不再移动了
        }
        else if (dis <= 240 && !this.canMoveToFormation && !this._moveVec.isCrtl) {// (dis <= 150 && !this._moveVec.isCrtl) {
            //和阵容位置小于100时，且不是主动移动不归位
        }
        else if (dis > this.battleLogic.battleSetting.flashDis) {
            //大于1500距离马上瞬移到为止
            this.setPosXY(this._formationPos.x, this._formationPos.y)
        }
        else if (dis > 10) {
            this.envActive = false;
            let speed = 0;//BattleConstantConfig.heroMoveSpeed;
            if (!this._moveVec.isCrtl) {
                speed = BattleConstantConfig.heroMoveSpeed + BattleConstantConfig.heroMoveFormationSpeed;
            }
            else {
                speed = BattleConstantConfig.heroMoveFormationSpeed;
                if (dis > 200) {
                    speed *= 6;
                }
            }

            speed = speed * BattleUtils.frameDeltaMs;
            let radians = MathUtils.getRadians(this._pos.x, this._pos.y, this._formationPos.x, this._formationPos.y);
            let moveDistance = speed;
            let tempVec = MathUtils.tempVec2(moveDistance * Math.cos(radians), moveDistance * Math.sin(radians))
            // if (dis >= BattleConstantConfig.heroMoveFormationDis * 2) {
            //     //大于600距离，马上移动到身边
            //     this.stopByBlockTimes = 99999;
            //     this.forceMove1 = true;
            // }
            this._moveVec.setMoveVec(tempVec);
            if (force) {
                this.forceMovePathHandler();
            }
        }
    }

    public updatePos(): void {
        super.updatePos()
        if (this._moveVec.isMoving) {
            if (this._moveVec.isCrtl) {
                this.canMoveToFormation = false;
            }
            else
                this.canMoveToFormation = true;
        }
    }

    /**修正移动位置 */
    onBeforUpdatePos(): void {

        if (this._moveVec.isCrtl || (!this._moveVec.isMoving && !this.collectTarget && !this.isAttacking && !this.selectMainTarget && !this.collectHitTime)) {
            this.moveToFormation();
        }
        else
            this.envActive = true;
    }

    protected onMove(notBreakAttack: boolean = false): void {
        super.onMove(notBreakAttack)
        this.isInBlock = false;
        this.collectHitTime = 0;
        if (this._moveVec.isCrtl) {
            this.clearCollectTarget()
        }
    }

    /****挖矿受击的时间戳(帧) */
    private collectHitTime: number = 0;
    /**采集矿产 */
    collectMineral() {
        let mineralUnit = UnitSearchUtils.getNearestMineralUnit(this, this._attr.searchRange) as MineralUnit;
        if (mineralUnit) {

            if (Vec2.distance(mineralUnit.pos, this.originPos) >= this.collectHateDistance) {
                //超过仇恨距离
                this.clearCollectTarget()
                return false;
            }

            if (!this.collectTargetPos)
                this.findMineral(mineralUnit);//寻找可用的矿位

            this.collectTarget = mineralUnit;

            if (!this._moveVec.isCrtl && Vec2.distance(this.collectTargetPos, this.pos) <= 50) {
                if (!this.collectHitTime) {
                    //开始挖矿动作
                    this.stopMove()
                    this.beginCollect()
                }
            }
            else {
                // let vec = CollisionUtils.calVecTemp(this.pos, this.collectTargetPos, this.moveDistance);
                // this._moveVec.setMoveVec(vec);
                this.setMoveTarget(this.collectTargetPos)
            }
            return true;
        }
        return false
    }

    /***寻找对应的矿点 */
    protected findMineral(mineralUnit: MineralUnit): void {
        let posKeys = mineralUnit.getEemptyPosList();
        if (posKeys.length == 0) {
            //用矿的坐标
            this.collectTargetPos = mineralUnit.pos;
            return
        }
        let minDis: number = 999999999999;
        let minKey: string = ""
        for (let i = 0; i < posKeys.length; i++) {
            let collectPos = mineralUnit.getPosByKey(posKeys[i])
            if (this.battleLogic.aStar.checkPointPassByPix(collectPos)) {
                let tempDis = MathUtils.distance(this.pos, collectPos)
                if (tempDis < minDis) {
                    minDis = tempDis;
                    minKey = posKeys[i]
                }
            }
        }

        if (minKey == "") {
            //用矿的坐标
            this.collectTargetPos = mineralUnit.pos;
            return
        }

        this.collectTargetKey = minKey
        this.collectTargetPos = mineralUnit.getPosByKey(minKey)
        mineralUnit.setEmptyPos(minKey, false)
    }

    /***选择目标 */
    protected checkSelectTarget(): void {
        super.checkSelectTarget();
        if (this.selectMainTarget) {
            this.clearCollectTarget();
        }
    }

    private clearCollectTarget(): void {
        if (this.collectTarget && this.collectTargetKey) {
            this.collectTarget.showIdleEffect()
            this.collectTarget.setEmptyPos(this.collectTargetKey, true)
        }
        this.collectTargetKey = null;
        this.collectTargetPos = null;
        this.collectTarget = null;
        this.collectHitTime = 0;
        this.battleLogic.command.send(BattleCommandType.endCollect, this.uid, this.collectTarget)

    }

    /**检测对方状态 */
    protected checkTargetStatue(): void {
        super.checkTargetStatue()
        if (this.collectTarget && this.collectTarget.isDeath) {
            //采集目标死亡，马上停止动作切换
            this.clearCollectTarget();
            this._attackEndTime = 0;
            this.setState(ActorState.Idle);
        }
    }

    /***执行一定寻路次数时同步1下当前目标的坐标 */
    protected movePathTimes: number = 0
    /***判断路径位移 */
    protected checkPathMove(): void {
        super.checkPathMove()
        if (this.isForcePathMove) {
            this.movePathTimes++;
            if (this.movePathTimes > 30) {
                this.movePathTimes = 0;
                this.forceMovePathHandler();
            }
        }
    }

    protected forceMove1: boolean = false;
    /***移动碰撞到障碍物而暂停 */
    protected tryMove(pos: Vec2, moveVec: Vec2): boolean {
        if (this.forceMove1) {
            this.forceMove1 = false;
            this.stopByBlockTimes = 0;
            this.clearMainTarget()
            this.forceMovePathHandler();
            return false
        }

        return super.tryMove(pos, moveVec)
    }

    /***获取移动路径的目标点 */
    protected getForceMovePathTarget(): Vec2 {
        if (this.selectMainTarget)
            return this.selectMainTarget.pos
        else if (this.collectTarget)
            return this.collectTarget.pos
    }

    private beginCollect(): void {
        let dir = this.collectTarget.pos.x > this.pos.x ? -1 : 1
        // this._spineNode.setDirction(dir);
        this.setDirction(dir)
        this._attackEndTime = BattleUtils.getFrameByTime(1100);//挖矿动作时间
        this.collectHitTime = BattleUtils.getFrameByTime(666);
        let collectAction = this.collectTarget.getCollcetAction()
        this.setState(ActorState.Collect, collectAction);
        this.battleLogic.command.send(BattleCommandType.beginCollect, this.uid, this.collectTarget)
    }

    private collectTargetHurt(): void {
        if (this.collectHitTime) {
            this.collectHitTime--;
            if (this.collectHitTime <= 0) {
                this.collectTarget.hurt(this.uid);
                if (this.collectTarget.isDeath) {
                    this.clearCollectTarget();
                }
            }
        }
        else if (!this.isAttacking) {
            this.beginCollect();
        }
    }

    /***打断动作 */
    public stopAction(): void {
        super.stopAction();
        this.clearCollectTarget()
    }

    /***采集目标 */
    private collectTarget: MineralUnit;
    /***前往采集的目标位置 */
    private collectTargetPos: Vec2;
    private collectTargetKey: string;
    /**处理其他事情 */
    protected doOther() {
        super.doOther()
        if (this.collectTarget && ActorState.Collect == this._state) {
            this.collectTargetHurt()
        }
        else if (!this.selectMainTarget && !this._moveVec.isCrtl && !this.isAttacking) {
            let team = this.battleLogic.getTeamByTeamId(this.teamId)
            if (team.isTeamFighting) {
                //附近无敌人的时候，假如队伍是参战状态，就前往队友的目标
                let teamSelectTarget = team.getTeamSelectMainTarget()
                if (teamSelectTarget) {
                    let vec = CollisionUtils.calVecTemp(this.pos, teamSelectTarget.pos, this.moveDistance);
                    this._moveVec.setMoveVec(vec);
                }
                return
            }
            this.collectMineral();//无攻击目标就去挖矿
        }
    }

    public update(): boolean {
        let b = super.update()
        if (b) {
            this.checkDropHandler()
        }
        return b;
    }

    /***检查附近的掉落物 */
    private checkDropHandler(): void {
        let drops = this.battleLogic.unitCollisionsManager.getCircleDropUnits(this.pos, 150);
        for (let i = 0; i < drops.length; i++) {
            if (drops[i].canGet && !drops[i].isGet) {
                drops[i].getDropByHero(this)
            }
        }
    }

    /**更新AI */
    protected updateAI() {
        if (BattleDebugManager.ins().isHeroNotAttack)
            return
        super.updateAI()
    }

    /***是否算作1个英雄 */
    public isHero(): boolean {
        return true
    }

    protected markVerify(): void {
        this.battleLogic.markVerify(this);
    }
}
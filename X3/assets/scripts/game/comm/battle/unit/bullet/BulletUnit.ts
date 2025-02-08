import { Vec2, v2 } from "cc";
import { BaseUnit } from "../BaseUnit";
import { MathUtils } from "../../../../../core/utils/MathUtils";
import { _decorator } from "cc";
import { IPool } from "../../../../../core/pool/IPoolInstance";
import { SkillBehavior } from "../../skill/SkillBehavior";
import { ICaster } from "../../skill/ICaster";
import { BaseSkillData } from "../../skill/BaseSkillData";
import { BattleUnit } from "../battle/BattleUnit";
import { ITarget } from "../../skill/ITarget";
import { BattleUtils } from "../../BattleUtils";
import { BattleCommandType } from "../../BattleCommand";
import { PoolManager } from "../../../../../core/pool/PoolManager";
import { BulletShowUnit } from "../../show/BulletShowUnit";

/**普通子弹单位 （必中） */
export class BulletUnit extends BaseUnit implements IPool, ICaster {
    public _cfg: table.battle.MissileConfig;
    public hurt: number;
    public atk: number;

    /***所属队伍 */
    public teamId: number;
    /***目标队伍 */
    public targetTeamId: number
    /**施法者 */
    public casterUid: number;
    /**目标者 */
    public targetUid: number;

    /***所属技能 */
    public skill: BaseSkillData
    public behavior: SkillBehavior
    protected _bulletType: number;

    /**移动向量 */
    protected _moveVec: Vec2 = v2();
    /**起始位置 */
    protected _startVec: Vec2 = v2();

    /**运行时间 */
    protected _runTime: number = 0;
    /**最大运行时间 */
    protected _maxTime: number = 0;

    protected _isActive;

    protected target: ITarget

    /***携带的自定义参数 */
    public exData: any

    init(data: table.battle.MissileConfig) {
        this._cfg = data;
        this._isActive = true;
        this._runTime = 0;
    }

    initParam(atk: number, targetPos: { x: number, y: number }, atkPoint: { x: number, y: number }, from: ICaster, target: ITarget) {
        this.atk = atk;

        this.target = target

        this._startVec.set(atkPoint.x, atkPoint.y);
        this.pos.set(atkPoint.x, atkPoint.y);

        let radians = MathUtils.getRadians(this._pos.x, this._pos.y, targetPos.x, targetPos.y);
        let angle = MathUtils.radians2Angle(radians);
        this.battleLogic.showMgr.setStatue(this.uid, { angle: angle + 180 });

        this._moveVec.set(this.moveSpeed * Math.cos(radians), this.moveSpeed * Math.sin(radians));
        let dis = MathUtils.getDistance(this.pos.x, this.pos.y, targetPos.x, targetPos.y) - 10;

        this._maxTime = BattleUtils.getFrameByTime(dis / this.moveSpeed);
    }

    /***获取当前绑定的对应显示单位，不一定有值 */
    public showUnit(): BulletShowUnit {
        return this.battleLogic.showMgr.getUnit(this.uid) as BulletShowUnit;
    }

    get cfg(): table.battle.MissileConfig {
        return this._cfg
    }

    get isActive(): boolean {
        return this._isActive;
    }

    get atkPoint() {
        return this._pos;
    }

    public get caster(): BattleUnit {
        return this.battleLogic.getUnitByUid(this.casterUid) as BattleUnit
    }

    /**每毫秒移动速度 */
    get moveSpeed() {
        return this._cfg.speed / 1000;
    }

    get moveVec(): Vec2 {
        return this._moveVec
    }

    /**检测是否触发 */
    checkTrigger() {
        let target = this.battleLogic.getBatteUintByUid(this.targetUid);
        if (target && MathUtils.distance(this.pos, target.pos) <= target.attr.getSize()) {
            this.hit(target)
            this.action();
            this.showBulletEffect(target)
        } else if (this._runTime >= this._maxTime) {
            this.action();
            this.showBulletEffect(target)
        }
    }

    update(): boolean {
        let t = BattleUtils.frameDeltaMs;
        this._runTime++
        this.pos.add2f(this._moveVec.x * t, this._moveVec.y * t);
        this.checkTrigger();
        return true
    }

    hit(hurtTarget: BattleUnit): void {
        this.battleLogic.command.send(BattleCommandType.hit, this.uid, hurtTarget)
    }

    action() {
        this._isActive = false;
        this.actionBehavior();
    }

    actionBehavior(): void {
        let behaviorIds = this._cfg.behaviors;
        if (behaviorIds) {
            for (let i = 0; i < behaviorIds.length; i++) {
                let behaviorId = behaviorIds[i];
                let behavior = SkillBehavior.createBehavior(behaviorId, 0, this.skill);
                if (behavior) {
                    behavior.skillGroupIndex = this.behavior?.skillGroupIndex;
                    behavior.index = 0;
                    behavior.skillTarget = this.target;
                    behavior.skillTargetUid = this.targetUid;
                    behavior.setCaster(this)
                    this.skill.fightSkillInfo.beginBehaviorEffect(behavior, this)
                }
            }
        }
    }

    protected showBulletEffect(target: BattleUnit): void {
        this.battleLogic.command.send(BattleCommandType.bulletEffect, this.uid, target)
    }

    /***是否存在场景中，false的话证明被移除了Uid */
    public inScene(): boolean {
        if (this.caster)
            return true
        return false;
    }

    dispose() {
        this.battleLogic.command.send(BattleCommandType.dispose, this.uid)
        this.battleLogic.unitProcessor.removeQuoteUid(this.casterUid);
        PoolManager.recovery(this);
    }

    onRecovery(): void {
        // this._uid = StateMemory.createUid();
    }
}
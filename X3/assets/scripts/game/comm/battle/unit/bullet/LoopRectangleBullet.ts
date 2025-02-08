import { v2 } from "cc";
import { MathUtils } from "../../../../../core/utils/MathUtils";
import { BattleUtils } from "../../BattleUtils";
import { ICaster } from "../../skill/ICaster";
import { ITarget } from "../../skill/ITarget";
import { SkillData } from "../../skill/SkillData";
import { SkillSubType } from "../../skill/SkillEnum";
import { BulletUnit } from "./BulletUnit";
import { BulletShowUnit } from "../../show/BulletShowUnit";
import { SkillUtils } from "../../skill/SkillUtils";
import { BattleUnit } from "../battle/BattleUnit";
import UnitSearchUtils from "../../collisions/UnitSearchUtils";

export class LoopRectangleBulletShow extends BulletShowUnit {
    public unitData: LoopRectangleBullet;

    protected onSpineLoaded(): void {
        super.onSpineLoaded()
        this.updateScale();
    }

    protected updateScale(): void {
        this._spineNode.setScale(this.unitData.cfg.distance / this.unitData.bulletWidth, 1)
    }
}


/**持续的直线弹道 */
export class LoopRectangleBullet extends BulletUnit {
    public bulletWidth: number
    private targetPos: { x: number, y: number }
    private interval: number = 0;
    private initInterval: number = 0;
    private startPoint: { x: number, y: number }
    private casterPoint: { x: number, y: number }
    private autoLockRange: number = 0;
    private nowTarget: BattleUnit
    initParam(atk: number, targetPos: { x: number, y: number }, atkPoint: { x: number, y: number }, from: ICaster, target: ITarget) {
        this.atk = atk;
        this.targetPos = targetPos
        this.startPoint = v2(atkPoint.x - this.caster.pos.x, atkPoint.y - this.caster.pos.y);;
        this.casterPoint = v2(0, 0);

        let parameter: { width: number, interval: number, autoLock: number } = this._cfg.parameter;
        this.bulletWidth = parameter.width;
        this.interval = 0;
        this.initInterval = BattleUtils.getFrameByTime(parameter.interval || 0);
        if (target && target instanceof BattleUnit) {
            this.autoLockRange = parameter.autoLock || 0;
            this.nowTarget = target;
        }

        this.updatePos(atkPoint, targetPos);

        this._maxTime = BattleUtils.getFrameByTime(this._cfg.timeLimit);
    }

    protected updatePos(atkPoint: { x: number, y: number }, targetPos: { x: number, y: number }): void {
        this._startVec.set(atkPoint.x, atkPoint.y);
        this.pos.set(atkPoint.x, atkPoint.y);

        if (this.autoLockRange && (!this.nowTarget || !this.nowTarget.isActive) && this.skill instanceof SkillData) {
            //当前目标死亡，更换目标
            this.nowTarget = UnitSearchUtils.getNearestBattleUnit(this.caster, this.targetTeamId, this.autoLockRange)
        }

        if (this.nowTarget) {
            let effectParam: { missileId: string, notHurtPoint?: number, notAtkPoint?: number } = this.behavior.effectParam;
            if (effectParam.notHurtPoint) {
                targetPos.x = this.nowTarget.pos.x;
                targetPos.y = this.nowTarget.pos.y;
            }
            else {
                targetPos.x = this.nowTarget.hurtPoint.x;
                targetPos.y = this.nowTarget.hurtPoint.y;
            }

            this.target = this.nowTarget;
            this.targetUid = this.target.uid;
        }

        let radians = MathUtils.getRadians(this._pos.x, this._pos.y, targetPos.x, targetPos.y);
        let angle = MathUtils.radians2Angle(radians);
        this.battleLogic.showMgr.setStatue(this.uid, { angle: angle + 180 });
    }

    /**检测是否触发 */
    checkTrigger() {
        if (!this.caster) {
            this._isActive = false;
            return
        }

        this.casterPoint.x = this.caster.pos.x + this.startPoint.x;
        this.casterPoint.y = this.caster.pos.y + this.startPoint.y;
        this.updatePos(this.casterPoint, this.targetPos);

        if (!this.caster.skillInfo && !(this.skill instanceof SkillData && this.skill.canMoveSkill())) {
            this._isActive = false;
            return
        }

        if (this.interval <= 0) {
            this.action();
            this.interval = this.initInterval
        }
        this.interval--;

        if (this._runTime >= this._maxTime) {
            this._isActive = false;
            if (this.skill instanceof SkillData && SkillUtils.checkSkillSubType(SkillSubType.Loop, this.skill.getSubType())) {
                // this.caster.stopLoopSkilAction()
            }
        }
    }

    action() {
        this.actionBehavior();
    }
}
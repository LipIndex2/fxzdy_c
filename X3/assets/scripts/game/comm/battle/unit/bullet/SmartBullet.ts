import { MathUtils } from "../../../../../core/utils/MathUtils";
import { BattleUtils } from "../../BattleUtils";
import UnitSearchUtils from "../../collisions/UnitSearchUtils";
import { ICaster } from "../../skill/ICaster";
import { ITarget } from "../../skill/ITarget";
import { TargetFaction } from "../../skill/SkillEnum";
import { SkillUtils } from "../../skill/SkillUtils";
import { BattleUnit } from "../battle/BattleUnit";
import { BulletUnit } from "./BulletUnit";

/**跟踪子弹 */
export class SmartBullet extends BulletUnit {
    protected angle: number
    initParam(atk: number, targetPos: { x: number, y: number }, atkPoint: { x: number, y: number }, from: ICaster, target: ITarget) {
        super.initParam(atk, targetPos, atkPoint, from, target)
        this._maxTime = BattleUtils.getFrameByTime(this._cfg.timeLimit);
        let radians = MathUtils.getRadians(atkPoint.x, atkPoint.y, targetPos.x, targetPos.y);
        this.angle = MathUtils.radians2Angle(radians);
    }

    update(): boolean {
        let radians = MathUtils.getRadians(this._pos.x, this._pos.y, this.target.hurtPoint.x, this.target.hurtPoint.y);
        let angle = MathUtils.radians2Angle(radians);
        this.battleLogic.showMgr.setStatue(this.uid, { angle: angle + 180 });
        this._moveVec.set(this.moveSpeed * Math.cos(radians), this.moveSpeed * Math.sin(radians));
        return super.update()
    }

    /**检测是否触发 */
    checkTrigger() {
        let units: BattleUnit[]
        let parameter: { width: number, height: number } = this._cfg.parameter;
        let isRect: boolean = false
        if (parameter?.width && parameter?.height) {
            isRect = true
            units = UnitSearchUtils.getUnitsByRectAndRectParam(this.battleLogic.unitCollisionsManager, this.pos, SkillUtils.getTeamIdByFaction(this.teamId, TargetFaction.EnemySide), this.angle, parameter);
        }
        else
            units = UnitSearchUtils.getUnitsByCircle(this, this.targetTeamId, 100);

        let target = this.battleLogic.getBatteUintByUid(this.targetUid);
        if (target && units && units.indexOf(target) != -1) {
            this.hit(target)
            this.action();
            this.showBulletEffect(target)
        }
        if (this._runTime >= this._maxTime) {
            this._isActive = false;
        }
    }
}
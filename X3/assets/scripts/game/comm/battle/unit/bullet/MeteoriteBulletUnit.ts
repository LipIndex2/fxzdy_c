import { MathUtils } from "../../../../../core/utils/MathUtils";
import { BattleUtils } from "../../BattleUtils";
import { ICaster } from "../../skill/ICaster";
import { ITarget } from "../../skill/ITarget";
import { BulletUnit } from "./BulletUnit";

/**陨石弹道 */
export class MeteoriteBulletUnit extends BulletUnit {
    protected angle: number
    initParam(atk: number, targetPos: { x: number, y: number }, atkPoint: { x: number, y: number }, from: ICaster, target: ITarget) {
        this.atk = atk;
        let parameter: { angle: number } = this._cfg.parameter
        this.pos.set(targetPos.x, targetPos.y + this._cfg.distance);
        if (parameter?.angle) {
            let newPoint = MathUtils.getCoordinates(parameter.angle, this._cfg.distance)
            this.pos.set(targetPos.x + newPoint.x, targetPos.y + newPoint.y);
            this.battleLogic.showMgr.setStatue(this.uid, { angle: parameter.angle });
        }
        let radians = MathUtils.getRadians(this._pos.x, this._pos.y, targetPos.x, targetPos.y);
        if (!parameter?.angle) {
            let angle = MathUtils.radians2Angle(radians);
            this.battleLogic.showMgr.setStatue(this.uid, { angle: angle + 180 });
        }

        this._moveVec.set(this.moveSpeed * Math.cos(radians), this.moveSpeed * Math.sin(radians));
        let dis = MathUtils.getDistance(this.pos.x, this.pos.y, targetPos.x, targetPos.y) - 10;

        this._maxTime = BattleUtils.getFrameByTime(dis / this.moveSpeed);
        this.showUnit()?.setHitTipsCompTargetPos(targetPos)
    }
}


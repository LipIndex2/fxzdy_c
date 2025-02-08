import BattleTimer from "../../../../../core/timer/BattleTimer";
import { MathUtils } from "../../../../../core/utils/MathUtils";
import { BattleUnit } from "../battle/BattleUnit";
import { ThrowBulletUnit } from "./ThrowBulletUnit";

/**抛物线弹道 */
export class ThrowBulletTargetUnit extends ThrowBulletUnit {
    update(): boolean {
        this._runTime++;
        var x = this.pos.x;
        var y = this.pos.y;

        this.bezier2Tween.setPoint(this._startVec.x, this._startVec.y,
            this._startVec.x + (this.target.pos.x - this._startVec.x) / 2, Math.max(this._startVec.y, this.target.pos.y) + this._cfg.distance,
            this.target.pos.x, this.target.pos.y)

        var xy: { x: number, y: number } = this.bezier2Tween.getPosByFactor(this.factor)
        this.pos.set(xy.x, xy.y);
        var angle: number = MathUtils.getAngle(x, y, xy.x, xy.y)
        if (this.isAngle) {
            this.battleLogic.showMgr.setStatue(this.uid, { angle: angle + 180 });
        }
        this.factor += this.moveSpeed / 50 * BattleTimer.battleTickFrame;
        this.checkTrigger();
        return true
    }

    /**检测是否触发 */
    checkTrigger() {
        if (this.factor >= 1) {
            this._isActive = false;

            if (this.target instanceof BattleUnit) {
                this.targetUid = this.target.uid; //修改目标
                this.hit(this.target)
                this.action();
                this.showBulletEffect(this.target)
            }
        }

        if (this._runTime >= this._maxTime) {
            this._isActive = false;
        }
    }
}
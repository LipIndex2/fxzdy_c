import { Vec2 } from "cc";
import { MathUtils } from "../../../../../core/utils/MathUtils";
import { BattleUtils } from "../../BattleUtils";
import { BulletShowUnit } from "../../show/BulletShowUnit";
import { BulletUnit } from "./BulletUnit";

export class StretchBulletShow extends BulletShowUnit {
    public unitData: StretchBullet;

    protected onSpineLoaded(): void {
        super.onSpineLoaded()
        this.updateScale();
    }

    protected updateScale(): void {
        let dis = MathUtils.getDistance(this.unitData.targetPos.x, this.unitData.targetPos.y, this.unitData.startVec.x, this.unitData.startVec.y)
        this._spineNode.setScale(dis / this.unitData.bulletWidth, 1)
    }
}


/**拉伸弹道 */
export class StretchBullet extends BulletUnit {
    public bulletWidth: number
    public targetPos: { x: number, y: number }
    private delay: number;
    private isHurt: boolean = false;
    initParam(atk: number, targetPos: { x: number, y: number }, atkPoint: { x: number, y: number }, ...arg) {
        this.atk = atk;
        this.targetPos = targetPos
        this.isHurt = false;

        let parameter: { width: number, delay?: number } = this._cfg.parameter;
        this.bulletWidth = parameter.width;
        this.delay = BattleUtils.getFrameByTime(parameter.delay || 0);

        this._startVec.set(atkPoint.x, atkPoint.y);
        this.pos.set(atkPoint.x, atkPoint.y);

        let radians = MathUtils.getRadians(this._pos.x, this._pos.y, targetPos.x, targetPos.y);
        let angle = MathUtils.radians2Angle(radians);
        this.battleLogic.showMgr.setStatue(this.uid, { angle: angle + 180 });

        this._maxTime = BattleUtils.getFrameByTime(this._cfg.timeLimit);
    }

    get startVec(): Vec2 {
        return this._startVec
    }

    /**检测是否触发 */
    checkTrigger() {
        if (this.isHurt) {
            if (this._runTime >= this._maxTime) {
                this._isActive = false;
            }
            return
        }

        this.delay = Math.max(0, this.delay - 1)
        if (!this.delay) {
            this.isHurt = true;
            //触发后
            this.action();
        }
    }

    action() {
        this.actionBehavior();
    }
}
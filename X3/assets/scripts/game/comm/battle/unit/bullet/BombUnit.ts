import { BattleUtils } from "../../BattleUtils";
import { ICaster } from "../../skill/ICaster";
import { ITarget } from "../../skill/ITarget";
import { BulletUnit } from "./BulletUnit";

/**炸弹单位 （无弹道子弹） */
export class BombUnit extends BulletUnit {
    private tickTime: number = 0;
    private effectDelay: number = 0
    initParam(atk: number, targetPos: { x: number, y: number }, atkPoint: { x: number, y: number }, from: ICaster, target: ITarget) {
        this._isActive = true;
        let parameter: { delay: number, effectDelay: number } = this._cfg.parameter;
        this.tickTime = BattleUtils.getFrameByTime(parameter?.delay || 0);
        this.effectDelay = BattleUtils.getFrameByTime(parameter?.effectDelay || 0);
        this.atk = atk;
        this.target = target;
        this.pos.set(targetPos.x, targetPos.y);
        this.showUnit()?.setHitTipsCompTargetPos(targetPos)
    }

    /**检测是否触发 */
    checkTrigger() {
        this.action();
    }

    update(): boolean {
        if (this.effectDelay == 0) {
            this.showBulletEffect(null)
            this.effectDelay = -1;
        }
        else
            this.effectDelay--;

        if (this.tickTime <= 0)
            this.checkTrigger();
        else
            this.tickTime--;
        return true
    }
}
import { MathUtils } from "../../../../../core/utils/MathUtils";
import { BattleUtils } from "../../BattleUtils";
import { BattleUnit } from "../battle/BattleUnit";
import { BulletUnit } from "./BulletUnit";

/**前方矩形弹道 */
export class RectangleBulletUnit extends BulletUnit {

    initParam(atk: number, targetPos: { x: number, y: number }, atkPoint: { x: number, y: number }, ...arg) {
        this._isActive = true;
        this.atk = atk;
        let fix = this._cfg.pos?.x || 0;
        let fiy = this._cfg.pos?.y || 0;
        this.pos.set(atkPoint.x + +fix, atkPoint.y + +fiy);
        // this._spineNode.setPosition(atkPoint.x, atkPoint.y); //炸弹型直接 挂目标点

        let caster: BattleUnit = arg[0]
        let target: BattleUnit = arg[1]

        this.target = target


        let radians = MathUtils.getRadians(this.pos.x, this.pos.y, targetPos.x, targetPos.y);
        let angle = MathUtils.radians2Angle(radians);
        this.battleLogic.showMgr.setStatue(this.uid, { angle: angle + 180 });

        this._maxTime = BattleUtils.getFrameByTime(this._cfg.timeLimit || 2000);
    }

    /**检测是否触发 */
    checkTrigger() {
        this.action();
        if (this._runTime >= this._maxTime) {
            this._isActive = false;
        }
    }

    private isHurt: boolean = false;
    action() {
        if (this.isHurt)
            return
        this.isHurt = true;
        this.actionBehavior();
    }

    update(): boolean {
        this._runTime++;
        this.checkTrigger();
        return true
    }

    /**销毁 */
    dispose() {
        this.isHurt = false;
        super.dispose();
    }
}
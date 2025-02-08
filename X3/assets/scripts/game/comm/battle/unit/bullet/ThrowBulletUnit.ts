import { Bezier2Tween } from "../../../../../core/comp/Bezier2Tween";
import { MathUtils } from "../../../../../core/utils/MathUtils";
import { BulletUnit } from "./BulletUnit";
import UnitSearchUtils from "../../collisions/UnitSearchUtils";
import { BattleUnit } from "../battle/BattleUnit";
import { ITarget } from "../../skill/ITarget";
import { ICaster } from "../../skill/ICaster";
import { BattleUtils } from "../../BattleUtils";
import { PointTarget } from "../../skill/PointTarget";
import BattleTimer from "../../../../../core/timer/BattleTimer";

/**抛物线弹道 */
export class ThrowBulletUnit extends BulletUnit {

    protected factor: number = 0;
    protected bezier2Tween: Bezier2Tween
    protected isAngle: boolean = true;
    initParam(atk: number, targetPos: { x: number, y: number }, atkPoint: { x: number, y: number }, from: ICaster, target: ITarget) {
        this.atk = atk;
        this.factor = 0;
        if (!this.bezier2Tween)
            this.bezier2Tween = new Bezier2Tween()

        this._startVec.set(atkPoint.x, atkPoint.y);
        this.target = target;
        this.bezier2Tween.setPoint(atkPoint.x, atkPoint.y,
            atkPoint.x + (targetPos.x - atkPoint.x) / 2, Math.max(atkPoint.y, targetPos.y) + this._cfg.distance,
            this.target.pos.x, this.target.pos.y)

        this.isAngle = true;
        let param: { isAngle: number } = this._cfg.parameter
        if (param && param.isAngle == 0) {
            this.isAngle = false;
        }

        this.pos.set(atkPoint.x, atkPoint.y);
        this._maxTime = BattleUtils.getFrameByTime(10000);
        this.showUnit()?.setHitTipsCompTargetPos(targetPos)
    }

    update(): boolean {
        this._runTime++;
        var x = this.pos.x;
        var y = this.pos.y;
        var xy: { x: number, y: number } = this.bezier2Tween.getPosByFactor(this.factor)
        this.pos.set(xy.x, xy.y);
        var angle: number = MathUtils.getAngle(x, y, xy.x, xy.y)
        if (this.isAngle) {
            this.battleLogic.showMgr.setStatue(this.uid, { angle: angle + 180 });
        }
        this.factor += this.moveSpeed / 50 * BattleTimer.battleTickFrame;
        // let factorIncrement = this.moveSpeed / 20;
        // let factorMidPoint = 0.5; // 假设线段的中点是我们想要减速的地方
        // let factorCurrent = this.factor;

        // // 使用二次函数来控制速度的变化
        // // 当 factor 接近中点时，增加速率变小；远离中点时，增加速率变大
        // factorIncrement *= Math.pow(factorCurrent - factorMidPoint, 2);
        // factorIncrement = Math.max(factorIncrement, 0.005)
        // this.factor += factorIncrement;

        // // 确保 factor 不超出范围 [0, 1]
        // this.factor = Math.min(Math.max(this.factor, 0), 1);

        this.checkTrigger();
        return true
    }

    /**检测是否触发 */
    checkTrigger() {
        if (this.factor >= 1) {
            this._isActive = false;

            if (this.target instanceof BattleUnit) {
                let units = UnitSearchUtils.getUnitsByCircle(this, this.targetTeamId, 200);
                if (units?.length) {
                    let hurtTarget: BattleUnit;
                    let minDis = 9999999;
                    for (let i = 0; i < units.length; i++) {
                        let unit = units[i];
                        let dis = MathUtils.distance(unit.pos, this.pos);
                        if ((unit.attr.getSize() + 20) >= dis && dis < minDis) {
                            hurtTarget = unit;
                            minDis = dis;
                        }
                    }

                    if (hurtTarget) {
                        this.targetUid = hurtTarget.uid; //修改目标
                        this.hit(hurtTarget)
                        this.action();
                        this.showBulletEffect(null)
                        return;
                    }
                }
            }

            //不命中目标的话，以点为目标
            if (!this.target || !(this.target instanceof PointTarget)) {
                let pointTarget: PointTarget = this.target = new PointTarget(this.battleLogic);
                pointTarget.setPoint(this.pos.x, this.pos.y);
                pointTarget.teamId = this.targetTeamId;
            }

            this.action();
            this.showBulletEffect(null)
        }

        if (this._runTime >= this._maxTime) {
            this._isActive = false;
        }
    }
}
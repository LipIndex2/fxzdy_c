import { Vec2 } from "cc";
import { Bezier2Tween } from "../../../../../core/comp/Bezier2Tween";
import { MathUtils } from "../../../../../core/utils/MathUtils";
import { BattleUtils } from "../../BattleUtils";
import UnitSearchUtils from "../../collisions/UnitSearchUtils";
import { ICaster } from "../../skill/ICaster";
import { ITarget } from "../../skill/ITarget";
import { BattleUnit } from "../battle/BattleUnit";
import { BulletUnit } from "./BulletUnit";
import BattleTimer from "../../../../../core/timer/BattleTimer";
import { v2 } from "cc";

/**回旋弹道 */
export class ConvoluteBullet extends BulletUnit {
    private hitMap: { [uid: number]: boolean }
    protected factor: number = 0;
    protected bezier2Tween: Bezier2Tween
    protected isAngle: boolean = true;
    private startPos: { x: number, y: number }
    private endPoint: { x: number, y: number }
    private stageIndex: number = 2;//阶段
    private ctrlPoint: number
    private hitRadius: number = 100;
    private targetFactor: number = 1;
    initParam(atk: number, targetPos: { x: number, y: number }, atkPoint: { x: number, y: number }, from: ICaster, target: ITarget) {
        this.hitMap = {}
        this.atk = atk;
        this.factor = 0;
        this.targetFactor = 1
        this.stageIndex = 2
        if (!this.bezier2Tween)
            this.bezier2Tween = new Bezier2Tween()

        this.startPos = atkPoint;

        this.isAngle = true;
        let param: { isAngle: number, radius: number, ctrlPoint: number } = this._cfg.parameter
        if (param && param.isAngle == 0) {
            this.isAngle = false;
        }
        this.ctrlPoint = param.ctrlPoint;
        this.hitRadius = param.radius;

        let center = MathUtils.getTwoPointCenter(atkPoint.x, atkPoint.y, targetPos.x, targetPos.y, 0.5);
        let aPos = MathUtils.getCoordinates(-90 + 180, this.ctrlPoint);

        let angle = MathUtils.getAngle(atkPoint.x, atkPoint.y, targetPos.x, targetPos.y);
        // let disPos = MathUtils.getCoordinates(angle, this.cfg.distance);
        let disPos = MathUtils.getCoordinates(angle, this.cfg.distance);
        this.endPoint = v2(atkPoint.x + disPos.x, atkPoint.y + disPos.y);
        this.bezier2Tween.setPoint(atkPoint.x, atkPoint.y,
            center.x + aPos.x, center.y + aPos.y,
            this.endPoint.x, this.endPoint.y)



        this.pos.set(atkPoint.x, atkPoint.y);
        this.showUnit()?.setHitTipsCompTargetPos(atkPoint, angle)
        this._maxTime = BattleUtils.getFrameByTime(10000);
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
        // this.factor += this.moveSpeed / ((this.factor || 0.1) * 50)
        // 计算当前位置与终点的距离
        let remainingDistance = MathUtils.getDistance(this.endPoint.x, this.endPoint.y, xy.x, xy.y);

        // 根据剩余距离调整因子增量
        let factorIncrement = this.moveSpeed / 12 * BattleTimer.battleTickFrame;
        factorIncrement *= remainingDistance / this.cfg.distance; // 当remainingDistance接近0时，速度减慢

        factorIncrement = Math.max(factorIncrement, 0.01)
        // 更新 factor
        this.factor += factorIncrement;

        // 确保 factor 不超出范围 [0, 1]
        this.factor = Math.min(Math.max(this.factor, 0), 1);

        this.checkTrigger();
        return true
    }

    /**检测是否触发 */
    checkTrigger() {
        if (this.factor >= this.targetFactor) {
            this.stageIndex--;
            if (this.stageIndex <= 0) {
                this._isActive = false;
                return
            }
            this.hitMap = {};
            this.factor = 0;
            this.targetFactor = 0.8
            let center = MathUtils.getTwoPointCenter(this.pos.x, this.pos.y, this.startPos.x, this.startPos.y, 0.5);
            let aPos = MathUtils.getCoordinates(90 + 180, this.ctrlPoint);
            this.bezier2Tween.setPoint(this.pos.x, this.pos.y,
                center.x + aPos.x, center.y + aPos.y,
                this.startPos.x, this.startPos.y)
        }

        let units = UnitSearchUtils.getUnitsByCircle(this, this.targetTeamId, this.hitRadius);
        if (units?.length) {
            for (let i = 0; i < units.length; i++) {
                let unit = units[i];
                if (!this.hitMap[unit.uid]) {
                    let dis = MathUtils.distance(unit.hurtPoint as Vec2, this.pos);
                    if ((unit.attr.getSize() + this.hitRadius * 0.5) >= dis) {
                        if (unit) {
                            this.targetUid = unit.uid; //修改目标
                            this.hit(unit)
                        }
                    }
                }
            }
        }
    }

    hit(hurtTarget: BattleUnit) {
        if (hurtTarget) {
            this.hitMap[hurtTarget.uid] = true
            super.hit(hurtTarget)
        }
        this.action();
        this.showBulletEffect(hurtTarget)
    }

    action() {
        this.actionBehavior();
    }
}
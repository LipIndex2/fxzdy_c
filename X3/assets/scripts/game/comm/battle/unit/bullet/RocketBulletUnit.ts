import { Vec2 } from "cc";
import { Bezier2Tween } from "../../../../../core/comp/Bezier2Tween";
import { MathUtils } from "../../../../../core/utils/MathUtils";
import { ICaster } from "../../skill/ICaster";
import { ITarget } from "../../skill/ITarget";
import { PhysicalBulletUnit, PhysicalBulletUnitShow } from "./PhysicalBulletUnit";
import { v2 } from "cc";
import { BattleUnit } from "../battle/BattleUnit";
import { DirctionType } from "../../enum/BattleEnum";
import { BattleUtils } from "../../BattleUtils";
import { BattleCommandType } from "../../BattleCommand";
import { Handler } from "../../../../../core/utils/Handler";
import { DebugUtils } from "db://assets/scripts/core/utils/DebugUtils";

export class RocketBulletUnitShow extends PhysicalBulletUnitShow {

    /***初始化监听的战斗指令 */
    protected initCommand(): void {
        super.initCommand()
        this.unitData.battleLogic.command.reg(BattleCommandType.rocketBulletRotateToAngle, this.uid, new Handler(this, this.rotateToAngle))
    }

    private rotateToAngle(targetAngle: number): void {
        var distance = Math.abs(targetAngle - this._spineNode.angle);
        var step = distance / 5;

        if (distance === 0) {
            DebugUtils.isDebugMode() && console.log('已经到达目标角度');
            return;
        }

        if (distance < step) {
            DebugUtils.isDebugMode() && console.log('旋转到目标角度');
            this._spineNode.angle = targetAngle;
        } else {
            if (targetAngle < this._spineNode.angle) {
                this._spineNode.angle -= step;
            } else {
                this._spineNode.angle += step;
            }
        }
    }
}


/**火箭弹 */
export class RocketBulletUnit extends PhysicalBulletUnit {
    /***当前速度 */
    private addSpeed: number = 0;
    private step: number = 0
    protected bezier2Tween: Bezier2Tween
    protected factor: number = 0;
    protected targetPos: { x: number, y: number }
    protected targetAngle: number = 0;
    initParam(atk: number, targetPos: { x: number, y: number }, atkPoint: { x: number, y: number }, from: ICaster, target: ITarget) {
        this.atk = atk;
        this.factor = 0
        this.nowDis = 0;
        this.addSpeed = 0;
        this.step = 0;

        if (!this.bezier2Tween)
            this.bezier2Tween = new Bezier2Tween()

        this.targetPos = targetPos;
        let beginPos: Vec2
        if (from instanceof BattleUnit && from.dirction == DirctionType.Left) {
            beginPos = v2(atkPoint.x - 60, atkPoint.y)
            this.bezier2Tween.setPoint(beginPos.x, beginPos.y,
                beginPos.x - 70, beginPos.y + 100,
                beginPos.x - 80, beginPos.y)
        }
        else {
            beginPos = v2(atkPoint.x + 60, atkPoint.y)
            this.bezier2Tween.setPoint(beginPos.x, beginPos.y,
                beginPos.x + 70, beginPos.y + 100,
                beginPos.x + 80, beginPos.y)
        }


        let radians = MathUtils.getRadians(this.pos.x, this.pos.y, this.targetPos.x, this.targetPos.y);
        this.targetAngle = MathUtils.radians2Angle(radians) + 180;
        this.pos.set(beginPos.x, beginPos.y);

        this.battleLogic.showMgr.setStatue(this.uid, { angle: 270 });
        this.missileDis = this._cfg.distance + this.caster.battleLogic.buffMgr.getMissileDis(from);

        this._maxTime = BattleUtils.getFrameByTime(this._cfg.timeLimit || 2000);
        this.showUnit()?.setHitTipsCompTargetPos(this.targetPos)
    }

    update(): boolean {
        let t = BattleUtils.frameDeltaMs;
        this._runTime++;

        if (this.step == 0) {
            var xy: { x: number, y: number } = this.bezier2Tween.getPosByFactor(this.factor)
            this.pos.set(xy.x, xy.y);
            this.factor += this.moveSpeed / 20
            let radians = MathUtils.getRadians(this.pos.x, this.pos.y, this.targetPos.x, this.targetPos.y);
            this.targetAngle = MathUtils.radians2Angle(radians) + 180;
            if (this.targetAngle > 0 && this.targetAngle < 90) {
                this.targetAngle += 360;
            }

            if (this.factor >= 1) {
                this.step = 1
                this.battleLogic.command.send(BattleCommandType.rocketBulletRotateToAngle, this.uid, this.targetAngle)
                this._moveVec.set(this.moveSpeed * Math.cos(radians), this.moveSpeed * Math.sin(radians));
            }
            else if (this.factor > 0.5) {
                this.battleLogic.command.send(BattleCommandType.rocketBulletRotateToAngle, this.uid, this.targetAngle)
            }
        }
        else {
            if (this.step == 1) {
                this.addSpeed -= 0.04;
                if (this.addSpeed < -0.2) {
                    this.step = 2;
                }
            }
            else {
                this.addSpeed += 0.16;
            }

            if (this.addSpeed > 4) {
                this.addSpeed = 4;
            }

            let moveVecX = this._moveVec.x * t * this.addSpeed;
            let moveVecY = this._moveVec.y * t * this.addSpeed;
            this.nowDis += Math.abs(moveVecX) + Math.abs(moveVecY);
            this.pos.add2f(moveVecX, moveVecY);
            this.checkTrigger();
        }
        return true
    }

    protected checkDis(): void {
        if (this.nowDis >= this.missileDis) {
            this.hit(null);
            this._isActive = false;
        }
    }
}
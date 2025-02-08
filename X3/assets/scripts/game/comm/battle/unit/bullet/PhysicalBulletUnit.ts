import { MathUtils } from "../../../../../core/utils/MathUtils";
import { BulletUnit } from "./BulletUnit";
import UnitSearchUtils from "../../collisions/UnitSearchUtils";
import { BattleUnit } from "../battle/BattleUnit";
import { Vec2 } from "cc";
import { ICaster } from "../../skill/ICaster";
import { ITarget } from "../../skill/ITarget";
import { BattleUtils } from "../../BattleUtils";
import { BulletShowUnit } from "../../show/BulletShowUnit";
import { BattleCommandType } from "../../BattleCommand";

export class PhysicalBulletUnitShow extends BulletShowUnit {
    protected hit(hurtTarget: BattleUnit): void {
        this._spineNode.setPosition(hurtTarget.pos.x, hurtTarget.pos.y);
        this._spineNode.active = false;
        super.hit(hurtTarget)
    }
}

/**物理子弹 （碰撞子弹） */
export class PhysicalBulletUnit extends BulletUnit {
    protected angle: number
    protected missileDis: number
    protected nowDis: number = 0;
    initParam(atk: number, targetPos: { x: number, y: number }, atkPoint: { x: number, y: number }, from: ICaster, target: ITarget) {
        this.atk = atk;

        this.pos.set(atkPoint.x, atkPoint.y);

        let radians = MathUtils.getRadians(atkPoint.x, atkPoint.y, targetPos.x, targetPos.y);
        this.angle = MathUtils.radians2Angle(radians);
        this.battleLogic.showMgr.setStatue(this.uid, { angle: this.angle + 180 });
        this.missileDis = this._cfg.distance + this.battleLogic.buffMgr.getMissileDis(from);
        this.nowDis = 0;

        this._moveVec.set(this.moveSpeed * Math.cos(radians), this.moveSpeed * Math.sin(radians));

        this._maxTime = BattleUtils.getFrameByTime(this._cfg.timeLimit || 2000);
    }

    /**检测是否触发 */
    checkTrigger() {
        let units = UnitSearchUtils.getUnitsByCircle(this, this.targetTeamId, 400);
        if (units?.length) {
            let hurtTarget: BattleUnit;
            let minDis = 9999999;
            for (let i = 0; i < units.length; i++) {
                let unit = units[i];
                let dis = MathUtils.distance(unit.hurtPoint as Vec2, this.pos);
                if (unit.uid != this.casterUid && unit.attr.getSize() >= dis && dis < minDis) {
                    hurtTarget = unit;
                    minDis = dis;
                }
            }

            if (hurtTarget) {
                this.targetUid = hurtTarget.uid; //修改目标
                this.hit(hurtTarget)
                return;
            }
        }

        if (this._runTime >= this._maxTime) {
            this._isActive = false;
        }
        this.checkDis();
    }

    hit(hurtTarget: BattleUnit) {
        if (hurtTarget) {
            this.pos.set(hurtTarget.pos.x, hurtTarget.pos.y);
            this.battleLogic.command.send(BattleCommandType.hit, this.uid, hurtTarget)
        }
        this.action();
        this.showBulletEffect(hurtTarget)
    }

    protected checkDis(): void {
        if (this.nowDis >= this.missileDis) {
            this._isActive = false;
        }
    }

    update(): boolean {
        let t = BattleUtils.frameDeltaMs;
        this._runTime++;

        let moveVecX = this._moveVec.x * t;
        let moveVecY = this._moveVec.y * t
        this.nowDis += Math.abs(moveVecX) + Math.abs(moveVecY);
        this.pos.add2f(moveVecX, moveVecY);
        this.checkTrigger();
        return true
    }
}
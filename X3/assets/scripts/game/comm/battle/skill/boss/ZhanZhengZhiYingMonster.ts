import { MathUtils } from "../../../../../core/utils/MathUtils";
import { CollisionUtils } from "../../../math/CollisionUtils";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { MonsterUnit } from "../../unit/battle/MonsterUnit";

export class ZhanZhengZhiYingMonster extends MonsterUnit {
    protected updateAI() {
        super.updateAI();
        if (!this._moveVec.isCrtl && this.skillInfo && this.skillInfo.skillIndex == 2 && this.selectMainTarget) {
            let dis = MathUtils.distance(this.pos, this.selectMainTarget.pos)
            if (dis > 50) {
                let vec = CollisionUtils.calVecTemp(this.pos, this.selectMainTarget.pos, this.moveDistance);
                this._moveVec.setMoveVec(vec);
            }
        }
    }

    protected isTargetAhead(lookaheadDistance: number, targets: BattleUnit[]) {
        let directionAngle = MathUtils.angleXY(0, 0, this._moveVec.ctrlVec.x, this._moveVec.ctrlVec.y)
        // 将角度转换为弧度，便于后续计算
        const angleRad = directionAngle * Math.PI / 180;

        // 计算单位前方中心点的新坐标
        const aheadCenterX = this.pos.x + lookaheadDistance * Math.cos(angleRad);
        const aheadCenterY = this.pos.y + lookaheadDistance * Math.sin(angleRad);

        // BattleDebugManager.ins().showRangeCircle2(null, aheadCenterX, aheadCenterY, 100)

        // 检查每个目标是否在前方区域
        for (const target of targets) {
            // 判断目标是否在单位前方的矩形区域内
            if (Math.abs(target.pos.x - aheadCenterX) <= 100 &&
                Math.abs(target.pos.y - aheadCenterY) <= 100) {
                // 简化碰撞检测，实际应用中可能需要更精确的碰撞算法
                return true;
            }
        }

        return false;
    }

    protected attackActionComplete(isForce: boolean): void {
        if (isForce && this.skillInfo && this.skillInfo.skillIndex == 2) {
            return
        }
        super.attackActionComplete(isForce)
    }
}
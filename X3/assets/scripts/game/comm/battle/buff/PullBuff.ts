import { MathUtils } from "../../../../core/utils/MathUtils";
import { CollisionUtils } from "../../math/CollisionUtils";
import { BattleUtils } from "../BattleUtils";
import { SkillBuff } from "../skill/SkillBuff";
import { MonsterUnit } from "../unit/battle/MonsterUnit";

export class PullBuff extends SkillBuff {
    protected buffHandler(): void {
        let effectParam: { speed: number, fixDis: number } = this.effectParm1;
        if (effectParam) {
            if (!this.caster || !this.target.isActive || !this.target.canBeHurt()) {
                return;
            }

            if (this.target instanceof MonsterUnit && this.target.isBoss) {
                return;
            }

            if (!this.target.attr.canForceMove()) {
                return;
            }

            let v_scale = effectParam.speed / 1000 * BattleUtils.frameDeltaMs;
            let dis = MathUtils.getDistance(this.caster.pos.x, this.caster.pos.y, this.target.pos.x, this.target.pos.y);
            if (dis > effectParam.fixDis) {
                let angle = MathUtils.angle(this.target.pos, this.caster.pos) + 180
                let tempPos = MathUtils.getCoordinates(angle, effectParam.fixDis)
                let radian = MathUtils.getRadians(this.target.pos.x + tempPos.x, this.target.pos.y + tempPos.y, this.caster.pos.x, this.caster.pos.y);
                let v = Math.min(dis, v_scale);
                CollisionUtils.tempVec.set(v * Math.cos(radian), v * Math.sin(radian));
                this.target.forceMove(CollisionUtils.tempVec);
            }
            else {
                this.isReadyToRemove = true
            }
        }
    }
}
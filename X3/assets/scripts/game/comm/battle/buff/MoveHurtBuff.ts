import { Vec2 } from "cc";
import { DamageVo } from "../DamageVo";
import { FightFormula } from "../FightFormula";
import { SkillBuff } from "../skill/SkillBuff";
import { MathUtils } from "../../../../core/utils/MathUtils";
import { v2 } from "cc";
/***
 * 移动时收到攻击
 */
export class MoveHurtBuff extends SkillBuff {
    private lastPos: Vec2
    protected buffHandler(): void {
        let effectParam: { amount: number } = this.effectParm1;
        if (effectParam) {
            if (this.lastPos && MathUtils.distance(this.lastPos, this.target.pos) > 10) {
                let damageVo: DamageVo = FightFormula.buffHurt(this.skillBehavior, this, this.caster, this.target, effectParam.amount * this.layer, this.distance)
                damageVo.buffInfo = this;
                this.caster.battleLogic.hurt(damageVo)
            }
            this.lastPos = v2(this.target.pos.x, this.target.pos.y)
        }
    }
}
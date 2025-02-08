import { DamageVo } from "../DamageVo";
import { FightFormula } from "../FightFormula";
import { SkillBuff } from "../skill/SkillBuff";
/***
 * 真实伤害BUFF
 * amount 伤害系数
 */
export class RealHurtBuff extends SkillBuff {

    protected buffHandler(): void {
        let effectParam: { amount: number } = this.effectParm1;
        if (effectParam) {
            let damageVo: DamageVo = FightFormula.buffHurt(this.skillBehavior, this, this.caster, this.target, effectParam.amount * this.layer, this.distance, { real: true })
            damageVo.buffInfo = this;
            this.caster.battleLogic.hurt(damageVo)
        }
    }
}
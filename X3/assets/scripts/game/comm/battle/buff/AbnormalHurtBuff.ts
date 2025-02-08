import { DamageVo } from "../DamageVo";
import { FightFormula } from "../FightFormula";
import { SkillBuff } from "../skill/SkillBuff";
/***
 * 异常伤害BUFF
 * type:类型
 * amount 伤害系数
 */
export class AbnormalHurtBuff extends SkillBuff {

    protected buffHandler(): void {
        let effectParam: { type: string, amount: number } = this.effectParm1;
        if (effectParam) {
            if (this.target.isActive) {
                let damageVo: DamageVo = FightFormula.buffHurt(this.skillBehavior, this, this.caster, this.target, effectParam.amount * this.layer, this.distance)
                damageVo.buffInfo = this;
                this.caster.battleLogic.hurt(damageVo)
            }
        }
    }
}
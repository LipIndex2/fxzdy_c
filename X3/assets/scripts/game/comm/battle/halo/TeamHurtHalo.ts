import { DamageVo } from "../DamageVo";
import { FightFormula } from "../FightFormula";
import { SkillHalo } from "../skill/SkillHalo";
/***
 * 伤害BUFF
 * amount 伤害系数
 */
export class TeamHurtHalo extends SkillHalo {
    protected haloHandler(): void {
        let effectParam: { amount: number, hurtType?: number } = this.effectParm1;
        if (effectParam) {
            for (let i = 0; i < this.units?.length; i++) {
                if (!this.units[i].isDeath) {
                    let damageVo: DamageVo = FightFormula.teamHurt(this.skillBehavior, this.caster, this.units[i], effectParam.amount)
                    damageVo.haloInfo = this;
                    if (effectParam.hurtType)
                        damageVo.hurtType = effectParam.hurtType
                    this.caster.battleLogic.hurt(damageVo)
                    damageVo.skillInfo.fightSkillInfo.haloHandlerAfter(damageVo)
                }
            }
        }
    }
}
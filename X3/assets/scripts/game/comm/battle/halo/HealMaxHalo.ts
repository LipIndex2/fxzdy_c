import BattleConstantConfig from "../config/BattleConstantConfig";
import { FightFormula } from "../FightFormula";
import { SkillHalo } from "../skill/SkillHalo";
/***
 * 治疗BUFF
 * amount 伤害系数
 */
export class HealMaxHalo extends SkillHalo {
    protected haloHandler(): void {
        let effectParam: { amount: number, healType?: number } = this.effectParm1;
        if (effectParam) {
            for (let i = 0; i < this.units?.length; i++) {
                let taker = this.units[i];
                if (!taker.isDeath) {
                    let value = Math.floor(taker.attr.maxHp * effectParam.amount / BattleConstantConfig.getRandBase)
                    let hp = FightFormula.heal(this.skillBehavior, this.caster, taker, value, false)
                    if (effectParam.healType)
                        hp.healType = effectParam.healType
                    this.caster.battleLogic.heal(hp);
                }
            }
        }
    }
}
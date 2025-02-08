import BattleConstantConfig from "../config/BattleConstantConfig";
import { DamageVo } from "../DamageVo";
import { FightFormula } from "../FightFormula";
import { SkillBuff } from "../skill/SkillBuff";
/***
 * 伤害BUFF
 * amount 伤害系数
 */
export class HurtCutHpBuff extends SkillBuff {

    protected buffHandler(): void {
        let effectParam: { amount: number, maxAmount: number } = this.effectParm1;
        if (effectParam) {
            let value = Math.ceil((this.target.attr.maxHp - this.target.attr.hp) * effectParam.amount / BattleConstantConfig.getRandBase * this.layer);
            if (value > 0) {
                value = Math.min(Math.ceil(this.caster.atk * effectParam.maxAmount / BattleConstantConfig.getRandBase), value);
                let damageVo: DamageVo = FightFormula.buffHurt(this.skillBehavior, this, this.caster, this.target, value * BattleConstantConfig.getRandBase, null)
                damageVo.buffInfo = this;
                this.caster.battleLogic.hurt(damageVo)
            }
        }
    }
}
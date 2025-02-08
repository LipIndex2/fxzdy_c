import BattleConstantConfig from "../config/BattleConstantConfig";
import { DamageVo } from "../DamageVo";
import { FightFormula } from "../FightFormula";
import { SkillBuff } from "../skill/SkillBuff";
/***
 * 伤害BUFF
 * amount 伤害系数
 */
export class HurtNowHpBuff extends SkillBuff {

    protected buffHandler(): void {
        let effectParam: { amount: number } = this.effectParm1;
        if (effectParam) {
            let value = Math.ceil(this.target.attr.hp * effectParam.amount / BattleConstantConfig.getRandBase * this.layer);
            if (value > 0) {
                let damageVo: DamageVo = FightFormula.buffHurt(this.skillBehavior, this, this.caster, this.target, value * BattleConstantConfig.getRandBase, null, { atk: true, real: true })
                damageVo.buffInfo = this;
                damageVo.ignoreSelfHurtText = false;
                this.caster.battleLogic.hurt(damageVo)
            }
        }
    }
}
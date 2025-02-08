import { FightFormula } from "../FightFormula";
import BattleConstantConfig from "../config/BattleConstantConfig";
import { SkillBuff } from "../skill/SkillBuff";
/***
 * 根据最大值生命恢复
 * hpRate 最大生命值百分比
 */
export class HealMaxHpBuff extends SkillBuff {

    protected buffHandler(): void {
        let effectParam: { hpRate: number, healType?: number } = this.effectParm1;
        if (effectParam) {
            let value = Math.floor(this.target.attr.maxHp * effectParam.hpRate * this.layer / BattleConstantConfig.getRandBase)
            let hp = FightFormula.heal(this.skillBehavior, this.caster, this.target, value, false, this.notHero)
            if (effectParam.healType)
                hp.healType = effectParam.healType
            this.caster.battleLogic.heal(hp);
        }
    }
}
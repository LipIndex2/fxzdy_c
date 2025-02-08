import BattleConstantConfig from "../config/BattleConstantConfig";
import { FightFormula } from "../FightFormula";
import { SkillBuff } from "../skill/SkillBuff";

export class ReviveBuff extends SkillBuff {
    protected buffHandler(): void {
        let effectParam: { amount: number } = this.effectParm1;
        if (effectParam) {
            let skillAmount: number = Math.ceil(this.target.attr.maxHp * effectParam.amount / BattleConstantConfig.getRandBase);
            let hp = FightFormula.heal(this.skillBehavior, this.caster, this.target, skillAmount, false)
            this.target.battleLogic.heal(hp);
            this.target.rebirth(false)
        }
    }
}
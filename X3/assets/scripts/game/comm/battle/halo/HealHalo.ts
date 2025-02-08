import BattleConstantConfig from "../config/BattleConstantConfig";
import { FightFormula } from "../FightFormula";
import { SkillHalo } from "../skill/SkillHalo";
import { HeroUnit } from "../unit/battle/HeroUnit";
/***
 * 治疗BUFF
 * amount 伤害系数
 */
export class HealHalo extends SkillHalo {
    protected haloHandler(): void {
        let effectParam: { amount: number, camp?: number, campValue?: number, healType?: number } = this.effectParm1;
        if (effectParam) {
            for (let i = 0; i < this.units?.length; i++) {
                let taker = this.units[i];
                if (!taker.isDeath) {
                    let skillAmount: number = effectParam.amount;
                    if (effectParam.camp) {
                        //阵营治疗加成
                        if (taker instanceof HeroUnit && taker.camp == +effectParam.camp) {
                            skillAmount += +effectParam.campValue;
                        }
                    }
                    let hp = FightFormula.heal(this.skillBehavior, this.caster, taker, skillAmount / BattleConstantConfig.getRandBase)
                    if (effectParam.healType)
                        hp.healType = effectParam.healType
                    this.caster.battleLogic.heal(hp);
                }
            }
        }
    }
}
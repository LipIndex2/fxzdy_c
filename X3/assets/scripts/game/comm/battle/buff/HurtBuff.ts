import { DamageVo } from "../DamageVo";
import { FightFormula } from "../FightFormula";
import { SkillBuff } from "../skill/SkillBuff";
import { BuffType } from "../skill/SkillEnum";
import { BattleUnit } from "../unit/battle/BattleUnit";
/***
 * 伤害BUFF
 * amount 伤害系数
 */
export class HurtBuff extends SkillBuff {

    protected buffHandler(): void {
        let effectParam: { amount: number } = this.effectParm1;
        if (effectParam) {

            let addDamage: number = 0;
            if (this.caster instanceof BattleUnit && this.caster.attr.buffStatueByType(BuffType.BuffNumSkill)) {
                let arr = this.battleLogic.buffMgr.getBuffListByEffect(this.caster as BattleUnit, BuffType.BuffNumSkill)
                for (let i = 0; i < arr.length; i++) {
                    let buffNumSkillParam: { amount: number, buff: string } = arr[i].effectParm1;
                    if (buffNumSkillParam.buff == this.cfg.group) {
                        addDamage += buffNumSkillParam.amount * arr[i].layer;
                    }
                }
            }

            let damageVo: DamageVo = FightFormula.buffHurt(this.skillBehavior, this, this.caster, this.target, effectParam.amount * this.layer + addDamage, this.distance)
            damageVo.buffInfo = this;
            this.caster.battleLogic.hurt(damageVo)
        }
    }
}
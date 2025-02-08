import BattleConstantConfig from "../config/BattleConstantConfig";
import { DamageVo } from "../DamageVo";
import { FightFormula } from "../FightFormula";
import { SkillBuff } from "../skill/SkillBuff";
import { SkillUtils } from "../skill/SkillUtils";
/***
 * 光环伤害BUFF
 * amount 伤害系数
 */
export class HaloMaxHurtBuff extends SkillBuff {

    protected buffHandler(): void {
        let effectParam: { amount: number, hurtType?: number } = this.effectParm1;
        if (effectParam) {

            let targets = SkillUtils.skillTarget(this.cfg.targetType, this.cfg.targetFaction, this.caster, this.target, this.cfg.range, this.cfg.num)
            if (targets) {
                for (let i = 0; i < targets.length; i++) {
                    if (targets[i].isActive) {
                        let amount = targets[i].attr.maxHp * effectParam.amount;
                        let damageVo: DamageVo = FightFormula.buffHurt(this.skillBehavior, this, this.caster, targets[i], amount * this.layer, this.distance, { atk: true })
                        damageVo.buffInfo = this;
                        if (effectParam.hurtType)
                            damageVo.hurtType = effectParam.hurtType
                        this.caster.battleLogic.hurt(damageVo)
                    }
                }
            }
        }
    }
}
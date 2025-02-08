import { BattleLogic } from "../BattleLogic";
import { BattleUtils } from "../BattleUtils";
import BattleConstantConfig from "../config/BattleConstantConfig";
import { DamageVo } from "../DamageVo";
import { FightFormula } from "../FightFormula";
import { SkillBuff } from "../skill/SkillBuff";
import { SkillUtils } from "../skill/SkillUtils";
import { BattleUnit } from "../unit/battle/BattleUnit";
/***
 * 光环伤害BUFF
 * amount 伤害系数
 */
export class HaloHurtByAtkTimeBuff extends SkillBuff {

    init(cfg: table.battle.BuffConfig, timeLimit: number, battleLogic: BattleLogic) {
        super.init(cfg, timeLimit, battleLogic)
        if (this.caster instanceof BattleUnit) {
            this.trigger = Math.floor(BattleUtils.getFrameByTime(this.cfg.interval) / this.caster.atkTimeScale)
        }
    }

    protected buffHandler(): void {
        let effectParam: { amount: number, hurtType?: number } = this.effectParm1;
        if (effectParam) {
            let targets = SkillUtils.skillTarget(this.cfg.targetType, this.cfg.targetFaction, this.caster, this.target, this.cfg.range, this.cfg.num)
            if (targets) {
                for (let i = 0; i < targets.length; i++) {
                    if (targets[i].isActive) {
                        let damageVo: DamageVo = FightFormula.fight(this.skillBehavior, this.caster, targets[i], effectParam.amount * this.layer)
                        damageVo.buffInfo = this;
                        damageVo.status = BattleConstantConfig.ForceNormal
                        if (effectParam.hurtType)
                            damageVo.hurtType = effectParam.hurtType
                        this.caster.battleLogic.hurt(damageVo)
                    }
                }
            }
        }
    }
}
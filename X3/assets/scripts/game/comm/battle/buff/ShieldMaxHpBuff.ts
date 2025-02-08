import { DamageVo } from "../DamageVo";
import { FightFormula } from "../FightFormula";
import BattleConstantConfig from "../config/BattleConstantConfig";
import { HurtNumType } from "../enum/BattleEnum";
import { EffectLayer } from "../skill/SkillEnum";
import { SkillUtils } from "../skill/SkillUtils";
import { BattleUnit } from "../unit/battle/BattleUnit";
import { ShieldAtkBuff } from "./ShieldAtkBuff";
/***
 * 按释放者最大生命值的护盾,结束按剩余护盾值造成范围伤害
 */
export class ShieldMaxHpBuff extends ShieldAtkBuff {
    protected buffHandler(): void {
        let effectParam: { amount: number, boom: number } = this.effectParm1;
        if (effectParam) {
            if (this.caster instanceof BattleUnit) {
                let shield = Math.floor(this.caster.attr.maxHp * effectParam.amount / BattleConstantConfig.getRandBase)
                shield = this.battleLogic.buffMgr.getShieldAddValue(shield, this.caster?.caster)
                this.maxHp += shield
                this.hp += shield
                this.battleLogic.logManager.addShield(this.caster, this.target, shield, this.skillBehavior)
                this.battleLogic.easyLogManager.addShield(this.caster, this.target, shield, this.skillBehavior)
                this.battleLogic.effectMgr.createNum(HurtNumType.ShieldNum, shield, this.target.pos, this.target.modelHeight);
            }
        }
    }

    protected completeHandler(timeOut: boolean = false): void {
        super.completeHandler(timeOut)
        if (timeOut) {
            let effectParam: { amount: number, boom: number, effect: number } = this.effectParm1;
            if (effectParam && effectParam.boom) {
                let targets = SkillUtils.skillTarget(this.cfg.targetType, this.cfg.targetFaction, this.caster, this.target, this.cfg.range, this.cfg.num)
                if (targets) {
                    for (let i = 0; i < targets.length; i++) {
                        if (targets[i].isActive) {
                            let damageVo: DamageVo = FightFormula.fightNotAtk(this.skillBehavior, this.caster, targets[i], this.hp * effectParam.boom)
                            damageVo.buffInfo = this;
                            this.caster.battleLogic.hurt(damageVo)
                            this.target.createFightEffect(+effectParam.effect, 0, this.target, EffectLayer.EffectTopLayer, false, 1)
                        }
                    }
                }
            }
        }
    }

    dispose() {
        this.maxHp = this.hp = 0;
        super.dispose()
    }
}
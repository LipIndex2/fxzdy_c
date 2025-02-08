import { DamageVo } from "../DamageVo";
import { FightFormula } from "../FightFormula";
import { SkillBuff } from "../skill/SkillBuff";
import { BuffEffectPos } from "../skill/SkillEnum";
import { SkillUtils } from "../skill/SkillUtils";
/***
 * 光环伤害BUFF
 * amount 伤害系数
 */
export class HaloHurtBuff extends SkillBuff {
    private nextAmount: number = 0;

    /**提取需要克隆的字段 */
    public getCloneData(): any {
        return this.nextAmount;
    }

    /**设置需要克隆的字段 */
    public setCloneData(data: any): void {
        this.nextAmount = data;
    }

    protected buffHandler(): void {
        let effectParam: { amount: number, hurtType?: number, nextAmount: number, effectUp: number, effectLow: number } = this.effectParm1;
        if (effectParam) {
            if (effectParam.effectLow)
                this.caster?.caster?.showUnit()?.addBuffEff([effectParam.effectLow], ["low"], BuffEffectPos.Once, this.caster.caster);
            if (effectParam.effectUp)
                this.caster?.caster?.showUnit()?.addBuffEff([effectParam.effectUp], ["up"], BuffEffectPos.Once, this.caster.caster)
            if (effectParam.nextAmount) {
                this.nextAmount = Math.max(0, this.nextAmount + effectParam.nextAmount)
            }
            let targets = SkillUtils.skillTarget(this.cfg.targetType, this.cfg.targetFaction, this.caster, this.target, this.cfg.range, this.cfg.num)
            if (targets) {
                for (let i = 0; i < targets.length; i++) {
                    if (targets[i].isActive) {
                        let damageVo: DamageVo = FightFormula.buffHurt(this.skillBehavior, this, this.caster, targets[i], (effectParam.amount + this.nextAmount) * this.layer, this.distance)
                        damageVo.buffInfo = this;
                        if (effectParam.hurtType)
                            damageVo.hurtType = effectParam.hurtType
                        this.caster.battleLogic.hurt(damageVo)
                        damageVo.skillInfo?.fightSkillInfo?.buffHurtAfter(damageVo)
                    }
                }
            }
        }
    }
}
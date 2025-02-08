import { BattleUtils } from "../BattleUtils";
import { DamageVo } from "../DamageVo";
import { FightFormula } from "../FightFormula";
import { SkillHalo } from "../skill/SkillHalo";
/***
 * 伤害BUFF
 * amount 伤害系数
 */
export class HurtHalo extends SkillHalo {
    /***相同光环类型造成伤害的时间限制 */
    public static hurtMap: { [key: string]: number } = {};

    protected haloHandler(): void {
        this.skillBehavior.skill.fightSkillInfo.haloHandlerBeforce(this)
        let effectParam: { amount: number, hurtType?: number, cd: number } = this.effectParm1;
        if (effectParam) {
            let cd = BattleUtils.getFrameByTime(effectParam.cd || 0);
            for (let i = 0; i < this.units?.length; i++) {
                if (!this.units[i].isDeath) {
                    let nowCd = HurtHalo.hurtMap[this.id + "_" + this.caster.casterUid + "_" + this.units[i].uid] || 0;
                    if (this.caster.battleLogic.frameIndex >= nowCd) {
                        let addAmount = this.battleLogic.buffMgr.getHaloAddAmount(this.caster, this.cfg.group)
                        let damageVo: DamageVo = FightFormula.buffHurt(this.skillBehavior, this, this.caster, this.units[i], effectParam.amount + addAmount, this.distance)
                        damageVo.haloInfo = this;
                        if (effectParam.hurtType)
                            damageVo.hurtType = effectParam.hurtType
                        this.caster.battleLogic.hurt(damageVo)
                        damageVo.skillInfo.fightSkillInfo.haloHandlerAfter(damageVo)
                        HurtHalo.hurtMap[this.id + "_" + this.caster.casterUid + "_" + this.units[i].uid] = this.caster.battleLogic.frameIndex + cd;
                    }
                }
            }
        }
    }
}
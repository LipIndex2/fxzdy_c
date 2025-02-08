import { BattleUtils } from "../BattleUtils";
import { DamageVo } from "../DamageVo";
import { FightFormula } from "../FightFormula";
import { SkillHalo } from "../skill/SkillHalo";
import { BattleUnit } from "../unit/battle/BattleUnit";
import { BulletUnit } from "../unit/bullet/BulletUnit";

/***
 * 一定时间后生效，触发1次伤害后移除
 */
export class ContactBoomHalo extends SkillHalo {
    private triggerTime: number = 0;
    public onAdd(): void {
        super.onAdd();
        let effectParam: { delay: number } = this.effectParm1;
        this.triggerTime = this.battleLogic.frameIndex;
        if (effectParam) {
            this.triggerTime += BattleUtils.getFrameByTime(effectParam.delay) || 0
        }
    }

    protected haloHandler(): void {
        let caster = this.caster;
        if (caster instanceof BulletUnit) {
            caster = caster.caster;
        }
        if (caster instanceof BattleUnit && caster.isActive) {
            let effectParam: { amount: number, hurtType: number } = this.effectParm1;
            if (effectParam) {
                if (this.triggerTime <= this.battleLogic.frameIndex) {
                    let b: boolean = false
                    for (let i = 0; i < this.units.length; i++) {
                        if (!this.units[i].isDeath) {
                            let damageVo: DamageVo = FightFormula.fight(this.skillBehavior, caster, this.units[i], effectParam.amount)
                            damageVo.haloInfo = this;
                            damageVo.hurtType = effectParam.hurtType || 0;
                            this.caster.battleLogic.hurt(damageVo)
                            b = true;
                        }
                    }

                    if (b) {
                        this.isReadyToRemove = true;
                    }
                }
            }
        }
    }
}
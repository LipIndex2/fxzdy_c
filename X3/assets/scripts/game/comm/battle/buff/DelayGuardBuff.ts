import { PoolManager } from "../../../../core/pool/PoolManager";
import BattleConstantConfig from "../config/BattleConstantConfig";
import { DamageVo } from "../DamageVo";
import { SkillBuff } from "../skill/SkillBuff";

export class DelayGuardBuff extends SkillBuff {
    public totalHurt: number = 0;
    public intervalHurt: number = 1
    public addHurt(value: number): void {
        this.totalHurt += value;

        let effectParam: { time: number } = this.effectParm1;
        let times = Math.ceil(effectParam.time / this.cfg.interval)
        this.intervalHurt = Math.floor(this.totalHurt / times)
        this.time = 0;
        this.timeLoop = 0;
        this.buffHandler();
    }

    protected buffHandler(): void {
        if (this.totalHurt <= 0)
            return

        if (this.intervalHurt > 0) {
            //造成伤害
            let counterAttackDamage: DamageVo = PoolManager.getItem(DamageVo)
            counterAttackDamage.status = BattleConstantConfig.Guard;
            counterAttackDamage.value = this.intervalHurt;
            counterAttackDamage.caster = this.target;
            counterAttackDamage.ignoreSelfHurtText = false;
            counterAttackDamage.target = this.caster.caster;
            counterAttackDamage.buffInfo = this;
            counterAttackDamage.skillInfo = this.skillBehavior?.skill;
            this.battleLogic.hurt(counterAttackDamage)
        }
        this.totalHurt = Math.max(0, this.totalHurt - this.intervalHurt);
    }
}
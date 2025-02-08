import { PoolManager } from "../../../../core/pool/PoolManager";
import { Handler } from "../../../../core/utils/Handler";
import { DamageVo } from "../DamageVo";
import { SkillBuff } from "../skill/SkillBuff";
import { AbnormalType } from "../skill/SkillEnum";
/***
 * 秒杀BUFF，一定时间后秒杀目标，存在秒杀BUFF后不能再添加其他秒杀BUFF
 * delay 是延迟多少毫秒后秒杀
 */
export class KillBuff extends SkillBuff {

    protected buffHandler(): void {
        //秒杀
        let effectParam: { delay: number } = this.effectParm1;
        if (effectParam) {
            this.battleLogic.createTimeCheck(effectParam.delay, Handler.create(this, this.onKillBuff, null, false))
        }
    }


    public onAddBuff(): void {
        super.onAddBuff();
        if (this.target) {
            this.target.setAbnormalStatus(AbnormalType.Invincible)
        }
    }

    public remove(): void {
        if (this.target) {
            this.target.clearAbnormalStatus(AbnormalType.Invincible)
        }
        super.remove();
    }

    private onKillBuff(): void {
        if (this.target && this.target.isActive) {
            let damageVo = PoolManager.getItem(DamageVo)
            damageVo.buffInfo = this;
            if (this.skillBehavior)
                damageVo.skillInfo = this.skillBehavior.skill
            damageVo.value = this.target.attr.maxHp;
            this.target.hurt(damageVo)
        }
    }
}
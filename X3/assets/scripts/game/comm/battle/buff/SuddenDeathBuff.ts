import BattleConstantConfig from "../config/BattleConstantConfig";
import { SkillBuff } from "../skill/SkillBuff";

/***
 * 猝死：额外吸收本次心脏称重50%的伤害值，在此之前单位受到的治疗需要先填充到此伤害中
 * 其实就是抵御治疗的护盾
 */
export class SuddenDeathBuff extends SkillBuff {

    /***BUFF的HP用于护盾  */
    public hp: number = 0;
    /***BUFF的HP用于护盾  */
    public maxHp: number = 0;

    protected buffHandler(): void {
        let effectParam: { amount: number } = this.effectParm1;
        if (effectParam) {
            let shield = Math.floor(this.caster.atk * effectParam.amount / BattleConstantConfig.getRandBase)
            this.maxHp += shield
            this.hp += shield
        }
    }

    dispose() {
        this.maxHp = this.hp = 0;
        super.dispose()
    }
}
import BattleConstantConfig from "../config/BattleConstantConfig";
import { HurtNumType } from "../enum/BattleEnum";
import { SkillBuff } from "../skill/SkillBuff";
/***
 * 攻击力护盾
 */
export class ShieldAtkBuff extends SkillBuff {

    /***BUFF的HP用于护盾  */
    public hp: number = 0;
    /***BUFF的HP用于护盾  */
    public maxHp: number = 0;

    protected buffHandler(): void {
        let effectParam: { amount: number, moveAmount?: number } = this.effectParm1;
        if (effectParam) {
            let amount = effectParam.amount
            if (effectParam.moveAmount && this.target.isMoveing) {
                amount = effectParam.moveAmount
            }
            let shield = Math.floor(this.caster.atk * amount / BattleConstantConfig.getRandBase)
            shield = this.battleLogic.buffMgr.getShieldAddValue(shield, this.caster?.caster)
            this.maxHp += shield
            this.hp += shield
            this.battleLogic.logManager.addShield(this.caster, this.target, shield, this.skillBehavior)
            this.battleLogic.easyLogManager.addShield(this.caster, this.target, shield, this.skillBehavior)
            this.battleLogic.effectMgr.createNum(HurtNumType.ShieldNum, shield, this.target.pos, this.target.modelHeight);
        }
    }

    dispose() {
        this.maxHp = this.hp = 0;
        super.dispose()
    }
}
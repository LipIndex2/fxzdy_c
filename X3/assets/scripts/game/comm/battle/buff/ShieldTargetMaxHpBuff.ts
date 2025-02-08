import BattleConstantConfig from "../config/BattleConstantConfig";
import { HurtNumType } from "../enum/BattleEnum";
import { BattleUnit } from "../unit/battle/BattleUnit";
import { ShieldAtkBuff } from "./ShieldAtkBuff";
/***
 * 按目标最大生命值的护盾,
 */
export class ShieldTargetMaxHpBuff extends ShieldAtkBuff {
    protected buffHandler(): void {
        let effectParam: { amount: number } = this.effectParm1;
        if (effectParam) {
            if (this.caster instanceof BattleUnit) {
                let shield = Math.floor(this.target.attr.maxHp * effectParam.amount / BattleConstantConfig.getRandBase)
                shield = this.battleLogic.buffMgr.getShieldAddValue(shield, this.caster?.caster)
                this.maxHp += shield
                this.hp += shield
                this.battleLogic.logManager.addShield(this.caster, this.target, shield, this.skillBehavior)
                this.battleLogic.easyLogManager.addShield(this.caster, this.target, shield, this.skillBehavior)
                this.battleLogic.effectMgr.createNum(HurtNumType.ShieldNum, shield, this.target.pos, this.target.modelHeight);
            }
        }
    }

    dispose() {
        this.maxHp = this.hp = 0;
        super.dispose()
    }
}
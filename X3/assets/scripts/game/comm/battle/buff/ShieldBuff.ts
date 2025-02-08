import BattleConstantConfig from "../config/BattleConstantConfig";
import { HurtNumType } from "../enum/BattleEnum";
import { SkillBuff } from "../skill/SkillBuff";
/***
 * 普通护盾
 */
export class ShieldBuff extends SkillBuff {

    /***BUFF的HP用于护盾  */
    public hp: number = 0;
    /***BUFF的HP用于护盾  */
    public maxHp: number = 0;

    public setData(data: number): void {
        this.addShield(data)
    }

    protected buffHandler(): void {
        let effectParam: { amount: number } = this.effectParm1;
        if (effectParam) {
            this.addShield(effectParam.amount)
        }
        else
            this.addShield(0)
    }

    public addShield(shield: number): void {
        if (!shield)
            return

        shield = this.battleLogic.buffMgr.getShieldAddValue(shield, this.caster?.caster)
        this.maxHp += shield;
        this.hp += shield;

        let effectParam: { max: number } = this.effectParm1;
        if (effectParam?.max) {
            this.maxHp = Math.min(this.target.hpMax * effectParam.max / BattleConstantConfig.getRandBase, this.target.hpMax)
            this.hp = Math.min(this.maxHp, this.target.hp)
        }

        this.battleLogic.logManager.addShield(this.caster, this.target, shield, this.skillBehavior)
        this.battleLogic.easyLogManager.addShield(this.caster, this.target, shield, this.skillBehavior)
        this.battleLogic.effectMgr.createNum(HurtNumType.ShieldNum, shield, this.target.pos, this.target.modelHeight);
    }

    dispose() {
        this.maxHp = this.hp = 0;
        super.dispose()
    }
}
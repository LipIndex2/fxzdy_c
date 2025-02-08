import { DamageVo } from "../../DamageVo";
import BattleConstantConfig from "../../config/BattleConstantConfig";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";

export class SamaierSkill2 extends FightSkillInfo {
    protected hurtHandler(behavior: SkillBehavior, taker: BattleUnit, damageVo: DamageVo): void {
        let param: { amount: number } = behavior.cfg.param;
        if (param && param.amount && behavior.owner instanceof BattleUnit) {
            //收割额外造成10%已损失血量的伤害
            let loseHp = behavior.owner.attr.maxHp - behavior.owner.attr.hp
            damageVo.value += Math.ceil(loseHp * (param.amount / BattleConstantConfig.getRandBase));
        }
        super.hurtHandler(behavior, taker, damageVo)
    }
}

export class SamaierXSkill1 extends FightSkillInfo {
    private haveBuff: boolean = false
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner)
        let param: { hp: number, buff: string } = behavior.cfg.param;
        if (param?.hp && owner instanceof BattleUnit) {
            let rate = Math.ceil((owner.hp / owner.hpMax) * BattleConstantConfig.getRandBase)
            if (!this.haveBuff && rate <= param.hp) {
                owner.battleLogic.buffMgr.buffControlByGroup(param.buff, owner, owner, behavior)
                this.haveBuff = true;
            }
            else if (this.haveBuff && rate > param.hp) {
                owner.attr.removeBuffGroup(param.buff)
                this.haveBuff = false;
            }
        }
    }
}
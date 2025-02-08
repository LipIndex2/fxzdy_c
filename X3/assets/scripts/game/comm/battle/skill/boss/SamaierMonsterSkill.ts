import { DamageVo } from "../../DamageVo";
import BattleConstantConfig from "../../config/BattleConstantConfig";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { SkillBehavior } from "../SkillBehavior";

export class SamaierMonsterSkill2 extends FightSkillInfo {
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
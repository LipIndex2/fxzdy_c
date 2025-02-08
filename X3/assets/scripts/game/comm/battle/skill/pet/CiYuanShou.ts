import { PoolManager } from "../../../../../core/pool/PoolManager";
import BattleConstantConfig from "../../config/BattleConstantConfig";
import { DamageVo } from "../../DamageVo";
import { UnitType } from "../../enum/BattleEnum";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";

export class CiYuanShouSkill2 extends FightSkillInfo {

    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner);
        let param: { baseRate: number, addRate: number } = behavior.cfg.param;
        if (param?.baseRate && owner instanceof BattleUnit) {
            //实际概率 = 基础概率 + 敌我血量百分比差值 * 【概率增加值】
            if (behavior.selectUnits?.length) {
                for (let i = 0; i < behavior.selectUnits.length; i++) {
                    let taker = behavior.selectUnits[i];
                    if (taker.attr.canForceMove()) {
                        let myHp = owner.attr.hpPercentage;
                        let takerHp = taker.attr.hpPercentage;
                        let value = Math.floor(myHp - takerHp)
                        let rate = param.baseRate
                        if (value > 0)
                            rate += Math.floor(myHp - takerHp) * param.addRate;
                        if (owner.battleLogic.randomMgr.isRandTrue(rate)) {
                            this.onKillBuff(behavior, taker)
                        }
                    }
                }
            }
        }
    }

    private onKillBuff(behavior: SkillBehavior, target: BattleUnit): void {
        if (target && target.isActive) {
            let damageVo = PoolManager.getItem(DamageVo)
            damageVo.caster = this.skill.owner
            damageVo.target = target;
            damageVo.status = BattleConstantConfig.Kill;
            damageVo.skillInfo = this.skill;
            damageVo.value = target.attr.hp;
            target.hurt(damageVo)
        }
    }
}
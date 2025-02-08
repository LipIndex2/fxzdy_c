import { PoolManager } from "../../../../../core/pool/PoolManager";
import BattleConstantConfig from "../../config/BattleConstantConfig";
import { DamageVo } from "../../DamageVo";
import { ExSkillData } from "../../skill/ExSkillData";
import { FightSkillInfo } from "../../skill/FightSkillInfo";
import { ICaster } from "../../skill/ICaster";
import { SkillBehavior } from "../../skill/SkillBehavior";

export class AoDingZhiMaoSkill extends FightSkillInfo {
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        let skill = behavior.skill as ExSkillData;
        behavior.skillTarget = skill.selectTarget;
        super.beginBehaviorEffect(behavior, owner)
        if (skill.selectTarget) {
            let damageVo = PoolManager.getItem(DamageVo)
            damageVo.caster = this.skill.owner
            damageVo.target = skill.selectTarget;
            damageVo.skillInfo = this.skill;
            damageVo.ignoreLockingBlood = true;
            damageVo.value = skill.selectTarget.attr.hp;
            skill.selectTarget.hurt(damageVo)
        }
    }
}
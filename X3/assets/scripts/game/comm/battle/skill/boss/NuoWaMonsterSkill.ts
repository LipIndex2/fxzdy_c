import { PoolManager } from "../../../../../core/pool/PoolManager";
import BattleConstantConfig from "../../config/BattleConstantConfig";
import { DamageVo } from "../../DamageVo";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { NuoWa } from "../hero/NuoWa";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";
import { PassivitySkillFlag } from "../SkillEnum";


export class NuoWaMonsterSkill2 extends FightSkillInfo {
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner)
        let param: { skill: string } = behavior.cfg.param;
        if (param?.skill && owner instanceof BattleUnit) {
            let P4312_p104Parm = owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P4312_p104)
            if (P4312_p104Parm) {
                let summons = owner.battleLogic.getSummons(owner.casterUid)
                for (let i = 0; i < summons.length; i++) {
                    if (summons[i].isActive) {
                        summons[i].usePassActiveSkillSkill(param.skill)
                    }
                }
            }
        }
    }
}

export class NuoWaMonsterSkill3 extends FightSkillInfo {
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner)
        let param: { die: number, amount: number } = behavior.cfg.param;
        if (param?.die && owner instanceof NuoWa) {
            let summons = owner.battleLogic.getSummons(owner.casterUid)
            for (let i = 0; i < summons.length; i++) {
                if (summons[i].isActive) {

                    let damageVo = PoolManager.getItem(DamageVo)
                    damageVo.caster = owner
                    damageVo.target = summons[i];
                    damageVo.status = BattleConstantConfig.SpecialHurt;
                    damageVo.value = summons[i].attr.hp;
                    summons[i].hurt(damageVo)

                    let lifeStealHp = Math.floor(owner.hpMax * param.amount / BattleConstantConfig.getRandBase)
                    let lifeStealHpDamageVo = PoolManager.getItem(DamageVo)
                    lifeStealHpDamageVo.skillInfo = behavior.skill;
                    lifeStealHpDamageVo.caster = owner;
                    lifeStealHpDamageVo.target = owner;
                    lifeStealHpDamageVo.status = BattleConstantConfig.Heal;
                    lifeStealHpDamageVo.value = lifeStealHp
                    owner.battleLogic.heal(lifeStealHpDamageVo);
                    break
                }
            }
        }
    }

    protected summon(behavior: SkillBehavior,
        effectParam: { id: number, x: number, y: number, num?: number, randomFix?: number, isMapPoint?: number, time?: number, attr?: number, attrAmount?: number, delay?: number },
        caster: BattleUnit, takers: BattleUnit[], exData?: any) {
        let summons = caster.battleLogic.getSummons(caster.casterUid)
        for (let i = 0; i < summons.length; i++) {
            if (summons[i].isActive) {
                summons[i].toDie();
            }
        }
        super.summon(behavior, effectParam, caster, takers, exData)
    }
}
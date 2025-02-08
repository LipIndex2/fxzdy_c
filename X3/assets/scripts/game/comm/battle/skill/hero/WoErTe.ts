import { PoolManager } from "../../../../../core/pool/PoolManager";
import ArrayUtils from "../../../../../core/utils/ArrayUtils";
import ObjectUtils from "../../../../../core/utils/ObjectUtils";
import BattleConstantConfig from "../../config/BattleConstantConfig";
import { DamageVo } from "../../DamageVo";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { HeroUnit } from "../../unit/battle/HeroUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";
import { PassivitySkillFlag } from "../SkillEnum";

export class WoErTe extends HeroUnit {
    public skill3Num: number = 0;
    public enterFight(teamEnter: boolean = true): boolean {
        if (this.isBeginToFight)
            return false
        let b = super.enterFight(teamEnter)
        this.skill3Num = 0;
        return b
    }
}

export class WoErTeSkill2 extends FightSkillInfo {
    /***下次使用2技能的目标数量 */
    public targetNum: number = 1;

    /***目标被选取 */
    protected onBehaviorSelectTargets(behavior: SkillBehavior, owner: ICaster): BattleUnit[] {
        let param: { behavior: string } = behavior.cfg.param;
        if (param?.behavior) {
            let num = this.targetNum;
            let units = super.onBehaviorSelectTargets(behavior, owner, num);
            if (units) {
                let unitNum = units.length;
                for (let i = units.length; i < num; i++) {
                    units.push(units[owner.battleLogic.randomMgr.randomInt(0, unitNum - 1)])
                }
            }
            this.targetNum = 1
            return units;
        }
        else
            return super.onBehaviorSelectTargets(behavior, owner)
    }


    /**治疗固定值 */
    protected healValue(behavior: SkillBehavior, effectParam: { amount: number, buff?: string[], healType: number }, caster: ICaster, takers: BattleUnit[]) {
        let param: { amount: number } = behavior.cfg.param;
        if (param?.amount) {
            let newEffectParam = ObjectUtils.copy(effectParam) as any;
            newEffectParam.amount = behavior.exData * param.amount / BattleConstantConfig.getRandBase;
            super.healValue(behavior, newEffectParam, caster, takers)
        }
        else
            super.healValue(behavior, effectParam, caster, takers)
    }

    /***目标收到伤害后回调被攻击者 */
    public onTargetHurt(damageVo?: DamageVo): void {
        if (damageVo) {
            let param: { behavior: string } = damageVo.skillBehavior?.cfg.param;
            if (param?.behavior) {
                this.onNewBehaviorHandler(param.behavior, damageVo.skillBehavior, damageVo.originalCaster, damageVo.skillInfo, damageVo.originalCaster, damageVo.value)
            }
        }
    }
}

export class WoErTeSkill3 extends FightSkillInfo {
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner)
        if (owner instanceof WoErTe) {
            let param: { rate: number, amount: number } = behavior.cfg.param;
            if (param?.rate) {
                owner.skill3Num++;
                let num = 0;
                if (behavior.selectUnits?.length) {
                    let buffGroupIds: string[] = []
                    for (let i = 0; i < behavior.selectUnits.length; i++) {
                        for (let j = 0; j < behavior.selectUnits[i].attr.buffs.length; j++) {
                            if (!behavior.selectUnits[i].attr.buffs[j].isReadyToRemove && behavior.selectUnits[i].attr.buffs[j].cfg.stateType == 2 && behavior.selectUnits[i].attr.buffs[j].skillBuffGroup) {
                                ArrayUtils.iPush(buffGroupIds, behavior.selectUnits[i].attr.buffs[j].skillBuffGroup.cfg.id)
                            }
                        }
                    }

                    for (let i = 0; i < buffGroupIds.length; i++) {
                        let buffGroupId = buffGroupIds[i]
                        for (let j = 0; j < behavior.selectUnits.length; j++) {
                            let b = owner.battleLogic.randomMgr.isRandTrue(param.rate);
                            if (b && !owner.battleLogic.buffMgr.checkBuffGroupInTarget(buffGroupId, behavior.selectUnits[j])) {
                                //复制BUFF
                                owner.battleLogic.buffMgr.buffControlByGroup(buffGroupId, owner, behavior.selectUnits[j], behavior)
                                num++;
                            }
                        }
                    }

                    let P6110_x101Parm = owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P6110_x101)
                    if (P6110_x101Parm) {
                        let skill2 = owner.attr.getSkillByIndex(1, true)
                        if (skill2 && skill2.fightSkillInfo instanceof WoErTeSkill2)
                            skill2.fightSkillInfo.targetNum = Math.max(1, num);
                    }

                    if (param.amount && num > 0) {
                        let lifeStealHp = Math.floor(owner.hpMax * param.amount * num / BattleConstantConfig.getRandBase)
                        let lifeStealHpDamageVo = PoolManager.getItem(DamageVo)
                        lifeStealHpDamageVo.skillInfo = behavior.skill
                        lifeStealHpDamageVo.caster = owner;
                        lifeStealHpDamageVo.target = owner;
                        lifeStealHpDamageVo.status = BattleConstantConfig.Heal;
                        lifeStealHpDamageVo.value = lifeStealHp
                        owner.battleLogic.heal(lifeStealHpDamageVo);
                    }
                }

                let P6110_p101Param: { num: number, amount2: number } = owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P6110_p101)
                if (P6110_p101Param?.num == owner.skill3Num) {
                    for (let i = 0; i < behavior.selectUnits.length; i++) {
                        let damageVo = PoolManager.getItem(DamageVo)
                        damageVo.skillInfo = behavior.skill;
                        damageVo.caster = owner
                        damageVo.target = behavior.selectUnits[i]
                        damageVo.status = BattleConstantConfig.Normal;
                        damageVo.value = Math.ceil(P6110_p101Param.amount2 * owner.hpMax / BattleConstantConfig.getRandBase);
                        damageVo.isRealHurt = true;
                        owner.battleLogic.hurt(damageVo)
                    }
                }
            }
        }
    }

    protected fightFormulaHandler(behavior: SkillBehavior, caster: BattleUnit, taker: BattleUnit): void {
        let param: { amount: number } = caster.attr.getPassiveSkillFlag(PassivitySkillFlag.P6110_p101)
        if (param?.amount) {
            let buffNum = 0;
            for (let j = 0; j < taker.attr.buffs.length; j++) {
                if (!taker.attr.buffs[j].isReadyToRemove && taker.attr.buffs[j].cfg.stateType == 2) {
                    buffNum++;
                }
            }
            behavior.tempAddDamageValue += param.amount * buffNum;
        }
        super.fightFormulaHandler(behavior, caster, taker)
    }
}
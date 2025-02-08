import { PoolManager } from "../../../../../core/pool/PoolManager";
import BattleConstantConfig from "../../config/BattleConstantConfig";
import { DamageVo } from "../../DamageVo";
import { HeroShowUnit } from "../../show/HeroShowUnit";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { HeroUnit } from "../../unit/battle/HeroUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";
import { PassivitySkillFlag } from "../SkillEnum";

export class NuoWaShow extends HeroShowUnit {
    public fadeIn(v: number, alpha: number = 255): void {
        let P4312_p101Parm = this.unitData.attr.getPassiveSkillFlag(PassivitySkillFlag.P4312_p101)
        if (P4312_p101Parm)
            super.fadeIn(v, 120)
        else
            super.fadeIn(v, alpha)
    }
}

export class NuoWa extends HeroUnit {
    /***获取当前绑定的对应显示单位，不一定有值 */
    public showUnit(): NuoWaShow {
        return super.showUnit() as NuoWaShow;
    }

    public enterFight(teamEnter: boolean = true): boolean {
        let b = super.enterFight(teamEnter)
        if (b) {
            let P4312_p101Parm = this.attr.getPassiveSkillFlag(PassivitySkillFlag.P4312_p101)
            if (P4312_p101Parm)
                this.showUnit()?.setAlpha(1)
        }
        return b
    }

    /***脱离战斗 */
    public exitFight(): void {
        super.exitFight()
        if (this.isActive) {
            let P4312_p101Parm = this.attr.getPassiveSkillFlag(PassivitySkillFlag.P4312_p101)
            if (P4312_p101Parm)
                this.showUnit()?.setAlpha(0.5)
        }
    }
}

export class NuoWaSkill2 extends FightSkillInfo {
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

export class NuoWaSkill3 extends FightSkillInfo {
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
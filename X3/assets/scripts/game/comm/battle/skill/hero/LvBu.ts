import { PoolManager } from "../../../../../core/pool/PoolManager";
import BattleConstantConfig from "../../config/BattleConstantConfig";
import { DamageVo } from "../../DamageVo";
import { UnitType } from "../../enum/BattleEnum";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { HeroUnit } from "../../unit/battle/HeroUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";
import { AbnormalType } from "../SkillEnum";

export class LvBu extends HeroUnit {
    public canSkill3ReadHurt: boolean = true;
    /***决斗对象 */
    public duelTarget: BattleUnit;
    /***
    * 进入战斗
    * teamEnter 是否全队进战
    *  */
    public enterFight(teamEnter: boolean = true): boolean {
        let b = super.enterFight(teamEnter)
        if (b) {
            this.duelTarget = null;
            this.canSkill3ReadHurt = true
        }
        return b
    }
}

export class LvBuSkill2 extends FightSkillInfo {
    protected hurtHandler(behavior: SkillBehavior, taker: BattleUnit, damageVo: DamageVo): void {
        let param: { hp: number, amount: number } = behavior.cfg.param;
        if (param?.amount) {
            if (taker.hpPercen < damageVo.originalCaster.hpPercen)
                damageVo.value = Math.ceil(damageVo.value * (1 + param.amount / BattleConstantConfig.getRandBase));
        }
        super.hurtHandler(behavior, taker, damageVo);
        if (param?.hp) {
            //计算吸血
            let lifeStealHp = Math.floor(damageVo.value * param.hp / BattleConstantConfig.getRandBase)
            let lifeStealHpDamageVo = PoolManager.getItem(DamageVo)
            lifeStealHpDamageVo.skillInfo = damageVo.skillInfo
            lifeStealHpDamageVo.caster = damageVo.originalCaster;
            lifeStealHpDamageVo.target = damageVo.originalCaster;
            lifeStealHpDamageVo.status = BattleConstantConfig.LifeSteal;
            lifeStealHpDamageVo.value = lifeStealHp
            damageVo.originalCaster.battleLogic.heal(lifeStealHpDamageVo);
        }
    }
}

export class LvBuSkill3 extends FightSkillInfo {
    protected hurtHandler(behavior: SkillBehavior, taker: BattleUnit, damageVo: DamageVo): void {
        let param: { isReal: number } = behavior.cfg.param;
        if (param?.isReal && (behavior.owner as LvBu).canSkill3ReadHurt) {
            damageVo.isRealHurt = true;
        }
        super.hurtHandler(behavior, taker, damageVo);
    }

    /***技能动作播放完毕 */
    public skillCompleteHandler(): void {
        (this.skill.owner.caster as LvBu).canSkill3ReadHurt = false;
    }
}

export class LvBuPassivitySkill1 extends FightSkillInfo {
    private loopBreak: boolean = false
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner)
        let param: { amount: number, buffId: string } = behavior.cfg.param;
        if (param?.amount && behavior.selectUnits?.length && !this.loopBreak) {
            for (let i = 0; i < behavior.selectUnits.length; i++) {
                let unit = behavior.selectUnits[i]
                if (unit.type != UnitType.Boss && unit.hp <= owner.caster.hp * param.amount / BattleConstantConfig.getRandBase) {
                    let damageVo = PoolManager.getItem(DamageVo)
                    damageVo.caster = this.skill.owner
                    damageVo.target = unit;
                    damageVo.status = BattleConstantConfig.Kill;
                    damageVo.skillInfo = this.skill;
                    damageVo.value = unit.attr.hp;
                    this.loopBreak = true;
                    unit.setAbnormalStatus(AbnormalType.notSelect);
                    unit.hurt(damageVo)
                    this.loopBreak = false;
                }
            }
        }

        if (param?.buffId && behavior.selectUnits?.length) {
            if ((owner as LvBu).duelTarget != behavior.selectUnits[0] && ((owner as LvBu).duelTarget == null || !(owner as LvBu).duelTarget.isActive)) {
                owner.battleLogic.buffMgr.buffControlByGroup(param.buffId, owner, behavior.selectUnits[0], behavior);
                (owner as LvBu).duelTarget = behavior.selectUnits[0];
            }
        }
    }
}
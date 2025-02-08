import { PoolManager } from "../../../../../core/pool/PoolManager";
import { SortUtils } from "../../../../../core/utils/SortUtils";
import BattleConstantConfig from "../../config/BattleConstantConfig";
import { DamageVo } from "../../DamageVo";
import { UnitType } from "../../enum/BattleEnum";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { HeroUnit } from "../../unit/battle/HeroUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { HuangXiong } from "../hero/HuangXiong";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";
import { PassivitySkillFlag, SkillTargetType, TargetFaction } from "../SkillEnum";
import { SkillUtils } from "../SkillUtils";

export class HuangXiongMonsterSkill1 extends FightSkillInfo {
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        let param: { hpAmount: number } = behavior.cfg.param;
        if (param?.hpAmount && owner instanceof BattleUnit) {
            super.beginBehaviorEffect(behavior, owner);
            if (behavior.selectUnits?.length) {
                let damageVo = PoolManager.getItem(DamageVo)
                damageVo.skillInfo = behavior.skill;
                damageVo.caster = owner;
                damageVo.target = owner;
                damageVo.value = Math.ceil(owner.hpMax * behavior.selectUnits.length * param.hpAmount / BattleConstantConfig.getRandBase);
                damageVo.status = BattleConstantConfig.Heal;
                owner.battleLogic.heal(damageVo);
            }
        }
        else {
            let P1230_x101Parm: { behavior: string } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P1230_x101)
            if (P1230_x101Parm?.behavior) {
                this.onNewBehaviorHandler(P1230_x101Parm.behavior, behavior, owner, behavior.skill, behavior.skillTarget);
            }
            else {
                super.beginBehaviorEffect(behavior, owner);
            }
        }
    }
}

export class HuangXiongMonsterSkill2 extends FightSkillInfo {
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner);
        let param: { buff: string } = behavior.cfg.param;
        if (param?.buff && owner instanceof HuangXiong && owner.tankFriend?.isActive) {
            owner.battleLogic.buffMgr.buffControlByGroup(param.buff, owner, owner.tankFriend, behavior, null, owner);
        }
    }
}

export class HuangXiongMonsterPassivitySkill1 extends FightSkillInfo {
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner);
        let param: { addSkill: string, buff: string } = behavior.cfg.param;
        if (param?.addSkill) {
            let units = SkillUtils.skillTarget(SkillTargetType.Nearset, TargetFaction.OurSide, owner, owner as BattleUnit, 2000, 0)
            let heros: HeroUnit[] = []
            for (let i = 0; i < units.length; i++) {
                if (units[i].type == UnitType.Hero && units[i].uid != owner.casterUid && units[i].isActive) {
                    heros.push(units[i] as HeroUnit)
                }
            }
            if (heros.length > 0) {
                let target: HeroUnit = SortUtils.sortBy2(heros, ["seatSort"], [true], false)[0];
                (owner as HuangXiong).tankFriendSkillId = param.addSkill;
                (owner as HuangXiong).tankFriend = target;
                target.attr.addOtherPassiveSkillByFightSkill(param.addSkill, this);
            }
        }
        if (param?.buff) {
            owner.battleLogic.buffMgr.buffControlByGroup(param.buff, this.skill.owner, owner as BattleUnit, behavior)
        }
    }
}
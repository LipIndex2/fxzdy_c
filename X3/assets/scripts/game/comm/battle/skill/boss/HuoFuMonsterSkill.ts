import { BattleUnit } from "../../unit/battle/BattleUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";
import { PassivitySkillFlag } from "../SkillEnum";

/***获得护盾时，攻击力增加百分之15% */
export class HuoFuMonsterSkill2 extends FightSkillInfo {

    /***执行行为 */
    protected actionBehavior(behavior: SkillBehavior, caster: ICaster, takers: BattleUnit[]): void {
        super.actionBehavior(behavior, caster, takers)
        let P2110_p101Parm: { buff: string } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P2110_p101)
        if (P2110_p101Parm) {
            caster.battleLogic.buffMgr.buffControlByGroup(P2110_p101Parm.buff, caster, caster as BattleUnit, behavior)
        }
    }
}
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";
import { PassivitySkillFlag } from "../SkillEnum";

export class NuoWaZhaoHuanWuSkill2 extends FightSkillInfo {
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner)
        let param: { dadSkill: string } = behavior.cfg.param;
        if (param?.dadSkill && owner instanceof BattleUnit) {
            let unit = owner.battleLogic.getBatteUintByUid(owner.summon.byUid)
            if (unit?.isActive) {
                let P4312_p104Parm = unit.attr.getPassiveSkillFlag(PassivitySkillFlag.P4312_p104)
                if (P4312_p104Parm) {
                    unit.usePassActiveSkillSkill(param.dadSkill)
                }
            }
        }
    }
}
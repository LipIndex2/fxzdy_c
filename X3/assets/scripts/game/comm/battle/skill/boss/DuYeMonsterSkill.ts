import { FightSkillInfo } from "../FightSkillInfo";
import { PassivitySkillData } from "../PassivitySkillData";
import { SkillBehavior } from "../SkillBehavior";
import { TargetFaction, PassivitySkillFlag, BuffGroupFlagType } from "../SkillEnum";
import { SkillUtils } from "../SkillUtils";
import { DuYeMonster } from "./DuYeMonster";

export class DuYeMonsterPassivitySkill1 extends FightSkillInfo {
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: DuYeMonster): void {
        super.beginBehaviorEffect(behavior, owner)
        let param: { targetType: number, die: number, amount: number, revive: number, buff: string } = behavior.cfg.param;
        if (param) {
            if (param.die == 1 && param.targetType) {
                let targetUnits = SkillUtils.skillTarget(param.targetType, TargetFaction.OurSide, owner, owner, 9999999, 1, { notSelf: 1, notSummon: 1, notPet: 1, notHeros: [1340] });
                if (!targetUnits || !targetUnits.length) {
                    //找不到1个目标，死亡
                    return
                }

                //被动刚触发，将CD设置到无限大
                behavior.skill.cd = 9999999999999;
                owner.possessSkillData = behavior.skill as PassivitySkillData;
                owner.attr.removeAllBuffs()
                let P1340_x101Parm: { buffId: string } = owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P1340_x101)
                if (P1340_x101Parm?.buffId) {
                    owner.battleLogic.buffMgr.buffControlByGroup(P1340_x101Parm.buffId, owner, owner, behavior, null, owner)
                }

                owner.battleLogic.buffMgr.buffControlByGroup(param.buff, owner, owner, behavior);
            }
            else if (param.targetType) {
                //隐身
                let targetUnits = SkillUtils.skillTarget(param.targetType, TargetFaction.OurSide, owner, owner, 9999999, 1, { notSelf: 1, notSummon: 1, notPet: 1, notHeros: [1340] });
                if (targetUnits?.length) {
                    //存在则复活
                    owner.possessAmount = param.amount;
                    owner.setPossess(targetUnits[0]);
                    if (param.revive)
                        owner.possessRevive = param.revive


                    let P1340_p104Parm: { buff: string } = owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P1340_p104)
                    if (P1340_p104Parm?.buff) {
                        owner.battleLogic.buffMgr.buffControlByGroup(P1340_p104Parm.buff, owner, targetUnits[0], behavior, null, owner)
                    }
                }
                else {
                    //不存在就死亡
                    let groups = owner.battleLogic.buffMgr.getAllBuffGroupByFlag(BuffGroupFlagType.DuYe, owner)
                    for (let i = 0; i < groups.length; i++) {
                        groups[i].removeAll()
                    }
                    return
                }
            }
        }
    }
}
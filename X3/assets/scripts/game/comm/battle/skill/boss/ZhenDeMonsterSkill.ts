import { BattleCommandType } from "../../BattleCommand";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";
import { BuffType, PassivitySkillFlag } from "../SkillEnum";

export class ZhenDeMonsterSkill2 extends FightSkillInfo {
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner)
        let param: { buff: string, initLayer: number, removeTime: number, layer: number, buff2: string, buff3: string, buff3Layer: number } = behavior.cfg.param;
        if (param && param.buff) {
            let groupBuff = owner.battleLogic.buffMgr.buffControlByGroup(param.buff, owner, owner as BattleUnit, behavior)
            if (owner instanceof BattleUnit) {
                owner["flagBuffUid"] = groupBuff.uid;
                owner["removeBuffTime"] = param.removeTime;

                for (let i = 0; i < groupBuff.buffs.length; i++) {
                    if (groupBuff.buffs[i].effectType == BuffType.FlagBuff && groupBuff.buffs[i].effectParm1.type == "zhende") {

                        if (param.initLayer && groupBuff.buffs[i].layer == 1) {
                            //初始层数
                            groupBuff.buffs[i].layer = param.initLayer;
                            owner.battleLogic.command.send(BattleCommandType.zhenDe, owner.uid, groupBuff.buffs[i])
                        }

                        if (param.buff3 && groupBuff.buffs[i].layer >= param.buff3Layer) {
                            owner.battleLogic.buffMgr.buffControlByGroup(param.buff3, owner, owner as BattleUnit, behavior)
                            owner.breakRiderCollisionBuff()
                        }

                        if (groupBuff.buffs[i].layer >= param.layer) {
                            owner.battleLogic.buffMgr.buffControlByTarget(groupBuff.buffs[i], owner, param.buff2, owner, behavior)
                        }

                        let P5210_p104Parm: { layer: number, buff: string } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P5210_p104)
                        if (P5210_p104Parm && P5210_p104Parm.buff) {
                            //贞德红旗下获得霸体
                            if (groupBuff.buffs[i].layer >= P5210_p104Parm.layer) {
                                owner.battleLogic.buffMgr.buffControlByGroup(P5210_p104Parm.buff, owner, owner as BattleUnit, behavior)
                            }
                        }
                    }
                }
            }
        }
    }
}

export class ZhenDeMonsterPassivitySkill1 extends FightSkillInfo {
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner)

        let param: { buff: string } = behavior.cfg.param;
        if (param && param.buff) {
            //消耗旗子触发BUFF
            let buffs = owner.battleLogic.buffMgr.getBuffListByEffect(owner as BattleUnit, BuffType.FlagBuff);
            if (buffs) {
                for (let i = 0; i < buffs.length; i++) {
                    if (buffs[i].effectParm1.type == "zhende" && buffs[i].layer > 1) {
                        owner.battleLogic.buffMgr.buffControlByGroup(param.buff, owner, behavior.skillTarget as BattleUnit, behavior)
                        buffs[i].layer--;
                        if (owner instanceof BattleUnit)
                            owner.battleLogic.command.send(BattleCommandType.zhenDe, owner.uid, buffs[i])
                    }
                }
            }
        }
    }
}

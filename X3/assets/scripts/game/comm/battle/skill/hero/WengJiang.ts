import HpStateUtils from "../../../battleEx/HpStateUtils";
import { HpShowType } from "../../config/BattleSetting";
import { WorldUnitTeam } from "../../enum/BattleEnum";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";
import { PassivitySkillFlag, SkillTargetType, TargetFaction } from "../SkillEnum";
import { SkillUtils } from "../SkillUtils";

export class WengJiangSkill2 extends FightSkillInfo {
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner);
    }
}

export class WengJiangSkill3 extends FightSkillInfo {
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner);
        let param: { buff: string, all: number } = behavior.cfg.param;
        if (param?.buff) {
            let otherBuff = null;
            let P3230_x101Parm: { buff: string } = owner.caster.attr.getPassiveSkillFlag(PassivitySkillFlag.P3230_x101)
            if (P3230_x101Parm?.buff) {
                otherBuff = P3230_x101Parm?.buff;
            }

            if (param.all) {
                for (let i = 0; i < behavior.selectUnits.length; i++) {
                    if (behavior.selectUnits[i].isActive) {
                        this.skill.battleLogic.buffMgr.buffControlByGroup(param.buff, owner, behavior.selectUnits[i], behavior)
                        if (otherBuff)
                            this.skill.battleLogic.buffMgr.buffControlByGroup(otherBuff, owner, behavior.selectUnits[i], behavior)
                    }
                }
            }
            else {
                let atkUnit = SkillUtils.skillTarget(SkillTargetType.Atk_Most, TargetFaction.OurSide, owner, owner as BattleUnit, 1000, 1, { notSelf: 1 })
                if (atkUnit && atkUnit[0]) {
                    this.skill.battleLogic.buffMgr.buffControlByGroup(param.buff, owner, atkUnit[0], behavior)
                    if (otherBuff)
                        this.skill.battleLogic.buffMgr.buffControlByGroup(otherBuff, owner, atkUnit[0], behavior)
                }

                let defUnit = SkillUtils.skillTarget(SkillTargetType.Def_Most, TargetFaction.OurSide, owner, owner as BattleUnit, 1000, 1, { notSelf: 1 })
                if (defUnit && defUnit[0]) {
                    this.skill.battleLogic.buffMgr.buffControlByGroup(param.buff, owner, defUnit[0], behavior)
                    if (otherBuff)
                        this.skill.battleLogic.buffMgr.buffControlByGroup(otherBuff, owner, atkUnit[0], behavior)
                }
            }
        }
    }
}

export class WengJiangPassivitySkill1 extends FightSkillInfo {
    /***当前形态，0是无变化，1是变大，2是表小 */
    private changeType: number = 0;
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner);
        let param: { bigBuff: string, smallBuff: string, changeBuff: string } = behavior.cfg.param;
        if (param?.bigBuff) {
            let selfHp = HpStateUtils.getCurHpByType(owner.battleLogic.fightType, SkillUtils.getTeamIdByFaction(owner.teamId, TargetFaction.OurSide), HpShowType.TOTAL);
            let enemyHp = HpStateUtils.getCurHpByType(owner.battleLogic.fightType, SkillUtils.getTeamIdByFaction(owner.teamId, TargetFaction.EnemySide), HpShowType.TOTAL);
            if (this.changeType != 1 && selfHp > enemyHp) {
                //变大，加攻击力
                this.changeType = 1;
                owner.caster.attr.setSizeScale(1.2)
                owner.caster.showUnit()?.fadeScale(1.2)
                owner.battleLogic.buffMgr.buffControlByGroup(param.bigBuff, owner, owner.caster, behavior)
                owner.caster.attr.removeBuffGroup(param.smallBuff)
                if (param.changeBuff) {
                    owner.battleLogic.buffMgr.buffControlByGroup(param.changeBuff, owner, owner.caster, behavior)
                }
            }
            else if (this.changeType != 2 && selfHp < enemyHp) {
                //变小，加防御力
                this.changeType = 2;
                owner.caster.attr.setSizeScale(0.8)
                owner.caster.showUnit()?.fadeScale(0.8)
                owner.battleLogic.buffMgr.buffControlByGroup(param.smallBuff, owner, owner.caster, behavior)
                owner.caster.attr.removeBuffGroup(param.bigBuff)
                if (param.changeBuff) {
                    owner.battleLogic.buffMgr.buffControlByGroup(param.changeBuff, owner, owner.caster, behavior)
                }
            }
        }
    }
}
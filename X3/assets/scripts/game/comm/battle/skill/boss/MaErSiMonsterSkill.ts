import { Handler } from "../../../../../core/utils/Handler";
import { FightTimeCheck } from "../../FightTimeCheck";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";
import { BuffGroupFlagType, BuffType } from "../SkillEnum";

export class MaErSiMonsterSkill2 extends FightSkillInfo {
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner)
        let param: { buff: string } = behavior.cfg.param;
        if (param?.buff) {
            let buffs = owner.battleLogic.buffMgr.getBuffListByEffect(this.skill.owner, BuffType.ZhanYi);
            if (buffs) {
                for (let i = 0; i < buffs.length; i++) {
                    if (buffs[i].layer >= buffs[i].cfgLayer) {
                        owner.battleLogic.buffMgr.buffControlByGroup(param.buff, owner, owner as BattleUnit, behavior)
                    }
                }
            }
        }
    }
}

export class MaErSiMonsterSkill3 extends FightSkillInfo {
    private fightCheckTimer: FightTimeCheck;
    private behaviorId: string;
    private behavior: SkillBehavior;
    private behaviorEnd: boolean = false
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner);
        let param: { ignoreBullet: number, behavior: string, time: number } = behavior.cfg.param;
        if (param?.ignoreBullet) {
            // if (owner instanceof MaErSiMonster) {
            owner["isSkill3"] = true;
            // }
        }
        if (param?.behavior) {
            this.behaviorEnd = false;
            this.behaviorId = param?.behavior
            this.behavior = behavior
            this.fightCheckTimer = owner.battleLogic.createTimeCheck(param.time, new Handler(this, this.onSkillNextHurt, [behavior]))
        }
    }

    private onSkillNextHurt(behavior: SkillBehavior): void {
        if (!this.behaviorEnd)
            this.onNewBehaviorHandler(this.behaviorId, behavior, this.skill.owner, this.skill)
        this.behaviorEnd = true;
        if (this.fightCheckTimer)
            this.fightCheckTimer.isReadyToRemove = true;
    }

    /***技能动作播放完毕 */
    public skillCompleteHandler(): void {
        let groups = this.skill.owner.battleLogic.buffMgr.getAllBuffGroupByFlag(BuffGroupFlagType.MeRsI, this.skill.owner)
        for (let i = 0; i < groups.length; i++) {
            groups[i].removeAll()
        }

        // if (this.skill.owner instanceof MaErSiMonster) {
        //     this.skill.owner.isSkill3 = false;
        // }
        this.skill.owner["isSkill3"] = false

        this.onSkillNextHurt(this.behavior);
    }
}


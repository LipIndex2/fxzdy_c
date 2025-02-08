import { BattleUnit } from "../../unit/battle/BattleUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";

export class ZiZouRenXingMonsterSkill2 extends FightSkillInfo {

    private buffId: string = ""
    /***自走人型在释放2技能的时候有可能霸体 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        let param: { buff: string } = behavior.cfg.param;
        if (param && param.buff) {
            this.buffId = param.buff
            owner.battleLogic.buffMgr.buffControlByGroup(param.buff, owner, owner as BattleUnit, behavior)
        }
        super.beginBehaviorEffect(behavior, owner)
    }

    /***技能动作播放完毕 */
    public skillCompleteHandler(): void {
        if (this.skill && this.skill.owner && this.buffId) {
            this.skill.owner.attr.removeGroupBuff(this.buffId)
            this.buffId = null
        }
    }
}
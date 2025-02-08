import { BattleUnit } from "../../unit/battle/BattleUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";
import { BuffGroupFlagType } from "../SkillEnum";

export class ZhanZhengZhiYingMonsterSkill1 extends FightSkillInfo {
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        let param: { behavior: string } = behavior.cfg.param;
        let groups = this.skill.owner.battleLogic.buffMgr.getAllBuffGroupByFlag(BuffGroupFlagType.ZhanZhengZhiYing, this.skill.owner)
        if (param?.behavior && groups?.length > 0) {
            this.onNewBehaviorHandler(param.behavior, behavior, owner, this.skill)
        }
        else
            super.beginBehaviorEffect(behavior, owner)
    }
}

//天界战马效果结束后获得奔腾【奔腾：下一次挥砍或冲锋造成额外伤害，伤害加成依据于本次天界战马期间的移动总距离，至多可提升500%】
export class ZhanZhengZhiYingMonsterSkill2 extends FightSkillInfo {
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner)
        let param: { addPassivity: string } = behavior.cfg.param;
        if (param && param.addPassivity && owner instanceof BattleUnit) {
            owner.attr.addOtherPassiveSkill(param.addPassivity)
        }
    }
}

export class ZhanZhengZhiYingMonsterSkill3 extends FightSkillInfo {
    private abnormal: number = 0;
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner)
        let param: { abnormal: number } = behavior.cfg.param;
        if (param && param.abnormal && owner instanceof BattleUnit) {
            this.abnormal = param.abnormal;
            owner.setAbnormalStatus(param.abnormal)
        }
    }

    /***技能动作播放完毕 */
    public skillCompleteHandler(): void {
        if (this.abnormal)
            (this.skill.owner as BattleUnit).clearAbnormalStatus(this.abnormal)
    }
}
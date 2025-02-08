import { TableManager } from "../../../../core/table/TableManager";
import { BattleLogic } from "../BattleLogic";
import { BattleUnit } from "../unit/battle/BattleUnit";
import { BaseSkillData } from "./BaseSkillData";
import { ITarget } from "./ITarget";
import { SkillBehavior } from "./SkillBehavior";
import { SkillData } from "./SkillData";

export class OtherSkillData extends SkillData {
    public teamId: number
    /**执行技能 */
    public actionSkill(): SkillBehavior[] {
        this.isBeginBehavior = false;
        this.fightSkillInfo.beginSkillHandler();

        let behaviors: SkillBehavior[] = [];
        let behaviorTimings = this.behaviorsTiming;
        for (let i = 0; i < behaviorTimings.length; i++) {
            let trigger = behaviorTimings[i].delay || 0
            const behavior = SkillBehavior.createBehavior(behaviorTimings[i].behaviorId, trigger, this);
            if (!behavior) {
                continue;
            }
            behavior.index = i;
            behaviors.push(behavior);
        }
        return behaviors;
    }

    public resCd(): void {
    }

    /***行为被触发 */
    public onSkillActionByBehavior(target: ITarget): void {
    }
}
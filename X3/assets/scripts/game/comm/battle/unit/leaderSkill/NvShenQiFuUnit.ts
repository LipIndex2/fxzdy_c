import { Handler } from "../../../../../core/utils/Handler";
import { FightTimeCheck } from "../../FightTimeCheck";
import { SkillBehavior } from "../../skill/SkillBehavior";
import { BaseLeaderSkillUnit } from "./BaseLeaderSkillUnit";

export class NvShenQiFuUnit extends BaseLeaderSkillUnit {
    private checkTimer: FightTimeCheck
    initParam(): void {
        let team = this.battleLogic.getTeamByTeamId(this.teamId)
        this.setPosXY(team.pos.x, team.pos.y)
        let param: { delay: number } = this._cfg.param;
        this.checkTimer = this.battleLogic.createTimeCheck(param.delay, new Handler(this, this.onSkillBehavior, null, false))
    }

    private onSkillBehavior(): void {
        let behaviorTimings = this.skill.behaviorsTiming;
        for (let i = 0; i < behaviorTimings.length; i++) {
            let trigger = behaviorTimings[i].delay || 0
            const behavior = SkillBehavior.createBehavior(behaviorTimings[i].behaviorId, trigger, this.skill);
            if (!behavior) {
                continue;
            }
            behavior.index = 0;
            behavior.setCaster(this)
            behavior.actionEffect()
        }
    }

    dispose() {
        if (this.checkTimer)
            this.checkTimer.isReadyToRemove = true;
        super.dispose();
    }
}
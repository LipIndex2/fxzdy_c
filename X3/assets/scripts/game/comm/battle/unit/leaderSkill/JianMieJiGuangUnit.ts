import GIns from "../../../../GIns";
import { BattleUtils } from "../../BattleUtils";
import BattleConstantConfig from "../../config/BattleConstantConfig";
import { LeaderSkillShowUnit } from "../../show/LeaderSkillShowUnit";
import { SkillBehavior } from "../../skill/SkillBehavior";
import { BaseLeaderSkillUnit } from "./BaseLeaderSkillUnit";


export class JianMieJiGuangShow extends LeaderSkillShowUnit {
}


export class JianMieJiGuangUnit extends BaseLeaderSkillUnit {
    private interval: number = -1
    initParam(): void {
        let map = GIns.mapMgr.curMap.mapNode()
        // let teamPos = this.battleLogic.getTeamPosByTeamId(this.teamId)
        // let startX = teamPos.x;
        // let startY = teamPos.y;
        let startX = -map.pos.x;
        let startY = -map.pos.y;
        this._startVec.set(startX, startY);
        this.pos.set(startX, startY);
        this.interval = BattleUtils.getFrameByTime(500);
    }

    update(): boolean {
        let b = super.update();
        if (this.interval == 0) {
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
        this.interval--
        return b
    }
}
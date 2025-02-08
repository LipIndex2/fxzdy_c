import { v2 } from "cc";
import BattleShowFactory from "../../factory/BattleShowFactory";
import { LeaderSkillShowUnit } from "../../show/LeaderSkillShowUnit";
import { SkillBehavior } from "../../skill/SkillBehavior";
import { BaseLeaderSkillUnit } from "./BaseLeaderSkillUnit";
import { WorldManager } from "../../../world/WorldManager";
import { AnimBaseUnitNode } from "../../node/AnimBaseUnitNode";

export class FanZhenNengLiangChangShow extends LeaderSkillShowUnit {
    /***初始化监听的战斗指令 */
    protected initCommand(): void {
        super.initCommand()
    }

    protected onSpineLoaded(): void {
        super.onSpineLoaded();
        let eff: AnimBaseUnitNode = BattleShowFactory.showEffectModel(10010187, v2(this.pos.x, this.pos.y), null, false, false)
        WorldManager.ins().shadowLayer.addChild(eff);
    }
}


export class FanZhenNengLiangChangUnit extends BaseLeaderSkillUnit {
    initParam(): void {
        let team = this.battleLogic.getTeamByTeamId(this.teamId)
        this.setPosXY(team.pos.x, team.pos.y)
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
}
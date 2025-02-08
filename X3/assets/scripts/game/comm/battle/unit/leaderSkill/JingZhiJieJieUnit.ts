import { v2 } from "cc";
import BattleShowFactory from "../../factory/BattleShowFactory";
import { LeaderSkillShowUnit } from "../../show/LeaderSkillShowUnit";
import { SkillBehavior } from "../../skill/SkillBehavior";
import { BaseLeaderSkillUnit } from "./BaseLeaderSkillUnit";
import { WorldManager } from "../../../world/WorldManager";
import { AnimBaseUnitNode } from "../../node/AnimBaseUnitNode";
import UnitSearchUtils from "../../collisions/UnitSearchUtils";
import { SkillUtils } from "../../skill/SkillUtils";
import { TargetFaction } from "../../skill/SkillEnum";

export class JingZhiJieJieShow extends LeaderSkillShowUnit {
    /***初始化监听的战斗指令 */
    protected initCommand(): void {
        super.initCommand()
    }

    protected onSpineLoaded(): void {
        super.onSpineLoaded();
        let eff: AnimBaseUnitNode = BattleShowFactory.showEffectModel(10010185, v2(this.pos.x, this.pos.y), null, false, false)
        WorldManager.ins().shadowLayer.addChild(eff);
    }
}


export class JingZhiJieJieUnit extends BaseLeaderSkillUnit {
    initParam(): void {
        let team = this.battleLogic.getTeamByTeamId(this.teamId)
        let targets = UnitSearchUtils.getUnitsByCircle(this, SkillUtils.getTeamIdByFaction(this.teamId, TargetFaction.EnemySide), 2000);
        if (targets?.length) {
            let p = UnitSearchUtils.getMostDenseArea(targets, 2000)
            this.setPosXY(p.x, p.y)
        }
        else {
            this.setPosXY(team.pos.x, team.pos.y)
        }

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
import { FightSkillInfo } from "../../skill/FightSkillInfo";
import { ICaster } from "../../skill/ICaster";
import { SkillBehavior } from "../../skill/SkillBehavior";
import { BaseCollectSkillUnit } from "./BaseCollectSkillUnit";

export class WuXianShouTaoCollectUnit extends BaseCollectSkillUnit {
    initParam(): void {
        let team = this.battleLogic.getTeamByTeamId(this.teamId)
        this.setPosXY(team.pos.x, team.pos.y)
        this.actionBehavior();
    }
}

export class WuXianShouTaoSkill extends FightSkillInfo {
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner)
    }
}
import { Handler } from "../../../../../core/utils/Handler";
import { FightTimeCheck } from "../../FightTimeCheck";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";

export class LeiNuoSkill3 extends FightSkillInfo {
    private interval: number = 0;
    private fightTimeCheck: FightTimeCheck

    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        let param: { interval: number } = behavior.cfg.param;
        if (param) {
            this.interval = param.interval
            this.fightTimeCheck = this.skill.battleLogic.createTimeCheck(param.interval, Handler.create(this, this.checkNextTime, [behavior, owner]))
        }
        else {
            super.beginBehaviorEffect(behavior, owner)
        }
    }

    private checkNextTime(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner)
        this.fightTimeCheck = this.skill.battleLogic.createTimeCheck(this.interval, Handler.create(this, this.checkNextTime, [behavior, owner]))
    }

    /***技能动作播放完毕 */
    public skillCompleteHandler(): void {
        if (this.fightTimeCheck) {
            this.fightTimeCheck.destoryTimeCheck();
            this.fightTimeCheck = null;
        }
    }
}
import { MathUtils } from "../../../../../core/utils/MathUtils";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { PointTarget } from "../PointTarget";
import { SkillBehavior } from "../SkillBehavior";

export class JuDuZhiCiSkill4 extends FightSkillInfo {
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner)
        // let param: { missile: string, num: number, behavior: string } = behavior.cfg.param;
        // if (param?.behavior) {
        //     let oneAngle = 360 / param.num;
        //     for (let i = 0; i < param.num; i++) {
        //         let pointTarget: PointTarget = new PointTarget(owner.battleLogic)
        //         pointTarget.teamId = owner.teamId
        //         let anglePos = MathUtils.getCoordinates(oneAngle * i + 180, 100)
        //         pointTarget.setPoint(owner.atkPoint.x + anglePos.x, owner.atkPoint.y + anglePos.y);
        //         this.onNewBehaviorHandler(param.behavior, null, owner, this.skill, pointTarget)
        //     }
        // }
        // if (param?.missile) {
        //     this.missile(behavior, { missileId: param.missile }, owner, behavior.skillTarget)
        // }
    }
}
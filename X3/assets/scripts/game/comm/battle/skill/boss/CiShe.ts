import { Vec2 } from "cc";
import { MathUtils } from "../../../../../core/utils/MathUtils";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { PointTarget } from "../PointTarget";
import { SkillBehavior } from "../SkillBehavior";
import { TargetFaction } from "../SkillEnum";
import { SkillUtils } from "../SkillUtils";

export class CiSheSkill3 extends FightSkillInfo {
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        let param: { angle: number, missileId: string } = behavior.cfg.param;
        if (param && param.missileId) {
            this.onMissileHandler(behavior, owner)
        }
        else {
            super.beginBehaviorEffect(behavior, owner)
        }
    }

    /***远程非指向型范围攻击；有子弹直线弹道；引导释放向目标扇形范围发射大量子弹，每颗子弹造成120%伤害 */
    private onMissileHandler(behavior: SkillBehavior, owner: ICaster): void {
        let param: { angle: number, angelNum: number, missileId: string } = behavior.cfg.param;

        var bulletNum = param.angelNum
        var oneAngel: number = param.angle * 2 / bulletNum || 0;

        let atkPoint = (owner as BattleUnit).getAtkPoint(false) as Vec2

        var maxAngle = bulletNum > 1 ? oneAngel * (bulletNum - 1) : 0;
        var beginAngle = 0;
        if (maxAngle > 0) {
            if (atkPoint.x > behavior.skillTarget.pos.x)
                beginAngle = -param.angle;
            else
                beginAngle = -param.angle + 30;
        }

        for (var i = 0; i < bulletNum; i++) {
            var angle = beginAngle + i * oneAngel;
            var endPoint = MathUtils.getPointByDisAndAngle(atkPoint.x, atkPoint.y, behavior.skillTarget.pos.x, behavior.skillTarget.pos.y,
                2000, angle);
            let pointTarget = new PointTarget(owner.battleLogic)
            pointTarget.teamId = SkillUtils.getTeamIdByFaction(owner.teamId, TargetFaction.EnemySide);
            pointTarget.setPoint(endPoint.x, endPoint.y);
            this.missile(behavior, param, owner, [pointTarget])
        }
    }
}
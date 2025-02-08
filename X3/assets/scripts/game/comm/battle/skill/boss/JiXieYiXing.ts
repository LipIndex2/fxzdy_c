import { MathUtils } from "../../../../../core/utils/MathUtils";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";

/***将距离Boss脚下200像素外的所有角色击飞500像素，并造成150%伤害，若击飞时达到场地边缘，则提留在场地边缘 */
export class JiXieYiXingSkill3 extends FightSkillInfo {
    /***目标被选取 */
    protected onBehaviorSelectTargets(behavior: SkillBehavior, owner: ICaster, num: number = -1): BattleUnit[] {
        let units = super.onBehaviorSelectTargets(behavior, owner, num)
        let param: { radius: number } = behavior.cfg.param;
        if (param?.radius && units?.length) {
            for (let i = 0; i < units.length; i++) {
                if (MathUtils.distance(units[i].pos, owner.caster.pos) < param.radius) {
                    units.splice(i, 1)
                    i--;
                }
            }
        }
        return units;
    }
}
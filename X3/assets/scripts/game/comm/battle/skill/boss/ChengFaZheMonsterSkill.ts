import ArrayUtils from "../../../../../core/utils/ArrayUtils";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { BulletUnit } from "../../unit/bullet/BulletUnit";
import { BehaviorUtils } from "../BehaviorUtils";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";
import { SkillData } from "../SkillData";
import { PassivitySkillFlag } from "../SkillEnum";

export class ChengFaZheMonsterSkill3 extends FightSkillInfo {
    /***目标被选取 */
    protected onBehaviorSelectTargets(behavior: SkillBehavior, owner: ICaster): BattleUnit[] {
        //num:4;random:1;buff:4120_x101_bf01
        if (behavior.skill instanceof SkillData) {
            let P4120_x101Parm: { random: number, num: number, buff: string } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P4120_x101)
            if (P4120_x101Parm?.num) {
                return BehaviorUtils.getBehaviorTargets(behavior, owner, P4120_x101Parm?.num);
            }
        }
        return BehaviorUtils.getBehaviorTargets(behavior, owner);
    }

    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner);
        if (behavior.skill instanceof SkillData && owner instanceof BulletUnit) {
            let P4120_x101Parm: { random: number, num: number, buff: string } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P4120_x101)
            if (P4120_x101Parm?.buff && this.selectUnits) {
                let arr = [];
                for (let i = 0; i < this.selectUnits.length; i++) {
                    if (this.selectUnits[i].isActive) {
                        arr.push(this.selectUnits[i])
                    }
                }
                arr = owner.battleLogic.randomMgr.randomAry(arr);
                arr = arr.slice(0, P4120_x101Parm.random)
                for (let i = 0; i < arr.length; i++) {
                    owner.battleLogic.buffMgr.buffControlByGroup(P4120_x101Parm.buff, owner, arr[i], behavior);
                }
            }
        }
    }
}
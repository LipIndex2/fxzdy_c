import { Vec2, v2 } from "cc";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";
import { SkillBuff } from "../SkillBuff";
import { PassivitySkillFlag } from "../SkillEnum";
import { SkillUtils } from "../SkillUtils";

export class HaiMuDaErMonsterSkill3 extends FightSkillInfo {
    private lastPos: Vec2
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        let param: { flash: number, skill: number } = behavior.cfg.param;
        if (owner instanceof BattleUnit) {
            if (param?.flash == 1) {
                //第1阶段
                this.lastPos = v2(owner.pos.x, owner.pos.y)
                owner.setPosXYForce(behavior.skillTarget.pos.x, behavior.skillTarget.pos.y)
            }
            else if (param?.flash == 2) {
                //第3阶段
                owner.setPosXYForce(this.lastPos.x, this.lastPos.y)
            }
            else if (param?.skill == 1) {
                let skill2 = owner.attr.getSkillByIndex(1, true);
                if (skill2) {
                    //可以在3技能中触发2技能
                    let behaviors = skill2.actionSkill()
                    for (let i = 0; i < behaviors.length; i++) {
                        let behavior = behaviors[i];
                        behavior.setCaster(owner);
                        behavior.skillTarget = SkillUtils.searchTarget(skill2, owner);
                        behavior.actionEffect(false)
                    }
                }
            }
        }
        super.beginBehaviorEffect(behavior, owner)
    }

    /***公式计算的处理 */
    // protected fightFormulaHandler(behavior: SkillBehavior, caster: ICaster, taker: BattleUnit, isReal: boolean = false, damgeValue: number = 0): void {
    //     let P5220_x101Parm: { buff: string, amount: number } = this.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P5220_x101)
    //     if (P5220_x101Parm?.amount) {
    //         behavior.tempAddDamageValue += P5220_x101Parm.amount * caster["buffNum"];
    //     }
    //     super.fightFormulaHandler(behavior, caster, taker, isReal, damgeValue)
    // }

    /***技能动作播放完毕 */
    public skillCompleteHandler(): void {
        // this.skill.owner["buffNum"] = 0;
    }
}

export class HaiMuDaErMonsterPassivitySkill1 extends FightSkillInfo {
    /***buff执行后 */
    public buffAfter(buff: SkillBuff): void {
        super.buffAfter(buff);
        let P5220_x101Parm: { buff: string, addBuff: string } = this.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P5220_x101)
        if (P5220_x101Parm?.buff == buff.cfg.group) {
            this.skill.battleLogic.buffMgr.buffControlByGroup(P5220_x101Parm.addBuff, this.skill.owner, this.skill.owner, buff.skillBehavior)
            // this.skill.owner["buffNum"]++;
        }
    }
}
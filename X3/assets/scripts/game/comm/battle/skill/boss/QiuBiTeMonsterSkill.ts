import { FightSkillInfo } from "../FightSkillInfo";
import { QiuBiTe } from "../hero/QiuBiTe";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";
import { PassivitySkillFlag } from "../SkillEnum";

export class QiuBiTeMonsterSkill2 extends FightSkillInfo {
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner);
        let param: { buff: string[]; rate: number } = behavior.cfg.param;
        if (param?.buff && this.selectUnits.length > 0) {
            if (owner.battleLogic.randomMgr.isRandTrue(param.rate || 10000)) {
                for (let i = 0; i < this.selectUnits.length; i++) {
                    for (let j = 0; j < param.buff.length; j++)
                        owner.battleLogic.buffMgr.buffControlByGroup(param.buff[j], owner, this.selectUnits[i], behavior)
                }
            }
        }
    }
}


/****复活技能有充能次数 */
export class QiuBiTeMonsterSkill3 extends FightSkillInfo {
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        let param: { num: number } = behavior.cfg.param;
        if (param?.num) {
            (owner as QiuBiTe).skill3UseNum++;
            (owner as QiuBiTe).skill3MaxNum = param?.num
            let P6220_x101Parm: { num: number } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P6220_x101)
            if (P6220_x101Parm?.num) {
                (owner as QiuBiTe).skill3MaxNum += param?.num
            }
        }
        super.beginBehaviorEffect(behavior, owner);
    }
}
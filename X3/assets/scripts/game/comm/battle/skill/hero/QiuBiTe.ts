import { HeroUnit } from "../../unit/battle/HeroUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";
import { SkillData } from "../SkillData";
import { PassivitySkillFlag } from "../SkillEnum";

export class QiuBiTe extends HeroUnit {
    public skill3UseNum: number = 0;
    public skill3MaxNum: number = 0;
    /***脱离战斗 */
    public exitFight(): void {
        super.exitFight();
        this.skill3UseNum = 0;
    }

    /****技能释放的其他条件检查 */
    protected skillOtherConditionCheckHandler(skill: SkillData): boolean {
        let b = super.skillOtherConditionCheckHandler(skill)
        if (!b)
            return false;

        if (skill.skillIndex == 2 && this.skill3MaxNum != 0 && this.skill3UseNum >= this.skill3MaxNum) {
            return false
        }
        return true;
    }
}

export class QiuBiTeSkill2 extends FightSkillInfo {
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
export class QiuBiTeSkill3 extends FightSkillInfo {
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
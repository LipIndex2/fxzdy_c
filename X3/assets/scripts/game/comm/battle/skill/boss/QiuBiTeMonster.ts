import { MonsterUnit } from "../../unit/battle/MonsterUnit";
import { SkillData } from "../SkillData";

export class QiuBiTeMonster extends MonsterUnit {
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
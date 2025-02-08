import { MonsterUnit } from "../../unit/battle/MonsterUnit";

export class DuYeZhaoHuanWu extends MonsterUnit {
    /****判断能否发动技能 */
    protected checkCanActivateSkills(): boolean {
        let skill = this.attr.getSkillByIndex(1);
        if (skill) {
            return !this.isAttacking;
        }
        return super.checkCanActivateSkills();
    }

    protected updateSkillCD(): void {
        //更新技能CD
        this._attr.updateSkillCD();
        if (!this.battleLogic.isInBattle()) {
            let skill = this.attr.getSkillByIndex(1, true);
            if (skill && skill.preCD) {
                skill.preCD--;
            }
        }
    }

    /***攻击完成 */
    protected attackActionComplete(isForce: boolean): void {
        if (isForce) {
            if (this.skillInfo && this.skillInfo.skillIndex == 1) {
                return
            }
        }
        super.attackActionComplete(isForce)
    }
}
import { MonsterUnit } from "../../unit/battle/MonsterUnit";
import { SkillUtils } from "../SkillUtils";

/***深海歌姬 */
export class ShenHaiGeJiMonster extends MonsterUnit {
    /***2技能是否可以移动释放 */
    public canMoveSkill2: boolean = false
    protected onMove(notBreakAttack: boolean = false): void {
        super.onMove(this.canMoveSkill2);
    }

    /****判断能否发动技能 */
    protected checkCanActivateSkills(): boolean {
        return this.isBeginToFight && !this.battleLogic.isSafe && !this.isAttacking && (!this._moveVec.isCrtl || this.isMoveAttack || this.canMoveSkill2)
    }

    /**更新AI */
    protected updateAI() {
        //判断是否在技能中，且是否能使用3技能
        if (this.skillInfo && this.skillInfo.skillIndex == 1) {
            let skill3 = this._attr.getSkillByIndex(2);
            if (skill3) {
                //可以在2技能中触发3技能
                let behaviors = skill3.actionSkill()
                for (let i = 0; i < behaviors.length; i++) {
                    let behavior = behaviors[i];
                    behavior.setCaster(this);
                    behavior.skillTarget = SkillUtils.searchTarget(skill3, this);
                    behavior.actionEffect()
                    this.showUnit()?.showSkillEfect(skill3.getActionEffectData(), 0, 1);
                }
            }
        }
        super.updateAI()
    }
}
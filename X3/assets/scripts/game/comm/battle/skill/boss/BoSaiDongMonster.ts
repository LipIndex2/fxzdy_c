import { DamageVo } from "../../DamageVo";
import { MonsterUnit } from "../../unit/battle/MonsterUnit";
import { SkillData } from "../SkillData";
import { PassivitySkillFlag } from "../SkillEnum";

export class BoSaiDongMonster extends MonsterUnit {
    public skill2TeamHurtTargetValue: number = 0;
    /****技能释放的其他条件检查 */
    protected skillOtherConditionCheckHandler(skill: SkillData): boolean {
        let b = super.skillOtherConditionCheckHandler(skill)
        if (!b)
            return false;

        if (skill.skillIndex == 1) {
            //无召唤物的时候才能释放
            let summons = this.battleLogic.getSummons(this.uid)
            if (summons?.length)
                return false
        }
        return true;
    }

    /**更新AI */
    protected updateAI() {
        super.updateAI()
        if (this.battleLogic.isInBattle() && this.skill2TeamHurtTargetValue) {
            let nowTeamHurt = this.battleLogic.teamHurtBoSaiDongMap[this.teamId] || 0;
            if (nowTeamHurt >= this.skill2TeamHurtTargetValue) {
                this.battleLogic.teamHurtBoSaiDongMap[this.teamId] = 0;
                //发动召唤物技能
                let summons = this.battleLogic.getSummons(this.uid)
                for (let i = 0; i < summons.length; i++) {
                    summons[i].useSkillByIndex(0)
                }
            }
        }
    }

    protected onDie(damageVo?: DamageVo) {
        let P3220_s203Parm: { dieBoom: number } = this.attr.getPassiveSkillFlag(PassivitySkillFlag.P3220_s203);
        if (P3220_s203Parm?.dieBoom) {
            //发动召唤物技能
            let summons = this.battleLogic.getSummons(this.uid)
            for (let i = 0; i < summons.length; i++) {
                summons[i].useSkillByIndex(0)
            }
        }
        super.onDie(damageVo)
    }

    protected checkSummonDieByHero(): void {
        let P3220_s203Parm: { dieBoom: number } = this.attr.getPassiveSkillFlag(PassivitySkillFlag.P3220_s203);
        if (P3220_s203Parm?.dieBoom) {
            return
        }
        this.battleLogic.summonDieByHero(this.uid)
    }
}
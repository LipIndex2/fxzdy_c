import { PetUnit } from "../../unit/battle/PetUnit";
import { SkillData } from "../SkillData";

// export class KaPiBaLaShow extends PetShowUnit {
//     protected getActionEffectData(): table.battle.SkillEffectConfig {
//         if (this.unitData.skillInfo.skillIndex == 0) {
//             if (RandomUtils.randomBoolean())
//                 return TableManager.getDataById(table.battle.SkillEffectConfig, this.unitData.skillInfo.cfg.anim)
//             else
//                 return TableManager.getDataById(table.battle.SkillEffectConfig, this.unitData.skillInfo.cfg.anim + 1)
//         }
//         return this.unitData.skillInfo.getActionEffectData()
//     }
// }

export class KaPiBaLa extends PetUnit {
    protected getActiveSkill(): SkillData {
        let skill = super.getActiveSkill();
        if (skill && skill.skillIndex == 0 && this.attr.exActiveSkills && this.attr.exActiveSkills[skill.skillId].length) {
            if (this.battleLogic.randomMgr.randomInt(0, 1) == 1) {
                skill = this.attr.exActiveSkills[skill.skillId][0]
            }
        }
        return skill;
    }
}


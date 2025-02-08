import { TableManager } from "db://assets/scripts/core/table/TableManager";

export class SkillConfigManager {

    static getSkillConfigById(skillId: string): table.battle.SkillConfig {
        return TableManager.getDataById(table.battle.SkillConfig, skillId)
    }

}
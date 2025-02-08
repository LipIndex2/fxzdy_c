import { TableManager } from "db://assets/scripts/core/table/TableManager";

export class AttrConfigManager {

    static getConfigById(id: string):table.battle.AttributeConfig {
        return TableManager.getDataById(table.battle.AttributeConfig, id);
    }
}
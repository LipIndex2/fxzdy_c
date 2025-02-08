import { TableManager } from "db://assets/scripts/core/table/TableManager";


export class WeaponConfigManager {

    static getConfigById(id: number): table.awakeweapon.AwakeWeaponConfig {
        return TableManager.getDataById(table.awakeweapon.AwakeWeaponConfig, id)
    }

}
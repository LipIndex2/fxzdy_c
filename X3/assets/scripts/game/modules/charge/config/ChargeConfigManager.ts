import { TableManager } from "db://assets/scripts/core/table/TableManager";

export class ChargeConfigManager {
    static getConfigById(chargeId: string): table.order.ChargeGoodsConfig {
        return TableManager.getDataById(table.order.ChargeGoodsConfig, chargeId);
    }

    static getRMBByChargeId(chargeId: string): number {
        const configById = this.getConfigById(chargeId);
        const money = configById?.price || 0;
        if (!money) {
            return 0;
        }
        return (money / 100).withDecimalCount(2, false);
    }
}
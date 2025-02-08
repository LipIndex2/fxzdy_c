import { TableManager } from "db://assets/scripts/core/table/TableManager";
import ArrayUtils from "db://assets/scripts/core/utils/ArrayUtils";

export class LeagueBargainConfigManager {

    private static _minDiscount10000: number = 0;

    static init() {

        this._minDiscount10000 = TableManager.getAllData(table.league.LeagueBargainRangeConfig)
            .toDataStream()
            .map(it => it.discountRangeArray[1] || 0)
            .filterNotNull()
            .minByWeightNumber(it => it, 0)
    }

    static getGiftConfigById(id: number): table.league.LeagueBargainGiftConfig {
        return TableManager.getDataById(table.league.LeagueBargainGiftConfig, id)
    }

    static getMessageByRate(rate: number): string {
        const array = TableManager.getAllData(table.league.LeagueBargainMessageConfig);
        if (ArrayUtils.isEmpty(array)) {
            return "";
        }
        for (let i = 0; i < array.length; i++) {
            const c = array[i];
            if (c.startRate <= rate && rate <= c.endRate) {
                return c.message;
            }
        }
        
        // 最后一个
        return array[array.length - 1]?.message;
    }

    // 最低价
    static getGiftMinPrice(giftId: number): number {
        const initPrice = this.getGiftConfigById(giftId)?.initPrice || 0;
        if (initPrice == 0) {
            return 0;
        }
        if (this._minDiscount10000 == 0) {
            return 0;
        }
        return Math.floor(initPrice * this._minDiscount10000 / 10000);
    }


    static get minDiscount10000(): number {
        return this._minDiscount10000;
    }
}
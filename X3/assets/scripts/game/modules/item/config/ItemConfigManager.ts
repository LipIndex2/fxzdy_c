import { TableManager } from "db://assets/scripts/core/table/TableManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";

export class ItemConfigManager {


    // 是否初始化过
    private static _isInit: boolean = false;

    static init() {
        if (this._isInit) {
            return;
        }
        this._isInit = true;

    }


    // 道具的最大拥有数量
    static getItemMaxCountByItemId(itemId: number) {
        // common limit
        const itemConfig = this.getItemConfigByItemId(itemId);
        let maxCount = 0;
        if (itemConfig) {
            maxCount = itemConfig.holdingCountLimit;
        }

        if (maxCount <= 0) {
            maxCount = Number.MAX_VALUE;
        }

        return maxCount;
    }

    static getItemConfigByItemId(itemId: number) {
        return TableManager.getDataById(table.item.ItemConfig, itemId)

    }


    /**
     * 道具二级类型
     * @param itemId
     */
    static getItemSecondType(itemId: number): ServerEnums.ItemSecondsType | null {
        const itemConfig = this.getItemConfigByItemId(itemId);
        if (!itemConfig) {
            return null;
        }
        return ServerEnums.ItemSecondsType[itemConfig.secondsType];
    }

    /**
     * 道具一级类型
     * @param itemId
     */
    static getItemType(itemId: number): ServerEnums.ItemType | null {
        const itemConfig = this.getItemConfigByItemId(itemId);
        if (!itemConfig) {
            return null;
        }
        return ServerEnums.ItemType[itemConfig.type];
    }


    /**
     * 道具一级类型
     * @param itemId
     */
    static getItemTypeByItemId(itemId: number): ServerEnums.ItemType {
        const typeStr = this.getItemConfigByItemId(itemId)?.type;
        if (!typeStr) {
            return null;
        }
        return ServerEnums.ItemType[typeStr];
    }
}
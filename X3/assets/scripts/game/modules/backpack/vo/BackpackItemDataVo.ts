import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { ItemConfigManager } from "db://assets/scripts/game/modules/item/config/ItemConfigManager";

/**
 * 背包中的物品数据 | 前端用
 */
export class BackpackItemDataVo {

    // 道具id
    itemId: number = 0;
    // 道具数量
    count: number = 0;
    // 物品唯一id
    uid: string = "";
    // 是否被使用中
    useFlag: boolean = false;
    // 堆叠的id
    stackId: number = 0;

    // 道具类型
    get type(): ServerEnums.ItemType {
        const itemConfig: table.item.ItemConfig = ItemUtils.getItemConfigByItemId(this.itemId)
        if (itemConfig) {
            return ServerEnums.ItemType.ITEM;
        }
        const typeName = itemConfig.type;
        return ServerEnums.ItemType[typeName] as ServerEnums.ItemType
    }

    static createNewOne(): BackpackItemDataVo {
        return new BackpackItemDataVo();
    }

    /**
     * 创建新的普通道具（非唯一物品）
     * @param itemId 物品id
     * @param count 数量
     */
    static createNewNormalItem(itemId: number, count: number): BackpackItemDataVo {
        let vo = new BackpackItemDataVo();
        vo.itemId = itemId;
        vo.count = count;
        return vo
    }

    static fromItemVo(it: Vo.item.ItemVo): BackpackItemDataVo {
        let vo = new BackpackItemDataVo();
        vo.itemId = it.baseId;
        vo.count = it.amount;
        return vo;
    }

    static fromLongItemVo(it: Vo.item.LongItemVo) {
        let vo = new BackpackItemDataVo();
        vo.itemId = it.baseId;
        vo.count = it.amount;
        return vo;
    }

    // 二级类型
    getSecondType(): ServerEnums.ItemSecondsType {
        return ItemConfigManager.getItemSecondType(this.itemId);
    }

    getConfig(): table.item.ItemConfig {
        return ItemUtils.getItemConfigByItemId(this.itemId);
    }
}
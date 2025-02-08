import { ItemConfigManager } from "db://assets/scripts/game/modules/item/config/ItemConfigManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { EnumClientItemType } from "db://assets/scripts/game/modules/backpack/EnumClientItemType";
import { ItemCompoundUtils } from "db://assets/scripts/game/modules/item/utils/ItemCompoundUtils";

/**
 * 道具红点
 */
export class ItemRedDotUtils {


    /**
     * 是否关注红点
     * @param itemId
     */
    static isCareRedDot(itemId: number) {
        const config = ItemConfigManager.getItemConfigByItemId(itemId);
        if (!config) {
            return false;
        }

        const clientItemType = config.itemType;
        if (clientItemType == EnumClientItemType.COMPOSE_FRAGMENT) {
            // 合成碎片
            return ItemCompoundUtils.isCanComposeAnyOne(itemId);
        }

        // 不显示在背包中
        if (!config.showBackpackFlag) {
            return;
        }

        // 只关心部分二级类型 | 常驻红点不关心
        const itemSecondType = ItemConfigManager.getItemSecondType(itemId);
        return itemSecondType == ServerEnums.ItemSecondsType.OPTIONAL_BOX
            || itemSecondType == ServerEnums.ItemSecondsType.DROP_BOX
            ;
    }

    /**
     * 是否可以标记永久已读
     * @param itemId
     */
    static isCanMarkReadForever(itemId: number) {
        const config = ItemConfigManager.getItemConfigByItemId(itemId);
        if (!config) {
            return false;
        }

        // 不显示在背包中
        if (!config.showBackpackFlag) {
            return;
        }

        // 只关心部分二级类型 | 常驻红点不关心
        const itemSecondType = ItemConfigManager.getItemSecondType(itemId);
        return itemSecondType == ServerEnums.ItemSecondsType.OPTIONAL_BOX
            || itemSecondType == ServerEnums.ItemSecondsType.DROP_BOX
            ;
    }
}
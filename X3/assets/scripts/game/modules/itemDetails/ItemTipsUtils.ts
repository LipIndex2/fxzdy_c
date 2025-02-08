import G from "../../../core/comm/G";
import { I18nManager } from "../../../core/i18n/I18nManager";
import { TableManager } from "../../../core/table/TableManager";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import { BackpackManager } from "../backpack/BackpackManager";
import { NoOwnerItem } from "../backpack/vo/NoOwnerItem";
import { DailyBossModel } from "../dailyBoss/model/DailyBossModel";
import { HangUpModel } from "../hangup/model/HangUpModel";
import { HangUpUtils } from "../hangup/utils/HangUpUtils";
import { ShopManager } from "../shop/shopManager";
import { UIViewItemDetails18nKeys } from "./UIViewItemDetailsKey";

export class ItemTipsUtils {

    public static getTipsValue(param: { sys: string }): { icon: string, value: string }[] {
        let systemType = ServerEnums.SystemType[param.sys];
        let arr = []
        switch (systemType) {
            case ServerEnums.SystemType.ARENA:
            case ServerEnums.SystemType.SECRET_INSTANCE:
                {
                    let data: { itemId: number } = param as any;
                    let cfg = TableManager.getDataById(table.item.ItemConfig, data.itemId)
                    let icon = cfg.smallIconPath;
                    let value = BackpackManager.ins().getItemCountByItemId(data.itemId).toString()
                    arr.push({ icon: icon, value: value })
                }
                break
            case ServerEnums.SystemType.DAILY_BOSS:
                {
                    let value = DailyBossModel.ins().context?.getRestChallengeTimes().toString();
                    arr.push({ value: value })
                }
                break
            case ServerEnums.SystemType.SHOP:
                let data: { shopId: number, goodId: number } = param as any;
                let goods = ShopManager.ins().getGoodsByShopAndId(data.shopId, data.goodId)
                if (goods) {
                    let value = ""
                    if (goods._config.buyTimesLimit) {
                        //有次数
                        let remainTimes = Math.max(0, goods._config.buyTimesLimit - goods.buyTimes)
                        value = remainTimes.toString();
                    }
                    else {
                        value = G.I18nManager.lang(UIViewItemDetails18nKeys.desc1);
                    }
                    arr.push({ value: value })
                }
                break
            case ServerEnums.SystemType.TRUNK_INSTANCE:
                {
                    let data: { type: number, itemId: number } = param as any;
                    let value = ""
                    let icon = ""
                    if (data.type == 1) {
                        //挂机次数
                        const curSpeedUpCount = HangUpModel.ins().getSpeedUpCount();
                        const maxSpeedUpHangUpCount = HangUpUtils.getMaxSpeedUpHangUpCount();
                        const restSpeedUpCount = maxSpeedUpHangUpCount - curSpeedUpCount;
                        value = G.I18nManager.lang(UIViewItemDetails18nKeys.desc2, restSpeedUpCount, maxSpeedUpHangUpCount)
                    }
                    else if (data.type == 2) {
                        //挂机奖励
                        let noOwnerItems: NoOwnerItem[] = HangUpModel.ins().calcHangUpItemArray();
                        for (let i = 0; i < noOwnerItems.length; i++) {
                            if (noOwnerItems[i].itemId == data.itemId) {
                                value = noOwnerItems[i].count.toString();
                                let cfg = TableManager.getDataById(table.item.ItemConfig, data.itemId)
                                icon = cfg.smallIconPath;
                                break;
                            }
                        }
                    }
                    arr.push({ icon: icon, value: value })
                }
                break
            case ServerEnums.SystemType.RECRUIT:
                {
                    let data: { itemIds: number[] } = param as any;
                    for (let i = 0; i < data.itemIds.length; i++) {
                        let cfg = TableManager.getDataById(table.item.ItemConfig, data.itemIds[i])
                        let icon = cfg.smallIconPath;
                        let value = BackpackManager.ins().getItemCountByItemId(data.itemIds[i]).toString()
                        arr.push({ icon: icon, value: value })
                    }
                }
                break
        }
        return arr;
    }

}
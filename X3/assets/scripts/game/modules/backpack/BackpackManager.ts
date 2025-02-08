import BaseSingleton from "db://assets/scripts/core/base/BaseSingleton";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { ItemModel } from "db://assets/scripts/game/modules/item/model/ItemModel";
import G from "db://assets/scripts/core/comm/G";
import { BackpackItemDataVo } from "db://assets/scripts/game/modules/backpack/vo/BackpackItemDataVo";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import FacadeManager from "../../../core/mvc/FacadeManager";
import NotificationKey from "../../event/NotificationKey";
import { ItemCostResult } from "db://assets/scripts/game/modules/item/structs/ItemCostResult";
import { UIViewItemDetailsKey } from "../itemDetails/UIViewItemDetailsKey";
import { ItemNotEnoughViewOpenArgs } from "../itemDetails/ItemNotEnoughView";

/**
 * 背包
 */
export class BackpackManager extends BaseSingleton {
    getMaxCanPayCount(item: NoOwnerItem): number {
        if (!item) {
            return 0;
        }

        const haveCount = this.getItemCountByItem(item);
        if (haveCount <= 0) {
            return 0;
        }

        return Math.floor(haveCount / item.count);
    }

    /**
     * 获取玩家道具的数量
     * @param itemId
     */
    getItemCountByItemId(itemId: number): number {
        if (itemId == null) {
            return 0;
        }
        const itemById = this.getItemById(itemId);
        if (!itemById) {
            return 0;
        }
        return itemById.count;
    }

    getItemCountByItem(item: NoOwnerItem): number {
        return this.getItemCountByItemId(item?.itemId);
    }

    /**
     * 获取背包中的道具
     * @param itemId
     */
    getItemById(itemId: number): BackpackItemDataVo {
        return ItemModel.ins().getItemById(itemId);
    }

    /**
     * 玩家是否足够支付这些物品
     * @param items
     */
    public isCanPayTheseItemArray(items: NoOwnerItem[]): boolean {
        // 空道具, 直接允许
        if (items == null || items.length == 0) {
            return true;
        }
        const mergedItems = ItemUtils.mergeItemArray(items, []);
        for (let item of mergedItems) {
            const canPayFlag = this.isCanPayItem(item);
            if (!canPayFlag) {
                return false;
            }
        }
        return true;
    }

    /**
     * 获取这批道具中首个不足的道具
     * @param items
     * @param isShowComeFrom
     */
    public tryPopUpNoEnoughItem(items: NoOwnerItem[], isShowComeFrom: boolean = false): NoOwnerItem | null {
        // 空道具, 直接允许
        if (items == null || items.length == 0) {
            return null;
        }
        for (let item of items) {
            const canPayFlag = this.isCanPayItem(item);
            if (!canPayFlag) {
                if (isShowComeFrom) {
                    G.UIManager.open(UIViewItemDetailsKey.ItemNotEnoughView, {
                        itemConfig: item.getItemConfig(),
                        count: item.count
                    } as ItemNotEnoughViewOpenArgs)
                    // FacadeManager.ins().emit(NotificationKey.EVENT_ITEM_GET_WAY_POP_UP, item.itemId);
                }
                return item;
            }
        }
        return null;
    }

    /**
     * 玩家是否足够支付这些物品 by config
     * @param itemConfigArray
     * @param isShowGetWay 不足时，是否弹出物品来源
     */
    public isCanPayTheseItemArrayByConfig(itemConfigArray: { k: any, v: any }[], isShowGetWay = false): boolean {
        let items: NoOwnerItem[] = ItemUtils.parseKvArrayToItemArray(itemConfigArray);
        // 空道具, 直接允许
        if (items == null || items.length == 0) {
            return true;
        }
        for (let item of items) {
            const canPayFlag = this.isCanPayItem(item, isShowGetWay);
            if (!canPayFlag) {
                return false;
            }
        }
        return true;
    }

    /**
     * 玩家是否足够支付物品
     * @param costItem
     * @param isShowGetWay 支付失败, 是否显示来源
     * @param multiplyCount 倍率 | 应用于十连抽 x10 这种情况
     */
    isCanPayItem(costItem: Readonly<NoOwnerItem>, isShowGetWay: boolean = false, multiplyCount: number = 1): boolean {
        if (!costItem) {
            return true;
        }
        const playerItem = ItemModel.ins().getItemById(costItem.itemId);
        if (!playerItem) {
            // no item
            const isFree = costItem.count <= 0;
            if (isFree) {
                return true;
            }

            if (isShowGetWay) {
                G.UIManager.open(UIViewItemDetailsKey.ItemNotEnoughView, {
                    itemConfig: costItem.getItemConfig(),
                    count: costItem.count
                } as ItemNotEnoughViewOpenArgs)
            }
            return false;
        }

        // have item
        const payCount = costItem.count * multiplyCount;
        let canPay = playerItem && playerItem.count >= payCount;

        if (!canPay && isShowGetWay) {
            G.UIManager.open(UIViewItemDetailsKey.ItemNotEnoughView, {
                itemConfig: costItem.getItemConfig(),
                count: costItem.count
            } as ItemNotEnoughViewOpenArgs)
            // FacadeManager.ins().emit(NotificationKey.EVENT_ITEM_GET_WAY_POP_UP_2, [item.itemId, payCount]);
        }

        return canPay;
    }

    /**
     * 添加后是否会溢出
     * @param items 要添加的物品
     */
    isCanAddTheseItemArray(items: NoOwnerItem[]): boolean {
        if (!items) {
            return false;
        }
        // 合并数量
        const itemIdToCountMap = items.toDataStream()
            .filterNotNull()
            .toMap(item => item.itemId, item => item.count, (v1, v2) => v1 + v2);
        let isCanPay = true;
        itemIdToCountMap.forEach((addCount, itemId) => {
            const playerItem = ItemModel.ins().getItemById(itemId);
            if (playerItem == null) {
                isCanPay = false;
                return;
            }
            const configItem = G.TableManager.getDataById(table.item.ItemConfig, itemId);
            if (!configItem) {
                isCanPay = false;
                return;
            }
            const holdingCountLimit = configItem.holdingCountLimit;
            const finalCount = playerItem.count + addCount;
            // 扣出数量
            if (finalCount < 0) {
                isCanPay = false;
                return;
            }
            // 超出上限
            if (finalCount < holdingCountLimit) {
                isCanPay = false;
                return;
            }
        });
        return isCanPay;
    }


    /**
     * 获取这些道具中, 玩家拥有的数量
     * @param costItemArray 要扣款的道具
     * @returns 这些道具, 玩家拥有的 itemId to数量的map
     */
    getHaveItemIdToCountMap(costItemArray: NoOwnerItem[] = null): Map<number, number> {
        if (!costItemArray) {
            // 返回所有
            return ItemModel.ins().getItemIdToCountMap();
        }

        // 有具体的扣减道具, 只返回影响的部分
        return costItemArray.toDataStream()
            .filterNotNull()
            .map(item => {
                const itemId = item.itemId;
                const haveCount = this.getItemCountByItemId(itemId);
                return NoOwnerItem.create(itemId, haveCount);
            })
            .toMap(item => item.itemId, item => item.count, (v1, v2) => v1 + v2);
    }

    /**
     * 计算扣道具结果
     * @param costItemArray 扣减的道具
     */
    isCanPayReturnResult(costItemArray: NoOwnerItem[]): ItemCostResult {
        return ItemCostResult.create(costItemArray);
    }
}
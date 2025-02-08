import {DEBUG} from "cc/env";
import { BackpackItemDataVo } from "db://assets/scripts/game/modules/backpack/vo/BackpackItemDataVo";
import { DataStream } from "../../../../core/utils/DataStream";
import G from "db://assets/scripts/core/comm/G";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { RedDotManager } from "db://assets/scripts/game/modules/common/redDot/RedDotManager";
import { RedDotKeys } from "db://assets/scripts/game/modules/common/redDot/RedDotKeys";
import { ItemRedDotUtils } from "db://assets/scripts/game/modules/item/utils/ItemRedDotUtils";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { HeroConfigManager } from "db://assets/scripts/game/modules/hero/config/HeroConfigManager";
import { Logger } from "db://assets/scripts/core/log/Logger";
import { ItemConfigManager } from "db://assets/scripts/game/modules/item/config/ItemConfigManager";


/**
 * 货币道具id | server 后端说写死
 */
export enum EnumCurrencyItemId {
    // 钻石
    DIAMOND = 1,
    // 绑定钻石
    BIND_DIAMOND = 2,
    // 内冲点卷 | TODO
    CHARGE_COUPON = 3,
    // 金币
    GOLD = 4,
}

/**
 * 背包数据
 */
export class BackpackContext implements INotification {

    // 背包物品数据
    private _itemArray: BackpackItemDataVo[] = new Array<BackpackItemDataVo>();

    listenNotifications(): string[] {
        return [
            NotificationKey.EVENT_CHANGE_ITEMS
        ]
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_CHANGE_ITEMS: {
                this.tryRefreshRedDotByChangeItem(args);
                break;
            }
        }
    }

    init() {
        FacadeManager.ins().removeNotification(this);
        FacadeManager.ins().registerNotification(this);
    }


    /**
     * 初始化背包货币数据
     * @param wallet
     */
    @LogBusiness("[背包-货币] add初始化货币数据 | 最先添加的")
    addInitWalletData(wallet: Vo.currency.WalletVo) {
        if (!wallet) {
            G.Logger.warn("Server 没有发送货币数据给 client")
            return;
        }

        // 货币是最先处理的
        this.cleanBackpackItems();
        // 1
        const diamondCount = wallet.diamond || 0;
        const itemDiamond = BackpackItemDataVo.createNewNormalItem(EnumCurrencyItemId.DIAMOND, diamondCount)
        this._itemArray.push(itemDiamond)

        // 3
        const chargeCouponCount = wallet.chargeCoupon || 0;
        const itemChargeCoupon = BackpackItemDataVo.createNewNormalItem(EnumCurrencyItemId.CHARGE_COUPON, chargeCouponCount)
        this._itemArray.push(itemChargeCoupon)

        // 4
        const goldCount = wallet.gold || 0;
        const itemGold = BackpackItemDataVo.createNewNormalItem(EnumCurrencyItemId.GOLD, goldCount)
        this._itemArray.push(itemGold)

        G.Logger.debug(`[背包-货币] 初始化完成. data = ${JSON.stringify(this._itemArray)}`)
    }

    /**
     * 初始化背包数据
     * @param vo
     */
    @LogBusiness("[背包-物品] add 初始化物品数据")
    addInitItemData(vo: Vo.item.ItemLoginInfoVo) {
        // 转为前端的物品数据
        const items: BackpackItemDataVo[] = DataStream.createNew<BackpackItemDataVo>()
            .mergeStream(
                // 普通物品
                DataStream.from(vo.items)
                    .map((it) => BackpackItemDataVo.fromItemVo(it))
            )
            .mergeStream(
                // 大量物品
                DataStream.from(vo.longItems)
                    .map((it) => BackpackItemDataVo.fromLongItemVo(it))
            )
            .toArray();
        this._itemArray.push(...items);

    }

    /**
     * 初始化星灵背包数据
     */
    @LogBusiness("[背包-星灵碎片] add 初始化星灵数据")
    addInitPetData(vo: Vo.pet.PetVo[]) {
        let TableManager = G.TableManager
        vo.forEach(v => {
            let petCfg = TableManager.getDataById(table.pet.PetConfig, v.petBaseId)
            let petItem = BackpackItemDataVo.createNewNormalItem(petCfg.fragmentItemId, v.fragment)
            if (v.active) {
                this._itemArray.push(BackpackItemDataVo.createNewNormalItem(petCfg.id, 1))
            }
            this._itemArray.push(petItem);
        })
    }

    /**
     * 初始化收藏品背包数据
     * @param vo
     */
    @LogBusiness("[背包-收藏品碎片] add 初始化收藏品数据")
    addInitDataByCollection(vo: Vo.collectibles.CollectiblesVo[]) {
        let TableManager = G.TableManager
        vo.forEach(v => {
            let collectionCfg = TableManager.getDataById(table.collectibles.CollectiblesConfig, v.baseId)
            if (DEBUG) {
                if (!collectionCfg) {
                    Logger.error(`找不到收藏品 id:${v.baseId}`);
                    return
                }

            }
            let petItem = BackpackItemDataVo.createNewNormalItem(collectionCfg.fragmentItemId, v.fragment)
            if (v.active) {
                this._itemArray.push(BackpackItemDataVo.createNewNormalItem(collectionCfg.id, 1))
            }
            this._itemArray.push(petItem);
        })
    }

    get itemArray(): BackpackItemDataVo[] {
        return this._itemArray
    }

    printDebugLog() {
        G.Logger.debug(this._itemArray, `[背包-货币] backpack all item data 打印所有背包数据`,);
    }

    /**
     * 刷新红点
     * @param changeItemIdToCountMap
     */
    tryRefreshRedDotByChangeItem(changeItemIdToCountMap: Map<number, number>) {
        if (!changeItemIdToCountMap) {
            return;
        }
        
        let isRefresh = false;
        for (let [itemId, count] of changeItemIdToCountMap.entries()) {
            const isCare = ItemRedDotUtils.isCareRedDot(itemId);
            if (isCare) {
                if (count > 0) {
                    isRefresh = true;
                }
                break;
            }
        }
        if (!isRefresh) {
            return;
        }

        this.refreshRedDot();
    }
    // 刷新红点
    refreshRedDot() {
        RedDotManager.ins().removeMarkRead(RedDotKeys.backpack);
        
        
        RedDotManager.ins().clearAll(RedDotKeys.backpackItem);
        for (let item of this._itemArray) {
            const itemId = item.itemId;

            // 是否关心红点
            const isCare = ItemRedDotUtils.isCareRedDot(item.itemId)
            if (isCare) {
                RedDotManager.ins().setRedDot(RedDotKeys.backpackItem, true, [itemId]);
            }
        }
    }

    private cleanBackpackItems() {
        this._itemArray = [];
    }

    // 扣减道具
    minusItems(costItemIdToAmountMap: Map<number, number>) {
        this._itemArray = this._itemArray
            .toDataStream()
            .handle(item => {
                const itemId = item.itemId;
                const amount = costItemIdToAmountMap.get(itemId) || 0;
                if (amount > 0) {
                    // 最终只能扣到 0 
                    item.count = Math.max(item.count - amount, 0);
                }
            })
            // 只保留有数量的道具
            .filter(item => item.count > 0)
            .toArray();
    }

    // 添加道具
    addItems(addItemIdToAmountMap: Map<number, number>) {
        const addItemIdToHaveDoneMap = new Map<number, boolean>();
        addItemIdToAmountMap.forEach((amount, itemId) => {
            addItemIdToHaveDoneMap.set(itemId, false);
        });

        // 已有道具+
        this.itemArray.toDataStream()
            .handle(item => {
                const itemId = item.itemId;
                const amount = addItemIdToAmountMap.get(itemId) || 0;
                if (amount > 0) {
                    item.count = Math.max(item.count + amount, 0);
                    addItemIdToHaveDoneMap.set(itemId, true);
                }
            });

        // new 道具
        for (let [itemId, haveDoneFlag] of addItemIdToHaveDoneMap) {
            if (haveDoneFlag) {
                continue;
            }
            const count = addItemIdToAmountMap.get(itemId) || 0;
            if (count <= 0) {
                continue;
            }
            const backpackItem: BackpackItemDataVo = BackpackItemDataVo.createNewNormalItem(itemId, count);
            this.itemArray.push(backpackItem);
         
            // event
            const noOwnerItem = NoOwnerItem.create(itemId, count);
            FacadeManager.ins().emit(NotificationKey.NEW_GAIN_ITEM, noOwnerItem);
        }

    }

    /**
     * 英雄碎片
     * @param array
     */
    addInitHeroFragmentData(array: Vo.hero.HeroVo[]) {
        // 转为前端的物品数据
        const items: BackpackItemDataVo[] = (array || [])
            .map(heroVo => {
                const heroId = heroVo.heroBaseId;
                const config = HeroConfigManager.getConfigById(heroId);
                if (!config) {
                    Logger.error(`[背包] 没找到 heroId = ${heroId}`);
                    return null;
                }

                const fragmentItemId = config.fragmentItemId;
                const fragmentConfig = ItemConfigManager.getItemConfigByItemId(fragmentItemId);
                if (!fragmentConfig) {
                    Logger.error(`[背包] 没找到英雄碎片id = ${fragmentItemId}`);
                    return null;
                }
                const fragmentCount = heroVo.fragment;

                return BackpackItemDataVo.createNewNormalItem(fragmentItemId, fragmentCount);
            })
            .filter(it => it != null);
        this._itemArray.push(...items);
    }
}
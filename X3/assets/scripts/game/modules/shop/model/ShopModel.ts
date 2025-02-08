import { Node, UITransform } from "cc";
import G from "../../../../core/comm/G";
import { BaseModel } from "../../../../core/mvc/model/BaseModel";
import { UIManager } from "../../../../core/mvc/UIManager";
import { TableManager } from "../../../../core/table/TableManager";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { IAdPlayVo } from "../../ad/model/vo/IAdPlayVo";
import { BackpackManager } from "../../backpack/BackpackManager";
import { ConditionManager } from "../../condition/ConditionManager";
import { EventClickItem } from "../../item/event/EventClickItem";
import { I18ShopKey, ShopType, UIShopKey } from "../const/UIShopConst";
import { ShopManager } from "../shopManager";
import { GoodsVo } from "../vo/goodsVo";
import { DebugUtils } from "db://assets/scripts/core/utils/DebugUtils";

/**
 * 商店模块
 */
export class ShopModel extends BaseModel {
    /**
     * 模块标识
     */
    private MODULE = 13;
    private cmds = {
        LOAD_SHOP_INFO: 1,
        BUY_GOODS: 2,
        REFRESH_SHOP: 3,
        LOAD_SHOP_INFO_LIST: 4,
    };

    constructor() {
        super();
        this.regist();
    }

    public static getModule(): number {
        return this.ins().MODULE;
    }

    public initData(data: any) {
        // console.log("初始化商店数据", data);

        //红点的时候用
        ShopManager.ins().setShopDatas(data.shopVos);
        // this._context = RankContext.from();
    }

    /**
     * 打开商店主界面
     * @param shopType 默认打开的商店类型
     */
    public openShopMain(shopType: number) {
        let shopIds: number[] = [];
        let spShopId: number | null = null;
        const cfgs = TableManager.getAllData(table.shop.ShopConfig);

        // 遍历 ShopConfig 配置
        for (let cfg of cfgs) {
            if (cfg.isInShop === 0) {
                spShopId = cfg.id;
            } else if (ConditionManager.ins().checkCondition(cfg.openVerify)) {
                shopIds.push(cfg.id);
            }
        }

        // 优先处理特殊商店
        if (spShopId && shopType === spShopId) {
            ShopManager.ins().curSpShopId = spShopId;
            this.sendLoadShopList({ idx: shopType }); // 数据回来后再打开界面
            return true;
        }

        // 从小到大排序
        shopIds.sort((a, b) => a - b);
        ShopManager.ins().shopIds = shopIds;

        // 查找 shopType 是否在 shopIds 中
        const idx = shopIds.indexOf(shopType);
        if (idx === -1) {
            GIns.floatingTextMgr.showTips(I18ShopKey.i18n_shop_errTips4);
            return false;
        }

        this.sendLoadShopList({ idx: idx }); // 数据回来后再打开界面
        return true;
    }

    /**
     * 注册所有从服务端收到的回调。
     */
    private regist(): void {
        // TODO 注册所有的指令
        let moduleId = this.MODULE;
        this.registerMsg(moduleId, this.cmds.LOAD_SHOP_INFO, this.recShopInfo);
        this.registerMsg(moduleId, this.cmds.BUY_GOODS, this.recBuyGoods);
        //刷新
        this.registerMsg(moduleId, this.cmds.REFRESH_SHOP, this.recRefreshShop);
        this.registerMsg(moduleId, this.cmds.LOAD_SHOP_INFO_LIST, this.recLoadShopList);

    }

    /**
     * 获取商店信息
     */
    public getShopInfo(shopId: number): void {
        let moduleId = this.MODULE;
        let c2s = {} as Vo.shop.LoadShopInfoC2S;
        c2s.shopId = shopId;

        this.send(moduleId, this.cmds.LOAD_SHOP_INFO, c2s);
    }

    /**
     * 返回商店信息
     */
    public recShopInfo(data: Vo.shop.LoadShopInfoS2C): void {
        let vo = data.content;
        //抛事件
        ShopManager.ins().setShopDatas([vo]);
    }

    private current_shopId: number;

    /**
     * 购买商品
     */
    public buyGoods(shopId: number, goodsId: number, count: number, advert: boolean = false, isPopReward: boolean = true): void {

        if (!this.checkBuyCost(shopId, goodsId, count)) {
            GIns.floatingTextMgr.showTips(G.I18nManager.translate(I18ShopKey.i18n_shop_errTips2));
            return;
        }
        let moduleId = this.MODULE;

        let c2s = {} as Vo.shop.BuyC2S;
        c2s.goodsId = goodsId;
        c2s.count = count;
        c2s.advert = advert;
        this.current_shopId = shopId;
        this.send(moduleId, this.cmds.BUY_GOODS, c2s, { c2s: c2s, isPopReward: isPopReward });
    }

    public buyGoodsById(goodsId: number, count: number, advert: boolean = false, isPopReward: boolean = true): void {
        let cfg = G.TableManager.getDataById(table.shop.ShopGoodsConfig, goodsId)
        if (cfg) {
            let shopId: number = cfg.shopId;
            this.buyGoods(shopId, goodsId, count, advert, isPopReward);
        }
    }

    /**
     * 返回购买商品
     */

    public recBuyGoods(data: Vo.shop.BuyS2C, customData?: any): void {
        if (data.code < 0) {
            return;
        }
        if (data.content.costItemResults) {
            G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, data.content.costItemResults as Vo.cost.CostItemResult[]);
        }

        if (data.content.rewardResults) {
            if (customData?.isPopReward) {
                G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS, data.content.rewardResults as Vo.reward.RewardResult[]);
            } else {
                G.FacadeManager.emit(NotificationKey.EVENT_RECEIVE_SERVER_ADD_ITEMS_NO_POP_UP, data.content.rewardResults as Vo.reward.RewardResult[]);
            }
        }

        this.getShopInfo(this.current_shopId);
        this.emit(NotificationKey.EVENT_SHOP_BUY_RESP, customData?.c2s?.goodsId)

    }

    /**检查购买货币是不是足够 */
    public checkBuyCost(shopId: number, goodId: number, count: number): boolean {
        let vo = ShopManager.ins().shopDatas.get(shopId);
        let goodsVo = vo._goods.find((goodsVo) => {
            return goodsVo.goodsId == goodId;
        });
        if (goodsVo == null) {
            return false
        }
        if (!goodsVo._config.costItems || goodsVo._config.costItems.length == 0) {
            //免费
            return true;
        }
        let costItem = goodsVo._config.costItems[0];
        return BackpackManager.ins().isCanPayTheseItemArrayByConfig([{ k: costItem.k, v: costItem.v * count }], true);
    }

    /**
     * 刷新商店
     */
    public reFreshShop(shopId: number): void {
        //检查是否有刷新次数
        let vo = ShopManager.ins().shopDatas.get(shopId);

        if (vo._maxManualRefreshCount <= vo._data.manualRefreshTimes) {
            GIns.floatingTextMgr.showTips(G.I18nManager.translate(I18ShopKey.i18n_shop_errTips3));
            // console.log("没有刷新次数");
            return;
        }

        let moduleId = this.MODULE;
        let c2s = {} as Vo.shop.ManualRefreshGoodsC2S;
        c2s.shopId = shopId;
        this.send(moduleId, this.cmds.REFRESH_SHOP, c2s);
    }

    /**
     * 返回刷新商店
     */
    public recRefreshShop(data: Vo.shop.ManualRefreshGoodsS2C): void {
        if (data.code < 0) {
            DebugUtils.isDebugMode() && console.log("刷新商店失败:", data.code);
            return;
        }

        let vo = data.content.shopVo;
        if (data.content.costItemResults) {
            G.FacadeManager.emitNow(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, data.content.costItemResults)
        }
        //抛事件
        ShopManager.ins().setShopDatas([vo]);
    }

    /**
     * 获取商店列表
     * 模块号：13	指令号：4
     */
    public sendLoadShopList(openArg?: { idx: number }): void {
        this.send(this.MODULE, this.cmds.LOAD_SHOP_INFO_LIST, null, openArg);
    }

    /**
     * 获取商店列表
     * 模块号：13	指令号：4
     */
    public recLoadShopList(data: Vo.shop.LoadShopListS2C, openArg?: { idx: number }): void {
        if (data.code >= 0) {
            let vos = data.content;
            ShopManager.ins().setShopDatas(vos);

            if (openArg) {
                if (openArg.idx === ShopType.SPECIAL) {
                    UIManager.ins().open(UIShopKey.SPECIAL_SHOP, openArg.idx);
                } else {
                    UIManager.ins().open(UIShopKey.SHOP_MAIN_VIEW, openArg.idx);
                }
            }
        }
    }

    /**获取商店配置 */
    public getShopConfig(shopId: number) {
        let cfg = TableManager.getDataById(table.shop.ShopConfig, shopId);
        return cfg;
    }

    /**获取商店刷新配置 */
    public getShopRefreshConfigs(shopId: number) {
        let cfgs = TableManager.getAllData(table.shop.ShopManualRefreshConfig);
        let cfg = cfgs.filter((cfg) => {
            return cfg.shopId == shopId;
        });
        return cfg;
    }

    /**获取商品配置 */

    public getGoodsConfig(goodsId: number) {
        let cfg = TableManager.getDataById(table.shop.ShopGoodsConfig, goodsId);
        return cfg;
    }

    public getGoodsIcon(goodId: number, smallIcon = true) {
        let cfg = this.getGoodsConfig(goodId);
        let rewardId = cfg.rewards[0].k;
        let rewardCfg = TableManager.getDataById(table.item.ItemConfig, rewardId);
        return smallIcon ? rewardCfg.smallIconPath : rewardCfg.iconPath;
    }

    public getGoodsCfg(goodId: number): table.item.ItemConfig {
        let cfg = this.getGoodsConfig(goodId);
        let rewardId = cfg.rewards[0].k;
        let rewardCfg = TableManager.getDataById(table.item.ItemConfig, rewardId);
        return rewardCfg;
    }

    /**根据限购类型获取商品配置 */
    public getShopCfgByLimitType(shopId: number) {
        let vo = ShopManager.ins().shopDatas.get(shopId);
        let goods = vo.getShowGoods();
        
        // 根据 goods._config.limitBuyType 字段分组并按 sort 从大到小 排序
        const groupedItems = goods.reduce((groups, item) => {
            const limitBuyType = item._config.limitBuyType;
            const limitTypeLb = this.getLimitConfig(limitBuyType).refreshStr;
            if (!groups[limitBuyType]) {
                groups[limitBuyType] = {
                    limitBuyType,  // 添加 limitBuyType 字段标识分组类型
                    limitTypeLb,
                    items: []
                };
            }
            groups[limitBuyType].items.push(item);
            return groups;
        }, {});
        
        // 按 sort 排序
        const sortedGroupedItems = Object.keys(groupedItems).map((key, index) => {
            const group = groupedItems[key];
            
            // 对每个分组的物品
            group.items.sort((a, b) => a.sort - b.sort);
            
            // 按第一个物品的 sort 排序大组
            return {
                index: index,
                limitBuyType: group.limitBuyType,
                limitTypeLb:group.limitTypeLb,
                items: group.items
            };}).sort((a, b) => a.items[0].sort - b.items[0].sort);  
  
        return sortedGroupedItems;
    }

    /**打开购买弹窗 */
    public openShop(goodsVo: GoodsVo, isAdBuy: boolean = false): void {
        //检查是否超过限购次数
        if (goodsVo._config.buyTimesLimit && goodsVo.buyTimes >= goodsVo._config.buyTimesLimit) {
            GIns.floatingTextMgr.showTips(G.I18nManager.translate(I18ShopKey.i18n_shop_errTips1));
            return;
        }
        //检查是否有购买限制
        if (!ConditionManager.ins().checkCondition(goodsVo._config.buyConditions)) {
            let limitStr = ConditionManager.ins().getOpenConditionTips(goodsVo._config.buyConditions)
            // let lock = goodsVo._config.buyConditions.split(",")[2];
            // let limitStr = G.I18nManager.lang(I18ShopKey.i18n_shop_goodsBuyLock, lock);
            GIns.floatingTextMgr.showTips(limitStr);
            return;
        }
        if (isAdBuy) {
            let args: IAdPlayVo = {
                type: ServerEnums.AdvertType.SHOP,
                param: goodsVo.goodsId + ''
            }
            this.emit(NotificationKey.AD_START_PLAY, args)
            return
        }
        UIManager.ins().open(UIShopKey.SHOP_BUY_WIN, goodsVo);
    }

    /**获取限制配置 */
    public getLimitConfig(type: string) {
        let cfg = TableManager.getDataById(table.shop.ShopGoodsLimitBuyConfig, type);

        return cfg;
    }

    /**显示道具详情弹窗 */
    public showItemDetail(node: Node, itemId: number, event: fgui.Event) {
        const itemUI = node.getComponent(UITransform);

        let cfg = TableManager.getDataById(table.item.ItemConfig, itemId);

        // event 点击道具
        G.FacadeManager.emit(NotificationKey.CLICK_ITEM, EventClickItem.create(
            event,
            cfg,
            itemUI
        ))
    }
}

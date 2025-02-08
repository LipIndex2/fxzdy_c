import G from "../../../../core/comm/G";
import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import { UIView, ViewAdaptType } from "../../../../core/mvc/view/UIView";
import { StringUtils } from "../../../../core/utils/StringUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { UiTweenMgr } from "../../../../core/comm/UiTweenMgr";
import NotificationKey from "../../../event/NotificationKey";
import { ItemModel } from "../../item/model/ItemModel";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { I18ShopKey } from "../const/UIShopConst";
import { DailyShopItem } from "../item/DailyShopItem";
import { ShopModel } from "../model/ShopModel";
import { ShopManager } from "../shopManager";
import { GoodsVo } from "../vo/goodsVo";
import { ShopVo } from "../vo/ShopVo";

export class DailyShopPage extends UIView {
    static pkgName: string = "shop";

    static viewName: string = "DailyShopPage";
    protected _layer: EnumUIViewLayer = EnumUIViewLayer.SUBVIEW;
    protected adaptType = ViewAdaptType.TOP;
    protected shopType = -1;
    private _goods: GoodsVo[];
    //一个货架最多显示的商品数量
    private lineNum = 3;

    protected _isFristRefresh: boolean = true
    protected _maxFirstAniIndex: number = 0

    private get view(): ui.shop.page.DailyShopPage {
        return this._view as any;
    }


    listenNotifications(): string[] {
        return [
            NotificationKey.EVENT_SHOP_BUY_RESP,
            NotificationKey.EVENT_SHOP_INFO_RESP,
            NotificationKey.SYSTEM_NEW_DAY,
            NotificationKey.EVENT_CHANGE_ITEMS
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_SHOP_BUY_RESP:
                this.onBuyResp(args);
                break;
            case NotificationKey.EVENT_SHOP_INFO_RESP:
                let vo = ShopManager.ins().shopDatas.get(this.shopType);
                this.onInfoResp(vo._data);
                break;
            case NotificationKey.SYSTEM_NEW_DAY:
                //跨天处理
                ShopModel.ins().getShopInfo(this.shopType);
                break;
            case NotificationKey.EVENT_CHANGE_ITEMS:
                this.showCost();
                break;
        }
    }

    public onInit(): void {
        this.view.goodsList.setVirtual();
        this.view.goodsList.isLoadInFrames = true;
        this.view.goodsList.itemRenderer = this.itemRendererForGoods.bind(this);
        this.view.cost0.onClick(this.onShowItemTips.bind(this, 0));
        this.view.cost1.onClick(this.onShowItemTips.bind(this, 1));
        this.view.updateBtn.onClick(this.onRefreshBtnClick, this);
    }


    public onOpen(args: number): void {
        if (this.shopType != args) {
            this.shopType = args;
            G.GameTimer.callLater(this, this.onRefreshResp);
        }
    }

    protected onClose(): void {
        G.GameTimer.clearAll(this);
    }

    private onShowItemTips(idx: number, e) {
        let vo = ShopManager.ins().shopDatas.get(this.shopType);
        let cost = vo._buyCosts[idx];
        //显示物品tips
        ShopModel.ins().showItemDetail(this.view[`cost${idx}`].node, cost, e);
    }

    private showCost() {
        let vo = ShopManager.ins().shopDatas.get(this.shopType);
        let costs = vo._buyCosts;
        if (costs.length > 0) {
            for (let i = 0; i < costs.length; i++) {
                let cost = costs[i];
                let node = this.view[`cost${i}`];
                //读取货币
                let item = ItemModel.ins().getItemById(Number(cost));
                let cont = item ? item.count : 0;
                this.shopCost(node, cost, cont);
                node.visible = true;
            }
            if (costs.length == 1)
                this.view.cost1.visible = false;
        }
    }


    onBuyResp(args: any) {
    }

    /**单独处理刷新逻辑
     * - 1  自动刷新,不能手动刷新  (AUTO_REFRESH)
     - 2  手动刷新,没有自动刷新时间  (MANUAL_REFRESH)
     - 3  永不刷新  (NEVER_REFRESH)
     - 4  指定自动刷新时间且可以手动刷新  (AUTO_AND_MANUAL_REFRESH)
     maxCount 手动刷新的最大次数
     */
    private showUpdate(refreshType: string,
        maxCount: number,
        refreshBtn: fgui.GButton,
        autoCom: fgui.GComponent,
        updateTime: fgui.GTextField
    ) {

        let type = ServerEnums.ShopRefreshType[refreshType];

        switch (type) {
            case ServerEnums.ShopRefreshType.AUTO_REFRESH:
                refreshBtn.visible = false;
                autoCom.visible = true;
                updateTime.visible = false;
                break;
            case ServerEnums.ShopRefreshType.MANUAL_REFRESH:
                refreshBtn.visible = maxCount > 0;

                updateTime.visible = maxCount > 0;
                autoCom.visible = false;
                break;
            case ServerEnums.ShopRefreshType.NEVER_REFRESH:
                refreshBtn.visible = false;
                autoCom.visible = false;
                updateTime.visible = false;
                break;
            case ServerEnums.ShopRefreshType.AUTO_AND_MANUAL_REFRESH:
                autoCom.visible = true;
                refreshBtn.visible = maxCount > 0;

                updateTime.visible = maxCount > 0;
                break;
        }
    }


    onInfoResp(args: Vo.shop.ShopVo) {
        if (args.shopId == this.shopType) {
            this.onRefreshResp();
        }
    }

    private shopCost(node: { costIcon: fgui.GLoader, costNum: fgui.GTextField }, itemId: number, num: number) {
        //  let item = NoOwnerItem.create(itemId, num);
        let icon = ItemUtils.getItemConfigByItemId(itemId).smallIconPath;
        node.costIcon.icon = icon;
        node.costNum.text = StringUtils.numShortToKM(num);
    }

    private onRefreshBtnClick() {
        ShopModel.ins().reFreshShop(this.shopType);
    }

    onRefreshResp() {
        let vo = ShopManager.ins().shopDatas.get(this.shopType);
        if (!vo) return;

        this.view.name1.text = this.view.name2.text = this.view.name3.text = G.I18nManager.translate(vo._config.shopName);
        //每日刷新
        this.view.autoCom.autoUpdateLabel.text = G.I18nManager.translate(vo._config.refreshStr);
        if (vo._refreshCfg) {
            //每日手动刷新次数  //设置文本颜色  [color=#FFFFFF]text[/color]
            let color = vo._maxManualRefreshCount > vo._data.manualRefreshTimes ? "#FFFFFF" : "#FF5454";
            let manualRefreshTimes = `[color=${color}]${vo._data.manualRefreshTimes}`;
            let refreshTimes = `${vo._maxManualRefreshCount}[/color]`;
            this.view.updateTime.text = G.I18nManager.lang(I18ShopKey.i18n_shop_shopUpdate, manualRefreshTimes, refreshTimes);
            //每日手动刷新消耗
            this.shopCost(this.view.updateBtn, vo._refreshCfg.costItems[0].k, vo._refreshCfg.costItems[0].v);
        }


        //刷新按钮显示逻辑
        this.showUpdate(vo._config.refreshType, vo._maxManualRefreshCount, this.view.updateBtn, this.view.autoCom, this.view.updateTime);

        //根据商品的消耗显示商品购买货币
        this.showCost();
        this._goods = vo.getShowGoods();

        //商品列表
        let num = Math.ceil(this._goods.length / this.lineNum);
        this.view.goodsList.numItems = 0;
        this.view.goodsList.numItems = num;

        if (this._isFristRefresh) {
            G.GameTimer.callLater(this, () => {
                this._isFristRefresh = false
            })
        }
    }

    /**商品每个货架列表子项 */
    private itemRendererForGoods(index: number, item: ui.shop.component.shopListItem) {
        //根据index和lineNum计算出当前商品的id
        let goodsIdStart = index * this.lineNum;
        let goodsList = item.goodsList;

        if (this._isFristRefresh) {
            //前三页才有特效
            goodsList.itemRenderer = UiTweenMgr.ins().listItemRendererEffect(this.view.goodsList.node.uuid + '_' + index, this.itemRendererForGoodsItem.bind(this, goodsIdStart), this, { delay: index * 300, delay2: 80 });
        } else {
            goodsList.itemRenderer = this.itemRendererForGoodsItem.bind(this, goodsIdStart);
        }

        let num = Math.min(this.lineNum, this._goods.length - goodsIdStart);
        goodsList.numItems = num;

    }

    /**商品列表子项 */
    private itemRendererForGoodsItem(goodsIdStart: number, index: number, item: DailyShopItem) {
        //根据index和lineNum计算出当前商品的id
        let goodsVo = this._goods[goodsIdStart + index];
        item.setData(goodsVo)
    }


    private onBuyBtnClick(goodsVo: GoodsVo) {
        ShopModel.ins().openShop(goodsVo);
    }


}

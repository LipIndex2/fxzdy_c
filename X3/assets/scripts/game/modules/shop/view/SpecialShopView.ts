/**@format */
import G from "../../../../core/comm/G";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { ItemModel } from "../../item/model/ItemModel";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import { ShopModel } from "../model/ShopModel";
import { ShopManager } from "../shopManager";
import { SpecialShopItem } from "../item/SpecialShopItem";
import { StringUtils } from "../../../../core/utils/StringUtils";
import NotificationKey from "../../../event/NotificationKey";
import { TimeUtils } from "../../../comm/utils/TimeUtils";

export class SpecialShopView extends UICommWin {
    static pkgName: string = "shop";

    static viewName: string = "SpecialShopView";
    protected shopType = -1;
    private _goods: any[];
    //一个货架最多显示的商品数量
    private lineNum = 3;

    private get view(): ui.shop.page.SpecialShopView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.EVENT_SHOP_BUY_RESP,
            NotificationKey.EVENT_SHOP_INFO_RESP,
            NotificationKey.SYSTEM_NEW_DAY,
            NotificationKey.EVENT_CHANGE_ITEMS,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
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
                // this.showCost();
                break;
        }
    }

    /**绑定，注册，静态数据获取 （初始化） */
    protected onInit(): void {
        this.view.totalList.itemRenderer =
            this.itemRendererForGoodsList.bind(this);
    }

    /**动态数据获取，界面逻辑 （界面打开，可能触发多次）*/
    protected onOpen(shopId?: number): void {
        this.shopType = shopId;
        let vo = ShopModel.ins().getShopCfgByLimitType(shopId);
        if (!vo) return;
        this._goods = vo;
        this.view.totalList.numItems = vo.length;
        this.showCost();
    }

    showCost() {
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
            if (costs.length == 1) this.view.cost1.visible = false;
        }
    }

    onBuyResp(args: any) {
    }

    onInfoResp(args: Vo.shop.ShopVo) {
        if (args.shopId == this.shopType) {
            this.onRefreshResp();
        }
    }

    onRefreshResp() {
        let vo = ShopManager.ins().shopDatas.get(this.shopType);
        if (!vo) return;

        //根据商品的消耗显示商品购买货币
        this.showCost();

        //商品列表
        this._goods = ShopModel.ins().getShopCfgByLimitType(this.shopType);
        this.view.totalList.numItems = 0;
        this.view.totalList.numItems = this._goods.length;
    }

    private shopCost(
        node: { costIcon: fgui.GLoader; costNum: fgui.GTextField },
        itemId: number,
        num: number
    ) {
        let icon = ItemUtils.getItemConfigByItemId(itemId).smallIconPath;
        node.costIcon.icon = icon;
        node.costNum.text = StringUtils.numShortToKM(num);
    }

    /**每个货架列表 */
    private itemRendererForGoodsList(
        typeId: number,
        item: ui.shop.component.SpecialShopTypeItem
    ) {
        let data = this._goods[typeId];
        item.ShopInfoBar.typetTitle.text = G.I18nManager.lang(data.limitTypeLb);
        if (data.limitBuyType === "WEEKLY") {
            let time = TimeUtils.getTimeUntilNextMonday(
                G.TimeManager.serverNow
            );
            item.ShopInfoBar.timeLabel.text =
                time.remainingDays + "天" + time.remainingHours + "时";
        } else {
            item.ShopInfoBar.timeImg.visible = false;
            item.ShopInfoBar.timeLabel.visible = false;
        }
        const num = data.items.length;
        if (num <= this.lineNum) {
            item.setSize(item.width, 310);
        } else {
            // 宽度增加240
            const height = Math.floor(num / 3) * 240;
            item.setSize(item.width, 310 + height);
        }
        item.itemList.itemRenderer = this.itemRendererForGoods.bind(
            this,
            typeId
        );
        item.itemList.numItems = num;
    }

    private itemRendererForGoods(
        typeId: number,
        index: number,
        item: SpecialShopItem
    ) {
        item.setData(this._goods[typeId].items[index]);
    }

    /*清理定时器、动画、临时数据 （界面关闭，注意这里不是销毁）*/
    protected onClose(): void {
        GameTimer.ins().clearAll(this);
    }

    /**用于界面清理缓存 （界面销毁）*/
    protected onPreDispose(): void {}
}

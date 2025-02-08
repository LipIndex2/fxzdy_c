/**@format */
import { bindScript } from "db://assets/scripts/core/comm/UIScriptManager";
import { ViewAdaptType } from "db://assets/scripts/core/mvc/view/UIView";
import {
    DailySaleCfgData,
    DailySaleGroupCfgData,
    DailySaleModel,
} from "db://assets/scripts/game/modules/dailySale/model/DailySaleModel";
import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { GListEffectType } from "db://assets/scripts/core/prototypes/FguiGListEffect";
import G from "db://assets/scripts/core/comm/G";
// import { UiTweenMgr } from "db://assets/scripts/game/comm/mgr/UiTweenMgr";
import { UIChargeConfig } from "db://assets/scripts/game/modules/charge/const/UIChargeConfig";
import { DailySaleItem } from "db://assets/scripts/game/modules/dailySale/view/item/DailySaleItem";
import { TouchUtils } from "../../../../core/utils/TouchUtils";
import { ShopType } from "db://assets/scripts/game/modules/shop/const/UIShopConst";
import { ShopModel } from "db://assets/scripts/game/modules/shop/model/ShopModel";
import { ModelNode } from "../../common/node/ModelNode";
import { EnumTabItemNameForClient } from "../../../ui/main/const/EnumTabItemNameForClient";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import GIns from "../../../GIns";

/**
 * 限购页面 */
@bindScript(UIChargeConfig.DailySaleMainView)
export class DailySaleMainView extends UICommWin {
    static pkgName: string = "dailySale";
    static viewName: string = "DailySaleMainView";
    protected adaptType = ViewAdaptType.TOP;

    protected _groupId: number = 0;
    protected _showCfgs: DailySaleCfgData[] = [];
    protected _groupData: DailySaleGroupCfgData = null;

    protected _showEffect: boolean = false;
    protected _config: table.mainpage.MainPageTabItemConfig = null;
    private _isShopOpen: boolean = true;

    private get view(): ui.dailySale.DailySaleMainView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [NotificationKey.DAILY_SALE_CHANGE];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.DAILY_SALE_CHANGE:
                this.updateUI();
                break;
        }
    }

    protected onInit() {
        //@ts-ignore
        this.view.ui.list.setVirtual();
        this.view.ui.list.itemRenderer = this.itemRendererForGoods.bind(this);
        // this.view.ui.list.effectType = GListEffectType.FADE_IN;
        // this.view.ui.list.effectParams = { delay: 0.4, interval: 0.06 };

        // outside
        this.view.onClick(this.onTouchOutSide, this);
        this.view.btnBack.onClick(() => {
            this.closeSelf();
        }, this);
        this.view.ui.shopBtn.onClick(() => {
            ShopModel.ins().openShopMain(ShopType.SPECIAL);
        });
    }

    private onTouchOutSide(event: fgui.Event) {
        G.Logger.debug(event, " onTouchEnd ");

        let isIn = TouchUtils.isFguiTouchInUi(event, this.view._uiTrans);
        if (isIn) {
            return;
        }
        this.closeSelf();
    }

    protected onClickFree(): void {
        DailySaleModel.ins().sendReceiveSaleReward({
            saleId: this._groupData.freeCfg.cfg.id,
        });
    }

    protected itemRendererForGoods(index: number, item: DailySaleItem): void {
        item.setData(this._showCfgs[index]);
    }

    public updateUI(): void {
        this._groupData = DailySaleModel.ins().getGroupCfgData(this._groupId);
        if (this._groupData == null) {
            this.closeSelf();
            return;
        }

        //@ts-ignore
        let packComp = this.view.ui.itemPack as DailySalePackItem;
        packComp.setData(this._groupData.packCfg);

        let allBuyCount = 0;
        for (let giftCfg of this._groupData.otherCfgs) {
            allBuyCount = allBuyCount + giftCfg.orderCfg.price;
        }
        packComp.lbTip1.text = "原价\n" + allBuyCount / 100 + "元";

        this._showCfgs = this._groupData.otherCfgs.concat();
        this._showCfgs[this._showCfgs.length] = this._groupData.freeCfg; // 免费礼包

        // let dailySaleModel = DailySaleModel.ins();
        this._showCfgs.sort((a, b) => {
            // let sa = dailySaleModel.hasBuyGift(a.cfg.id) ? 1 : 0;
            // let sb = dailySaleModel.hasBuyGift(b.cfg.id) ? 1 : 0;
            // if (sa != sb) {
            //     return sa - sb;
            // }
            return a.cfg.id - b.cfg.id;
        });

        // let showEffect: boolean = this.view.ui.list.isShowEffect;
        this.view.ui.list.numItems = this._showCfgs.length;

        // if (showEffect) {
        //     UiTweenMgr.ins().listShowEffect(
        //         this.view.ui.list,
        //         this.view.ui.listBg
        //     );
        //     UiTweenMgr.ins().listShowEffect(
        //         this.view.ui.itemPack,
        //         this.view.ui.listBg
        //     );
        // }
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this.view.ui.list.resetRefreshTimes();
        this._groupId = DailySaleModel.ins().curGroupId;
        this.updateUI();
        this.updateEffect();
    }

    /**更新特效*/
    public updateEffect() {
        const shopBtn = this.view.ui.shopBtn;
        let iconEffect = { low: 10010196, up: 10010195 };
        //图标特效
        let modelNodeBottom: ModelNode = shopBtn.modelNodeBottom as ModelNode;
        let modelNodeTop: ModelNode = shopBtn.modelNodeTop as ModelNode;

        if (iconEffect.low) {
            modelNodeBottom.loadByModelId(iconEffect.low);
        } else {
            modelNodeBottom.clear();
        }

        if (iconEffect.up) {
            modelNodeTop.loadByModelId(iconEffect.up);
        } else {
            modelNodeTop.clear();
        }
    }

    protected onClose(): void {
        // UiTweenMgr.ins().removeTweenEffect(
        //     this.view.ui.list,
        //     this.view.ui.itemPack,
        //     this.view.ui.listBg
        // );
    }
}

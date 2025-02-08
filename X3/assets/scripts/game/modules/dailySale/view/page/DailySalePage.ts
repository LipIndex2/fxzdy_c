/**@format */
import { EnumUIViewLayer } from "../../../../../core/comm/LayerManager";
import { bindScript } from "../../../../../core/comm/UIScriptManager";
import { UIView, ViewAdaptType } from "../../../../../core/mvc/view/UIView";
import { GListEffectType } from "../../../../../core/prototypes/FguiGListEffect";
// import { UiTweenMgr } from "../../../../comm/mgr/UiTweenMgr";
import NotificationKey from "../../../../event/NotificationKey";
import { UIChargeConfig } from "../../../charge/const/UIChargeConfig";
import {
    DailySaleCfgData,
    DailySaleGroupCfgData,
    DailySaleModel,
} from "../../model/DailySaleModel";
import { DailySaleItem } from "../item/DailySaleItem";
import { DailySalePackItem } from "../item/DailySalePackItem";

/** 限购页面 */
@bindScript(UIChargeConfig.CHARGE_DAILY_PAGE)
export class DailySalePage extends UIView {
    static pkgName: string = "dailySale";
    static viewName: string = "DailySalePage";

    protected _layer: EnumUIViewLayer = EnumUIViewLayer.SUBVIEW;
    protected adaptType = ViewAdaptType.TOP;

    protected _groupId: number = 0;
    protected _showCfgs: DailySaleCfgData[] = [];
    protected _groupData: DailySaleGroupCfgData = null;

    protected _showEffect: boolean = false;

    private get view(): ui.dailySale.page.DailySalePage {
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
        this.view.list.setVirtual();
        this.view.list.itemRenderer = this.itemRendererForGoods.bind(this);
        this.view.list.effectType = GListEffectType.FADE_IN;
        this.view.list.effectParams = { delay: 0.4, interval: 0.06 };
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
        let hasBuyPack = DailySaleModel.ins().hasBuyPackGift(this._groupId);
        //@ts-ignore
        let packComp = this.view.itemPack as DailySalePackItem;
        packComp.setData(this._groupData.packCfg);

        this._showCfgs = this._showCfgs.concat(
            this._groupData.otherCfgs,
            this._groupData.freeCfg
        );
        if (hasBuyPack == false) {
            let dailySaleModel = DailySaleModel.ins();
            this._showCfgs.sort((a, b) => {
                let sa = dailySaleModel.hasBuyGift(a.cfg.id) ? 1 : 0;
                let sb = dailySaleModel.hasBuyGift(b.cfg.id) ? 1 : 0;
                if (sa != sb) {
                    return sa - sb;
                }
                return a.cfg.id - b.cfg.id;
            });
        }
        // let showEffect: boolean = this.view.list.isShowEffect;
        this.view.list.numItems = this._showCfgs.length;

        // if (showEffect) {
        //     UiTweenMgr.ins().listShowEffect(this.view.list, this.view.listBg);
        //     UiTweenMgr.ins().listShowEffect(
        //         this.view.itemPack,
        //         this.view.listBg
        //     );
        // }
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this.view.list.resetRefreshTimes();
        this._groupId = DailySaleModel.ins().curGroupId;
        this.updateUI();
    }

    protected onClose(): void {
        // UiTweenMgr.ins().removeTweenEffect(
        //     this.view.list,
        //     this.view.itemPack,
        //     this.view.listBg
        // );
    }
}

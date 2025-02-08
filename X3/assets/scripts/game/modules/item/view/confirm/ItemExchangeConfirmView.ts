import G from "db://assets/scripts/core/comm/G";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import { ColorUtils } from "db://assets/scripts/core/utils/ColorUtils";
import { TouchUtils } from "db://assets/scripts/core/utils/TouchUtils";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { BackpackManager } from "db://assets/scripts/game/modules/backpack/BackpackManager";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { UICommWin } from "../../../../../core/mvc/view/UICommWin";
import GIns from "../../../../GIns";


export enum ItemExchangeType {
    /**直接扣费*/
    Cost = 1,
    /**商店购买*/
    Shop = 2
}

export interface IItemExchangeParam {
    goodsId?: number
    goodsCnt?: number
}

export class ItemExchangeConfirmViewOpenArgs {
    // 从什么道具
    itemFrom: NoOwnerItem[];
    // 转为什么道具
    itemTo: NoOwnerItem;
    // 确认回调
    okCallback: Function;
    // 兑换类型
    type: ItemExchangeType
    // 兑换参数
    param: IItemExchangeParam

    static create(itemFrom: NoOwnerItem[], itemTo: NoOwnerItem, okCallback: Function, type: ItemExchangeType, param: IItemExchangeParam): ItemExchangeConfirmViewOpenArgs {
        let args = new ItemExchangeConfirmViewOpenArgs();
        args.itemFrom = itemFrom;
        args.itemTo = itemTo;
        args.okCallback = okCallback;
        args.type = type;
        args.param = param;
        return args;
    }
}

/**
 * 道具兑换确认
 */
export class ItemExchangeConfirmView extends UICommWin {

    showFlag: boolean = false

    static pkgName: string = "commFrame";

    static viewName: string = "ItemExchangeConfirmView";

    private _args: ItemExchangeConfirmViewOpenArgs;
    private _isCanPay: boolean;


    private get view(): ui.commFrame.confirm.ItemExchangeConfirmView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.EVENT_SHOP_BUY_RESP
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_SHOP_BUY_RESP:
                if (this._args.type == ItemExchangeType.Shop && this._args.param?.goodsId == args) {
                    this.handleExchangeComplete()
                }
                break
        }
    }

    public onInit(): void {
        G.Logger.debug(" onInit ");

        // FGUIMaskUtils.createBackgroundMask(this.view)

        // this.view.onClick(this.onClickAny, this)
        this.view.btnYes.onClick(this.onBtnYesClick, this)
        this.view.btnNo.onClick(this.onBtnNoClick, this)
    }

    onClickAny(event: fgui.Event) {
        const b = TouchUtils.isFguiTouchInUi(event, this.view.bg._uiTrans);
        if (b) {
            return;
        }
        this.closeSelf();
    }

    @LogBusiness("[道具] 小提示框打开")
    public onOpen(args: ItemExchangeConfirmViewOpenArgs): void {
        G.Logger.debug(" onOpen ")
        if (!args) {
            return;
        }
        this._args = args;
        this.reset()
    }

    public onClose(): void {
        G.Logger.debug(" onClose ")

        this.showFlag = false

    }

    @LogBusiness("[消耗确认] yes")
    private onBtnYesClick() {
        if (!this._isCanPay) {
            // 又说改成道具来源
            // GIns.floatingTextMgr.showTips("道具不足无法兑换");

            // 弹出道具不足
            const item = this._args.itemTo;
            FacadeManager.ins().emit(NotificationKey.EVENT_ITEM_GET_WAY_POP_UP_2,
                [item.itemId, item.count]
            );

            this.closeSelf();
            return;
        }
        if (this._args.type == ItemExchangeType.Cost) {
            //直接兑换
            this.handleExchangeComplete()
        } else if (this._args.type == ItemExchangeType.Shop) {
            GIns.shopModel.buyGoodsById(this._args.param.goodsId, this._args.param.goodsCnt, false, false)
        }
    }

    protected handleExchangeComplete(): void {
        const okCallback = this._args.okCallback;
        if (okCallback) {
            okCallback();
        }
        this.closeSelf();
    }

    @LogBusiness("[消耗确认] no")
    private onBtnNoClick() {
        this.closeSelf();
    }

    private reset() {

        const args = this._args;
        const itemFrom = args.itemFrom?.length > 0 ? args.itemFrom[0] : null;
        const isCanPay = BackpackManager.ins().isCanPayItem(itemFrom, false);
        if (isCanPay) {
            this.view.imageItemText1.labelCount.color = ColorUtils.COLOR_GREEN;
        } else {
            this.view.imageItemText1.labelCount.color = ColorUtils.COLOR_RED;
        }
        this._isCanPay = isCanPay;

        if (itemFrom) {
            this.view.imageItemText1.labelCount.text = itemFrom.count.toString()
            this.view.imageItemText1.imageCostItem.icon = itemFrom.getItemSmallIconPath();
        }

        const itemTo = args.itemTo;
        this.view.imageItemText2.labelCount.text = itemTo.count.toString()
        this.view.imageItemText2.imageCostItem.icon = itemTo.getItemSmallIconPath();
    }
}
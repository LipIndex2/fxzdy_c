import G from "db://assets/scripts/core/comm/G";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { UICommWin } from "../../../../../core/mvc/view/UICommWin";
import { BackpackManager } from "db://assets/scripts/game/modules/backpack/BackpackManager";
import { ColorUtils } from "db://assets/scripts/core/utils/ColorUtils";
import { FloatingTextManager } from "db://assets/scripts/game/modules/floatingText/FloatingTextManager";
import { UIManager } from "db://assets/scripts/core/mvc/UIManager";
import { Logger } from "db://assets/scripts/core/log/Logger";
import { ItemNotEnoughViewOpenArgs } from "db://assets/scripts/game/modules/itemDetails/ItemNotEnoughView";
import { UIViewItemDetailsKey } from "db://assets/scripts/game/modules/itemDetails/UIViewItemDetailsKey";

// open args
export class ItemCostConfirmViewOpenArgs {
    isTwoRow: boolean;
    title1: string;
    title2: string;
    title3: string;
    // 消耗的道具
    item: NoOwnerItem;
    // 确认回调
    okCallback: Function;
    offsetX:number;

    static create(
        isTwoRow: boolean,
        item: NoOwnerItem,
        title1: string,
        title2: string,
        title3: string,
        okCallback: Function,
        offsetX?:number,
    ): ItemCostConfirmViewOpenArgs {
        let args = new ItemCostConfirmViewOpenArgs();
        args.isTwoRow = isTwoRow;
        args.title1 = title1;
        args.title2 = title2;
        args.title3 = title3;
        args.item = item;
        args.okCallback = okCallback;
        args.offsetX = offsetX || 0;
        return args;
    }
}

/**
 * 道具消耗确认
 */
export class ItemCostConfirmView extends UICommWin {

    showFlag: boolean = false

    static pkgName: string = "commFrame";

    static viewName: string = "ItemCostConfirmView";

    private _args: ItemCostConfirmViewOpenArgs;
    private _isCanPay: boolean = true;
    private _costItem: NoOwnerItem;


    private get view(): ui.commFrame.confirm.ItemCostConfirmView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return null;
    }

    notificationHandler(eventName: string, args?: any): void {

    }

    public onInit(): void {
        G.Logger.debug(" onInit ");

        this.view.btnYes.onClick(this.onBtnYesClick, this)
        this.view.btnNo.onClick(this.onBtnNoClick, this)
    }

    @LogBusiness("[道具] 小提示框打开")
    public onOpen(args: ItemCostConfirmViewOpenArgs): void {
        G.Logger.debug(" onOpen ")
        if (!args) {
            return;
        }

        this.reset(args)
    }

    public onClose(): void {
        G.Logger.debug(" onClose ")

        this.showFlag = false

    }

    @LogBusiness("[消耗确认] yes")
    private onBtnYesClick() {
        if (!this._isCanPay) {
            // 不足支付
            FloatingTextManager.ins().showTips("货币不足");
            UIManager.ins().open(UIViewItemDetailsKey.ItemNotEnoughView, {
                itemConfig: this._costItem.getItemConfig(),
                count: this._costItem.count,
            } as ItemNotEnoughViewOpenArgs)
            this.closeSelf();
            return;
        }

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

    private reset(args: ItemCostConfirmViewOpenArgs) {
        this._args = args;
        const x = this.view.G_1.x;
        this.view.G_1.x = x + args.offsetX;
        this.view.getController("isTwoRow").selectedIndex = args?.isTwoRow ? 1 : 0;

        this.view.labelContent1.text = args.title1;
        this.view.labelContent2.text = args.title2;
        this.view.labelContent3.text = args.title3;

        const costItem = args.item;
        if (!costItem) {
            Logger.error("没有扣款道具");
        }
        this._costItem = costItem;
        this.view.imageItemText1.labelCount.text = costItem.count.toString()
        this.view.imageItemText1.imageCostItem.icon = costItem.getItemSmallIconPath();

        const isCanPay = BackpackManager.ins().isCanPayItem(costItem);
        this._isCanPay = isCanPay;
        this.view.imageItemText1.labelCount.color = isCanPay ? ColorUtils.COLOR_GREEN : ColorUtils.COLOR_RED;

    }
}
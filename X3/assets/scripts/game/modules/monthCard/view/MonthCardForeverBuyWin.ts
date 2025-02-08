import { RichText } from "cc";
import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { ViewBlackBgComp } from "../../../../core/mvc/view/comp/ViewBlackBgComp";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import { DateUtils } from "../../../../core/utils/DateUtils";
import { RichTextUtils } from "../../../../core/utils/RichTextUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import NotificationKey from "../../../event/NotificationKey";
import { OrderModel } from "../../order/OrderModule";
import { MonthCardI18nKeys } from "../const/MonthCardI18nKeys";
import { UIMonthCardConfig } from "../const/UIMonthCardConfig";
import { MonthCardAdditionDesc, MonthCardData, MonthCardModel } from "../model/MonthCardModel";
import { MonthCardAdditionItem } from "./item/MonthCardAdditionItem";
import { MonthCardItem } from "./item/MonthCardItem";
import { AccountModel } from "../../account/model/AccountModel";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";

/**
 * 终身卡界面
 */
@bindScript(UIMonthCardConfig.MonthCardForeverBuyWin)
export class MonthCardForeverBuyWin extends UICommWin {

    static pkgName: string = "activityPass";
    static viewName: string = "MonthCardForeverBuyWin";

    protected _cardData: MonthCardData = null;
    protected _descList: MonthCardAdditionDesc[] = []

    private get view(): ui.activityPass.monthCard.view.MonthCardForeverBuyWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.MONTHCARD_DATA_CHANGE,
            NotificationKey.MONTHCARD_BUY_COMPLETE
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.MONTHCARD_DATA_CHANGE:
                this.updateUI()
            case NotificationKey.MONTHCARD_BUY_COMPLETE:
                if (args == null || args == this._cardData) {
                    // this.closeSelf()
                }
                break
        }
    }

    protected onInit(): void {
        this.view.lbTip1.text = G.I18nManager.lang(MonthCardI18nKeys.tip2)
        this.view.lbTitle2.text = G.I18nManager.lang(MonthCardI18nKeys.tip3)
        this.view.btnDraw.title = G.I18nManager.lang(MonthCardI18nKeys.draw)

        this.view.btnDraw.onClick(this.onClickDraw, this)
        this.view.btnBuy.onClick(this.onClickBuy, this)
        // this.view.btnRenew.onClick(this.onClickBuy, this)
        this.view.listAddition.itemRenderer = this.itemRenderForAddition.bind(this)
    }

    protected onClickDraw(): void {
        MonthCardModel.ins().sendReceiveDailyRewards({cardId:this._cardData.id})
    }

    protected onClickBuy(): void {
        OrderModel.ins().sendCreateOrder(this._cardData.cfg?.chargeGoodsId)
    }

    protected itemRenderForAddition(index: number, item: MonthCardAdditionItem): void {
        item.setData(this._descList[index], ServerEnums.MonthCardType[this._cardData.cfg.type])
    }

    protected updateUI(): void {
        this.view.lbTitle.text = this._cardData.orderCfg.goodsName
        this.view.lbDes.text = G.I18nManager.lang(MonthCardI18nKeys.tip1, this._cardData.orderCfg.goodsName)
        this._descList = MonthCardModel.ins().getAdditionDescList(this._cardData)
        this.view.listAddition.numItems = this._descList.length

        let isActive = MonthCardModel.ins().isActive(this._cardData)
        if (isActive) {
            this.view.getController('c1').selectedIndex = 1
            // this.view.btnRenew.title = G.I18nManager.lang(MonthCardI18nKeys.renew, this._cardData.orderCfg.price / 100)
            this.view.btnDraw.enabled = !MonthCardModel.ins().hasDrewReward(this._cardData)

            // let remianDays = MonthCardModel.ins().getRemainDays(this._cardData)
            // this.view.lbTime.text = G.I18nManager.lang(MonthCardI18nKeys.remainDays, remianDays)
        } else {
            this.view.getController('c1').selectedIndex = 0
            this.view.btnBuy.title = G.I18nManager.lang(MonthCardI18nKeys.price, this._cardData.orderCfg.price / 100)
        }

        if (this._cardData.cfg.dailyRewards.length > 0) {
            let firstDailyReward = this._cardData.cfg.dailyRewards[0]
            let itemCfg = G.TableManager.getDataById(table.item.ItemConfig, firstDailyReward.k)
            if (itemCfg) {
                this.view.iconReward.icon = itemCfg.iconPath
            }
            this.view.lbCount.text = 'x' + firstDailyReward.v
        }
        if (this._cardData.cfg.discountShow > 0) {
            this.view.pDiscount.visible = true
            this.view.pDiscount.lbTitle.text = G.I18nManager.lang(MonthCardI18nKeys.discount)
            this.view.pDiscount.lbDiscount.text = this._cardData.cfg.discountShow + '%'
        } else {
            this.view.pDiscount.visible = false
        }

        if (this._cardData.cfg?.rewards?.length > 0) {
            let firstReward = this._cardData.cfg.dailyRewards[0]
            let itemCfg = G.TableManager.getDataById(table.item.ItemConfig, firstReward.k)
            if (itemCfg) {
                let lastIndex = itemCfg.smallIconPath.lastIndexOf('/')
                if (lastIndex != -1) {
                    let itemIcon = itemCfg.smallIconPath.substring(lastIndex + 1)
                    let itemImgStr = ` <img src='${itemIcon}' width='30' height='30'/> `
                    let startTime = DateUtils.getCurrentTimeMsByHour(AccountModel.ins().vo.createdOn, 0)
                    let diffDays = DateUtils.dayCount(startTime, G.TimeManager.serverNow)
                    let itemCount = (diffDays - 1) * firstReward.v
                    let tipStr = G.I18nManager.lang(MonthCardI18nKeys.foreverTip, itemImgStr, itemCount)
                    let richText = this.view.lbBuyTip.node.getComponent(RichText)
                    let iconPath = itemCfg.smallIconPath.substring(0, lastIndex)
                    RichTextUtils.setTextWithImg(tipStr, richText, iconPath)
                }
            }
        }
        
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this._cardData = args as MonthCardData
        if (this._cardData == null) {
            console.error('MonthCardBuyWin 打开参数错误 需要MonthCardData类型参数')
            this.closeSelf()
            return
        }
        this.updateUI()
    }

    protected onClose(): void {

    }
}
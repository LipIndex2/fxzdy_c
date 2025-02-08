import { UITransform } from "cc";
import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { ViewBlackBgComp } from "../../../../core/mvc/view/comp/ViewBlackBgComp";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { BackpackManager } from "../../backpack/BackpackManager";
import { ItemFrameBtn } from "../../common/item/ItemFrameBtn";
import { FloatingTextManager } from "../../floatingText/FloatingTextManager";
import { EventClickItem } from "../../item/event/EventClickItem";
import { OrderModel } from "../../order/OrderModule";
import { MonthCardI18nKeys } from "../const/MonthCardI18nKeys";
import { UIMonthCardConfig } from "../const/UIMonthCardConfig";
import { MonthCardAdditionDesc, MonthCardData, MonthCardModel } from "../model/MonthCardModel";
import { MonthCardAdditionItem } from "./item/MonthCardAdditionItem";
import { MonthCardItem } from "./item/MonthCardItem";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";

/**
 * 月卡界面
 */
@bindScript(UIMonthCardConfig.MonthCardBuyWin)
export class MonthCardBuyWin extends UICommWin {

    static pkgName: string = "activityPass";
    static viewName: string = "MonthCardBuyWin";

    protected _cardData: MonthCardData = null;
    protected _descList: MonthCardAdditionDesc[] = []

    private get view(): ui.activityPass.monthCard.view.MonthCardBuyWin {
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
        this.view.btnItemUse.onClick(this.onClickUse, this)
        this.view.iconReward.onClick(this.onClickItem, this)
        this.view.iconReward2.onClick(this.onClickItem2, this)
        this.view.listAddition.itemRenderer = this.itemRenderForAddition.bind(this)
    }

    protected onClickItem(event: fgui.Event): void {
        const dailyRewards = this._cardData.cfg.dailyRewards;
        if (dailyRewards && dailyRewards[0]) {
            const item = dailyRewards[0];
            const itemUI = this.view.iconReward.node.getComponent(UITransform);
            const itemConfig = G.TableManager.getDataById(table.item.ItemConfig, +item.k);
            G.FacadeManager.emit(NotificationKey.CLICK_ITEM, EventClickItem.create(
                event,
                itemConfig,
                itemUI
            ));
        }
    }

    protected onClickItem2(event: fgui.Event): void {
        const dailyRewards = this._cardData.cfg.dailyRewards;
        if (dailyRewards && dailyRewards[1]) {
            const item = dailyRewards[1];
            const itemUI = this.view.iconReward.node.getComponent(UITransform);
            const itemConfig = G.TableManager.getDataById(table.item.ItemConfig, +item.k);
            G.FacadeManager.emit(NotificationKey.CLICK_ITEM, EventClickItem.create(
                event,
                itemConfig,
                itemUI
            ));
        }
    }




    protected onClickDraw(): void {
        MonthCardModel.ins().sendReceiveDailyRewards({ cardId: this._cardData.id })
    }

    protected onClickUse(): void {
        MonthCardModel.ins().sendActive({ cardId: this._cardData.id })

    }

    protected onClickBuy(): void {
        if (this._cardData.cfg.chargeGoodsId) {
            //有充值ID
            let remianDays = MonthCardModel.ins().getRemainDays(this._cardData)
            if (remianDays > this._cardData.cfg.maxDaysLimit - this._cardData.cfg.validDays) {
                //超过了购买限制
                let tipStr = G.I18nManager.lang(MonthCardI18nKeys.buyLimitTip, this._cardData.cfg.maxDaysLimit)
                GIns.floatingTextMgr.showTips(tipStr)
                return
            }
            OrderModel.ins().sendCreateOrder(this._cardData.cfg?.chargeGoodsId)
        }
        else if (this._cardData.cfg.activeChargeMoney) {
            //累充金额
            if (this._cardData.itemVo?.chargeMoney >= this._cardData.cfg.activeChargeMoney) {
                this.onClickUse()
            }
            else
                GIns.jumpManager.jumpById(29)
        }
    }

    protected itemRenderForAddition(index: number, item: MonthCardAdditionItem): void {
        item.setData(this._descList[index], ServerEnums.MonthCardType[this._cardData.cfg.type])
    }

    protected updateUI(): void {
        // this.view.lbTitle.text = this._cardData.orderCfg.goodsName
        // this.view.lbDes.text = G.I18nManager.lang(MonthCardI18nKeys.tip1, this._cardData.orderCfg.goodsName)
        this._descList = MonthCardModel.ins().getAdditionDescList(this._cardData)
        this.view.listAddition.numItems = this._descList.length

        let isActive = MonthCardModel.ins().isActive(this._cardData)

        this.view.itemGp.visible = false;//取消道具激活界面
        // const enough = MonthCardModel.ins().isEnough();
        // if(enough){
        //     if(isActive){
        //         let remianDays = MonthCardModel.ins().getRemainDays(this._cardData)
        //         const validDays = this._cardData.cfg.validDays;
        //         const maxDaysLimit = this._cardData.cfg.maxDaysLimit;
        //         if(maxDaysLimit - remianDays < validDays){
        //             //还在最大值
        //             this.view.itemGp.visible = false
        //         }else{
        //             this.view.btnItemUse.title = G.I18nManager.lang(MonthCardI18nKeys.useItem2);
        //             this.view.itemGp.visible = true
        //         }
        //     }else{
        //         this.view.btnItemUse.title = G.I18nManager.lang(MonthCardI18nKeys.useItem1);
        //         this.view.itemGp.visible = true
        //     }

        // }else{
        //     this.view.itemGp.visible = false
        // }

        //当前在激活状态
        if (isActive) {
            this.view.getController('c1').selectedIndex = 1
            // this.view.btnRenew.title = G.I18nManager.lang(MonthCardI18nKeys.renew, this._cardData.orderCfg.price / 100)
            this.view.btnDraw.enabled = !MonthCardModel.ins().hasDrewReward(this._cardData)
            if (!this.view.btnDraw.enabled)
                this.view.btnDraw.title = G.I18nManager.lang(MonthCardI18nKeys.draw2)
            else
                this.view.btnDraw.title = G.I18nManager.lang(MonthCardI18nKeys.draw)

            let remianDays = MonthCardModel.ins().getRemainDays(this._cardData)
            this.view.lbTime.text = G.I18nManager.lang(MonthCardI18nKeys.remainDays, remianDays)
        } else {
            this.view.getController('c1').selectedIndex = 0
            if (this._cardData.cfg.activeChargeMoney) {
                //累充
                let money = 0;
                if (this._cardData.itemVo) {
                    money = this._cardData.itemVo.chargeMoney
                }
                if (money >= this._cardData.cfg.activeChargeMoney) {
                    this.view.btnBuy.title = G.I18nManager.lang(MonthCardI18nKeys.act)
                }
                else
                    this.view.btnBuy.title = G.I18nManager.lang(MonthCardI18nKeys.leichong, money / 100, this._cardData.cfg.activeChargeMoney / 100)
                FguiScriptUtils.toMyScriptClass(this.view.btnBuy.redDot, RedDotCom).reset(RedDotKeys.MonthCard_act)
            }
            else {
                this.view.btnBuy.title = G.I18nManager.lang(MonthCardI18nKeys.price, this._cardData.orderCfg.price / 100)
            }
        }

        const dailyRewards = this._cardData.cfg.dailyRewards
        if (dailyRewards.length > 0) {
            let firstDailyReward = dailyRewards[0]
            if (firstDailyReward) {
                let itemCfg = G.TableManager.getDataById(table.item.ItemConfig, firstDailyReward.k)
                if (itemCfg) {
                    this.view.iconReward.icon = itemCfg.iconPath
                    this.view.lbCount.text = 'x' + firstDailyReward.v
                } else {
                    this.view.iconReward.icon = '';
                    this.view.lbCount.text = '';
                }
            }


            let firstDailyReward2 = dailyRewards[1]
            if (firstDailyReward2) {
                let itemCfg2 = G.TableManager.getDataById(table.item.ItemConfig, firstDailyReward2.k)
                if (itemCfg2) {
                    this.view.iconReward2.icon = itemCfg2.iconPath
                    this.view.lbCount2.text = 'x' + firstDailyReward2.v
                } else {
                    this.view.iconReward2.icon = '';
                    this.view.lbCount2.text = '';
                }
            }
        }

        if (this._cardData.cfg.discountShow > 0) {
            this.view.pDiscount.visible = true
            this.view.pDiscount.lbTitle.text = G.I18nManager.lang(MonthCardI18nKeys.discount)
            this.view.pDiscount.lbDiscount.text = this._cardData.cfg.discountShow + '%'
        } else {
            this.view.pDiscount.visible = false
        }

        // const aCostIds = MonthCardModel.ins().aCostIds;
        // if (aCostIds?.length > 0) {
        //     const itemId = aCostIds[0];
        //     const num = BackpackManager.ins().getItemCountByItemId(itemId);
        //     FguiScriptUtils.toMyScriptClass(this.view.useItem, ItemFrameBtn).reset(itemId, num);
        // }
        FguiScriptUtils.toMyScriptClass(this.view.btnDraw.redDot, RedDotCom).reset(RedDotKeys.MonthCard_dayReward, [this._cardData.id])
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
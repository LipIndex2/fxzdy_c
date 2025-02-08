import { BaseController } from "db://assets/scripts/core/mvc/controller/BaseController";
import G from "../../../core/comm/G";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import NotificationKey from "../../event/NotificationKey";
import { RedDotKeys } from "../common/redDot/RedDotKeys";
import { RedDotManager } from "../common/redDot/RedDotManager";
import { ConditionUtils } from "../condition/ConditionUtils";
import { DailySaleModel } from "../dailySale/model/DailySaleModel";
import { DailySaleItem } from "../dailySale/view/item/DailySaleItem";
import { DailySalePackItem } from "../dailySale/view/item/DailySalePackItem";
import { FloatingTextManager } from "../floatingText/FloatingTextManager";
import { MallModel } from "../mall/model/MallModel";
import { ModuleOpenManager } from "../moduleopen/ModuleOpenManager";
import { UIChargeConfig } from "./const/UIChargeConfig";
import { ChargeLimitIconItem } from "./item/ChargeLimitIconItem";
import { ChargeLimitItem } from "./item/ChargeLimitItem";
import { ChargeLimitPageItem } from "./item/ChargeLimitPageItem";
import { ChargeNormalItem } from "./item/ChargeNormalItem";
import { ChargeNormalRowItem } from "./item/ChargeNormalRowItem";
import { ChargeI18nKeys } from "./const/ChargeI18nKeys";
import { ChargeLimitItem2 } from "./item/ChargeLimitItem2";
import GIns from "../../GIns";


export class ChargeController extends BaseController {

    protected _openKeys: number[] = []
    protected _showLimitBuyTypes: number[] = []

    listenNotifications(): string[] {
        return [
            // 解锁 tabItem 用
            ...ConditionUtils.getUnlockEventNameArray(),
            NotificationKey.MALL_DATA_INIT_COMPLETE,
            NotificationKey.MALL_DATA_CHANGE_BY_TYPE,
            NotificationKey.MALL_DATA_CHANGE_BY_ID,
            NotificationKey.DAILY_SALE_CHANGE,
        ];
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.MALL_DATA_INIT_COMPLETE:
            case NotificationKey.MALL_DATA_CHANGE_BY_TYPE:
            case NotificationKey.MALL_DATA_CHANGE_BY_ID:
                this.checkLimitRedDot()
                break
            case NotificationKey.DAILY_SALE_CHANGE:
                this.checkDailySaleRedDot()
                break
        }
        const ok = ConditionUtils.isNeedHandleForUnlock(event)
        if (ok) {
            this.checkAllRedDot();
        }
    }

    constructor() {
        super();
    }

    public get openKeys(): number[] {
        if (this._openKeys.length <= 0) {
            this._openKeys = [
                ServerEnums.SystemType.NORMAL_CHARGE,
                ServerEnums.SystemType.MALL_VIP,
                ServerEnums.SystemType.MALL_LIMIT_BUY,
                ServerEnums.SystemType.DAILY_SALE
            ]
        }
        return this._openKeys
    }

    /**限购商城展示的购买类型*/
    public get showLimitBuyTypes(): number[] {
        if (this._showLimitBuyTypes.length <= 0) {
            this._showLimitBuyTypes = [
                ServerEnums.MallGoodsLimitBuyType.MONTHLY,
                ServerEnums.MallGoodsLimitBuyType.DOUBLE_WEEKLY,
                ServerEnums.MallGoodsLimitBuyType.WEEKLY,
                ServerEnums.MallGoodsLimitBuyType.NEVER
            ]
        }
        return this._showLimitBuyTypes
    }

    protected checkAllRedDot(): void {
        this.checkLimitRedDot()
        this.checkDailySaleRedDot()
    }

    protected checkLimitRedDot(): void {
        let hasFreeLimit = false
        let isOpen: boolean = ModuleOpenManager.ins().isCanOpenModule(ServerEnums.SystemType.MALL_LIMIT_BUY, false)
        if (isOpen) {
            hasFreeLimit = MallModel.ins().hasFreeMall(ServerEnums.MallGoodsType.LIMIT_BUY, this.showLimitBuyTypes)
        }
        RedDotManager.ins().setRedDot(RedDotKeys.Charge_limit, hasFreeLimit);
    }

    protected checkDailySaleRedDot(): void {
        let groupId = DailySaleModel.ins().curGroupId
        let groupData = DailySaleModel.ins().getGroupCfgData(groupId)
        let hasBuyPack = DailySaleModel.ins().hasBuyPackGift(groupId)
        if (groupData) {
            if (DailySaleModel.ins().hasDrewFreeGift(groupData.freeCfg?.cfg?.id) || hasBuyPack){ // 打包礼包已经包含免费奖励
                RedDotManager.ins().setRedDot(RedDotKeys.Charge_dailySale_free, false)
            } else {
                RedDotManager.ins().setRedDot(RedDotKeys.Charge_dailySale_free, true)
            }
        }
    }

    onInit(): void {
        G.FGUIManager.bindScript("ui://charge/ChargeNormalItem", ChargeNormalItem)
        G.FGUIManager.bindScript("ui://charge/ChargeNormalRowItem", ChargeNormalRowItem)
        G.FGUIManager.bindScript("ui://charge/ChargeLimitIconItem", ChargeLimitIconItem)
        G.FGUIManager.bindScript("ui://charge/ChargeLimitItem", ChargeLimitItem)
        G.FGUIManager.bindScript("ui://charge/ChargeLimitItem2", ChargeLimitItem2)
        G.FGUIManager.bindScript("ui://charge/ChargeLimitPageItem", ChargeLimitPageItem)
        G.FGUIManager.bindScript("ui://dailySale/DailySaleItem", DailySaleItem)
        G.FGUIManager.bindScript("ui://dailySale/DailySalePackItem", DailySalePackItem)

        this.initRedDot()
    }

    protected initRedDot(): void {
    }

    public getLimitChargeTitleText(limitBuyType: number): string {
        let tilteStr: string = ''
        switch (limitBuyType) {
            case ServerEnums.MallGoodsLimitBuyType.DAILY:
                tilteStr = G.I18nManager.lang(ChargeI18nKeys.limitDaily)
                break
            case ServerEnums.MallGoodsLimitBuyType.WEEKLY:
                tilteStr = G.I18nManager.lang(ChargeI18nKeys.limitWeekly)
                break
            case ServerEnums.MallGoodsLimitBuyType.DOUBLE_WEEKLY:
                tilteStr = G.I18nManager.lang(ChargeI18nKeys.limitDoubleWeekly)
                break
            case ServerEnums.MallGoodsLimitBuyType.MONTHLY:
                tilteStr = G.I18nManager.lang(ChargeI18nKeys.limitMonthly)
                break
            case ServerEnums.MallGoodsLimitBuyType.NEVER:
                tilteStr = G.I18nManager.lang(ChargeI18nKeys.limitNever)
                break
        }
        return tilteStr
    }

    public openChargeMainView(args?: any): void {
        let page: number = 0
        if (args?.page) {
            page = args.page
        }
        if (page >= 0 && page < this.openKeys.length) {
            let openKey = this.openKeys[page]
            let unLock = ModuleOpenManager.ins().isCanOpenModule(openKey, false);
            if (unLock == false) {//未解锁
                let lockDesc = ModuleOpenManager.ins().getModuleLockTips(openKey)
                if (lockDesc) {
                    GIns.floatingTextMgr.showTips(lockDesc);
                }
                return
            }
            G.UIManager.open(UIChargeConfig.CHARGE_MAIN_VIEW, args)
        }
    }

    public getChargeTabNum(): number {
        let tabNum = 0
        this.openKeys.forEach((openKey) => {
            let unLock = ModuleOpenManager.ins().isCanOpenModule(openKey, false);
            if (unLock) {
                tabNum++
            }
        })
        return tabNum
    }
}

ChargeController.ins().doInit();
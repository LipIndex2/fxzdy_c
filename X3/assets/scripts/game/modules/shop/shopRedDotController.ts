import G from "../../../core/comm/G";
import { BaseController } from "../../../core/mvc/controller/BaseController";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import { EnumTabItemNameForClient } from "../../ui/main/const/EnumTabItemNameForClient";
import { RedDotKeys } from "../common/redDot/RedDotKeys";
import { ConditionUtils } from "../condition/ConditionUtils";
import { ShopType } from "./const/UIShopConst";
import { ShopManager } from "./shopManager";

export class ShopRedDotController extends BaseController {
    protected _isShopOpen: boolean = false
    protected _shopEnterCfg: table.mainpage.MainPageTabItemConfig = null
    constructor() {
        super();
    }
    onInit(): void {
        // fgui.UIObjectFactory.setExtension("ui://account/ComAccount", AccountHistoryCom);
    }
    listenNotifications(): string[] {
        return [
            // 解锁 tabItem 用
            ...ConditionUtils.getUnlockEventNameArray(),
            NotificationKey.EVENT_SHOP_INFO_RESP];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.EVENT_SHOP_INFO_RESP:
                this.checkShopTabRed();
                break;
        }
        const ok = ConditionUtils.isNeedHandleForUnlock(event);
        if (ok) {
            if (this._isShopOpen == false) {
                this.checkShopTabRed();
            }
        }
    }

    checkShopTabRed(): void {
        if (this._shopEnterCfg == null) {
            let allCfgs = G.TableManager.getAllData(table.mainpage.MainPageTabItemConfig);
            this._shopEnterCfg = allCfgs.find(value => value.nameForClient == EnumTabItemNameForClient.SHOP);
        }
        if (this._isShopOpen == false) {
            let isShowEnter:boolean = true;
            if (this._shopEnterCfg) {
                isShowEnter = GIns.conditionMgr.checkCondition(this._shopEnterCfg.conditionText);
            }
            let isOpen:boolean = GIns.moduleOpenMgr.isCanOpenModule(ServerEnums.SystemType.SHOP, false);
            this._isShopOpen = isShowEnter && isOpen;
        }
        if (this._isShopOpen == false) {
            return;
        }
        //所有商店都检查是否有免费的商品
        ShopManager.ins().shopDatas?.forEach(vo => {
            let typeHasFree: boolean = false;
            let showGoods = vo.getShowGoods();
            showGoods?.forEach((goodsVo) => {
                let isFree: boolean = false
                if (goodsVo._config.costItems == null || goodsVo._config.costItems.length <= 0) {
                    isFree = goodsVo.buyTimes < goodsVo._config.buyTimesLimit;
                }
                if (isFree) {
                    typeHasFree = isFree
                }
                GIns.redDotMgr.setRedDot(RedDotKeys.Shop_item, isFree, [vo._config.id, goodsVo.goodsId])
            })
            if (vo._config.id == ShopType.LEAGUE) {
                GIns.redDotMgr.setRedDot(RedDotKeys.League_shop, typeHasFree)
            }
        });
    }
}

ShopRedDotController.ins().doInit();
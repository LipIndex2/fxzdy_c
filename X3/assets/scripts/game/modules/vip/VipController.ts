import { BaseController } from "db://assets/scripts/core/mvc/controller/BaseController";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import NotificationKey from "../../event/NotificationKey";
import { RedDotKeys } from "../common/redDot/RedDotKeys";
import { RedDotManager } from "../common/redDot/RedDotManager";
import { ConditionManager } from "../condition/ConditionManager";
import { ConditionUtils } from "../condition/ConditionUtils";
import { MallModel } from "../mall/model/MallModel";
import G from "../../../core/comm/G";
import { VipAdditionItem } from "./view/page/VipAdditionItem";
import { VipGoodsItem } from "./view/page/VipGoodsItem";

export class VipController extends BaseController {

    listenNotifications(): string[] {
        return [
            // 解锁 tabItem 用
            ...ConditionUtils.getUnlockEventNameArray(),
            NotificationKey.MALL_DATA_INIT_COMPLETE,
            NotificationKey.MALL_DATA_CHANGE_BY_TYPE,
            NotificationKey.MALL_DATA_CHANGE_BY_ID,
            NotificationKey.VIP_LV_CHANGE,
        ];
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.MALL_DATA_INIT_COMPLETE:
            case NotificationKey.MALL_DATA_CHANGE_BY_TYPE:
            case NotificationKey.MALL_DATA_CHANGE_BY_ID:
            case NotificationKey.VIP_LV_CHANGE:
                this.checkVipRedDot()
                break
        }
        const ok = ConditionUtils.isNeedHandleForUnlock(event)
        if (ok) {
            this.checkVipRedDot();
        }
    }

    constructor() {
        super();
    }

    protected checkVipRedDot(): void {
        let hasFree: boolean = false
        let mallDatas = MallModel.ins().getMallListByType(ServerEnums.MallGoodsType.VIP)
        for (let i = 0; i < mallDatas.length; i++) {
            if (mallDatas[i].costCfg) {
                let hasMall = MallModel.ins().isSellOut(mallDatas[i]) == false && ConditionManager.ins().checkCondition(mallDatas[i].cfg.buyConditions)
                if (mallDatas[i].costCfg.costItems == null) {
                    hasFree = hasMall || hasFree
                } else {
                    RedDotManager.ins().setRedDot(RedDotKeys.Charge_vip_item, hasMall, [mallDatas[i].id])
                }
            }
        }
        RedDotManager.ins().setRedDot(RedDotKeys.Charge_vip_free, hasFree)
    }

    onInit(): void {
        G.FGUIManager.bindScript("ui://vip/VipAdditionItem", VipAdditionItem)
        G.FGUIManager.bindScript("ui://vip/VipGoodsItem", VipGoodsItem)
        this.initRedDot()
    }

    protected initRedDot(): void {
    }
}

VipController.ins().doInit();
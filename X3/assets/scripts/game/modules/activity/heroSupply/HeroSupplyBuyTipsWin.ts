import { bindScript } from "db://assets/scripts/core/comm/UIScriptManager";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { ActivityHeroSupplyModelVo } from "db://assets/scripts/game/modules/activity/model/ActivityHeroSupplyModelVo";
import { ActivityModel } from "db://assets/scripts/game/comm/activity/model/ActivityModel";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { Logger } from "db://assets/scripts/core/log/Logger";
import { UIActivityKey } from "db://assets/scripts/game/modules/activity/const/UIActivityConfig";
import {
    HeroSupplyConfigManager
} from "db://assets/scripts/game/modules/activity/heroSupply/config/HeroSupplyConfigManager";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { ItemListComp2 } from "db://assets/scripts/game/modules/common/item/ItemListComp2";
import { OrderModel } from "db://assets/scripts/game/modules/order/OrderModule";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { ChargeConfigManager } from "db://assets/scripts/game/modules/charge/config/ChargeConfigManager";


@bindScript(UIActivityKey.HeroSupplyBuyTipsWin)
export class HeroSupplyBuyTipsWin extends UICommWin {

    static pkgName: string = "heroSupply";
    static viewName: string = "HeroSupplyBuyTipsWin";

    private _vo: ActivityHeroSupplyModelVo;
    private _configs: any;
    private _allRewardItems: NoOwnerItem[] = [];
    private _canGainItems: NoOwnerItem[] = [];

    get view(): ui.heroSupply.HeroSupplyBuyTipsWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.CLOSE_ViEW,
            NotificationKey.EVENT_RECEIVE_SERVER_ITEM_CHANGE,
            NotificationKey.SEVEN_DAY_TASK_UPDATE,
            NotificationKey.SEVEN_DAY_TASK_CHOOSE_DAY,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.CLOSE_ViEW:
            case NotificationKey.EVENT_RECEIVE_SERVER_ITEM_CHANGE:
            case NotificationKey.SEVEN_DAY_TASK_UPDATE: {
                this.reset();
                break;
            }
        }
    }


    protected onInit() {
        FacadeManager.ins().registerNotification(this);

        const vo: ActivityHeroSupplyModelVo = ActivityModel.ins().getActivityVoByType(ServerEnums.ActivityType.HERO_SUPPLY) as ActivityHeroSupplyModelVo;
        if (!vo) {
            return;
        }
        this._vo = vo;


        this.view.btnBuy.onClick(this.onClickBuy, this);

    }

    onOpen() {
        this.reset();
    }

    onClickBuy() {
        if (!this._vo) {
            return;
        }
        const activityId = this._vo.activityId;

        // 支付
        const chargeId = HeroSupplyConfigManager.getChargeIdByActivityId(activityId);

        OrderModel.ins().sendCreateOrder(chargeId);

        this.closeSelf();
    }

    protected onClose() {
        GameTimer.ins().clearAll(this);
        FacadeManager.ins().removeNotification(this);

        super.onPreDispose();
    }

    private reset() {
        const vo: ActivityHeroSupplyModelVo = ActivityModel.ins().getActivityVoByType(ServerEnums.ActivityType.HERO_SUPPLY) as ActivityHeroSupplyModelVo;
        if (!vo) {
            return;
        }
        this._vo = vo;
        const activityId = vo.activityId;

        // RMB
        const chargeId = HeroSupplyConfigManager.getChargeIdByActivityId(activityId);
        const rmb = ChargeConfigManager.getRMBByChargeId(chargeId)
        this.view.btnBuy.title = `${rmb}元`;
        
        // rewards
        const allRewardItemArray = vo.getAllRewardItemArray();
        const canGainItems = vo.getCanGainItems();
        
        this._allRewardItems = ItemUtils.mergeItemArray(allRewardItemArray);
        this._canGainItems = ItemUtils.mergeItemArray(canGainItems);

        // config
        this._configs = HeroSupplyConfigManager.getRewardConfigArrayByActivityId(activityId);

        // 能领取的奖励
        FguiScriptUtils.toMyScriptClass(this.view.itemList1, ItemListComp2)
            .reset(this._canGainItems);
        // 所有奖励
        FguiScriptUtils.toMyScriptClass(this.view.itemList2, ItemListComp2)
            .reset(this._allRewardItems);


    }

}
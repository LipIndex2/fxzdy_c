import { ICondition } from "db://assets/scripts/game/modules/condition/ICondition";
import { EnumConditionType } from "db://assets/scripts/game/modules/condition/enum/EnumConditionType";
import GIns from "../../../GIns";
import { BaseActivityVo } from "../../../comm/activity/model/BaseActivityVo";
import NotificationKey from "../../../event/NotificationKey";
import { ActivityController } from "../../activity/ActivityController";

/**
 * 活动中有商品可购买 ?
 * ACTIVITY_IS_OVER,${活动id},0
 */
export class ConditionActivityHasGoodsBuy extends ICondition {

    protected _param: string
    private _activityId: number = 0;

    public listenNotifications: string[] = [
        NotificationKey.ACTIVITY_UPDATE,
        NotificationKey.ACTIVITY_REQUEST_BACK,
        NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK,
    ];

    type(): EnumConditionType {
        return EnumConditionType.ACTIVITY_HAS_GOODS_BUY;
    }

    param(): string {
        return this._param
    }

    value(): number {
        return this._activityId
    }


    initParams(params: string, targetCount: number): void {
        this._param = params
        this._activityId = params.toInt();
    }

    check(): boolean {
        // 活动开启
        let isUnlock = ActivityController.ins().isActivityUnlock(this._activityId);
        if (isUnlock) {
            let vo = GIns.activityModel.getActivityVoById(this._activityId) as BaseActivityVo;
            if (vo.hasGoodsCanBuy()) {
                return true;
            }
        }
        return false;
    }

    getErrorTipsArgs(): (string | number)[] {
        return [];
    }

}
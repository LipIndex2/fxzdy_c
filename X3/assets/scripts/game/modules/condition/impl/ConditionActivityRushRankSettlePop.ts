import { ICondition } from "db://assets/scripts/game/modules/condition/ICondition";
import { EnumConditionType } from "db://assets/scripts/game/modules/condition/enum/EnumConditionType";
import GIns from "../../../GIns";
import { ActivityRushRankVo } from "../../activity/model/ActivityRushRankVo";

/**
 * 冲榜活动是否弹出过结算
 * ACTIVITY_RUSH_RANK_SETTLE_POP_STATE,${活动id},0
 */
export class ConditionActivityRushRankSettlePop extends ICondition {

    protected _state: number = 0;
    private _activityId: number = 0;

    public listenNotifications: string[] = [
    ];

    type(): EnumConditionType {
        return EnumConditionType.ACTIVITY_RUSH_RANK_SETTLE_POP;
    }

    param(): string {
        return this._activityId.toString();
    }

    value(): number {
        return this._state;
    }


    initParams(params: string, targetCount: number): void {
        this._activityId = params.toInt();
        this._state = targetCount;
    }

    check(): boolean {
        let vo = GIns.activityModel.getActivityVoById(this._activityId) as ActivityRushRankVo;
        if (!vo) {
            //活动不存在
            return false;
        }
        let settleRound = vo.getCurSettleRound();
        if (settleRound <= 0) {
            //没有上一轮
            return false;
        }
        let isPop: boolean = GIns.activityAutoPopMgr.hasSettleHistory(this._activityId, vo.period, settleRound);
        return (isPop && this._state == 1) || (!isPop && this._state == 0);
    }

    getErrorTipsArgs(): (string | number)[] {
        return [];
    }

}
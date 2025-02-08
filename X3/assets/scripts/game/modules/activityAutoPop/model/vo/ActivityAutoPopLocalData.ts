/**活动弹框每日本地数据记录*/
export class ActivityAutoPopTodayLocalData {
    /**今日0点时间*/
    todayZeroTime: number = 0;
    /**今日已经弹过弹框id列表*/
    popIds: number[] = [];
    /**今日不在弹框banner列表*/
    noPopTodayKeys: string[] = [];
}

/**活动结算弹框历史记录*/
export class ActivityAutoPopSettleHistoryLocalData {
    /**活动id*/
    activityId: number = 0;
    /**循环周期 来自ActivityVo 活动可能重复开放防止记录错误*/
    period: number = 0;
    /**当前是第几轮*/
    round: number = 0;
    /**弹框当天的0点时间*/
    popZeroTime: number;
}

/**活动弹框本地记录*/
export class ActivityAutoPopLocalData {
    /**今日本地数据*/
    todayData: ActivityAutoPopTodayLocalData = new ActivityAutoPopTodayLocalData();
    /**活动结算弹框记录 目前只支持冲榜活动*/
    settleHistorys: { [activityId: number]: ActivityAutoPopSettleHistoryLocalData } = {};
}
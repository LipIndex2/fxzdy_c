/**活动自动弹框触发事件*/
export enum ActivityAutoPopEvent {
    /**登录时*/
    LOGIN = 1,
    /**活动开启 (登录时没开启 在线过程中开启才触发)*/
    ACTIVITY_OPEN,
    /**活动结算*/
    ACTIVITY_SETTLE,
    /**地图副本战斗胜利*/
    MAP_BATTLE_WIN,
    /**地图副本战斗失败*/
    MAP_BATTLE_FAIL,
    /**各种玩法战斗胜利*/
    BATTLE_WIN,
    /**各种玩法战斗失败*/
    BATTLE_FAIL,
    /**队伍死亡返回主城*/
    TEAM_DIE_BACK
}
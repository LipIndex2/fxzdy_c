/**活动自动弹框时机类型*/
export enum ActivityAutoPopTimeType {
    /**登录之后检测一次*/
    AFTER_LOGIN = 1,
    /**每次登录只触发一次*/
    LOGIN_ONCE = 2,
    /**队伍死亡返回主城*/
    TEAM_DIE_BACK = 3,
    /**战斗胜利*/
    BATTLE_WIN = 4,
    /**战斗失败*/
    BATTLE_FAIL = 5,
}
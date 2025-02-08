import { ServerEnums } from "../../../../libs/extras/ServerEnums";
declare module "../../../../libs/extras/ServerEnums" {
    namespace ServerEnums {
        export enum FightType {
            //---------------------------自定义战斗场景 只是为了与内部FightType类型兼容-------------------------
            /**
             * 勘探探索地图
             * FightType兼容类型 请勿直接使用
             * @deprecated
            */
            LEAGUE_EXPLORE_MAP = -1,
            /**
             * 勘探探索地图
             * FightType兼容类型 请勿直接使用
             * @deprecated
            */
            PET_DUNGEON_MAP = -2,
        }
    }
}
//@ts-ignore
ServerEnums.FightType.LEAGUE_EXPLORE_MAP = -1;
//@ts-ignore
ServerEnums.FightType.PET_DUNGEON_MAP = -2;

/**
 * 战斗类型 | 扩展版
 *
 * 在后端枚举基础上加入 世界类型
 * ps: 在后端基础上增加了新的战斗类型 | 用于临时测试用等清空, 不一定和后端一致
 *
 * 后端的战斗类型
 * @see ServerEnums.FightType
 */

declare global {
    namespace XJ {
        type EFightType = FightType | ServerEnums.FightType
    }
}

export enum FightType {

    //---------------------------自定义战斗场景-------------------------
    /**
     * 勘探探索地图
    */
    LEAGUE_EXPLORE_MAP = -1,
    /**
     * 宠物副本地图
    */
    PET_DUNGEON_MAP = -2,


    //---------------------------后端战斗场景-------------------------
    /**
    * 主线地图(使用默认布阵)
    */
    TRUNK_MAP = 1,
    /**
    * 主线关卡(使用默认布阵)
    */
    TRUNK_INSTANCE = 2,
    /**
    * 每日BOSS(保存自定义布阵)
    */
    DAILY_BOSS = 3,
    /**
    * 地图副本
    */
    MAP_INSTANCE = 4,
    /**
    * 序列校验
    */
    LADDER = 5,
    /**
    * 秘境副本
    */
    SECRET_INSTANCE = 6,
    /**
    * 竞技场
    */
    ARENA = 7,
    /**
    * 世界BOSS
    */
    WORLD_BOSS = 8,
    /**
    * 测试战斗
    */
    TEST = 9,
    /**
    * 联盟BOSS
    */
    LEAGUE_BOSS = 10,
    /**
    * 好友切磋
    */
    FRIEND = 11,
    /**
   * 守卫母舰
   */
    GUARD_SHIP = 12,
    /**
     * 联盟对决
     */
    LEAGUE_WAR = 13,
    /**
   * 星际工厂占领
   */
    FACTORY = 14,
    /**
    * 组队副本
    */
    TEAM_INSTANCE = 15,
    /**
    * 资源勘探
    */
    LEAGUE_EXPLORE = 16,
    /**
    * 赛季秘境副本
    */
    SEASON_SECRET = 17,
    /**
    * 赛季Boss
    */
    SEASON_BOSS = 18,
    /**
     * 宠物副本
    */
    PET_DUNGEON = 19,

    /**
    * 收藏品玩法
    */
    COLLECTIBLES_DUNGEON = 20,
    /**
      * 试玩
      */
    TRIAL = 21,
    /**
    * 无尽秘境副本
    */
    ENDLESS_SECRET = 22,
}
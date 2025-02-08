import { CollectiblesDungeonConditionVo } from "./CollectiblesDungeonConditionVo";

/**关卡信息*/
export interface ICollectiblesDungeonLevelVo {
    /**关卡id*/
    id: number;
    /**关卡配置列表*/
    cfg: table.collectiblesdungeon.CollectiblesDungeonConfig;
    /**当前星级*/
    curStar: number;
    /**星级条件*/
    conditions: CollectiblesDungeonConditionVo[];
}
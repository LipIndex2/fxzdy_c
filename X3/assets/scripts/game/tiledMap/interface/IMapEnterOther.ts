import { FightType } from "../../comm/battle/enum/FightType";
/**进入其他地图数据*/
export interface IMapEnterOther {
    /**战斗类型*/
    fightType: FightType;
    /**建筑物Id */
    buildingId?: number,
    /**地图id*/
    mapId: number;
    /**传送位置*/
    pos?: { x: number, y: number };
}
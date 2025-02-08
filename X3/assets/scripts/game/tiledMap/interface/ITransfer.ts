import { Vec2 } from "cc";

export interface ITransfer {
    /**传送点 建筑物Id */
    portalID?: number,
    /**地图Id */
    mapId?: number,
    /**多地图id拼接 */
    mapIds?: number[],
    /**指定位置 */
    pos?: { x: number, y: number }
    /**拼接地图下，用 connect_layer 层的 start 点指定起始位置，忽略 pos 参数 */
    useStartObj?: boolean
    /**进入玩法世界后，是否发送 BATTLE_START 消息*/
    emitBattleStar?: boolean
    /***是否离开战斗的方式 */
    isExitBattle?: boolean
    /***是否下一关 */
    isNextLevel?: boolean,
    /**建筑id 代表进入地图后需要传送到建筑上*/
    buildingId?:number
}

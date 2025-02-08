import { Vec2 } from "cc";
import { DirctionType, WorldUnitTeam } from "../enum/BattleEnum";
import { ISummonData } from "../unit/battle/ISummonData";

export interface ICreateMineralData {
    /**对应MapResourceConfig的id */
    resourceId: number,
    /**对应MapMineralConfig的id */
    mineralId: number,
    /**刷新点位置*/
    pos: Vec2,
    /**资源下标 （同一点多个怪）*/
    idxs: Array<number>;
    /***是否已经死亡 */
    isDead: boolean;
}

export interface ICreateMonsterData {
    /**对应MapResourceConfig的id */
    resourceId: number,
    /**对应MapMonsterConfig的id */
    monsterId: number,
    /**刷新点位置*/
    pos: Vec2,
    /**资源下标 （同一点多个怪）*/
    idxs: Array<number>;
    /*** 未击杀过的资源索引列表 */
    notKilledResourceIdxs;
    /***掉落奖励 */
    drops?: { itemId: number, num: number }[]
    /***召唤物 */
    summon: ISummonData;
    teamId: number;
    /***有值的话，属性全部使用这个 */
    attr?: { [key: number]: number }
    /***方向 */
    dirction?: DirctionType;
    /***是否不统计血量 */
    isNotStatisticsHp: boolean
    /***分裂怪的召唤者 */
    splitMonsterFatherUid: number
}

export interface ICreatePetData {
    petId: string,
    teamId: number;
    /***有值的话，属性全部使用这个 */
    attr?: { [key: number]: number }
}

export interface IResourceParam {
    /**对应MapResourceConfig的id */
    resourceId: number,
    /**资源下标 （同一点多个怪）*/
    resourceIdx: number;
}

/**战斗单位死亡事件 */
export interface IBattleUnitDeadEventData {
    /**单位队伍 */
    teamId: WorldUnitTeam;
    /**英雄id （有则是英雄） */
    heroId?: number;
    /**怪物id （有则是怪物） */
    monsterId?: number;
}
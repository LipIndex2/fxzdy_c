import { Vec2 } from "cc";
import { BattleUnit } from "../unit/battle/BattleUnit";

export interface ITarget {
    /**检索位置 */
    readonly pos: Vec2;
    /***当前的实体类型 */
    get unit(): BattleUnit;
    /**所属队伍Id */
    teamId: number;
    /**受击点 */
    get hurtPoint(): { x: number, y: number };
    uid: number;
}
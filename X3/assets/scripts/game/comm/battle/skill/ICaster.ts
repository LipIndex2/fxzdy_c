import { Vec2 } from "cc";
import { FightType } from "../enum/FightType";
import { BattleLogic } from "../BattleLogic";
import { BattleUnit } from "../unit/battle/BattleUnit";

export interface ICaster {
    /**所属队伍Id */
    readonly teamId: number
    /**施法者Id */
    readonly casterUid: number;
    /**攻击力 */
    readonly atk: number;
    /**发射攻击的位置 */
    readonly atkPoint: { x: number, y: number };
    /**检索位置 */
    readonly pos: Vec2;
    /**当前玩法类型 */
    readonly fightType: FightType;
    /**当前战斗逻辑 */
    readonly battleLogic: BattleLogic;
    /***是否在场景中存在 */
    inScene(): boolean;
    readonly caster: BattleUnit;
}
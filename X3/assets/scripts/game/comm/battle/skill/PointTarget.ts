import { Vec2 } from "cc";
import { BattleUnit } from "../unit/battle/BattleUnit";
import { ITarget } from "./ITarget";
import { BattleLogic } from "../BattleLogic";

export class PointTarget implements ITarget {

    /**所属队伍Id */
    teamId: number;
    private _pos: Vec2;

    uid: number;
    public battleLogic: BattleLogic;

    public angle: number = null

    /***是否一定要走到点的附近 */
    public isMoveToPoint: boolean = false;

    public constructor (battleLogic: BattleLogic) {
        this.battleLogic = battleLogic;
    }

    /***当前的实体类型 */
    get unit(): BattleUnit {
        return null;
    }

    public setPoint(x: number, y: number): void {
        this._pos = new Vec2(x, y)
    }

    get pos(): Vec2 {
        return this._pos;
    }

    /**受击点 */
    get hurtPoint() {
        return this._pos;
    }
}
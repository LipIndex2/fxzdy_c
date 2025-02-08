import { v2, Vec2 } from "cc";
import { IPool } from "../../../../core/pool/IPoolInstance";
import { TableManager } from "../../../../core/table/TableManager";
import { IPosition } from "../../../comm/math/ICollision";
import { ConditionManager } from "../../../modules/condition/ConditionManager";

/**非实体 仅用于数据刷新 */
export default class ResourcePoint implements IPool, IPosition {

    /**表ID @see table.map.MapResourceConfig.id*/
    protected _id: number;

    /**位置 */
    protected _pos: Vec2 = v2();

    /**下次可刷新的时间 0表示不需要刷新 */
    protected _nextRefreshTime = 0;

    /**是否已经与后端同步 */
    protected _isLoaded = false;

    get id() {
        return this._id;
    }

    set id(id: number) {
        this._id = id;
    }

    get pos(): Vec2 {
        return this._pos;
    }

    get isLoaded() {
        return this._isLoaded;
    }

    set refreshTime(time: number) {
        this._isLoaded = true;
        this._nextRefreshTime = time;
    }

    get refreshTime() {
        return this._nextRefreshTime;
    }

    /**是否未解锁 */
    get isLock() {
        return false;
    }

    setPosXY(x: number, y: number) {
        this._pos.set(x, y);
    }

    /**回池清理 */
    onRecovery() {
        this._id = null;
        this.resetState();
    }

    /**重置状态 */
    resetState() {
        this._isLoaded = false;
        this._nextRefreshTime = 0;
    }
}
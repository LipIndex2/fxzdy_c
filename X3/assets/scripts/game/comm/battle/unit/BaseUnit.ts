import { v2 } from "cc";
import { UnitType } from "../enum/BattleEnum";
import { IPool } from "../../../../core/pool/IPoolInstance";
import { IPosition } from "../../math/ICollision";
import { BattleCommandType } from "../BattleCommand";
import { BattleLogic } from "../BattleLogic";
import { FightType } from "../enum/FightType";

export class BaseUnit implements IPool, IPosition {
    /**单元类型
     * @see UnitType */
    protected _type: UnitType = UnitType.Unknow;

    /**单元Id */
    protected _uid: number;

    /**资源Id （仅资源单位有， 矿 气 怪物）*/
    public resId: string;

    protected _dirty;

    /**位置 */
    protected _pos = v2();

    protected _width;
    protected _height;

    protected _needDispose = false;

    public isDisposed = false;
    public battleLogic: BattleLogic;
    public fightType: FightType
    public isVisible: boolean = true;



    constructor () {
        // this._uid = StateMemory.createUid();
    }

    public setBattleLogic(battleLogic: BattleLogic): void {
        this.battleLogic = battleLogic;
        this.fightType = battleLogic.fightType;
    }

    get type() {
        return this._type;
    }

    get uid() {
        return this._uid;
    }

    set uid(uid: number) {
        this._uid = uid;
    }

    get pos() {
        return this._pos;
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

    get isDirty() {
        return this._dirty;
    }

    /**是否活跃单位 */
    get isActive() {
        return true;
    }

    init(...arg: any) {

    }

    setPosXY(x: number, y: number) {
        this._pos.set(x, y);
    }

    update(): boolean {
        this._dirty = false;
        return true
    }

    /**复活 （不是所有单位都需要）*/
    resurgence() {
        this._needDispose = false;
    }

    /**回池清理 */
    onRecovery() {
        this._uid = null;
    }

    /**是否需要被销毁 */
    get isNeedDispose() {
        return this._needDispose;
    }

    /**需要被销毁 */
    needDispose() {
        if (!this._needDispose) {
            this._needDispose = true;
            this.battleLogic.unitProcessor?.disposeUnit(this); //销毁自己
        }
    }

    /***是否可以选择 */
    canSelect(): boolean {
        return true
    }

    /**销毁 */
    dispose() {
        this.isDisposed = true;
        this.battleLogic.command.send(BattleCommandType.dispose, this.uid)
    }
}
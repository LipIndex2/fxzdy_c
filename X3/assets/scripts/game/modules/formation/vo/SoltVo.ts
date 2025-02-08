/**槽位Vo */
export class SoltVo {
    /**阵位Id */
    private _level:number;
    private _stage:number;
    /** 设置槽位数据 */
    public setSoltVoData(vo: Vo.formation.SlotVo) {
        if (!vo) return;
        this._level = vo.level;
        this._stage = vo.stage;
    }

    /** 槽位等级 */
    get level() {
        return this._level || 0;
    }

    /** 槽位等阶 */
    get stage() {
        return this._stage || 0;
    }

    /** 是否解锁 (等级大于0) */
    get isUnlock() {
        return this.level > 0;
    }
}
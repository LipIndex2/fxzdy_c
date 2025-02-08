import ArrayUtils from "../../../../core/utils/ArrayUtils";
import { ConditionManager } from "../../../modules/condition/ConditionManager";
import ResourcePoint from "./ResourcePoint";

/**主线地图 非实体 仅用于数据刷新 */
export default class TrunkMapResourcePoint extends ResourcePoint {

    /**配置 MapResourceConfig */
    protected _cfg: table.map.MapResourceConfig;

    /**已刷且存活的下标 */
    protected _survivalIdxs: number[];

    get cfg() {
        return this._cfg;
    }

    set cfg(cfg) {
        this._cfg = cfg;
    }

    /**是否未解锁 */
    get isLock() {
        return this._cfg.isGuide || !ConditionManager.ins().checkCondition(this._cfg.refreshVerify); //引导怪 由引导来刷新
    }

    setPosXY(x: number, y: number) {
        this._pos.set(x, y);
    }

    get survivalIdxs() {
        return this._survivalIdxs;
    }

    setSurvivalIdxs(idxs: number[]) {
        if (!this._survivalIdxs) {
            this._survivalIdxs = idxs;
        } else {
            ArrayUtils.combineArraysNoRepeated(this._survivalIdxs, idxs);
        }
    }

    removeResoucresIdx(deadResourceIdx: number) {
        if (!this._survivalIdxs) return;

        let idx = this._survivalIdxs?.indexOf(deadResourceIdx);
        if (idx >= 0) {
            this._survivalIdxs.splice(idx, 1);
        }
    }

    /**回池清理 */
    onRecovery() {
        super.onRecovery();
        this._cfg = null;
    }

    resetState(): void {
        super.resetState();
        this._survivalIdxs = null;
    }
}
import BaseSingleton from "../../../core/base/BaseSingleton";
import G from "../../../core/comm/G";
import { TableManager } from "../../../core/table/TableManager";
import GIns from "../../GIns";
import { ConditionManager } from "../condition/ConditionManager";
import { MagicCubeController } from "./MagicCubeController";
import { MagicCubeVo } from "./MagicCubeVo";

/** 魔方管理类 */
export class MagicCubeManager extends BaseSingleton {
    /** 所有魔方数据 */
    private _allMagicCubeVo: MagicCubeVo[] = [];
    /** 所有魔方数据，按照heroId存储 */
    private _allMagicCubeVoByID: { [heroId: number]: MagicCubeVo } = {};

    /** 是否锁定当前属性 */
    private _isLock: boolean = false;

    constructor() {
        super();
    }

    public initData(vos: Vo.magiccube.MagicCubeVo[]) {

        for (let vo of vos) {
            let magicCubeVo = new MagicCubeVo();
            magicCubeVo.setData(vo);
            this._allMagicCubeVo.push(magicCubeVo);
            this._allMagicCubeVoByID[vo.id] = magicCubeVo;
        }

        G.GameTimer.once(1000, this, () => {
            MagicCubeController.ins().refreshRedDot();
        });
    }

    /** 是否锁定当前属性 */
    set isLock(isLock: boolean) {
        this._isLock = isLock;
    }
    get isLock() {
        return this._isLock;
    }

    /** 获取所有魔方数据 */
    public getAllMagicCubeVo(): MagicCubeVo[] {
        return this._allMagicCubeVo;
    }

    /** 获取对应英雄id的魔方数据 */
    public getMagicCubeVoByHeroId(heroId: number): MagicCubeVo {
        if (this._allMagicCubeVoByID[heroId]) {
            return this._allMagicCubeVoByID[heroId];
        }
        return null;
    }

    /** 设置对应英雄id的魔方数据 */
    public setMagicCubeVoByHeroId(heroId: number, Vo: Vo.magiccube.MagicCubeVo) {
        let magicCubeVo = new MagicCubeVo();
        magicCubeVo.setData(Vo);
        this._allMagicCubeVoByID[heroId] = magicCubeVo;
    }

    private _conditions: Array<Array<any>>;
    /** 是否可以解锁魔方 */
    public isCanUnlock() {
        if (!this._conditions) {
            let constantCfg = TableManager.getDataById(table.magiccube.MagicCubeConstantConfig, "MAGICCUBE_OPEN_VERIFY");
            if (!constantCfg) return true;
            this._conditions = ConditionManager.ins().parseConditionStr(constantCfg.content);
        }

        if (GIns.conditionMgr.checkCondition(this._conditions)) return true;
        return false;
    }
}

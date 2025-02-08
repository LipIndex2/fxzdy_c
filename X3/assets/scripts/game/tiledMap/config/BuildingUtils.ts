import { TableManager } from "../../../core/table/TableManager";
import { ConditionManager } from "../../modules/condition/ConditionManager";

/**建筑工具 */
export class BuildingUtils {
    /**是否可见 */
    static isVisible(cfg: table.map.MapBuildingConfig) {
        return !cfg.showVerify || ConditionManager.ins().checkCondition(cfg.showVerify);
    }

    /**是否显示解锁条件 */
    static isShowUnlickItem(cfg: table.map.MapBuildingConfig) {
        if (cfg.unlockOpenVerify) {
            //开始显示条件
            return ConditionManager.ins().checkCondition(cfg.unlockOpenVerify);
        }
        if (cfg.unlockCloseVerify) {
            //结束显示条件
            return !ConditionManager.ins().checkCondition(cfg.unlockCloseVerify);
        }
        return true;
    }

    /**是否显示按钮*/
    static isShowBuildingBtn(buildingId: number) {
        let cfg = TableManager.getDataById(table.map.MapBuildingConfig, buildingId);
        if (cfg) {
            if (cfg.btnOpenVerify) {
                //开始显示条件
                return ConditionManager.ins().checkCondition(cfg.btnOpenVerify);
            }
            if (cfg && cfg.btnCloseVerify) {
                //结束显示条件
                return !ConditionManager.ins().checkCondition(cfg.btnCloseVerify);
            }
        }

        return true;
    }
}
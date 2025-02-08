import BaseSingleton from "db://assets/scripts/core/base/BaseSingleton";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import G from "db://assets/scripts/core/comm/G";
import { StringUtils } from "db://assets/scripts/core/utils/StringUtils";
import { ConditionManager } from "db://assets/scripts/game/modules/condition/ConditionManager";
import { EnumUtils } from "db://assets/scripts/core/utils/EnumUtils";
import { FloatingTextManager } from "db://assets/scripts/game/modules/floatingText/FloatingTextManager";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { TimeManager } from "db://assets/scripts/core/time/TimeManager";
import { I18nManager } from "db://assets/scripts/core/i18n/I18nManager";
import { ModuleOpenI18nKeys } from "db://assets/scripts/game/modules/moduleopen/ModuleOpenI18nKeys";
import GIns from "../../GIns";
import { ICondition } from "../condition/ICondition";

/**
 * 模块开启, 管理器
 */
export class ModuleOpenManager extends BaseSingleton {

    private _map: Map<ServerEnums.SystemType, boolean> = new Map<ServerEnums.SystemType, boolean>();

    /**
     * 是否可以开启模块 / 无提示
     * @param moduleId 模块id: number
     */
    isCanOpenModuleWithoutTips(moduleId: ServerEnums.SystemType) {
        return this.isCanOpenModule(moduleId, false);
    }

    /**
     * 是否可以开启模块 by name
     */
    isCanOpenModuleByName(moduleIdStr: string,
        showLockTipsFlag: boolean = true
    ): boolean {
        return this.isCanOpenModule(ServerEnums.SystemType[moduleIdStr], showLockTipsFlag);
    }

    /**
     * 是否可以开启模块
     * @param moduleId 模块id: number
     * @param showLockTipsFlag 是否显示锁定提示
     */
    isCanOpenModule(moduleId: ServerEnums.SystemType,
        showLockTipsFlag: boolean = true
    ): boolean {
        if (!moduleId) {
            return true;
        }

        /**已经开启直接判断完成 */
        if (this._map.has(moduleId)) {
            return true;
        }

        let ret = this._isCanOpenModule(moduleId, showLockTipsFlag);
        if (ret) {
            this._map.set(moduleId, true);
        }
        return ret;
    }


    /**
 * 是否可以开启模块
 * @param moduleId 模块id: number
 * @param showLockTipsFlag 是否显示锁定提示
 */
    // @LogBusiness("[模块开启] 是否可以开启模块")
    public _isCanOpenModule(moduleId: ServerEnums.SystemType,
        showLockTipsFlag: boolean = true
    ): boolean {

        const moduleName: string = EnumUtils.getEnumKeyNameByValue(ServerEnums.SystemType, moduleId);
        let config = G.TableManager.getDataById(table.verify.PlayerSystemOpenConfig, moduleName);
        if (!config) {
            G.Logger.error(`模块开启配置不存在. moduleId = ${moduleId}, moduleName=${moduleName}`)
            return false;
        }

        const needServerOpenDays = config.serverOpenDays;
        if (TimeManager.serverHaveOpenDay < needServerOpenDays) {
            if (showLockTipsFlag) {
                const tips = I18nManager.ins().lang(ModuleOpenI18nKeys.SERVER_OPEN_DAYS, needServerOpenDays - TimeManager.serverHaveOpenDay);
                GIns.floatingTextMgr.showTips(tips);
            }
            return false;
        }

        let verifyModels = config.conditions;
        // 无条件
        if (!verifyModels?.length) {
            return true;
        }

        const isCanSee: boolean = ConditionManager.ins().checkCondition(verifyModels, false, false);
        if (!isCanSee) {
            // 显示锁定提示
            if (showLockTipsFlag) {
                let lockTipStr = ConditionManager.ins().getOpenConditionTips(verifyModels, moduleId)
                GIns.floatingTextMgr.showTips(lockTipStr);
            }
            return false;
        }

        return true;
    }


    // @LogBusiness("[模块开启] 锁定提示")
    getModuleLockTips(moduleId: ServerEnums.SystemType): string | null {
        const moduleName: string = EnumUtils.getEnumKeyNameByValue(ServerEnums.SystemType, moduleId)
        let config = G.TableManager.getDataById(table.verify.PlayerSystemOpenConfig, moduleName);
        if (!config) {
            G.Logger.error(`模块开启配置不存在. moduleId = ${moduleId}, moduleName=${moduleName}`)
            return null;
        }

        const needServerOpenDays = config.serverOpenDays;
        if (TimeManager.serverHaveOpenDay < needServerOpenDays) {
            // 开服天数
            return I18nManager.ins().lang(ModuleOpenI18nKeys.SERVER_OPEN_DAYS, needServerOpenDays - TimeManager.serverHaveOpenDay);
        }

        let verifyModels = config.conditions;
        // 无条件
        if (!verifyModels?.length) {
            return null;
        }

        const isCanSee: boolean = ConditionManager.ins().checkCondition(verifyModels, false);
        if (isCanSee) {
            return null;
        }
        let lockTipStr = ConditionManager.ins().getOpenConditionTips(verifyModels, moduleId)
        return lockTipStr;
    }

    /**获取解锁模块所需要的所有条件*/
    getUnlockConditions(moduleId:ServerEnums.SystemType):ICondition[] {
        const moduleName: string = EnumUtils.getEnumKeyNameByValue(ServerEnums.SystemType, moduleId)
        let config = G.TableManager.getDataById(table.verify.PlayerSystemOpenConfig, moduleName);
        if (!config) {
            G.Logger.error(`模块开启配置不存在. moduleId = ${moduleId}, moduleName=${moduleName}`)
            return null;
        }

        let verifyModels = config.conditions;
        // 无条件
        if (!verifyModels?.length) {
            return [];
        }
        return ConditionManager.ins().getAllConditions(verifyModels)
    }


}
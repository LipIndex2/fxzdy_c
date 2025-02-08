import { Constructor } from "cc";
import BaseSingleton from "db://assets/scripts/core/base/BaseSingleton";
import { ICondition } from "db://assets/scripts/game/modules/condition/ICondition";
import G from "db://assets/scripts/core/comm/G";
import { EnumUtils } from "db://assets/scripts/core/utils/EnumUtils";
import { ConditionFactory } from "db://assets/scripts/game/modules/condition/ConditionFactory";
import { FloatingTextManager } from "db://assets/scripts/game/modules/floatingText/FloatingTextManager";
import UrlUtils from "../../../core/utils/UrlUtils";
import { ConditionUtils } from "db://assets/scripts/game/modules/condition/ConditionUtils";
import { I18nManager } from "db://assets/scripts/core/i18n/I18nManager";
import { EnumConditionType } from "db://assets/scripts/game/modules/condition/enum/EnumConditionType";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import GIns from "../../GIns";
import { Logger } from "../../../core/log/Logger";


/**
 * 游戏条件管理器
 *
 * 接入方式:
 * 1. 在 impl/ 目录下, 编写一个 class 实现 ICondition 接口
 * 2. 在 ConditionFactory.ts 的 getMyConditionClassArray() 方法中, 注册该条件 Class 即可
 *
 * Config:
 * 条件文本格式 =  ${type}, ${params}, ${numberCount}; ${type}, ${params}, ${numberCount};...
 * demo = playerLvGreaterThan, 0 ,10; playerLvLessThan, 0, 50
 * -----
 * Code:
 * const isOK: boolean = ConditionManager.ins().checkCondition(array<array<string|number>>)
 */
export class ConditionManager extends BaseSingleton {


    // 条件类型: 
    private _typeToCreateConditionMap: Map<string, ICondition> = new Map();

    // 初始化注册所有枚举
    protected onInit() {
        super.onInit();

        const conditionClassArray = ConditionFactory.ins().getMyConditionClassArray();
        conditionClassArray.forEach((it) => {
            this.addConditionHandler0(it)
        })
        // console.info("[ConditionManager] 所有条件初始化完毕! map = ", this._typeToCreateConditionMap)
    }

    /**
     * 解析条件文本
     * 仅适用于静态表
     * @param conditionText 条件文本
     */
    public parseConditionStr(conditionText: string): Array<Array<string | number>> {
        if (!conditionText) return null;
        let arr: Array<Array<any>> = [];
        const conditionTextArray = conditionText.split(";");
        for (let index = 0; index < conditionTextArray.length; index++) {
            const element = conditionTextArray[index];
            const oneConditionArray = element.split(",");

            if (!oneConditionArray[0]) continue;

            let arg1 = Number(oneConditionArray[1]);
            let arg2 = Number(oneConditionArray[2]);

            arr.push([
                oneConditionArray[0],
                isNaN(arg1) ? oneConditionArray[1] : arg1,
                isNaN(arg2) ? oneConditionArray[2] : arg2
            ]);
        }
        return arr;
    }

    /**
     *  通过2维数组解析条件
     *  [["playerLvGreaterThan", "0", "10"], ["playerLvLessThan", "0", "50"]]
     * @param conditionArray
     * @private
     */
    private parseConditionByLevel2Array0(conditionArray: Array<Array<any>>): Array<ICondition> {
        const conditions: ICondition[] = [];

        for (const [conditionType, params, targetValue] of conditionArray) {
            const condition = this._typeToCreateConditionMap.get(conditionType);
            if (!condition) {
                throw new Error(`Unknown condition type: ${conditionType}`);
            }

            // 后端规范: number, number | 但目前只有配置数字, 所有 number, number 先
            condition.initParams(params?.toString() || "", targetValue as number);
            conditions.push(condition);
        }

        return conditions;
    }

    /**
     * 是否空白
     * @param condition
     */
    isBlank(condition: Array<Array<any>>): boolean {
        if (!condition?.length) {
            return true;
        }
    }

    /**
     * 是否锁定
     */
    isLock(condition: Array<Array<any>>,
        defaultOkFlag: boolean = true,
        showTipsFlag: boolean = false,
    ): boolean {
        return !this.checkCondition(condition, defaultOkFlag, showTipsFlag);
    }

    /**
     * 检查【游戏条件】是否满足
     * 
     * @param condition  二维数组 || 条件文本（不建议） 
     * @param defaultOkFlag 默认是否成功 | default true
     * @param showTipsFlag 是否漂字提示 | default false
     */
    checkCondition(condition: Array<Array<any>>,
        defaultOkFlag: boolean = true,
        showTipsFlag: boolean = false,
    ): boolean {
        if (UrlUtils.hasUrlParam(UrlUtils.isFightDebug))
            return true;

        if (!condition) {
            return defaultOkFlag;
        }

        return this.checkConditionByL2Array(condition, defaultOkFlag, showTipsFlag);
    }

    /**获取条件需要满足的数值*/
    public getConditionValue(condition: Array<Array<any>>, type: EnumConditionType): number {
        let iCondition = this.getCondition(condition, type)
        if (iCondition) {
            return iCondition.value()
        }
        return 0
    }

    /**获取所有条件数据
     * 不建议使用string类型
    */
    public getAllConditions(condition: Array<Array<any>>): ICondition[] {
        let conditionArray: ICondition[] = [];
        try {
            if (!condition) {
                conditionArray = [];
            } else {
                conditionArray = this.parseConditionByLevel2Array0(condition);
            }
        } catch (error) {
            G.Logger.error(`条件格式错误, conditionText = ${condition?.toString()}`, error);
            return null
        }
        return conditionArray
    }

    /**获取条件数据
     * 不建议使用string类型
    */
    public getCondition(conditionText: Array<Array<any>>, type: EnumConditionType): ICondition {
        let conditionArray: ICondition[] = this.getAllConditions(conditionText);
        let condition = conditionArray?.find((value) => value.type() == type)
        if (condition) {
            return condition
        }
        return null
    }

    /**
     * 二维数组检查条件
     * @param arrayL2
     * @param defaultOkFlag
     * @param showTipsFlag 是否显示提示
     */
    private checkConditionByL2Array(arrayL2: Array<Array<any>>,
        defaultOkFlag: boolean,
        showTipsFlag: boolean,
    ): boolean {
        let conditionArray = [];
        try {
            conditionArray = this.parseConditionByLevel2Array0(arrayL2);
        } catch (error) {
            G.Logger.error(`条件格式错误, conditionText = ${arrayL2} | defaultOkFlag = ${defaultOkFlag}`, error);
            return defaultOkFlag;
        }
        return this.check0(conditionArray, defaultOkFlag, showTipsFlag);
    }

    private check0(conditionArray: Array<ICondition>,
        defaultOkFlag: boolean,
        showTipsFlag: boolean = false,
    ) {
        // safe check
        let okFlag = true;
        if (conditionArray.length <= 0) {
            return defaultOkFlag;
        }

        for (let i = 0; i < conditionArray.length; i++) {
            const condition = conditionArray[i];

            // 检查条件
            const isOk = condition.check();
            okFlag = okFlag && isOk;

            if (!isOk) {
                if (showTipsFlag) {
                    let i18nTips = this.getUnlockTipByCondition(condition)
                    if (i18nTips) {
                        GIns.floatingTextMgr.showTips(i18nTips);
                    }
                }
                break;
            }
        }

        return okFlag;
    }

    /**获取显示提示
     * 不建议使用string类型
     * @param [systemType=0] ServerEnums.SystemType
    */
    getOpenConditionTips(condition: Array<Array<any>>, systemType: number = 0) {
        let conditionArray: Array<ICondition> = [];
        try {
            conditionArray = this.parseConditionByLevel2Array0(condition);
        } catch (error) {
            G.Logger.error(`条件格式错误, conditionText = ${condition.toString()}`, error);
            return null;
        }
        for (let i = 0; i < conditionArray.length; i++) {
            const condition = conditionArray[i];

            // 检查条件
            const isOk = condition.check();

            if (!isOk) {
                return this.getUnlockTipByCondition(condition, systemType)
            }
        }
        return null;
    }

    /**
     * 根据条件获取解锁提示信息。
     * @param condition - 需要检查的条件对象。
     * @param systemType - 系统类型，默认为0。如果提供，则尝试获取系统名称并附加到提示信息中。
     * @returns 返回根据条件配置生成的本地化提示信息字符串。
     * @throws 如果条件配置不存在，则在控制台输出警告信息，并返回空字符串。
     */
    public getUnlockTipByCondition(condition: ICondition, systemType: number = 0): string {
        let moduleName: string = '';
        if (systemType) {
            let system = ServerEnums.SystemType[systemType]
            let cfg = G.TableManager.getDataById(table.verify.PlayerSystemOpenConfig, system);
            if (cfg) {
                moduleName = cfg.showName;
            }
        }
        const conditionType = condition.type();
        const config = ConditionUtils.getConditionConfig(conditionType);
        if (config?.message) {
            // 
            let args = condition.getErrorTipsArgs()
            if (moduleName) {
                args.concat(moduleName)
            }
            let i18nTips = I18nManager.ins().lang(config.message, ...args);
            return i18nTips;
        } else {
            G.Logger.warn(`条件配置不存在! <ConditionConfig> message conditionType = ${conditionType}`);
        }
        return ''
    }

    /**
     * 获取开放条件的标题。
     * @param condition - 一个二维数组，表示各种条件。
     * @returns 返回表示条件标题的字符串。
     */
    public getOpenConditionTitle(condition: Array<Array<any>>) {
        let conditionArray: Array<ICondition> = [];
        try {
            conditionArray = this.parseConditionByLevel2Array0(condition);
        } catch (error) {
            G.Logger.error(`条件格式错误, conditionText = ${condition.toString()}`, error);
            return null;
        }
        for (let i = 0; i < conditionArray.length; i++) {
            const condition = conditionArray[i];
            // 检查条件
            const isOk = condition.check();
            if (!isOk) {
                return this.getUnlockTitleByCondition(condition);
            }
        }
        return null;
    }

    /**
     * 根据条件获取解锁标题。
     * @param condition - 条件对象。
     * @returns 解锁标题字符串。
     */
    public getUnlockTitleByCondition(condition: ICondition): string {
        const conditionType = condition.type();
        const config = ConditionUtils.getConditionConfig(conditionType);
        if (config?.title) {
            let args = condition.getErrorTipsArgs();
            let i18nTips = I18nManager.ins().lang(config.title, ...args);
            return i18nTips;
        } else {
            G.Logger.warn(`条件配置不存在! <ConditionConfig> title conditionType = ${conditionType}`);
        }
        return '';
    }


    /**
     * 添加条件处理器
     * @param classForCondition
     * @private
     */
    private addConditionHandler0(classForCondition: Constructor<ICondition>) {
        const obj = new classForCondition();
        const type = obj.type();
        if (!type) {
            console.error("条件类型为空! please check it. classForCondition = ", classForCondition);
            return;
        }

        // 条件映射
        const typeStr = EnumUtils.getEnumKeyNameByValue(EnumConditionType, type)
        if (!typeStr) {
            console.error("条件类型为空! please check it. classForCondition = ", classForCondition);
            return;
        }
        this._typeToCreateConditionMap.set(typeStr, new classForCondition());

    }


    /**
     * 获取添加对应的监听事件
     * @param conditions - 二维数组，每个子数组的第一个元素代表条件类型。
     * @returns 返回一个包含条件类型的数组，如果输入为空或无效，则返回null。
     */
    public getConditionsNotificationKeys(conditions: Array<Array<any>>): Array<string> | null {
        if (!conditions || !conditions.length) return null;

        let notificationKeys = [];
        for (let i = 0; i < conditions.length; i++) {
            let condition = this._typeToCreateConditionMap.get(conditions[i]?.[0]);
            let keys = condition?.listenNotifications;
            if (keys?.length) {
                notificationKeys.push(...keys);
            }
        }
        return notificationKeys;
    }
}

import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { TableManager } from "db://assets/scripts/core/table/TableManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { EnumConditionType } from "db://assets/scripts/game/modules/condition/enum/EnumConditionType";
import GIns from "../../GIns";
import { I18nManager } from "../../../core/i18n/I18nManager";
import G from "../../../core/comm/G";
import { ICondition } from "./ICondition";
import { ConditionManager } from "./ConditionManager";

/**
 * 获取条件文本类型
 */
export enum ConditionGetTxtType {
    TITLE = 1,
    UNLOCK_TXT = 2,
    MESSAGE = 3,
}

/**条件工具类 */
export class ConditionUtils {

    /**
     * 是否需要处理解锁的事件 | 新增机制就需要追加!
     * @param event
     */
    static isNeedHandleForUnlock(event: string): boolean {
        return event == NotificationKey.HERO_UP_LEVEL
            || event == NotificationKey.MAP_BUILDING_UNLOCK
            || event == NotificationKey.HANG_UP_MAX_PASS_LEVEL_ID_CHANGE
            || event == NotificationKey.GUIDE_NEXT
            || event == NotificationKey.GUIDE_END
            || event == NotificationKey.GUIDE_MARK_COMPLETED
            || event == NotificationKey.EVENT_TRUNK_TASK_ID_NEXT
            || event == NotificationKey.ACTIVITY_DATA_RELOAD
            || event == NotificationKey.EVENT_TRUNK_TASK_COMPLETE
            || event == NotificationKey.TALENT_CHANGE
            || event == NotificationKey.SYSTEM_NEW_DAY
            || event == NotificationKey.SEASON_ACTIVITY_NEWSTATE
            || event == NotificationKey.CAPTAIN_SKILL_LV_UPDATE
            ;
    }

    /**
     * 所有解锁的事件名
     */
    static getUnlockEventNameArray(): string[] {
        return [
            NotificationKey.HERO_UP_LEVEL,
            NotificationKey.MAP_BUILDING_UNLOCK,
            NotificationKey.HANG_UP_MAX_PASS_LEVEL_ID_CHANGE,
            NotificationKey.GUIDE_NEXT,
            NotificationKey.GUIDE_END,
            NotificationKey.GUIDE_MARK_COMPLETED,
            NotificationKey.EVENT_TRUNK_TASK_ID_NEXT,
            NotificationKey.ACTIVITY_DATA_RELOAD,
            NotificationKey.EVENT_TRUNK_TASK_COMPLETE,
            NotificationKey.TALENT_CHANGE,
            NotificationKey.SYSTEM_NEW_DAY,
            NotificationKey.SEASON_ACTIVITY_NEWSTATE,
            NotificationKey.CAPTAIN_SKILL_LV_UPDATE,
        ]
    }

    /**
     * 根据条件类型获取对应的条件配置信息。
     * @param conditionType - 条件类型枚举值。
     * @returns 返回对应的条件配置对象，如果未找到则返回 null。
     */
    static getConditionConfig(conditionType: EnumConditionType): table.condition.ConditionConfig | null {
        const name = EnumConditionType[conditionType]
        return TableManager.getDataById(table.condition.ConditionConfig, name)
    }


    /**
     * 获取条件状态变更通知。
     * -----
     * @param conditions - 条件数组的数组。
     * @returns 返回条件通知键的字符串数组，如果获取失败则返回null。
     */
    static getConditionsNotificationKeys(conditions: Array<Array<any>>): Array<string> | null {
        return GIns.conditionMgr.getConditionsNotificationKeys(conditions);
    }

    /**
     * 获取条件标题
     * @param conditions - 条件数组， 一个二维数组，表示各种条件
     * @returns string|null 如果是null说明已满足条件
     */
    public static getConditionsTitle(conditions: Array<Array<any>>) {
        return this.getConditionsTxtByType(conditions, ConditionGetTxtType.TITLE);
    }

    /**
     * 获取条件解锁文本
     * @param conditions - 条件数组， 一个二维数组，表示各种条件
     * @returns string|null 如果是null说明已满足条件
     */
    public static getConditionsUnlockTxt(conditions: Array<Array<any>>) {
        return this.getConditionsTxtByType(conditions, ConditionGetTxtType.UNLOCK_TXT);
    }

    /**
     * 获取条件解锁文本
     * @param conditions - 条件数组， 一个二维数组，表示各种条件
     * @returns string|null 如果是null说明已满足条件
     */
    public static getConditionsMessage(conditions: Array<Array<any>>) {
        return this.getConditionsTxtByType(conditions, ConditionGetTxtType.MESSAGE);
    }

    /**
     * 获取开放条件的首条不满足条件的文本
     * @param condition - 一个二维数组，表示各种条件。
     * @param txtType 条件类型
     * @returns string|null 如果是null说明已满足条件 。
     */
    public static getConditionsTxtByType(conditions: Array<Array<any>>, txtType: ConditionGetTxtType) {
        if (!conditions?.length) return null;

        let conditionInsArray = GIns.conditionMgr.getAllConditions(conditions);
        for (let i = 0; i < conditionInsArray.length; i++) {
            const conditionIns = conditionInsArray[i];
            // 检查条件
            if (!conditionIns.check()) {
                return this.getConditionTxt(conditionIns, txtType);
            }
        }
        return null;
    }

    /**
     * 获取开放条件的全部条件的文本 (包括已满足)
     * @param condition - 一个二维数组，表示各种条件。
     * @param txtType 条件类型
     * @returns string[] 。
     */
    public static getConditionsAllTxtByType(conditions: Array<Array<any>>, txtType: ConditionGetTxtType = ConditionGetTxtType.UNLOCK_TXT) {
        let txtArr = [];

        if (!conditions?.length) return null;

        let conditionInsArray = GIns.conditionMgr.getAllConditions(conditions);
        for (let i = 0; i < conditionInsArray.length; i++) {
            // 检查条件
            txtArr.push(this.getConditionTxt(conditionInsArray[i], txtType));
        }

        return txtArr;
    }

    /**
     * 根据条件获取解锁标题。
     * @param condition - 条件对象。
     * @returns 解锁标题字符串。
     */
    private static getConditionTxt(condition: ICondition, txtType: ConditionGetTxtType): string {
        const conditionType = condition.type();
        const config = ConditionUtils.getConditionConfig(conditionType);

        let txt: string;
        switch (txtType) {
            case ConditionGetTxtType.TITLE:
                txt = config?.title;
                break;
            case ConditionGetTxtType.UNLOCK_TXT:
                txt = config?.unlockTxt;
                break;
            case ConditionGetTxtType.MESSAGE:
                txt = config?.message;
                break;
        }

        if (!txt) {
            G.Logger.warn(`条件配置不存在! <ConditionConfig> title conditionType = ${conditionType}`);
            return "";
        }

        let args = condition.getErrorTipsArgs();
        let i18nTips = G.I18nManager.lang(txt, ...args);
        return i18nTips;
    }

}
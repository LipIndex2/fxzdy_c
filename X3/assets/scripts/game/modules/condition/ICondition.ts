import { EnumConditionType } from "db://assets/scripts/game/modules/condition/enum/EnumConditionType";

/**
 * 单个游戏条件
 */
export abstract class ICondition {

    /**状态变更相关通知  */
    public listenNotifications: string[];

    /**条件类型*/
    abstract type(): EnumConditionType;

    /**条件参数*/
    abstract param(): string

    /**条件数值*/
    abstract value(): number

    /**
     * 初始化参数 | 具体格式问后端！
     * @param params 数字参数
     * @param targetCount 数字参数
     */
    abstract initParams(params: string, targetCount: number): void

    /**检查条件 | true = ok | false = error*/
    abstract check(): boolean;

    /**错误参数*/
    abstract getErrorTipsArgs(): (string | number)[]
}

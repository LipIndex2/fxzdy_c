import BaseSingleton from "db://assets/scripts/core/base/BaseSingleton";
import {TableCheckTaskForItem} from "db://assets/scripts/game/modules/table/checker/TableCheckTaskForItem";
import G from "db://assets/scripts/core/comm/G";
import {LogType} from "db://assets/scripts/core/log/Logger";

export interface ITableCheckTask {

    // 任务名
    taskName(): string

    /**
     * 检查表的业务关系
     * @returns 是否通过检查 true = ok, false = error
     */
    checkBusinessIsOk(): boolean

    /**
     * 错误提示
     */
    getErrorTipsStr(): string
}

/**
 * 策划数据表检查器
 */
export class TableCheckerManager extends BaseSingleton {

    private _checkTaskArray = new Array<ITableCheckTask>()

    protected onInit() {
        super.onInit();

        // todo 追加大家的
        this._checkTaskArray.push(new TableCheckTaskForItem())
    }

    /**
     * 检查表
     */
    checkTable() {

        G.Logger.blue(LogType.DEBUG, "[Start] 开始检查策划数据表")

        const errorTaskIndexArray = new Array<number>();

        // 检查所有任务
        const maxSize = this._checkTaskArray.length;
        for (let i = 0; i < maxSize; i++) {
            const checkTask = this._checkTaskArray[i]
            const isOk = checkTask.checkBusinessIsOk()
            if (!isOk) {
                errorTaskIndexArray.push(i)
            }
        }

        const errorSize = errorTaskIndexArray.length;
        G.Logger.debug(`【策划表检查结果】 成功数量 success count = ${maxSize - errorSize}/${maxSize}`)
        G.Logger.debug(`【策划表检查结果】 错误数量 error count = ${errorSize}/${maxSize}`)
        
        // 打印错误提示
        if (errorSize > 0) {
            G.Logger.printError(`【策划数据表检查失败】 数量 = ${errorSize}/${maxSize}`)
            for (let i = 0; i < errorSize; i++) {
                const taskIndex = errorTaskIndexArray[i]
                const checkTask = this._checkTaskArray[taskIndex]
                G.Logger.printError(checkTask.taskName())
            }
        }

        G.Logger.blue(LogType.DEBUG, "[End] 开始检查策划数据表")
    }

}
    
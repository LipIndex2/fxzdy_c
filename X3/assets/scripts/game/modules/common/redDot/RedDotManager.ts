import BaseSingleton from "../../../../core/base/BaseSingleton";
import { RedDotPath } from "db://assets/scripts/game/modules/common/redDot/structs/RedDotPath";
import { RedDotTree } from "db://assets/scripts/game/modules/common/redDot/structs/RedDotTree";
import { EnumRedDotShowType } from "db://assets/scripts/game/modules/common/redDot/enums/EnumRedDotShowType";
import { EnumRedDotReadType } from "db://assets/scripts/game/modules/common/redDot/enums/EnumRedDotReadType";
import ArrayUtils from "db://assets/scripts/core/utils/ArrayUtils";
import { Logger, LogType } from "db://assets/scripts/core/log/Logger";
import { TimeManager } from "db://assets/scripts/core/time/TimeManager";

/**
 * 红点管理器
 * - 只关心数据
 */
export class RedDotManager extends BaseSingleton {


    // state
    private _tree = new RedDotTree();

    private _debug = false;
    init() {
        this._debug = Logger.isOpen(LogType.DEBUG);
        this._tree.init();
    }

    isFirstInitData(): boolean {
        return this._tree.isFirstInitData();
    }

    setHaveInitData() {
        this._tree.setHaveInitData();
    }

    // 注册红点
    registerRedDotShowType(
        path: RedDotPath,
        showType: EnumRedDotShowType = EnumRedDotShowType.NULL,
    ) {

        this._tree.setShowTypeForPath(path, showType);
        this._debug && Logger.debug(`[红点] 注册 path = ${path.templatePath}, showType = ${showType}`);
    }

    clearAll(path: RedDotPath) {
        this._tree.clearAll(path);
    }

    tryRefreshNewDay() {
        this._tree.tryRefreshNewDay(TimeManager.serverNow);
    }


    /**
     * 设置红点永久已读
     */
    markRedDotForeverRead(path: RedDotPath, pathArgs?: any[]) {

        this.markRead(EnumRedDotReadType.FOREVER, path, pathArgs);
    }

    /**
     * 设置红点已读
     */
    markRead(readType: EnumRedDotReadType, path: RedDotPath, pathArgs?: any[]) {
        const args = pathArgs || [];
        this._tree.markRead(readType, path, args);
    }

    /**
     * 已读 / 设置红点 + 子路径
     */
    markReadAll(readType: EnumRedDotReadType, path: RedDotPath, pathArgs?: any[]) {
        const args = pathArgs || [];
        this._tree.markReadAll(readType, path, args);
    }

    /**
     * 移除已读
     * @param path
     * @param pathArgs
     */
    removeMarkRead(path: RedDotPath, pathArgs?: any[]) {
        const args = pathArgs || [];

        this._tree.removeMarkRead(path, args);
    }

    /**
     * 设置红点
     */
    setRedDot(path: RedDotPath, isHaveRedDot: boolean, pathArgs?: any[]) {

        // 目前只有布尔值
        const count = isHaveRedDot ? 1 : 0;
        const args = pathArgs || [];

        if (count <= 0) {
            this._tree.remove(path, args);
            return;
        }
        this._tree.set(path, count, args);
    }

    /**
     * 是否有红点
     * @param path
     * @param pathArgs
     */
    isHaveRedDot(path: RedDotPath, pathArgs: any[] = []): boolean {
        // const key = path instanceof RedDotPath ? path.render() : path;

        return this._tree.get(path, pathArgs) > 0;
    }

    /**
     * 判断多个路径是否有红点
     * @param paths
     */
    isHaveRedDotByPaths(paths: RedDotPath[]): boolean {
        for (let path of paths) {
            if (this.isHaveRedDot(path, [])) {
                return true;
            }
        }
        return false;
    }


    /**
     * 获取显示方式
     * @param path
     * @param pathArgs
     */
    getShowType(path: RedDotPath, pathArgs: any[] = []): EnumRedDotShowType {

        return this._tree.getFirstShowTypeInChildRedDot(path, pathArgs);
    }

    /**
     * 获取显示路径 by 多个红点路径
     * @param paths
     */
    getShowTypeByPathArray(paths: RedDotPath[]): EnumRedDotShowType {
        const array = [];
        for (let path of paths) {
            const showType = this.getShowType(path, []);
            if (showType == EnumRedDotShowType.NULL) {
                continue;
            }

            array.push(showType);
        }

        if (ArrayUtils.isEmpty(array)) {
            return EnumRedDotShowType.NULL;
        }

        // 按优先度显示
        return array.sort((v1, v2) => v1 - v2)[0]
    }

    // print data
    printRedDotTree() {
        this._tree.printTree();
    }

    // 是否已读
    isRead(type: EnumRedDotReadType, path: RedDotPath, args: any[]): boolean {
        return this._tree.isRead(type, path, args);
    }
}

/**
 * 红点触发器  主动调用才能触发
 * 绑定红点id
 */
export function redDotTrigger(...paths: RedDotPath[]) {
    return function (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<Function>) {
        const method = descriptor.value
        descriptor.value = function () {
            let isHaveRedDot = method.apply(this, arguments);

            for (let path of paths) {
                // RedDotManager.ins().registerRedDot(key);

                // setter
                RedDotManager.ins().setRedDot(path, isHaveRedDot);
                this._debug && Logger.debug(`[红点 @redDotTrigger] ${path} args = ${arguments}, | return value = ${isHaveRedDot}`);
            }

            return isHaveRedDot;

        }
    }
}


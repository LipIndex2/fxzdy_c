import { RedDotPath } from "db://assets/scripts/game/modules/common/redDot/structs/RedDotPath";
import { EnumRedDotShowType } from "db://assets/scripts/game/modules/common/redDot/enums/EnumRedDotShowType";
import { DebugUtils } from "db://assets/scripts/core/utils/DebugUtils";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import { GameUtils } from "db://assets/scripts/core/utils/GameUtils";
import { LocalStorageUtils } from "db://assets/scripts/core/utils/LocalStorageUtils";
import { LocalStorageKeys } from "db://assets/scripts/game/comm/cache/LocalStorageKeys";
import { IRedDotHistoryDto } from "db://assets/scripts/game/modules/common/redDot/dto/IRedDotHistoryDto";
import ArrayUtils from "db://assets/scripts/core/utils/ArrayUtils";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import { MapUtils } from "db://assets/scripts/core/utils/MapUtils";
import { ClipboardUtils } from "db://assets/scripts/core/utils/ClipboardUtils";
import { IRedDotForeverReadDto } from "db://assets/scripts/game/modules/common/redDot/dto/IRedDotForeverReadDto";
import { EnumRedDotReadType } from "db://assets/scripts/game/modules/common/redDot/enums/EnumRedDotReadType";
import { PlayerTempData } from "db://assets/scripts/game/modules/player/temp/PlayerTempData";
import { Logger } from "db://assets/scripts/core/log/Logger";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { DateUtils } from "db://assets/scripts/core/utils/DateUtils";

/**
 * 红点树
 */
export class RedDotTree {

    private version: string = "0.0.3";

    private readonly ROOT_EVENT_NAME = NotificationKey.RED_DOT_CHANGE + "_";

    // state
    //  <路径, <参数[], 红点数量>> | 红点数据
    private _pathToArgNameToRedDotCountMap: Map<RedDotPath, Map<string, number>> = new Map();
    // <子路径, 是否不再参与父路径聚合红点?> | 子路径有红点, 但是父路径不再有红点
    private _pathToNotJoinParentFlagMap: Map<RedDotPath, boolean> = new Map();

    // --- 已读
    //  <路径, <参数, 红点永久已读>> 
    private _pathToArgNameToIsForeverReadMap: Map<RedDotPath, Map<string, boolean>> = new Map();
    //  <路径, <参数, 登录已读>> 
    private _pathToArgNameToIsLoginReadMap: Map<RedDotPath, Map<string, boolean>> = new Map();
    //  <路径, <参数, 今日已读>> 
    private _pathToArgNameToIsTodayReadMap: Map<RedDotPath, Map<string, boolean>> = new Map();
    // 今日已读的时间
    private _todayReadRefreshTimeMs: number = 0;

    // config
    // 路径模板 -> 显示方式
    private _pathToShowTypeMap: Map<RedDotPath, EnumRedDotShowType> = new Map();

    // dependency
    // <路径, 覆盖到的子路径[]> | 依赖关系
    private _pathToChildPathMap: Map<RedDotPath, RedDotPath[]> = new Map();


    private _isDirty: boolean = false;

    // 是否初始化
    private _isFirstInit: boolean = true;

    init() {
        Logger.game("[红点] 全自动分析依赖关系 start");

        // 先清空 
        this._pathToChildPathMap.clear();

        // 获取所有注册的 RedDotPath
        const redDotPaths: IterableIterator<RedDotPath> = this._pathToShowTypeMap.keys();
        // 遍历每个路径模板，找到其对应的子路径
        const pathArray = Array.from(redDotPaths);
        for (const parentPath of pathArray) {
            const childPaths: RedDotPath[] = [];

            // 遍历所有其他路径，检查哪些是当前路径的子路径
            for (const potentialChildPath of pathArray) {
                if (this._isChildPath(parentPath, potentialChildPath)) {
                    childPaths.push(potentialChildPath);
                }
            }

            if (childPaths.length <= 0) {
                continue;
            }
            // 保存父路径与其对应的子路径
            this._pathToChildPathMap.set(parentPath, childPaths);
        }

        Logger.game("[红点] 全自动分析依赖关系 end");


        // print 
        if (DebugUtils.isDebugAndInBrowser()) {
            Logger.game("-------------- 红点依赖关系 -------------- ");
            for (let [parentPath, allChildPaths] of this._pathToChildPathMap) {
                Logger.game(`[红点] path = ${parentPath.templatePath} `);
                allChildPaths.forEach(it => Logger.game(`- ${it.templatePath}`))
            }

            Logger.game("-------------- /红点依赖关系 -------------- ");
        }

        GameUtils.onGameExit(() => {

            this.saveToLocalStorage();
        });

        const isRestoreData = this.restoreHistoryData();
        this._isFirstInit = !isRestoreData;

        GameTimer.ins().loop(10 * 1000, this, this.saveToLocalStorage);
    }


    // 保存到本地
    saveToLocalStorage() {
        if (!this._isDirty) {
            return;
        }
        this._isDirty = false;

        Logger.game("保存历史红点数据 start");

        LocalStorageUtils.set(LocalStorageKeys.redDotVersion, this.version);

        this.saveRedDotData();
        this.saveForeverRead();
        this.saveTodayRead();


        Logger.game("保存历史红点数据 end");
    }

    private saveRedDotData() {
        // data
        const redDotDataArray = [];
        for (let [path, argMap] of this._pathToArgNameToRedDotCountMap) {
            for (let [argName, count] of argMap) {


                redDotDataArray.push({
                    template: path.templatePath,
                    argsName: argName,
                    count: count,
                } as IRedDotHistoryDto)
            }
        }
        LocalStorageUtils.set(this.getRedDotDataKey(), redDotDataArray);
    }

    private saveForeverRead() {
        // forever read
        const foreverReadArray = new Array<IRedDotForeverReadDto>();
        for (let [path, argMap] of this._pathToArgNameToIsForeverReadMap) {
            for (let [argName, isRead] of argMap) {
                if (isRead == null) {
                    continue;
                }

                foreverReadArray.push({
                    template: path.templatePath,
                    argsName: argName,
                    isForeverRead: isRead,
                } as IRedDotForeverReadDto);
            }
        }
        LocalStorageUtils.set(this.getForeverReadKey(), foreverReadArray);
    }

    private saveTodayRead() {
        // today read
        const todayReadArray = new Array<IRedDotForeverReadDto>();
        for (let [path, argMap] of this._pathToArgNameToIsTodayReadMap) {
            for (let [argName, isRead] of argMap) {
                if (isRead == null) {
                    continue;
                }

                todayReadArray.push({
                    template: path.templatePath,
                    argsName: argName,
                    isForeverRead: isRead,
                } as IRedDotForeverReadDto);
            }
        }
        LocalStorageUtils.set(this.getTodayReadKey(), todayReadArray);
        LocalStorageUtils.set(this.getTodayReadRefreshTimeKey(), this._todayReadRefreshTimeMs);
    }

    /**
     * 恢复数据
     */
    restoreHistoryData(): boolean {

        const oldVersion = LocalStorageUtils.get(LocalStorageKeys.redDotVersion, String);

        // 版本不一致, 不再用旧数据
        if (oldVersion != this.version) {
            Logger.game("【红点】 数据版本变更. 历史数据废弃!");
            this.cleanLocalStorageData();

            return false;
        }


        Logger.game("[红点] 恢复历史红点数据 start ");

        // forever read
        const readForeverDataArray: IRedDotForeverReadDto[] = LocalStorageUtils.get(this.getForeverReadKey(), Array<IRedDotForeverReadDto>);
        if (ArrayUtils.isNotEmpty(readForeverDataArray)) {
            for (let data of readForeverDataArray) {
                const path = RedDotPath.fromTemplatePath(data.template);
                if (!path) {
                    continue;
                }

                const map = this._pathToArgNameToIsForeverReadMap.getOrCreate(path, () => new Map());
                const argsName = data.argsName;
                const isForeverRead = data.isForeverRead;
                map.set(argsName, isForeverRead);
            }
        }

        // today read
        const todayReadDataArray: IRedDotForeverReadDto[] = LocalStorageUtils.get(this.getTodayReadKey(), Array<IRedDotForeverReadDto>);
        if (ArrayUtils.isNotEmpty(todayReadDataArray)) {
            for (let data of todayReadDataArray) {
                const path = RedDotPath.fromTemplatePath(data.template);
                if (!path) {
                    continue;
                }

                const map = this._pathToArgNameToIsTodayReadMap.getOrCreate(path, () => new Map());
                const argsName = data.argsName;
                const isForeverRead = data.isForeverRead;
                map.set(argsName, isForeverRead);
            }
        }
        this._todayReadRefreshTimeMs = LocalStorageUtils
            .get(this.getTodayReadRefreshTimeKey(), Number, () => 0)
            .valueOf();


        // 恢复数据
        // const array = LocalStorageUtils.get(this.getRedDotDataKey(), Array<IRedDotHistoryDto>);
        // if (ArrayUtils.isNotEmpty(array)) {
        //     // data
        //     for (let data of array) {
        //         const path = RedDotPath.fromTemplatePath(data.template);
        //         if (!path) {
        //             continue;
        //         }
        //
        //         const map = this._pathToArgNameToRedDotCountMap.getOrCreate(path, () => new Map());
        //         const argsName = data.argsName;
        //
        //         // 已读
        //         const isForeverRead = this.isRedDotForeverRead0(path, argsName);
        //         if (isForeverRead) {
        //             continue;
        //         }
        //
        //         const count = data.count;
        //         if (count <= 0) {
        //             continue;
        //         }
        //         map.set(argsName, count);
        //     }
        // }


        Logger.game("[红点] 恢复历史红点数据 end ");


        return true;
    }

    private cleanLocalStorageData() {
        // 清空历史数据
        LocalStorageUtils.set(this.getRedDotDataKey(), null);
        LocalStorageUtils.set(this.getForeverReadKey(), null);
    }


    /**
     * 永久已读 存储 key
     */
    getForeverReadKey(): string {
        const playerId = PlayerTempData.playerId;
        return `${LocalStorageKeys.redDotForeverReadData}|${playerId}`;
    }


    /**
     * 今日已读 存储 key
     */
    getTodayReadKey(): string {
        const playerId = PlayerTempData.playerId;
        return `${LocalStorageKeys.redDotTodayReadData}|${playerId}`;
    }

    // 今日刷新时间
    getTodayReadRefreshTimeKey(): string {
        const playerId = PlayerTempData.playerId;
        return `${LocalStorageKeys.redDotTodayReadRefreshTimeMs}|${playerId}`;
    }

    /**
     * 红点数据 存储 key
     */
    getRedDotDataKey(): string {
        const playerId = PlayerTempData.playerId;
        return `${LocalStorageKeys.redDotData}|${playerId}`;
    }

    isFirstInitData(): boolean {
        return this._isFirstInit;
    }

    setHaveInitData() {
        this._isFirstInit = true;
    }

    private _getArgsName(args: any[]): string {
        return args.map(it => it.toString()).join("|");
    }

// 判断某个路径是否是另一个路径的子路径
    private _isChildPath(parentPath: RedDotPath, childPath: RedDotPath): boolean {
        // 通过比较两个 RedDotPath 的模板字符串来判断是否是子路径关系
        return childPath.templatePath.startsWith(parentPath.templatePath) && childPath !== parentPath;
    }

    markDirty(path: RedDotPath, isChangeParent: boolean): void {
        this._isDirty = true;

        const eventName = path.toEventName();

        // event
        FacadeManager.ins().emit(eventName);

        // 父事件
        // Recursively emit parent events
        if (isChangeParent) {
            this._sendParentEvents(eventName);
        }
    }

    /**
     * 递归发射父路径 event
     * @param eventName
     * @private
     */
    private _sendParentEvents(eventName: string): void {
        let lastSlashIndex = eventName.lastIndexOf('/');

        while (lastSlashIndex > 0) {
            // 父红点
            const parentEventName = eventName.substring(0, lastSlashIndex);
            // 根红点不处理
            if (parentEventName == this.ROOT_EVENT_NAME) {
                break;
            }
            FacadeManager.ins().emit(parentEventName);

            lastSlashIndex = parentEventName.lastIndexOf('/');
        }
    }

    // 添加红点
    add(path: RedDotPath, count: number, args: any[]): void {
        const argsName = this._getArgsName(args);

        // 永久已读, 则再也不处理
        const isForeverRead = this.isRedDotNotNeedToHandle(path, args);
        if (isForeverRead) {
            return;
        }

        let isChangeParent = false;

        let argNameToCountMap = this._pathToArgNameToRedDotCountMap.get(path);
        if (!argNameToCountMap) {
            argNameToCountMap = new Map();
            this._pathToArgNameToRedDotCountMap.set(path, argNameToCountMap);

            isChangeParent = true;
        }

        if (argNameToCountMap.size == 0) {
            isChangeParent = true;
        }

        const currentCount = argNameToCountMap.get(argsName) || 0;
        argNameToCountMap.set(argsName, currentCount + count);

        this.markDirty(path, isChangeParent);
    }

    // 减少红点
    minus(path: RedDotPath, count: number, args: any[]): void {
        this.add(path, -count, args);
    }

    // 设置红点
    set(path: RedDotPath, count: number, args: any[]): void {
        const argsName = this._getArgsName(args);

        // filter
        const isForeverRead = this.isRedDotNotNeedToHandle(path, args);
        if (isForeverRead) {
            // 永久已读, 则再也不处理
            return;
        }


        // set
        let paramsMap = this._pathToArgNameToRedDotCountMap.getOrCreate(path, () => new Map<string, number>());
        const oldSize = paramsMap.size;
        const value = Math.max(0, count);

        const oldValue = paramsMap.get(argsName);
        if (oldValue == value) {
            return;
        }

        if (value > 0) {
            paramsMap.set(argsName, value);
        } else {
            paramsMap.delete(argsName);
        }
        const newSize = paramsMap.size;

        let isChangeParent = false;
        if (oldSize != newSize) {
            isChangeParent = true;
        }

        Logger.game(`[红点] add. path = ${path.templatePath}, args = ${argsName}, value = ${value}`);


        this.markDirty(path, isChangeParent);
    }

    // 移除红点
    remove(path: RedDotPath, args: any[]): void {
        const argsName = this._getArgsName(args);

        const paramsMap = this._pathToArgNameToRedDotCountMap.get(path);
        if (!paramsMap) {
            return;
        }

        let oldSize = paramsMap.size;
        paramsMap.delete(argsName);
        let newSize = paramsMap.size;

        // 是否变更
        const isChangeParent = oldSize != newSize;

        this.markDirty(path, isChangeParent);
    }

// 获取红点值，包括所有子路径的聚合
    get(path: RedDotPath, args: any[]): number {
        const argsName = this._getArgsName(args);

        // 获取当前路径的红点数
        let total = this._getRedDotCountForPath(path, argsName);

        // 获取子路径，并递归计算它们的红点数
        const childPaths = this._pathToChildPathMap.get(path);
        if (childPaths) {
            for (const childPath of childPaths) {
                total += this._getRedDotCountForPath(childPath, argsName);  // 递归获取子路径的红点数
            }
        }

        return total;
    }

// Helper method to get the red dot count for a specific path and args
    private _getRedDotCountForPath(path: RedDotPath, argsName: string): number {
        const nameToCountMap = this._pathToArgNameToRedDotCountMap.get(path);
        if (!nameToCountMap) {
            return 0;
        }

        let total = 0;
        for (const [otherName, value] of nameToCountMap) {
            if (this.isSameArgsInSubPath0(argsName, otherName)) {
                total += value;
            }
        }

        return total;
    }


    // 判断子路径参数是否匹配
    private isSameArgsInSubPath0(parentArgsName: string, childArgs: string): boolean {
        return childArgs.startsWith(parentArgsName);
    }

    // 设置显示方式 for 路径
    setShowTypeForPath(path: RedDotPath, showType: EnumRedDotShowType) {
        this._pathToShowTypeMap.set(path, showType);
    }

    /**
     * 获取第一个显示方式 by 子路径驱动
     * @param path
     * @param args
     */
    getFirstShowTypeInChildRedDot(path: RedDotPath, args: any[]): EnumRedDotShowType {
        const showTypeArray = this.getAllShowTypeOrChildPathShowType(path, args);
        if (ArrayUtils.isEmpty(showTypeArray)) {
            return EnumRedDotShowType.NULL;
        }

        // 从小到大
        return showTypeArray.sort((v1, v2) => v1 - v2)[0];
    }


    // 获取当前路径的 showType 或其有红点的子路径的所有 showType
    getAllShowTypeOrChildPathShowType(path: RedDotPath, args: any[]): EnumRedDotShowType[] {
        const canSeeShowTypeSet: EnumRedDotShowType[] = [];
        const argsName = this._getArgsName(args);

        // 这个路径已读 | 则不显示
        const isAnyRead = this.isAnyRead(path, argsName);
        if (isAnyRead) {
            return [];
        }

        const paramsToCntMap = this._pathToArgNameToRedDotCountMap.get(path);
        if (MapUtils.isNotEmpty(paramsToCntMap)) {
            const count = paramsToCntMap.get(argsName);


            // 如果当前路径, 有, 就直接用
            if (count > 0) {
                canSeeShowTypeSet.push(path.showType);
            }

        }

        // 子路径
        const childPaths = this._pathToChildPathMap.get(path);
        if (!childPaths) {
            // 没有子路径 | return
            return canSeeShowTypeSet;
        }


        for (let childPath of childPaths) {
            const paramsToCntMap = this._pathToArgNameToRedDotCountMap.get(childPath);
            if (MapUtils.isEmpty(paramsToCntMap)) {
                continue;
            }

            // 子路径同参数
            let isSameArgs = false;
            let sameChildArgsName: string = ''
            for (let [childArgsName, count] of paramsToCntMap) {
                const isSubPath = this.isSameArgsInSubPath0(argsName, childArgsName)
                if (isSubPath && count > 0) {
                    isSameArgs = true;
                    sameChildArgsName = childArgsName
                    break;
                }
            }
            if (!isSameArgs) {
                continue
            }

            // 子路径有红点, 加入显示方式
            const showType = this._pathToShowTypeMap.get(childPath);
            if (!showType) {
                continue;
            }
            if (this.isAnyRead(childPath, sameChildArgsName)) {
                //子节点已读
                continue;
            }
            canSeeShowTypeSet.push(showType);
        }

        return canSeeShowTypeSet;
    }

    printTree() {

        // data
        let log = "----------------------- RedDotTree ---------------------------\n";
        this._pathToArgNameToRedDotCountMap.forEach((paramsMap, path) => {
            log += `path = ${path.templatePath} \n`;
            let count = 1;
            paramsMap.forEach((count, argsName) => {
                log += `${count} | ${argsName} = ${count} \n`;
                count++;
            });

            log += "\n---------------------------\n";
        });
        log += "----------------------- RedDotTree ---------------------------\n";

        // forever
        log += "----------------------- RedDotTree | 永久已读 ---------------------------\n";
        this._pathToArgNameToIsForeverReadMap.forEach((paramsMap, path) => {
            log += `path = ${path.templatePath} \n`;
            paramsMap.forEach((isRead, argsName) => {
                log += `${argsName} = ${isRead} \n`;
            });
            log += "\n---------------------------\n";
        });
        log += "----------------------- RedDotTree | /永久已读 ---------------------------\n";

        // login
        log += "----------------------- RedDotTree | 登录已读 ---------------------------\n";
        this._pathToArgNameToIsLoginReadMap.forEach((paramsMap, path) => {
            log += `path = ${path.templatePath} \n`;
            paramsMap.forEach((isRead, argsName) => {
                log += `${argsName} = ${isRead} \n`;
            });
            log += "\n---------------------------\n";
        });
        log += "----------------------- RedDotTree | /登录已读 ---------------------------\n";

        // today read
        log += "----------------------- RedDotTree | 今日已读 ---------------------------\n";
        this._pathToArgNameToIsTodayReadMap.forEach((paramsMap, path) => {
            log += `path = ${path.templatePath} \n`;
            paramsMap.forEach((isRead, argsName) => {
                log += `${argsName} = ${isRead} \n`;
            });
            log += "\n---------------------------\n";
        });
        log += "----------------------- RedDotTree | /今日已读 ---------------------------\n";


        Logger.game(log);


        ClipboardUtils.copy(log);
    }

    // 刷新, 新的一天
    tryRefreshNewDay(timeMs: number) {
        if (this._todayReadRefreshTimeMs == 0) {
            this._todayReadRefreshTimeMs = timeMs;
            this._isDirty = true;
            return;
        }
        
        // 同一天
        if (DateUtils.isSameDayByTimeMs(this._todayReadRefreshTimeMs, timeMs)) {
            Logger.game(`[红点] 刷新今日已读. no change. 还是同一天. preTimeMs = ${this._todayReadRefreshTimeMs}, newTimeMs = ${timeMs}`);
            return;
        }

        this._todayReadRefreshTimeMs = timeMs;
        this.cleanTodayRead(timeMs);


    }

    private cleanTodayRead(timeMs: number) {
        let oldPaths: RedDotPath[] = [];
        for (let [path, _] of this._pathToArgNameToIsTodayReadMap.entries()) {
            oldPaths.push(path);
        }
        // 新新的一天
        this._pathToArgNameToIsTodayReadMap.clear();
        for (let path of oldPaths) {
            this.markDirty(path, true);
        }
        Logger.game(`[红点] 刷新今日已读. ok! newTimeMs = ${timeMs}`);
    }

    /**
     * 是否红点不再需要处理
     * @param path
     * @param args
     */
    isRedDotNotNeedToHandle(path: RedDotPath, args: any[]): boolean {
        const argsName = this._getArgsName(args);

        // 永久已读
        const isRead1 = this.isRead0(EnumRedDotReadType.FOREVER, path, argsName);
        if (isRead1) {
            return true;
        }

        // 本次登录已读
        const isRead2 = this.isRead0(EnumRedDotReadType.LOGIN_ONCE, path, argsName);
        if (isRead2) {
            return true;
        }

        return false;
    }

    /**
     * 是否任意已读
     * @param path
     * @param argsCsv
     */
    isAnyRead(path: RedDotPath, argsCsv: string): boolean {
        if (this.isRead0(EnumRedDotReadType.FOREVER, path, argsCsv)) {
            return true;
        }
        if (this.isRead0(EnumRedDotReadType.LOGIN_ONCE, path, argsCsv)) {
            return true;
        }
        if (this.isRead0(EnumRedDotReadType.TODAY_ONCE, path, argsCsv)) {
            return true;
        }
        return false;
    }

    /**
     * 是否已读
     * @param type
     * @param path
     * @param args
     */
    isRead(type: EnumRedDotReadType, path: RedDotPath, args: any[]): boolean {
        const argsName = this._getArgsName(args);

        return this.isRead0(type, path, argsName);
    }

    private isRead0(type: EnumRedDotReadType, path: RedDotPath, argsCsv: string): boolean {
        if (type == EnumRedDotReadType.FOREVER) {
            return this._pathToArgNameToIsForeverReadMap.get(path)?.get(argsCsv) == true;
        } else if (type == EnumRedDotReadType.LOGIN_ONCE) {
            return this._pathToArgNameToIsLoginReadMap.get(path)?.get(argsCsv) == true;
        } else if (type == EnumRedDotReadType.TODAY_ONCE) {
            return this._pathToArgNameToIsTodayReadMap.get(path)?.get(argsCsv) == true;
        }
        return false;
    }

    /**
     * 所有子路径已读
     * @param path
     * @param readType
     * @param args
     */
    markReadAll(readType: EnumRedDotReadType, path: RedDotPath, args: any[]) {
        this.markRead(readType, path, args);

        this._pathToChildPathMap.get(path)?.forEach(childPath => {
            this.markRead(readType, childPath, args);
        })
    }


    /**
     * 移除已读
     * @param path
     * @param args
     */
    removeMarkRead(path: RedDotPath, args: any[]) {
        const argsName = this._getArgsName(args);

        // forever
        this._pathToArgNameToIsForeverReadMap.get(path)?.delete(argsName);
        // login once
        this._pathToArgNameToIsLoginReadMap.get(path)?.delete(argsName);
        // today
        this._pathToArgNameToIsTodayReadMap.get(path)?.delete(argsName);
    }

    /**
     * 标记这个红点永久已读
     * @param path
     * @param readType
     * @param args
     */
    markRead(readType: EnumRedDotReadType, path: RedDotPath, args: any[]) {
        const argsName = this._getArgsName(args);

        if (readType == EnumRedDotReadType.FOREVER) {
            // 永久已读
            const map = this._pathToArgNameToIsForeverReadMap.getOrCreate(path, () => new Map());
            map.set(argsName, true);

            Logger.game(`[红点] 永久已读. path = ${path.templatePath}, args = ${argsName}`);
        } else if (readType == EnumRedDotReadType.LOGIN_ONCE) {
            // 永久已读
            const map = this._pathToArgNameToIsLoginReadMap.getOrCreate(path, () => new Map());
            map.set(argsName, true);

            Logger.game(`[红点] 登录内已读. path = ${path.templatePath}, args = ${argsName}`);
        } else if (readType == EnumRedDotReadType.TODAY_ONCE) {
            // 今日已读
            const map = this._pathToArgNameToIsTodayReadMap.getOrCreate(path, () => new Map());
            map.set(argsName, true);

            Logger.game(`[红点] 今日已读. path = ${path.templatePath}, args = ${argsName}`);
        } else {
            Logger.game(`[红点] 一次性已读. path = ${path.templatePath}, args = ${argsName}`);
        }

        // 并且删除红点
        this.remove(path, args);
        FacadeManager.ins().emit(path.toEventName());
    }

    // 清空该路径下所有红点
    clearAll(path: RedDotPath) {
        this._pathToArgNameToRedDotCountMap.delete(path);

        this.markDirty(path, true);
    }
}

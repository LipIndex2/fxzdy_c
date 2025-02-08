import { error, log, warn } from "cc";
import { DEBUG } from "cc/env";
import ObjectUtils from "db://assets/scripts/core/utils/ObjectUtils";

export enum LogType {
    /** 系统 */
    SYSTEM = 1,
    /** 网络层日志 */
    NET = 2,
    /** 错误日志 */
    ERROR = 4,
    /** 游戏主体日志 */
    GAME = 8,
    /** 配置数据 */
    CONFIG = 16,
    /** 调试日志 */
    DEBUG = 32,
    /** 数据结构层日志 */
    MODEL = 64,
    /** 战斗日志 */
    FIGHT = 128,
}

/** 日志管理 */
export class Logger {

    private static startLowTimeMap = {};

    // 日志级别 bit Mask
    private static _logLevelMask: number = 0;

    public static init(): void {
        if (DEBUG) {
            this._logLevelMask =
                LogType.SYSTEM |
                LogType.NET |
                LogType.ERROR |
                LogType.GAME |
                LogType.CONFIG |
                LogType.DEBUG |
                LogType.MODEL |
                LogType.FIGHT;
        } else {
            this._logLevelMask = 0;
        }
    }

    /***设置需要打印的级别 */
    public static setOpen(logLevelMask: number): void {
        this._logLevelMask = logLevelMask;
    }

    /** 开始计时 */
    public static startTime(name: string): void {
        if (!this.isOpen(LogType.DEBUG)) return;
        console.time(name);
    }

    /** 打印范围内时间消耗 */
    public static endTime(name: string): void {
        if (!this.isOpen(LogType.DEBUG)) return;
        console.timeEnd(name);
    }


    /** 开始计时 低精度 */
    public static startLowTime(name: string): void {
        if (!this.isOpen(LogType.DEBUG)) return;
        this.startLowTimeMap[name] = Date.now();
    }

    /** 打印范围内时间消耗 低精度 */
    public static endLowTime(name: string): void {
        if (!this.isOpen(LogType.DEBUG)) return;
        if (this.startLowTimeMap[name]) {
            let useTime = Date.now() - this.startLowTimeMap[name];
            if (useTime > 16) {
                console.log("%c%s", "color:red;", `${name} 用时：${useTime}ms 慢慢慢爆了！！！！！！ 数据有必要每次都处理吗？有用虚列表？是否可以分帧处理？！！！！`);
            } else if (useTime > 6) {
                console.log("%c%s", "color:orange;", `${name} 用时：${useTime}ms 有点慢哦，请考虑一下还有什么方法提速呢？`);
            } else {
                console.log("%c%s", "color:green;", `${name} 用时：${useTime}ms 这也太快了吧！！`);
            }
        }
    }


    /** 打印表格 */
    public static table(msg: any, describe?: any): void {
        if (!this.isOpen(LogType.DEBUG)) {
            return;
        }
        console.table(msg);
    }

    /** 无颜色日志 */
    public static debug(...msg: any) {
        this.print(LogType.DEBUG, msg, "")
    }

    /** 战斗日志 */
    public static fight(...msg: any) {
        this.green(LogType.FIGHT, msg)
    }

    /** 网络日志 */
    public static net(...msg: any) {
        this.orange(LogType.NET, msg);
    }

    /** 数据日志 */
    public static model(...msg: any) {
        this.violet(LogType.MODEL, msg);
    }

    /** 游戏主体日志 */
    public static game(...msg: any) {
        this.blue(LogType.GAME, msg);
    }

    /** 配置数据 */
    public static config(...msg: any) {
        this.gray(LogType.CONFIG, msg);
    }

    /** 系统 */
    public static system(...msg: any) {
        this.gray(LogType.SYSTEM, msg);
    }

    public static error(msg: string, errorObj: any = null) {
        if (!this.isOpen(LogType.ERROR)) {
            return;
        }
        this.printError(errorObj, msg);
    }

    public static warn(msg: string, obj: any = null) {
        if (!this.isOpen(LogType.ERROR)) {
            return;
        }
        warn('[WARN]:' + msg, obj);
    }

    /**橙色
     * @deprecated
     */
    public static orange(logType: LogType, ...msg: any) {
        this.print(logType, msg, "color:#ee7700;")
    }

    /**紫色
     * @deprecated
     */
    public static violet(logType: LogType, ...msg: any) {
        this.print(logType, msg, "color:Violet;")
    }

    /**蓝色
     * @deprecated
     */
    public static blue(logType: LogType, ...msg: any) {
        this.print(logType, msg, "color:#3a5fcd;")
    }

    /**绿色
     * @deprecated
     */
    public static green(logType: LogType, ...msg: any) {
        this.print(logType, msg, "color:green;")
    }

    /**灰色
     * @deprecated
     */
    public static gray(logType: LogType, ...msg: any) {
        this.print(logType, msg, "color:gray;")
    }

    public static isOpen(logType: LogType): boolean {
        return (this._logLevelMask & logType) != 0;
    }

    public static print(logType: LogType, msg: any, color: string) {
        // 标记没有打开，不打印该日志
        if (!this.isOpen(logType)) {
            return;
        }
        var backLog = /*log ||*/ console.log;
        backLog.call(null, "%c%s%s%s:%o", color, this.getDateString(), '[' + logType + ']', this.stack(5), ...msg);
    }

    /**
     * 打印错误
     * @param msg 消息
     * @param describe 描述
     */
    public static printError(msg: any, describe?: string) {

        const color = "color:red;";
        const backLog = /*error ||*/ console.error;
        if (describe) {
            backLog.call(null, "%c%s%s%s:%s%o", color, this.getDateString(), '[Error]', this.stack(5), describe, msg);
        } else {
            backLog.call(null, "%c%s%s%s:%o", color, this.getDateString(), '[Error]', this.stack(5), msg);
        }
    }

    private static stack(index: number): string {
        var e = new Error();
        var lines = e.stack!.split("\n");
        var result: Array<any> = [];
        lines.forEach((line) => {
            line = line.substring(7);
            var lineBreak = line.split(" ");
            if (lineBreak.length < 2) {
                result.push(lineBreak[0]);
            }
            else {
                result.push({ [lineBreak[0]]: lineBreak[1] });
            }
        });

        var list: string[] = [];
        var splitList: Array<string> = [];
        if (index < result.length - 1) {
            var value: string = "";
            for (var a in result[index]) {
                var splitList = a.split(".");

                if (splitList.length == 2) {
                    list = splitList.concat();
                }
                else {
                    value = result[index][a];
                    if (!value) {
                        continue;
                    }
                    // 不是 string 类型不处理
                    if (!ObjectUtils.isString(value)) {
                        continue;
                    }
                    var start = value!.lastIndexOf("/");
                    var end = value!.lastIndexOf(".");
                    if (start > -1 && end > -1) {
                        var r = value!.substring(start + 1, end);
                        list.push(r);
                    }
                    else {
                        list.push(value);
                    }
                }
            }
        }

        if (list.length == 1) {
            return "[" + list[0] + ".ts]";
        }
        else if (list.length == 2) {
            return "[" + list[0] + ".ts->" + list[1] + "]";
        }
        return "";
    }

    public static getDateString(): string {
        let d = new Date();
        let str = d.getHours().toString();
        let timeStr = "";
        timeStr += (str.length == 1 ? "0" + str : str) + ":";
        str = d.getMinutes().toString();
        timeStr += (str.length == 1 ? "0" + str : str) + ":";
        str = d.getSeconds().toString();
        timeStr += (str.length == 1 ? "0" + str : str) + ":";
        str = d.getMilliseconds().toString();
        if (str.length == 1) str = "00" + str;
        if (str.length == 2) str = "0" + str;
        timeStr += str;

        timeStr = "[" + timeStr + "]";
        return timeStr;
    }
}

Logger.init();
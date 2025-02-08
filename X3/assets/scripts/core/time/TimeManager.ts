import { DateUtils } from "db://assets/scripts/core/utils/DateUtils";
import { WeekDay } from "db://assets/scripts/core/time/WeekDay";

/**
 * 时间管理器
 */
export class TimeManager {

    // 当前本地时间
    private static _localNow: number = 0;

    // 当前本地时间
    private static _serverNow: number = 0;

    // 当前服务器开服的时间
    private static _openServerTime: number = 0;

    // 首次初始化时间
    private static _startTimeMs: number = 0;

    /**本地与服务器时间差 */
    private static _l2sDelta: number = 0;

    /**两帧时间差 */
    private static _frameDelta: number = 0;

    /**服务器时区 */
    public static serverTimeZone: number = 8;

    /**服务器刷新点数 */
    public static refreshClock: number = 0;

    static initTime() {
        this._serverNow = this._localNow = this._startTimeMs = Date.now();
    }

    /**
     * 跟随 cocos 每一帧更新
     * @param deltaTimeSecond
     */
    static update(deltaTimeSecond: number) {
        this._localNow = Date.now();
        this._serverNow = this._localNow + this._l2sDelta;
        this._frameDelta = deltaTimeSecond * 1000;
    }

    /**
     * 获取本地时间戳 timeMs\
     * (业务相关时间戳请用 serverNow)
     * @see serverNow
     */
    static get localNow(): number {
        return this._localNow;
    }

    /**
     * 获取当前服务器时间戳 timeMs
     */
    static get serverNow(): number {
        return this._serverNow;
    }

    /**
     * 获取战斗时间时间戳
     */
    static get battleNow(): number {
        return this._serverNow;
    }

    /**
     * 获取当前周几
     */
    static getServerTimeWeekday(): WeekDay {
        return WeekDay.getWeekDayByTimeMs(this._serverNow)
    }

    /**
     * 服务器时间文本
     */
    static getServerTimeString(format: string = "yyyy-MM-dd hh:mm:ss"): string {
        return DateUtils.dateTimeFormat(this._serverNow, format);
    }

    /**获取两帧间的时间间隔 */
    static get frameDeltaMs() {
        return this._frameDelta;
    }

    /**获取开服时间 */
    static get openServerTime() {
        return this._openServerTime;
    }

    /**
     * 服务器开启天数 | 从 1 开始
     */
    static get serverHaveOpenDay(): number {
        const diffTimeMs = this._serverNow - DateUtils.getCurrentTimeMsByHourZero(this._openServerTime);
        const day = diffTimeMs / (24 * 60 * 60 * 1000);
        return Math.floor(Math.max(0, day)) + 1;
    }

    /**设置当前服务器时间 */
    static setCurServerTime(serverMs: number) {
        this._serverNow = serverMs;
        this._localNow = Date.now();
        this._l2sDelta = this._serverNow - this._localNow;
    }

    /**设置开服时间 */
    static setOpenServerTime(time: number) {
        this._openServerTime = time;
    }

    /**当天零点的时间戳毫秒数++当前时间-今日过去时间（ms） */
    public static get todayZero(): number {
        //当前时间-今日过去时间
        return TimeManager.serverNow - (TimeManager.serverNow + (this.serverTimeZone) * 3600000) % 86400000;
    }

    /**下个系统刷新时间戳*/
    public static get systemRefreshTime(): number {
        let temp = TimeManager.serverNow - (TimeManager.serverNow + (this.serverTimeZone - this.refreshClock) * 3600000) % 86400000;
        return temp + 86400000;  //下一天 24*60*60*1000 86400000
    }

    /**下个系统刷新的剩余时间*/
    public static get remainingRefreshTime(): number {
        return this.systemRefreshTime - TimeManager.serverNow;
    }

    /**获取系统开启当天的零点时间*/
    public static get openDayZero(): number {
        //当前时间-今日过去时间
        return this._openServerTime - (this._openServerTime + (this.serverTimeZone) * 3600000) % 86400000;
    }

    /**指定时间戳零点的时间戳毫秒数++当前时间-今日过去时间（ms） */
    public static getZeroTime(time:number):number {
        return time - (time + (this.serverTimeZone) * 3600000) % 86400000;
    }
}

window["TimeManager"] = TimeManager;
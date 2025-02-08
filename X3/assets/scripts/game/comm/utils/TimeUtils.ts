import { TimeI18nKeys } from "../../modules/common/i18n/TimeI18nKeys";
import { I18nManager } from "../../../core/i18n/I18nManager";

export class TimeUtils {
    /**
     * 时间戳毫秒偏移值 -> 正计时文本 hh:mm:ss
     * @param milliseconds
     */
    static formatTimeMsToPositiveTimeText(milliseconds: number): string {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const pad = (num: number) => (num < 10 ? "0" + num : num); // 填充函数，确保两位数字

        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }

    /**
     * 关卡倒计时文本 by 时间戳毫秒偏移值
     * @param milliseconds
     */
    static formatTimeMsToLevelTimeText(milliseconds: number): string {
        const totalSeconds = Math.ceil(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const pad = (num: number) => (num < 10 ? "0" + num : num); // 填充函数，确保两位数字

        return `${pad(minutes)}:${pad(seconds)}`;
    }

    /**
     * PVP 挑战时间文本
     * @param diffTimeMs
     */
    static formatDiffTimeMsToPVPChallengeRecordTimeText(diffTimeMs: number): string {
        const msPerMinute = 60 * 1000;
        const msPerHour = msPerMinute * 60;
        const msPerDay = msPerHour * 24;

        if (diffTimeMs < msPerMinute) {
            const seconds = Math.round(diffTimeMs / 1000);
            return `${seconds}秒前`;
        } else if (diffTimeMs < msPerHour) {
            const minutes = Math.round(diffTimeMs / msPerMinute);
            return `${minutes}分钟前`;
        } else if (diffTimeMs < msPerDay) {
            const hours = Math.round(diffTimeMs / msPerHour);
            return `${hours}小时前`;
        } else {
            const days = Math.round(diffTimeMs / msPerDay);
            return `${days}天前`;
        }
    }

    /**
     * 条件	显示规则
     X≥1	X天Y小时
     X<1,Y>1	Y小时：Z分

     */
    static formatTimeMsToDayHourMinuteText(diffTimeMs: number): string {
        const msPerMinute = 60 * 1000;
        const msPerHour = msPerMinute * 60;
        const msPerDay = msPerHour * 24;
        const days = Math.floor(diffTimeMs / msPerDay);
        const hours = Math.floor((diffTimeMs % msPerDay) / msPerHour);
        const minutes = Math.floor((diffTimeMs % msPerHour) / msPerMinute);
        if (days >= 1) {
            return I18nManager.ins().lang("i18n:time:timeDayHour", days, hours);
        } else {
            return I18nManager.ins().lang("i18n:time:timeHourMinute", hours, minutes);
        }
    }

    /**
     * 条件	显示规则
     X≥1	X天Y小时
     X<1,Y>1	Y小时：Z分
     Y<1,Z>1	Y分：Z秒

     */
    static formatTimeMsToDayHourMinuteSecondText(diffTimeMs: number): string {
        const msPerSecond = 1000;
        const msPerMinute = msPerSecond * 60;
        const msPerHour = msPerMinute * 60;
        const msPerDay = msPerHour * 24;

        let days = 0;
        let hours = 0
        let minutes = 0;
        let seconds = 0;
        if (diffTimeMs > 0) {
            days = Math.floor(diffTimeMs / msPerDay);
            hours = Math.floor((diffTimeMs % msPerDay) / msPerHour);
            minutes = Math.floor((diffTimeMs % msPerHour) / msPerMinute);
            seconds = Math.floor((diffTimeMs % msPerMinute) / msPerSecond);
        }
        
        if (days >= 1) {
            return I18nManager.ins().lang("i18n:time:timeDayHour", days, hours);
        } else if (hours >= 1) {
            return I18nManager.ins().lang("i18n:time:timeHourMinute", hours, minutes);
        }
        return I18nManager.ins().lang("i18n:time:timeMinuteSecond", minutes, seconds);
    }

    /**
     * 毫秒转秒字符串
     * @param ms 毫秒
     * @param fixed 存在小数时, 保留小数
     */
    static msToSecondStr(ms: number, fixed: number = 0) {
        let s = ms / 1000;
        if (s % 1 == 0) {
            fixed = 0;
        }
        return s.toFixed(fixed) + (I18nManager.ins().isChinese() ? "秒" : "s");
    }

    /**转成xx小时后 */
    static formatTimeMsHourOrmin(diffTimeMs: number): string {
        //转成小时
        const msPerMinute = 60 * 1000;
        const msPerHour = msPerMinute * 60;
        //小于一分钟 显示一分钟
        if (diffTimeMs < msPerMinute) {
            return I18nManager.ins().isChinese() ? "1分钟后" : "1m";
        }
        //小于1小时显示分钟
        if (diffTimeMs < msPerHour) {
            return Math.round(diffTimeMs / msPerMinute) + (I18nManager.ins().isChinese() ? "分钟后" : "m");
        }

        return Math.round(diffTimeMs / msPerHour) + (I18nManager.ins().isChinese() ? "小时后" : "h");
    }

    /**毫秒转 hh:mm:ss */
    static formatTimeMsToDayHourMinuteSecond(diffTimeMs: number): string {
        const msPerMinute = 60 * 1000;
        const msPerHour = msPerMinute * 60;
        const msPerDay = msPerHour * 24;
        const days = Math.floor(diffTimeMs / msPerDay);
        const hours = Math.floor((diffTimeMs % msPerDay) / msPerHour);
        const minutes = Math.floor((diffTimeMs % msPerHour) / msPerMinute);
        const seconds = Math.floor((diffTimeMs % msPerMinute) / 1000);

        let day = I18nManager.ins().translate(TimeI18nKeys.timeUnitDay);
        let hour = I18nManager.ins().translate(TimeI18nKeys.timeUnitHour);
        let second = I18nManager.ins().translate(TimeI18nKeys.timeUnitSecond);

        if (days > 0) {
            return `${this.padZero(days)}${day}${this.padZero(hours)}${hour}`;
        } else {
            return `${this.padZero(hours)}:${this.padZero(minutes)}:${this.padZero(seconds)}`;
        }

        return "00:00:00";
    }

    /**
     * 10天12小时10分
     * @param diffTimeMs
     */
    static formatTimeMsToDayHourMinuteCN(diffTimeMs: number): string {
        const msPerMinute = 60 * 1000;
        const msPerHour = msPerMinute * 60;
        const msPerDay = msPerHour * 24;
        const days = Math.floor(diffTimeMs / msPerDay);
        const hours = Math.floor((diffTimeMs % msPerDay) / msPerHour);
        const minutes = Math.floor((diffTimeMs % msPerHour) / msPerMinute);
        const seconds = Math.floor((diffTimeMs % msPerMinute) / 1000);

        let unitDay = I18nManager.ins().translate(TimeI18nKeys.timeUnitDay);
        let unitHour = I18nManager.ins().translate(TimeI18nKeys.timeUnitHour);
        let unitMinute = I18nManager.ins().translate(TimeI18nKeys.timeUnitMinute);

        return `${this.padZero(days)}${unitDay}${this.padZero(hours)}${unitHour}${this.padZero(minutes)}${unitMinute}`;
    }

    /**毫秒转 hh时mm分ss秒 */
    static formatTimeMsToDayHourMinuteSecond1(diffTimeMs: number): string {
        const msPerMinute = 60 * 1000;
        const msPerHour = msPerMinute * 60;
        const msPerDay = msPerHour * 24;
        const days = Math.floor(diffTimeMs / msPerDay);
        const hours = Math.floor((diffTimeMs % msPerDay) / msPerHour);
        const minutes = Math.floor((diffTimeMs % msPerHour) / msPerMinute);
        const seconds = Math.floor((diffTimeMs % msPerMinute) / 1000);

        let day = I18nManager.ins().translate(TimeI18nKeys.timeUnitDay);
        let hour = I18nManager.ins().translate(TimeI18nKeys.timeUnitHour);
        let minute = I18nManager.ins().translate(TimeI18nKeys.timeUnitMinute);
        let second = I18nManager.ins().translate(TimeI18nKeys.timeUnitSecond);

        if (days > 0) {
            return `${days}${day}${hours}${hour}${minutes}${minute}${seconds}${second}`;
        } else if (hours > 0) {
            return `${hours}${hour}${minutes}${minute}${seconds}${second}`;
        } else if (minutes > 0) {
            return `${minutes}${minute}${seconds}${second}`;
        } else if (seconds >= 0) {
            return `${seconds}${second}`;
        }
        return "0";
    }

    /**毫秒转 hh时mm分 */
    static formatTimeMsToDayHourMinuteSecond2(diffTimeMs: number): string {
        const msPerMinute = 60 * 1000;
        const msPerHour = msPerMinute * 60;
        const msPerDay = msPerHour * 24;
        //时间
        const days = Math.floor(diffTimeMs / msPerDay);
        const hours = Math.floor((diffTimeMs % msPerDay) / msPerHour);
        const minutes = Math.floor((diffTimeMs % msPerHour) / msPerMinute);
        const seconds = Math.floor((diffTimeMs % msPerMinute) / 1000);

        //字
        let day = I18nManager.ins().translate(TimeI18nKeys.timeUnitDay);
        let hour = I18nManager.ins().translate(TimeI18nKeys.timeUnitHour);
        let minute = I18nManager.ins().translate(TimeI18nKeys.timeUnitMinute);
        let second = I18nManager.ins().translate(TimeI18nKeys.timeUnitSecond);

        if (days > 0) {
            return `${this.padZero(days)}${day}${this.padZero(hours)}${hour}`;
        } else {
            return `${this.padZero(hours)}:${this.padZero(minutes)}:${this.padZero(seconds)}`;
        }
    }

    /**毫秒转 hh时mm分ss秒 ，去掉右边所有的0数字*/
    static formatTimeMsToDayHourMinuteSecond3(diffTimeMs: number): string {
        const msPerMinute = 60 * 1000;
        const msPerHour = msPerMinute * 60;
        const msPerDay = msPerHour * 24;
        const days = Math.floor(diffTimeMs / msPerDay);
        const hours = Math.floor((diffTimeMs % msPerDay) / msPerHour);
        const minutes = Math.floor((diffTimeMs % msPerHour) / msPerMinute);
        const seconds = Math.floor((diffTimeMs % msPerMinute) / 1000);


        let fmtArr: (number | string)[] = [];
        let second = I18nManager.ins().translate(TimeI18nKeys.timeUnitSecond);
        if(seconds > 0) {
            fmtArr.push(second, seconds);
        }
        if(minutes > 0){
            let minute = I18nManager.ins().translate(TimeI18nKeys.timeUnitMinute);
            fmtArr.push(minute, minutes);
        }
        if(hours > 0){
            let hour = I18nManager.ins().translate(TimeI18nKeys.timeUnitHour);
            fmtArr.push(hour, hours);
        }
        if(days > 0){
            let day = I18nManager.ins().translate(TimeI18nKeys.timeUnitDay);
            fmtArr.push(day, days);
        }

        if(fmtArr.length == 2 &&  minutes > 0){
            //只有 *分 的情况，改成 *分钟
            fmtArr[0] = I18nManager.ins().translate(TimeI18nKeys.timeUnitMinute2);
        }
        if(fmtArr.length > 0) {
            return fmtArr.reverse().join("");
        } else {
            return `0${second}`;
        }
    }

    static padZero(num: number): string {
        return num < 10 ? `0${num}` : `${num}`;
    }

    /**
     * 将间隔毫秒 -> 天数 | 间隔天数从 1 开始
     * @param diffTimeMs
     */
    static convertTimeMsToHumanDay(diffTimeMs: number): number {
        const day = diffTimeMs / (24 * 60 * 60 * 1000);

        return Math.floor(Math.max(0, day)) + 1;
    }

    /**
     * 好友在线时间显示
     * @param diffTimeMs
     */
    static formatDiffTimeMsToFriendOfflineTimeText(diffTimeMs: number): string {
        const msPerMinute = 60 * 1000;
        const msPerHour = msPerMinute * 60;
        const msPerDay = msPerHour * 24;

        if (diffTimeMs < msPerHour) {
            const minutes = Math.round(diffTimeMs / msPerMinute);
            return `${minutes}分钟前`;
        } else if (diffTimeMs < msPerDay) {
            const hours = Math.round(diffTimeMs / msPerHour);
            return `${hours}小时前`;
        } else {
            const days = Math.round(diffTimeMs / msPerDay);
            return `${days}天前`;
        }
    }

    /**
     * 玩家信息还有多久过期
     * @param diffTimeMs
     */
    static formatRestTimeMsForExpirePlayerInfo(diffTimeMs: number): string {
        const msPerMinute = 60 * 1000;
        const msPerHour = msPerMinute * 60;
        const msPerDay = msPerHour * 24;

        if (diffTimeMs < msPerHour) {
            const minutes = Math.round(diffTimeMs / msPerMinute);
            return `${minutes}分`;
        } else if (diffTimeMs < msPerDay) {
            const hours = Math.round(diffTimeMs / msPerHour);
            return `${hours}时`;
        } else {
            const days = Math.round(diffTimeMs / msPerDay);
            return `${days}天`;
        }
    }

    /**下周一的时间*/
    static getTimeNextMonday(serverTimestamp: number): number {
        // 将服务器时间戳转换为Date对象
        const now = new Date(serverTimestamp);
        // 获取当前星期几（0 是星期日，1 是星期一，以此类推）
        const dayOfWeek = now.getDay();
        // 计算距离下周一的天数差
        // 如果今天是周日，距离下周一就是1天
        // 如果今天是周一，那么下周一就是7天后
        const daysUntilNextMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
        // 计算下周一的日期
        const nextMonday = new Date(now);
        nextMonday.setDate(now.getDate() + daysUntilNextMonday);
        // 清除时分秒毫秒，以确保时间戳对应的是下周一的0点
        nextMonday.setHours(0, 0, 0, 0);
        // 返回下周一的Unix时间戳
        return nextMonday.getTime();
    }

    /**计算距离下周一零点的天数 小时 */
    static getTimeUntilNextMonday(serverTimestamp: number) {
        // 下一个周一的日期 (时间设为 00:00)
        let nextMonday = this.getTimeNextMonday(serverTimestamp)
        
        // 获取距离下一个周一零点的时间差
        const timeDifference = nextMonday - serverTimestamp;
        const remainingDays = Math.floor(timeDifference / (1000 * 60 * 60 * 24)); // 剩余天数
        const remainingHours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)); // 剩余小时
    
        return { remainingDays, remainingHours };
    }

    /** 年-月-日 getTime */
    static getTimeForYear(timestamp: number): string {
        // 创建一个Date对象
        const date = new Date(timestamp); // 时间戳通常是秒级的，需要乘以1000转换为毫秒级

        // 获取年月日
        const year = date.getFullYear();
        const month = ("0" + (date.getMonth() + 1)).slice(-2); // 月份是从0开始的，需要+1，并且格式化为两位数
        const day = ("0" + date.getDate()).slice(-2); // 获取天，并格式化为两位数

        // 返回格式化的日期
        return `${year}-${month}-${day}`;
    }
}

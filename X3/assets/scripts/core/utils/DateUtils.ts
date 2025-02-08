/**
 * 时间格式化工具
 */
export class DateUtils {


    /**秒 */
    static readonly secTimes: number = 1000;
    /**分 */
    static readonly minTimes: number = 60 * DateUtils.secTimes;
    /**时 */
    static readonly hoursTimes: number = 60 * DateUtils.minTimes;
    /**天 */
    static readonly dayTimes: number = 24 * DateUtils.hoursTimes;
    /**月 */
    static readonly monTimes: number = 30 * DateUtils.dayTimes;
    /**年 */
    static readonly yearTimes: number = 365 * DateUtils.dayTimes;

    /**
     * 根据yyyyMMddHHmmss形式的日期字符串转换为毫秒数
     * @return
     * */
    static dateStringToTime(dateStr) {
        let year = (dateStr.slice(0, 4));
        let month = (dateStr.slice(4, 6)) - 1;
        let date = (dateStr.slice(6, 8));
        let hours = (dateStr.slice(8, 10));
        let minutes = (dateStr.slice(10, 12));
        let seconds = (dateStr.slice(12));
        let tmpDate = new Date(year, month, date, hours, minutes, seconds, 0);
        return tmpDate.getTime();
    }

    /**
     * 格式化yyyy-mm-dd hh:mm:ss 形式的日期字符串转换为毫秒数
     * @param dateStr
     * @return
     *
     */
    static dateStringToTime2(dateStr) {
        return this.dateStringToTime(dateStr.replace(/[^0-9]/g, ""));
    }

    /**
     * 格式化时间显示
     * @param msec 总时间，单位为毫秒
     * @param fmt 时间格式
     * 这里传递进来的是一个总时间，不是时间戳，表示共有多少年、多少个月，多少天，多少个小时，多少秒
     * 例如：
     * 1、timeFormat(10000,"YYYY年MM月dd日 h:m:s") 输出：'0年00月00日 0:0:10'：表示共有10秒
     * 2、timeFormat(10000000000,"YYYY年MM月dd日 h:m:s") '0年03月25日 17:46:40' 表示共有3个月，25天，17个小时，46分40秒
     */
    static totalTimeFormat(msec: number, fmt: string = "YY-MM-dd h:m:s"): string {

        let c = (n, times) => {
            let count = Math.floor(n / times);
            if (count !== 0) msec -= count * times;
            return count;
        }

        let yearCount = c(msec, this.yearTimes);
        let monCount = c(msec, this.monTimes);
        let dayCount = c(msec, this.dayTimes);
        let hourCount = c(msec, this.hoursTimes);
        let minCount = c(msec, this.minTimes);
        let secCount = c(msec, this.secTimes);

        let d: boolean = true;

        let format = (value) => {
            value = (value).toString();
            fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 2 ? value < 10 ? "0" + value : value : value);
        }

        if (/(Y+)/.test(fmt)) {
            format(yearCount);
            d = false;
        }

        if (/(M+)/.test(fmt)) {
            format(d ? yearCount * 12 + monCount : monCount);
            d = false;
        }

        if (/(d+)/.test(fmt)) {
            format(d ? (yearCount * 12 + monCount) * 30 + dayCount : dayCount);
            d = false;
        }

        if (/(h+)/.test(fmt)) {
            format(d ? ((yearCount * 12 + monCount) * 30 + dayCount) * 24 + hourCount : hourCount);
            d = false;
        }

        if (/(m+)/.test(fmt)) {
            format(d ? (((yearCount * 12 + monCount) * 30 + dayCount) * 24 + hourCount) * 60 + minCount : minCount);
            d = false;
        }

        if (/(s+)/.test(fmt)) {
            format(d ? ((((yearCount * 12 + monCount) * 30 + dayCount) * 24 + hourCount) * 60 + minCount) * 60 + secCount : secCount);
        }
        return fmt;
    }


    /**
     * 时间格式化,可以支持任何格式的时间，只需要通过format参数指定你想要的格式化
     * @param value 时间戳，单位为毫秒
     * @param format 时间格式
     * 这里传递进来的是一个时间戳
     *
     * 例如：
     * 1、dateTimeFormat(Date.now(),"YY年MM月dd日 h:m:s") 输出：'21年11月02日 14:21:52'
     * 2、dateTimeFormat(Date.now(),"YY年MM月dd日 h时m分s秒") 输出：'21年11月02日 14时21分52秒'
     * 3、dateTimeFormat(Date.now(),"h时m分s秒") 输出 '14时22分41秒'
     * 4、dateTimeFormat(Date.now(),"s秒") 输出：'3秒'
     * 5、dateTimeFormat(Date.now(),"ss秒") 输出：'03秒'
     * 6、dateTimeFormat(Date.now(),"h时") 输出：'3时
     * 7、dateTimeFormat(Date.now(),"hh时") 输出：'03时'
     * 8、dateTimeFormat(Date.now(),"yy年") 输出：'21年'
     * 9、dateTimeFormat(Date.now(),"yyyy年") 输出：'2021年'
     */
    static dateTimeFormat(value: number, format: string = "yyyy-MM-dd hh:mm:ss"): string {
        let date = new Date(value);
        if (date) {
            let template = {
                "M+": date.getMonth() + 1,
                "d+": date.getDate(),
                "h+": date.getHours(),
                "m+": date.getMinutes(),
                "s+": date.getSeconds(),
                "q+": Math.floor((date.getMonth() + 3) / 3),
                "S+": date.getMilliseconds()
            };
            if (/(y+)/i.test(format)) {
                format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
            }
            for (let key in template) {
                if (new RegExp("(" + key + ")").test(format)) {
                    format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? template[key] : ("00" + template[key]).substr(("" + template[key]).length));
                }
            }
            return format;
        }
    }

    /**
     * 获取当前的时间文本
     */
    static getCurrentDateTimeText(format: string = "yyyy-MM-dd hh:mm:ss"): string {
        return this.dateTimeFormat(Date.now(), format);
    }

    /**
     * 解析日期 | 在 0 时区
     * @param value
     * @param format
     */
    static parseDateInZeroTimeZoneToStr(value: number | Date, format: string = "yyyy-MM-dd HH:mm:ss"): string {
        const timestamp = value instanceof Date ? value.getTime() : value;
        const utcTimestamp = timestamp - new Date().getTimezoneOffset() * 60 * 1000; // 减去本地时区偏移
        const date = new Date(utcTimestamp);

        const pad = (n: number) => (n < 10 ? "0" + n : n); // 填充函数，确保两位数字

        const formatter: Record<string, () => string | number> = {
            yyyy: () => date.getFullYear(),
            yy: () => date.getFullYear().toString().slice(-2), // 后两位年份
            MM: () => pad(date.getMonth() + 1),
            M: () => date.getMonth() + 1,
            dd: () => pad(date.getDate()),
            d: () => date.getDate(),
            HH: () => pad(date.getHours()), // 24 小时制
            H: () => date.getHours(),
            hh: () => pad(date.getHours() % 12 || 12), // 12 小时制
            h: () => date.getHours() % 12 || 12,
            mm: () => pad(date.getMinutes()),
            m: () => date.getMinutes(),
            ss: () => pad(date.getSeconds()),
            s: () => date.getSeconds(),
        };

        return format.replace(/([a-zA-Z]+)/g, (_, key) => {
            const replacer = formatter[key];
            if (replacer) return replacer().toString();
            return _;
        });
    }


    /**
     * 当前时间戳
     */
    static getCurrentEpochTimeMs(): number {
        return Date.now();
    }

    /**
     * 基于当前时间戳, 获取下一个 hour 重置所在的时间戳
     * @param currentEpochTimeMs 当前时间戳 ms
     * @param nextResetHour 下一个重置时间的小时数 hour
     * @return 下一个重置时间的时间戳 ms
     */
    static getNextResetTimeByResetHour(currentEpochTimeMs: number, nextResetHour: number) {
        let currentDate = new Date(currentEpochTimeMs);
        let nextResetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), nextResetHour, 0, 0, 0);
        if (nextResetDate < currentDate) {
            nextResetDate.setDate(nextResetDate.getDate() + 1);
        }
        return nextResetDate.getTime();
    }

    /**
     * 获取当前时间戳，小时为 0 的时间戳
     * @param currentEpochTimeMs
     */
    static getCurrentTimeMsByHourZero(currentEpochTimeMs: number) {
        return this.getCurrentTimeMsByHour(currentEpochTimeMs, 0);
    }

    static getCurrentTimeMsByHour(currentEpochTimeMs: number, yourHour: number) {
        let currentDate = new Date(currentEpochTimeMs);
        let nextResetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), yourHour, 0, 0, 0);
        return nextResetDate.getTime();
    }

    /**
     * 解析日期时间字符串为时间戳（毫秒数）
     * @param dateTimeText - 要解析的日期时间字符串
     * @param format - 日期时间字符串的格式，例如 "yyyy-MM-dd HH:mm:ss"
     * @returns 解析后的时间戳（毫秒数）
     */
    static parseDateTimeTextToTimeMs(dateTimeText: string, format: string): number {
        const datePattern = /yyyy|MM|dd|HH|mm|ss/g;
        const dateComponents: { [key: string]: number } = {
            yyyy: 0,
            MM: 1,
            dd: 1,
            HH: 0,
            mm: 0,
            ss: 0
        };

        let dateString = dateTimeText;

        // 格式
        format.match(datePattern)?.forEach((component, index) => {
            const position = format.indexOf(component);
            const value = parseInt(dateTimeText.substr(position, component.length), 10);
            dateComponents[component] = value;
        });

        // 构建日期对象
        const date = new Date(
            dateComponents.yyyy,
            dateComponents.MM - 1,
            dateComponents.dd,
            dateComponents.HH,
            dateComponents.mm,
            dateComponents.ss
        );

        return date.getTime();
    }

    // 差异天数
    static diffDays(createTimeMs: number, curTimeMs: number): number {
        const diffTimeMs = curTimeMs - createTimeMs;
        const diffDays = Math.abs(diffTimeMs / DateUtils.dayTimes);
        return Math.floor(diffDays);
    }

    /**
     * 是否同一天
     * @param timeMs1
     * @param timeMs2
     */
    static isSameDayByTimeMs(timeMs1: number, timeMs2: number): boolean {
        const diffDays = this.diffDays(timeMs1, timeMs2);
        return diffDays == 0;
    }

    /**是第几天 createTimeMs为第一天0点*/
    static dayCount(createTimeMs: number, curTimeMs: number): number {
        const diffTimeMs = curTimeMs - createTimeMs;
        const diffDays = Math.abs(diffTimeMs / DateUtils.dayTimes);
        return Math.ceil(diffDays);
    }

    static getNextDayRestTimeMs(curTimeMs: number): number {
        const nextResetTimeByResetHour = DateUtils.getNextResetTimeByResetHour(curTimeMs, 0);
        return Math.max(0, nextResetTimeByResetHour - curTimeMs);
    }
}
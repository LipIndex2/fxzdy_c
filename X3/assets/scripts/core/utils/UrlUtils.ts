export default class UrlUtils {

    public static isFightDebug = "isFightDebug";
    /***只会普攻 */
    public static isOnlyNormalAttack = "isOnlyNormalAttack";
    /***怪物不攻击 */
    public static isMonsterNotAttack = "isMonsterNotAttack";
    /***不产生伤害 */
    public static isAllNotHurt = "isAllNotHurt";
    /***上阵后只显示某个英雄 */
    public static onlyHero = "onlyHero";
    /** 不现实引导 */
    public static Guide = "Guide"
    /** 显示战斗的测试范围 */
    public static ShowBattleRange = "ShowBattleRange"
    /** 显示战斗输出 */
    public static ShowBattleLog = "ShowBattleLog"
    /** 固定随机种子 */
    public static RandomSeed = "RandomSeed"

    private static urlParams: { [key: string]: any };

    static hasUrlParam(name: string): boolean {
        if (this.urlParams)
            return this.urlParams[name] ? true : false

        this.initUrlParams()
        return this.urlParams[name] ? true : false
    }

    /***获取浏览器参数 */
    static getURLQuery(name: string) {
        if (this.urlParams)
            return this.urlParams[name]

        this.initUrlParams()
        return this.urlParams[name]
    }

    private static initUrlParams(): void {
        this.urlParams = {};
        let url = window.location.href;
        const paramStr: string | undefined = url.split('?')[1];
        if (paramStr) {
            const regex: RegExp = /([^&=]+)=([^&]*)/g;
            let match: RegExpExecArray | null;
            while ((match = regex.exec(paramStr)) !== null) {
                this.urlParams[decodeURIComponent(match[1])] = decodeURIComponent(match[2]);
            }
        }
    }
}
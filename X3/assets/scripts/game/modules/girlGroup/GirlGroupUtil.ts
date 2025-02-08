/**
 * 女团工具类
 */
export class GirlGroupUtil {
    /** 获取加密后的玩家名字 */
    public static getPasswordName(name: string): string {
        if (name.length > 2) {
            let first = name.slice(0, 2);
            let c = name.length - 2;
            let star = "";
            for (let i = 0; i < c; i++) {
                star = star + "*";
            }
            return first + star;
        } else if (name.length == 2) {
            return name[0] + "*";
        }
        return name;
    }
}

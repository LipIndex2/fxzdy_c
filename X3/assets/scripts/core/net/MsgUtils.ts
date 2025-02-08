import { Constructor } from "cc";

/**
 * 公用接口
 */
export class MsgUtils {
    /** 获取基础的发送给服务端的C2S对象 */
    public static getVo<T>(voCls: Constructor<T>): T {
        var obj = Object.create(null);
        return obj;
    }
}

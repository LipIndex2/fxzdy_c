import { Constructor } from "cc";
import * as fgui from "fairygui-cc";


export class FguiScriptUtils {

    /**
     * 转为我的脚本类
     * @param fguiObj
     * @param myClass
     */
    static toMyScriptClass<T>(fguiObj: fgui.GComponent, myClass: Constructor<T>): T {
        return fguiObj as T;
    }
}
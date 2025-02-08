import * as fgui from "fairygui-cc";
import { UIView } from "../mvc/view/UIView";
import { UIBindingKey } from "db://assets/scripts/core/mvc/ui/UIBindingKey";

/**
 * 游戏 UI 脚本绑定管理器
 * */
export default class UIScriptManager {

    // <uiName, UIView script>
    private static _map: Map<string, typeof UIView> = new Map();


    /**
     * 绑定脚本 by 对象
     * @param bindingKey
     */
    static bindScriptByBindingKeyObj(bindingKey: UIBindingKey<UIView>) {
        return this.bindScript(bindingKey.key, bindingKey.uiClass as typeof UIView);
    }

    /**
     * 脚本绑定 ui 名
     * @param uiName
     * @param script
     */
    static bindScript(uiName: string, script: typeof UIView) {
        if (!this._map[uiName]) {
            this._map[uiName] = script;
        }
    }

    /**
     * 获取脚本组件类
     * @param uiName
     */
    static getViewScriptClass(uiName: string): typeof UIView {
        return this._map[uiName];
    }

    /**
     * get/create 脚本组件实例
     * 懒加载用
     * */
    static newViewScript(uiName: string): UIView {
        return this._map[uiName] && new this._map[uiName];
    }


}
/**ui绑定装饰器 */
export function bindScript(uiName: string) {

    return function (target: typeof UIView) {
        UIScriptManager.bindScript(uiName, target);
    }
}

/**
 * 绑定fgui到类
 * 脚本 继承fgui.GComponent | 如果是 FGUI类型是button 脚本也必须继承 fgui.GButton
 * @param componentPath 组件路径 "ui://comm/component"
 */
export function bindFguiExtension(componentPath: string) {
    return function (target: typeof fgui.GComponent) {
        fgui.UIObjectFactory.setExtension(componentPath, target);
    }
}
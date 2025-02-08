import { Constructor } from "cc";
import { UIView } from "db://assets/scripts/core/mvc/view/UIView";
import UIScriptManager from "db://assets/scripts/core/comm/UIScriptManager";

/**
 * UI 绑定 Key
 * 优势:
 * 1. 强类型
 * 2. 全自动注册 UIView
 *
 * ps:
 * 1. 配合 UIManager 使用, 提供强类型
 */
export class UIBindingKey<T extends UIView> {

    // 代替以前的 UIView Key
    readonly key: string;

    // 绑定的 UI 脚本类
    readonly uiClass: Constructor<T>

    private constructor(key: string, uiClass: Constructor<T>) {
        this.key = key;
        this.uiClass = uiClass;
    }

    /**
     * 创建 UI 绑定 Key
     * @param key
     * @param uiClass
     */
    static create<T extends UIView>(key: string, uiClass: Constructor<T>): UIBindingKey<T> {
        if (key == null || key.trim() == "") {
            console.error("UI 绑定 key 不允许为 null.")
            return null;
        }
        if (uiClass == null) {
            console.error("UI 绑定 key 对应的 UIView Class 不允许为 null.")
            return null;
        }

        const uiBindingKey = new UIBindingKey<T>(key, uiClass);

        // 注册到 UI 脚本管理器
        UIScriptManager.bindScriptByBindingKeyObj(uiBindingKey);

        //console.log(`注册 UIView 脚本到了 UIScriptManager! uiKey = ${key}, uiClass = ${uiClass.name}`)
        return uiBindingKey;
    }
}
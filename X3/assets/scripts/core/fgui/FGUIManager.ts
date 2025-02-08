import { Constructor, Font, Layers } from "cc";
import * as fgui from "fairygui-cc";
import BaseSingleton from "../base/BaseSingleton";
import FGUILoader from "./com/FGUILoader";
import { FGUIPkgLoader } from "./FGUIPkgLoader";
import { Res } from "../res/Res";


/**
 * fgui管理器
 */
export default class FGUIManager extends BaseSingleton {

    public init(): void {
        //fgui.GRoot.inst.node.layer = Layers.Enum.DEFAULT;
        //console.log(fgui.GRoot.inst.node);
        //console.log(Layers.Enum);

        // FGUI 优先级调整
        //fgui.GRoot.inst.node.setSiblingIndex(0)

        Res.setResLoader("fgui", FGUIPkgLoader);
        this.initExtension();
    }

    /**
     * 初始化扩展类
     */
    private initExtension(): void {
        fgui.UIObjectFactory.setLoaderExtension(FGUILoader);
    }

    public registerFont(font: Font): void {
        let fontName = "default";
        fgui.registerFont(fontName, font);
        fgui.UIConfig.defaultFont = fontName;
    }

    /**
     * 绑定fgui到类
     * @param componentPath 组件路径 "ui://comm/component"
     * @param script 脚本 继承fgui.GComponent | 如果是 FGUI button 必须对应回 GButton
     */
    public bindScript<T extends fgui.GComponent>(componentPath: string, script: Constructor<T>) {
        fgui.UIObjectFactory.setExtension(componentPath, script);
    }
}
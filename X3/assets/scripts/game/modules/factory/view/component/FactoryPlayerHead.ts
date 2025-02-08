import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";

/**
 * 星际工厂玩家头像信息
 */
@bindFguiExtension('ui://factory/FactoryPlayerHead')
export class FactoryPlayerHead extends fgui.GComponent {

    static pkgName: string = "factory";
    static viewName: string = "FactoryPlayerHead";

    private get view(): ui.factory.component.FactoryPlayerHead {
        return this as any;
    }

    /***组件初始化 */
    protected onInit(): void {

    }

    protected onPreDispose(): void {

    }
}
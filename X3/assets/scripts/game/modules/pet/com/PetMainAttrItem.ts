import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import { AttrConfigEffect } from "../../attr/structs/AttrConfigEffect";



/** 宠物属性item */
@bindFguiExtension("ui://pet/PetMainAttrItem")
export class PetMainAttrItem extends fgui.GComponent {
    static pkgName: string = "pet";
    static viewName: string = "PetMainAttrItem";

    private get view(): ui.pet.com.PetMainAttrItem {
        return this as any;
    }

    //更新UI信息
    public updateInfo(data: AttrConfigEffect, active: 0 | 1) {
        let view = this.view;
        view.iconLoader.icon = data.getIconPath();
        view.lbValue.text = data.getShowValueTextWithSymbol();
        view.lbName.text = "队伍" + data.config.attrName;

        view.getController("active").selectedIndex = active;
    }
}
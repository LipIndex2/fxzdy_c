import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import { AttrConfigEffect } from "../../attr/structs/AttrConfigEffect";

/**
 * 战队科技主属性
 */
@bindFguiExtension('ui://captainSkill/CaptionSkillLvMainAttrItem')
export class CaptionSkillLvMainAttrItem extends fgui.GButton {
    static pkgName: string = "captainSkill";
    static viewName: string = "CaptionSkillLvMainAttrItem";

    protected _captainId: number = 0;

    private get view(): ui.captainSkill.main.CaptionSkillLvMainAttrItem {
        return this as any;
    }

    protected onInit(): void {

    }

    protected onPreDispose(): void {

    }

    public setData(attrs: { k: any, v: any }, nextAttrs: { k: any, v: any }) {
        if (nextAttrs) {
            //有下一级
            this.view.getController('state').selectedIndex = 0;
            let nextAttrEffect = AttrConfigEffect.create(nextAttrs.k, nextAttrs.v);
            this.view.lbNext.text = nextAttrEffect.getValueStringForUIShow();
        } else {
            this.view.getController('state').selectedIndex = 1;
        }
        let attrEffect = null;
        if (attrs) {
            attrEffect = AttrConfigEffect.create(attrs.k, attrs.v);
        } else if (nextAttrs) {
            attrEffect = AttrConfigEffect.create(nextAttrs.k, 0);
        }
        if (attrEffect) {
            this.view.lbNow.text = attrEffect.getValueStringForUIShow();
            this.view.iconAttr.icon = attrEffect.getIconPath();
            this.view.lbName.text = attrEffect.getAttrName();
        }
    }
}
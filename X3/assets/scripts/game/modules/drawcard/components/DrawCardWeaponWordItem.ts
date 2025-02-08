import * as fgui from "fairygui-cc";
import { AttrData } from "db://assets/scripts/game/modules/attr/AttrManager";
import { AttrConfigManager } from "db://assets/scripts/game/modules/attr/config/AttrConfigManager";
import { AttrUtils } from "db://assets/scripts/game/modules/attr/utils/AttrUtils";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";


enum EnumGainItemType {
    item = 0,
    hero = 1,
    weapon = 2,
}


/**
 * 抽卡获得道具
 */
@bindFguiExtension("ui://drawCard/DrawCardWeaponWordItem")
export class DrawCardWeaponWordItem extends fgui.GComponent {

    protected onConstruct() {
        super.onConstruct();
    }


    private get view(): ui.drawCard.item.DrawCardWeaponWordItem {
        return this as any;
    }

    reset(attrData: AttrData) {
        if (!attrData) {
            return;
        }

        const attrId = attrData.id;
        const attributeConfig = AttrConfigManager.getConfigById(attrId);
        if (!attributeConfig) {
            console.error(`配置有误. 不存在 attributeId=${attrId}`);
            return;
        }
        // text
        this.view.labelLeft.text = attributeConfig?.attrName || "null";

        this.view.labelRight.text = AttrUtils.getShowAttrValue(attrData);
    }
}
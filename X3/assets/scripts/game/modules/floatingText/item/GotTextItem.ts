import * as fgui from "fairygui-cc";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { tween } from "cc";
import { FloatingTextType, TextData } from "../FloatingTextManager";
import { AudioManager, SoundType } from "../../../comm/mgr/AudioManager";
import G from "../../../../core/comm/G";
import { StringUtils } from "../../../../core/utils/StringUtils";
import { ModelNode } from "../../common/node/ModelNode";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";

/** 飘字Fgui item */
@bindFguiExtension("ui://floatingText/GotTextItem")
export class GotTextItem extends fgui.GComponent {
    static create() {
        return fgui.UIPackage.createObject("floatingText", "GotTextItem") as GotTextItem;
    }

    private get view(): ui.floatingText.item.GotTextItem {
        return this as any;
    }

    constructor() {
        super();
    }

    protected onPreDispose() {
    }

    /** 飘字数据 */
    setData(textData: TextData) {
        this.showTips(textData);
    }

    private showTips(textData: TextData) {
        let self = this.view;

        self.height = 65;
        let item = ItemUtils.getItemConfigByItemId(textData.itemId);
        self.T_item.text = item.name;
        self.img_item.icon = item.smallIconPath;
        if (textData.num > 0) {
            self.T_num.text = "+" + textData.num;
        } else {
            self.T_num.text = "" + textData.num;
        }
    }
}

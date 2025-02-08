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
@bindFguiExtension("ui://floatingText/AttrTextItem")
export class AttrTextItem extends fgui.GComponent {

    static create() {
        return fgui.UIPackage.createObject("floatingText", "AttrTextItem") as AttrTextItem;
    }

    private get view(): ui.floatingText.item.AttrTextItem {
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
        self.height = 32;
        self.T_attrCount.text = textData.attrText;
    }
}

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
@bindFguiExtension("ui://floatingText/AreaTextItem")
export class AreaTextItem extends fgui.GComponent {

    static create() {
        return fgui.UIPackage.createObject("floatingText", "AreaTextItem") as AreaTextItem;
    }

    private get view(): ui.floatingText.item.AreaTextItem {
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
        self.height = 76;
        self.T_area.text = textData.areaText;
        this.setAreaBGTween();
    }

    /** 区域背景效果 */
    setAreaBGTween() {
        this.view.area_bg1.scaleY = this.view.area_bg2.scaleY = 0;
        tween(this.view.area_bg1).to(0.2, { scaleY: 1 }).delay(1.2).to(0.2, { scaleY: 0 }).start();

        tween(this.view.area_bg2).to(0.2, { scaleY: 1 }).delay(1.2).to(0.2, { scaleY: 0 }).start();
    }
}

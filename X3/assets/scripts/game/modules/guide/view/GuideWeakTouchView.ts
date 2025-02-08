import { UIView } from "../../../../core/mvc/view/UIView";
import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";

import { GuideWeakTouchArgs, UIGuideConfig } from "../const/UIGuideConfig";
import UIScriptManager from "../../../../core/comm/UIScriptManager";
import * as fgui from "fairygui-cc";
import { ModelNode } from "../../common/node/ModelNode";
import { GuideUtils } from "../GuideUtils";

/**弱引导 手指点击 */
export class GuideWeakTouchView extends UIView {
    static pkgName: string = "guide";
    static viewName: string = "GuideWeakTouchView";
    protected _layer = EnumUIViewLayer.GUIDE;

    private _modelNode: ModelNode;

    private get view(): ui.guide.view.GuideWeakTouchView {
        return this._view as any;
    }

    protected onInit(): void {
        this._modelNode = this.view.modelNode as any;
        this._modelNode = this.view.modelNode as ModelNode;
        this._modelNode.loadByModelId(10010013);
        this._modelNode.animNode?.setPosition(45, -55); //手指偏移

        fgui.GRoot.inst.on(fgui.Event.TOUCH_BEGIN, this.onClick, this);
    }

    protected onOpen(data: GuideWeakTouchArgs): void {
        let item = GuideUtils.getUIClickItem(data.viewName, data.itemName);
        if (!item) this.closeSelf();

        let rect = GuideUtils.getUIRect(item);
        if (!rect) this.closeSelf();

        this._modelNode.setPosition(rect.center.x, rect.center.y);
        this._modelNode.visible = true;
        this._modelNode.play("idle", true);

        this._modelNode.scaleX = this.view.width - rect.center.x < 100 ? -1 : 1;
    }

    private onClick() {
        this.closeSelf();
    }
}

UIScriptManager.bindScript(UIGuideConfig.GuideWeakTouchView, GuideWeakTouchView)
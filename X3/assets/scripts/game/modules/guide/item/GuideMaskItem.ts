import * as fgui from "fairygui-cc";
import { ModelNode } from "../../common/node/ModelNode";
import { Rect } from "cc";
import FGUIManager from "../../../../core/fgui/FGUIManager";
import { ColorUtils } from "../../../../core/utils/ColorUtils";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";

/** 点击屏蔽组件 */

@bindFguiExtension("ui://guide/GuideMaskItem")
export class GuideMaskItem extends fgui.GComponent {
    static pkgName: string = "guide";
    static viewName: string = "GuideMaskItem";

    private get view(): ui.guide.item.GuideMaskItem {
        return this as any;
    }

    constructor() {
        super();
    }

    onInit() {
        this.view.btn_mask.x = -2000;
        this.view.img_mask.alpha = 0;
        this.view.visible = false;
    }

    /**
     * 是否有屏蔽点击
     */
    public isMask() {
        return this.view.visible;
    }

    /**隐藏 */
    public hide() {
        this.view.visible = false;
    }

    /**
     * 设置点击状态 (仅强制点击)
     * @param isMask 是否阻挡点击
     * @param rect 
     */
    public show(cfg: table.guide.GuideConfig, rect?: Rect) {
        if (!cfg.isForce) {
            this.hide();
            return;
        }

        if (rect) {
            this.updateRect(rect);
        } else {
            //全不可点击
            this.view.btn_mask.x = -2000;
        }
        this.view.visible = true;
        this.view.img_mask.alpha = (cfg.maskAlpha || 50) / 100;
    }

    /**
     * 全屏蔽
     */
    public maskTouch() {
        this.view.visible = true;
        this.view.btn_mask.x = -2000;
        this.view.img_mask.alpha = 0.005; //全透明 //0 原生有bug
    }

    /**更新范围 */
    public updateRect(rect: Rect) {
        if (rect) {
            //指定区域可以点击
            //遮罩
            this.view.btn_mask.x = rect.center.x;
            this.view.btn_mask.y = rect.center.y;
            this.view.btn_mask.width = rect.width;
            this.view.btn_mask.height = rect.height;
        }
    }
}
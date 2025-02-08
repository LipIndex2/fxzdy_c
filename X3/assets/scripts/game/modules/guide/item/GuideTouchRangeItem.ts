import * as fgui from "fairygui-cc";
import { ModelNode } from "../../common/node/ModelNode";
import { Rect } from "cc";
import { GuideMaskItem } from "./GuideMaskItem";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { TimeManager } from "../../../../core/time/TimeManager";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";

/** 引导点击框 */
@bindFguiExtension("ui://guide/GuideTouchRangeItem")
export class GuideTouchRangeItem extends fgui.GComponent {
    static pkgName: string = "guide";
    static viewName: string = "GuideTouchRangeItem";

    private _modelNode: ModelNode;
    private _animTimeKey: string;

    private get view(): ui.guide.item.GuideTouchRangeItem {
        return this as any;
    }

    constructor() {
        super();
    }

    protected onInit() {
        this._modelNode = this.view.modelNode as ModelNode;
        this._modelNode.loadByModelId(10010013);
        this._modelNode.animNode?.setPosition(45, -55); //手指偏移
        this._modelNode.setEventListener(this.onEvent.bind(this));
        //this._modelNode.visible = false;
    }

    public hide() {
        this.visible = false;
        this.view.boxGp.visible = false;
        //this._modelNode.visible = false;
        this._modelNode.stop();
    }

    /**显示点击 */
    public show(cfg: table.guide.GuideConfig, rect: Rect) {
        this.updateRect(rect);

        if (cfg.fingerPos && cfg.fingerPos.length >= 3) {
            //手指修正
            this._modelNode.x += cfg.fingerPos[0];
            this._modelNode.y += cfg.fingerPos[1];
            this._modelNode.scaleX = cfg.fingerPos[2];
        }

        this.visible = true;
        this._modelNode.visible = true;
        this._modelNode.play("idle", true);

        this.view.animBox.alpha = 0;
        this.view.boxGp.visible = !!cfg.isForce;
    }

    /**更新范围 */
    public updateRect(rect: Rect) {
        if (rect) {
            //位置大小
            this.setPosition(rect.center.x, rect.center.y);
            this.width = rect.width;
            this.height = rect.height;
        }
    }

    private onEvent(eventName: string) {
        if (eventName === "touchEvent") {
            this.rangeAnim();
        }
    }

    /**动画时长 */
    private animTime = 500;
    /**动画幅度 */
    private MaxDeltaSize = 40;

    /**范围动画 */
    private rangeAnim() {
        this.view.animBox.width = this.width + 46;
        this.view.animBox.height = this.height + 46;
        this.view.animBox.alpha = 1;
        GameTimer.ins().clearByKey(this._animTimeKey);
        this._animTimeKey = GameTimer.ins().frameLoop(1, this, () => {
            let deltaMs = TimeManager.frameDeltaMs;
            let alpha = this.view.animBox.alpha - (1 / this.animTime * deltaMs);
            let size = this.MaxDeltaSize / this.animTime * deltaMs;
            if (alpha <= 0) {
                alpha = 0;
                GameTimer.ins().clearByKey(this._animTimeKey);
            }
            this.view.animBox.alpha = alpha;
            this.view.animBox.width += size;
            this.view.animBox.height += size;
        });
    }

    onPreDispose() {
        GameTimer.ins().clearAll(this);
    }
}
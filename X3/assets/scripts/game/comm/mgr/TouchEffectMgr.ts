import BaseSingleton from "../../../core/base/BaseSingleton";
import { SpineUnitNode } from "../battle/node/SpineUnitNode";
import * as fgui from "fairygui-cc";
import { AudioManager, SoundType } from "./AudioManager";

/***
 * 点击特效
 */
export class TouchEffectMgr extends BaseSingleton {

    private touchX: number = 0;
    private touchY: number = 0;
    private isMoved: boolean = false
    private touchEffectNode: SpineUnitNode;
    public init(): void {
        this.touchEffectNode = new SpineUnitNode();
        this.touchEffectNode.loadByModelId(10010012)

        let fguiRootNode = fgui.GRoot.inst.node;
        fguiRootNode.on(fgui.Event.TOUCH_BEGIN, this.onTouch, this)
        fguiRootNode.on(fgui.Event.TOUCH_END, this.onTouchEnd, this)

        this.touchEffectNode.active = false;
    }

    private onTouch(evt: fgui.Event): void {
        this.isMoved = false
        let x = evt.pos.x;
        let y = -evt.pos.y;
        this.touchX = x;
        this.touchY = y;
        fgui.GRoot.inst.node.off(fgui.Event.TOUCH_MOVE, this.onTouchMove, this)
        fgui.GRoot.inst.node.on(fgui.Event.TOUCH_MOVE, this.onTouchMove, this)
    }

    private onTouchMove(evt: fgui.Event): void {
        let x = evt.pos.x;
        let y = -evt.pos.y;

        if (Math.abs(this.touchX - x) > 20 || Math.abs(this.touchY - y) > 20) {
            this.isMoved = true;
            fgui.GRoot.inst.node.off(fgui.Event.TOUCH_MOVE, this.onTouchMove, this)
        }
    }

    private onTouchEnd(evt: fgui.Event): void {
        fgui.GRoot.inst.node.off(fgui.Event.TOUCH_MOVE, this.onTouchMove, this)

        if (!this.isMoved) {
            let x = evt.pos.x;
            let y = -evt.pos.y;
            this.touchEffectNode.setPosition(x, y)
            this.touchEffectNode.replay()
            fgui.GRoot.inst.node.addChild(this.touchEffectNode);
            this.touchEffectNode.active = true;
            AudioManager.ins().playSoundDelay(30, SoundType.click)
        }
    }
}
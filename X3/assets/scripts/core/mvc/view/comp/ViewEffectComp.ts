import { tween } from "cc";
import * as fgui from "fairygui-cc";
import { UIView } from "../UIView";
import { ViewBaseComp } from "./ViewBaseComp";
import { Tween } from "cc";
import { GameTimer } from "../../../timer/GameTimer";
/**
 * 界面特效组件
 */
export class ViewEffectComp extends ViewBaseComp<UIView> {
    public static className = "ViewEffectComp";

    protected mcList: fgui.GComponent[];
    protected tweenList: Tween<any>[];
    public constructor(mcList: fgui.GComponent[]) {
        super()
        this.mcList = mcList;
        this.tweenList = []
    }

    public onOpen(): void {
        fgui.GRoot.inst.touchable = false;
        this.removeAllTween();
        for (let i = 0; i < this.mcList.length; i++) {
            let pivotX = this.mcList[i].pivotX;
            let pivotY = this.mcList[i].pivotY;
            let mc = this.mcList[i]
            mc.pivotX = mc.pivotY = 0.5;
            let tweenObj = tween(mc)
                .to(0.1, { scaleX: 1.04, scaleY: 1.04 })
                .to(0.1, { scaleX: 1, scaleY: 1 })
                .call(() => {
                    if (!mc.isDisposed) {
                        mc.pivotX = pivotX;
                        mc.pivotY = pivotY;
                    }
                })
                .start()
            this.tweenList.push(tweenObj)
        }

        GameTimer.ins().once(300, this, () => {
            fgui.GRoot.inst.touchable = true;
        })
    }

    protected removeAllTween(): void {
        for (let tween of this.tweenList) {
            tween.stop()
        }
    }

    protected doDispose(): void {
        this.removeAllTween();
        GameTimer.ins().clearAll(this);
        fgui.GRoot.inst.touchable = true;
    }
}
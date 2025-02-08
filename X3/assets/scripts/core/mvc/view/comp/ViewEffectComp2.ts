import { tween, Tween, TweenEasing } from "cc";
import * as fgui from "fairygui-cc";
import { GameTimer } from "../../../timer/GameTimer";
import { UIView } from "../UIView";
import { ViewBaseComp } from "./ViewBaseComp";

export interface IViewEffectCompExtraParam {
    /**初始缩放比例*/
    initScale?: number;
    /**放大时间*/
    interval?: number;
    /**背景动画延时*/
    bgDelay?: number;
    /**背景动画时间*/
    bgInterval?: number;
    /**动画曲线*/
    easing?: TweenEasing;
}
/**
 * 界面特效组件2
 */
export class ViewEffectComp2 extends ViewBaseComp<UIView> {
    public static className = "ViewEffectComp2";

    protected view: fgui.GObject;
    protected bg: fgui.GObject;
    protected tweenList: Tween<any>[];

    protected _param: IViewEffectCompExtraParam = {
        initScale: 0.4,
        interval: 0.12,
        bgDelay: 0.1,
        bgInterval: 0.2,
        easing: 'linear',
    }

    public constructor(view: fgui.GObject, bg: fgui.GObject, param?: IViewEffectCompExtraParam) {
        super()
        this.view = view;
        this.bg = bg;
        this.tweenList = [];
        if (param) {
            for (let key in param) {
                this._param[key] = param[key];
            }
        }
    }

    public onOpen(): void {
        fgui.GRoot.inst.touchable = false;
        this.removeAllTween();
        let pivotX = this.view.pivotX;
        let pivotY = this.view.pivotY;
        let mc = this.view;
        mc.pivotX = mc.pivotY = 0.5;
        mc.setScale(this._param.initScale, this._param.initScale);
        let tweenObj = tween(mc)
            .to(this._param.interval, { scaleX: 1, scaleY: 1 }, { easing: this._param.easing })
            .call(() => {
                if (!mc.isDisposed) {
                    mc.pivotX = pivotX;
                    mc.pivotY = pivotY;
                }
            })
            .start();
        this.tweenList.push(tweenObj);

        this.bg.alpha = 0;
        let tweenBg = tween(this.bg)
            .delay(this._param.bgDelay)
            .to(this._param.bgInterval, { alpha: 0.75 })
            .start()
        this.tweenList.push(tweenBg);

        let delay: number = Math.max(300, this._param.interval * 1000);
        GameTimer.ins().once(delay, this, () => {
            fgui.GRoot.inst.touchable = true;
        })
    }

    protected removeAllTween(): void {
        for (let tween of this.tweenList) {
            tween.stop();
        }
    }

    protected doDispose(): void {
        this.removeAllTween();
        GameTimer.ins().clearAll(this);
        fgui.GRoot.inst.touchable = true;
    }
}
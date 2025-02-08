import { tween, Tween } from "cc";
import * as fgui from "fairygui-cc";
import { EnumUIColor } from "../../ui/EnumUIColor";
import { GameTimer } from "../../../timer/GameTimer";
import { UIView } from "../UIView";
import { ViewBaseComp } from "./ViewBaseComp";
/**
 * 界面特效组件2
 */
export class ViewFlatEffectComp extends ViewBaseComp<UIView> {
    public static className = "ViewFlatEffectComp";

    protected _centerGroup: string = ''
    protected _hasLight: boolean = false
    protected _light: fgui.GGraph;
    public constructor(centerGroup: string, hasLight: boolean = false) {
        super()
        this._centerGroup = centerGroup
        this._hasLight = hasLight
    }

    /***初始化完毕 */
    public onInit(): void {
        if (this._hasLight) {
            this._light = new fgui.GGraph();
            this._light.width = fgui.GRoot.inst.width
            this._light.setPivot(0.5, 0.5, true);
            let viewCenterGroup = this.viewCenterGroup
            if (viewCenterGroup) {
                this._light.height = Math.max(200, viewCenterGroup.height - 200)
                let centerY = viewCenterGroup.y + viewCenterGroup.height * (0.5 - viewCenterGroup.pivotY)
                this._light.setPosition(fgui.GRoot.inst.width / 2, centerY)
            } else {
                this._light.height = 200
                this._light.setPosition(fgui.GRoot.inst.width / 2, fgui.GRoot.inst.height / 2)
            }


            const fillColor = EnumUIColor.WHITE
            this._light.drawRect(1, fillColor, fillColor)
        }
    }

    public onOpen(): void {
        fgui.GRoot.inst.touchable = false;
        this.removeAllTween();
        this.setViewBlackBgCompVisible(false);
        const view = this.owner._view
        let pivotX = view.pivotX;
        let pivotY = view.pivotY;
        view.pivotX = view.pivotY = 0.5;
        view.scaleY = 0;
        tween(view).to(0.22, { scaleY: 1 }).call(() => {
            if (!view.isDisposed) {
                view.pivotX = pivotX;
                view.pivotY = pivotY;
                this.setViewBlackBgCompVisible(true);
            }
        }).start();

        let viewCenterGroup = this.viewCenterGroup
        if (viewCenterGroup) {
            viewCenterGroup.alpha = 0;
            tween(viewCenterGroup).delay(0.1).to(0.1, { alpha: 1 }).start();
        }
        if (this._light) {
            this.owner._view.addChildAt(this._light, 1);
            this._light.visible = true
            this._light.scaleX = 0;
            tween(this._light).to(0.1, { scaleX: 1, height: 10, alpha: 0.4 }).to(0.1, { alpha: 0, height: 700 }).call(() => {
                if (this._light?.node?.isValid) {
                    this._light.visible = false
                }
            }).start();
        }

        GameTimer.ins().once(300, this, () => {
            fgui.GRoot.inst.touchable = true;
        })
    }

    protected get viewCenterGroup(): fgui.GObject {
        if (this._centerGroup && this.owner._view[this._centerGroup]) {
            return this.owner._view[this._centerGroup]
        }
        return null
    }

    /**设置背景隐藏展示*/
    protected setViewBlackBgCompVisible(bool: boolean): void {
        let bg = this.owner._view.getChild('ViewBlackBgComp')
        if (bg) {
            bg.visible = bool
        }
    }

    protected removeAllTween(): void {
        Tween.stopAllByTarget(this.owner._view)
        let viewCenterGroup = this.viewCenterGroup
        if (viewCenterGroup) {
            Tween.stopAllByTarget(viewCenterGroup)
        }
        if (this._light) {
            Tween.stopAllByTarget(this._light)
        }
    }

    public playCloseEffect(): void {
        this.setViewBlackBgCompVisible(false);
        this.removeAllTween();

        const view = this.owner._view
        let pivotX = view.pivotX;
        let pivotY = view.pivotY;
        view.pivotX = view.pivotY = 0.5;
        tween(view)
            .to(0.15, { scaleY: 0 })
            .call(() => {
                if (!view.isDisposed) {
                    view.pivotX = pivotX;
                    view.pivotY = pivotY;
                    UIView.prototype.closeSelf.call(this.owner);
                }
            })
            .start();

        let viewCenterGroup = this.viewCenterGroup
        if (viewCenterGroup) {
            viewCenterGroup.alpha = 1;
            tween(viewCenterGroup).to(0.1, { alpha: 0 }).start();
        }
        if (this._light) {
            this.owner._view.addChildAt(this._light, 1);
            this._light.alpha = 0;
            tween(this._light).to(0.1, { alpha: 1, height: 20 }).to(0.05, { scaleX: 0 }).start();
        }

    }
    protected doDispose(): void {
        this.removeAllTween();
        GameTimer.ins().clearAll(this);
        fgui.GRoot.inst.touchable = true;
    }
}
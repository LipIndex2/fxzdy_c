import { UIView } from "../UIView";
import { ViewBaseComp } from "./ViewBaseComp";
import * as fgui from "fairygui-cc";
import { GameTimer } from "../../../timer/GameTimer";
import { Color } from "cc";
import { EnumUIColor } from "../../ui/EnumUIColor";
import { Handler } from "../../../utils/Handler";

/**
 * 界面黑幕组件
 */
export class ViewBlackBgComp extends ViewBaseComp<UIView> {
    public static className = "ViewBlackBgComp";

    static BACKGROUND_MASK_COLOR = new Color(0, 0, 0, 192)


    private _canCloseTime = 0;
    private _canCloseByBg: boolean = true;

    public clickCallBack: Handler;

    public bg: fgui.GGraph;
    public constructor (leastTime: number = 0, canCloseByBg: boolean = true) {
        super();
        this._canCloseTime = Date.now() + leastTime;
        this._canCloseByBg = canCloseByBg;
    }

    /***初始化完毕 */
    public onInit(): void {
        this.bg = new fgui.GGraph();
        this.bg.width = fgui.GRoot.inst.width;
        this.bg.height = fgui.GRoot.inst.height;
        this.bg.pivotX = this.bg.pivotY = 0.5;
        this.bg.scaleX = 1.1;
        this.bg.scaleY = 1.5;
        this.bg.name = 'ViewBlackBgComp';
        const fillColor = EnumUIColor.COLOR_FOR_BACKGROUND_MASK;
        this.bg.drawRect(1, fillColor, fillColor);
        this.owner._view.opaque = false;
    }

    public onOpen(): void {
        this.owner._view.addChildAt(this.bg, 0);
        //this.owner._view.parent.addChildAt(this.bg, this.owner._view.parent.getChildIndex(this.owner._view));
        //this.owner._view.node.parent.insertChild(this.bg.node, this.owner._view.node.parent.children.length - 1)
        //this.owner._view.node.parent.addChild(this.bg.node);
        //this.bg.node.setSiblingIndex(this.owner._view.node.getSiblingIndex());

        this.bg.onClick(this.onClickAny, this);
        GameTimer.ins().callLater(this, () => {
            fgui.GRoot.inst.inputProcessor.cancelAllTouches();
        })
    }

    public set canCloseByBg(value:boolean) {
        this._canCloseByBg = value;
    }

    private onClickAny(event: fgui.Event) {
        if (!this._canCloseByBg) return;
        if (this._canCloseTime > Date.now()) return;
        if (this.clickCallBack) {
            this.clickCallBack.run()
            return
        }
        this.owner.closeSelf();
    }

    protected doDispose(): void {
        this.bg.dispose()
    }
}
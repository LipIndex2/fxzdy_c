import { Node } from "cc";
import { HurtNumType } from "../../enum/BattleEnum";
import BattleShowFactory from "../../factory/BattleShowFactory";
import * as fgui from "fairygui-cc";
import { Tween } from "cc";
import FGUICocosNodeComponent from "../../../../../core/fgui/com/FGUICocosNodeComponent";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";

/**伤害飘字组件 */
@bindFguiExtension("ui://battleNum/MaterialNum")
export class BattleNum extends FGUICocosNodeComponent {

    /***全局的飘字大小 */
    static ScaleValue: number = 1.6
    static pkgName: string = "battleNum";
    public type: HurtNumType
    protected tran: fgui.Transition
    protected get view(): any {
        return this as any;
    }

    public init(): void {
    }

    setValue(str: string) {
        this.view.numText.scaleX = this.view.numText.scaleY = 1.3;
        this.view.numText.text = str;
        this.tweenHandler();
    }

    protected onRmove(): void {
        Tween.stopAllByTarget(this.view);
        if (this.tran)
            this.tran.stop()
    }

    setParam(...arg: any): void {

    }

    protected tweenHandler(): void {
        this.tran = this.view.getTransition("t");
        this.tran.play(this.onPlayEnd.bind(this));
    }

    onPlayEnd() {
        // this.view.numText.text = "";
        this.removeFromParent()
        BattleShowFactory.recoveryBattleNum(this)
    }

    protected onPreDispose() {
        this.onRmove();
    }
}
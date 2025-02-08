import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { BattleNum } from "./BattleNum";

@bindFguiExtension("ui://battleNum/OtherNum")
export class OtherNum extends BattleNum {
    private otherType: string;
    protected get view(): ui.battleNum.num.OtherNum {
        return this as any;
    }

    setParam(type: string): void {
        this.otherType = type
        this.view.scaleY = this.view.scaleX = 0.8
    }

    setValue(str: string) {
        this.view.img.icon = "image/battleFont/" + this.otherType;
        this.tweenHandler();
    }

    protected tweenHandler(): void {
        this.tran = this.view.getTransition("t");
        this.tran.play(this.onPlayEnd.bind(this));
    }
}
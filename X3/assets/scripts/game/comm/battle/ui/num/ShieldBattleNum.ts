import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { BattleNum } from "./BattleNum";


@bindFguiExtension("ui://battleNum/ShieldNum")
export class ShieldBattleNum extends BattleNum {

    protected get view(): ui.battleNum.num.ShieldNum {
        return this as any;
    }

    private isUp: boolean;
    setParam(upDown: number): void {
        this.isUp = upDown == 1;
    }

    setValue(str: string) {
        super.setValue(str)
        this.view.numText.scaleX = this.view.numText.scaleY = 0.85
    }

    protected tweenHandler(): void {
        this.tran = this.view.getTransition(this.isUp ? "t" : "d");
        this.tran.play(this.onPlayEnd.bind(this));
    }
}
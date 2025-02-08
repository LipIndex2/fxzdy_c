import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { BattleNum } from "./BattleNum";

@bindFguiExtension("ui://battleNum/NormalHurtNum")
export class NormalHurtNum extends BattleNum {
    private damageScaleType: number
    protected get view(): ui.battleNum.num.NormalHurtNum {
        return this as any;
    }

    setParam(arg: any[]): void {
        this.damageScaleType = arg[1];
        let scale = 0.6;
        if (this.damageScaleType == 2) {
            this.view.scaleY = this.view.scaleX = 1.6 * scale
        }
        else if (this.damageScaleType == 3) {
            this.view.scaleY = this.view.scaleX = 1.8 * scale
        }
        else {
            this.view.scaleY = this.view.scaleX = 1.4 * scale
        }
    }

    protected tweenHandler(): void {
        this.tran = this.view.getTransition("d");
        this.tran.play(this.onPlayEnd.bind(this));
    }
}
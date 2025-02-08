import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { BattleNum } from "./BattleNum";

@bindFguiExtension("ui://battleNum/CritNum")
@bindFguiExtension("ui://battleNum/CritRealHurtNum")
export class CirtBattleNum extends BattleNum {

    private cirtType: number;
    setParam(cirtType: number): void {
        this.cirtType = cirtType;
    }

    protected tweenHandler(): void {
        this.tran = this.view.getTransition("t" + this.cirtType);
        this.tran.play(this.onPlayEnd.bind(this));
    }
}
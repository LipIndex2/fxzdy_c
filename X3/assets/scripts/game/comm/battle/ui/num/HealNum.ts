import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { HurtNumType } from "../../enum/BattleEnum";
import { BattleNum } from "./BattleNum";

/**伤害飘字组件 */
@bindFguiExtension("ui://battleNum/HealNum")
export class HealNum extends BattleNum {

    /***全局的飘字大小 */
    static ScaleValue: number = 1.6
    static pkgName: string = "battleNum";
    public type: HurtNumType
    protected get view(): any {
        return this as any;
    }

    setValue(str: string) {
        super.setValue(str)
        this.view.numText.scaleX = this.view.numText.scaleY = 0.8
    }
}
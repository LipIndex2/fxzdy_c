import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommonKey } from "../const/UICommonConfig";
import { BtnConfirmView } from "./BtnConfirmView";

/**
 * 警告层 二次确认框
 */
@bindScript(UICommonKey.BtnConfirmWarnView)
export class BtnConfirmWarnView extends BtnConfirmView {
    protected _layer: EnumUIViewLayer = EnumUIViewLayer.WARN;
}
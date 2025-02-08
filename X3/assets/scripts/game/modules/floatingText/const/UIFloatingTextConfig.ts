import UIScriptManager from "../../../../core/comm/UIScriptManager";
import { GetItemAnimView } from "../../common/view/GetItemAnimView";
import { FloatingTextView } from "../view/FloatingTextView";

/** 飘字 */
export enum UIFloatingTextKey {
    FLOATING_TEXT_MAIN_VIEW = "FLOATING_TEXT_MAIN_VIEW",
    GET_ITEM_ANIM = "GET_ITEM_ANIM",
 }
 
//  UIScriptManager.bindScript(UIFloatingTextKey.FLOATING_TEXT_MAIN_VIEW, FloatingTextView);
 UIScriptManager.bindScript(UIFloatingTextKey.GET_ITEM_ANIM, GetItemAnimView);
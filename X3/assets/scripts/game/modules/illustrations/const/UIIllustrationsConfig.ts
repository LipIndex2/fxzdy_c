import UIScriptManager from "../../../../core/comm/UIScriptManager";
import { IllustrationsMainWin } from "../view/IllustrationsMainWin";
import { IllustrationsRewardWin } from "../view/IllustrationsRewardWin";

export enum UIIllustrationsKey {
    /** 图鉴主页 */
    ILLUSTRATIONS_MAIN_VIEW = "ILLUSTRATIONS_MAIN_VIEW",
    /** 图鉴奖励 */
    ILLUSTRATIONS_REWARD_VIEW = "ILLUSTRATIONS_REWARD_VIEW",
}

UIScriptManager.bindScript(UIIllustrationsKey.ILLUSTRATIONS_MAIN_VIEW, IllustrationsMainWin)
UIScriptManager.bindScript(UIIllustrationsKey.ILLUSTRATIONS_REWARD_VIEW, IllustrationsRewardWin)
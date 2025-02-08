import UIScriptManager from "../../../../core/comm/UIScriptManager";
import { FriendBattleResultWin } from "../view/FriendBattleResultWin";
import { FriendMainWin } from "../view/FriendMainWin";

export enum UIFriendConfig {
    /** 好友主界面 */
    FRIEND_MAIN_VIEW = "FRIEND_MAIN_VIEW",
    /** 好友切磋结果界面 */
    FRIEND_BATTLE_RESULT_VIEW = "FRIEND_BATTLE_RESULT_VIEW",
}

UIScriptManager.bindScript(UIFriendConfig.FRIEND_MAIN_VIEW, FriendMainWin);
UIScriptManager.bindScript(UIFriendConfig.FRIEND_BATTLE_RESULT_VIEW, FriendBattleResultWin);
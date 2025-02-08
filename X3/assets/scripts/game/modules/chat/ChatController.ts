import { _decorator, } from 'cc';
import BaseSingleton from "db://assets/scripts/core/base/BaseSingleton";
import FGUIManager from "db://assets/scripts/core/fgui/FGUIManager";
import { ChatTabBtn } from "db://assets/scripts/game/modules/chat/components/ChatTabBtn";
import { ChatPlayerAvatarComp } from "db://assets/scripts/game/modules/chat/components/ChatPlayerAvatarComp";
import { ChatTypeChooseBoxBtn } from "db://assets/scripts/game/modules/chat/components/ChatTypeChooseBoxBtn";
import { ChatOneRowComp } from "db://assets/scripts/game/modules/chat/components/ChatOneRowComp";
import { ChatLeftItemBtn } from "db://assets/scripts/game/modules/chat/components/ChatLeftItemBtn";
import { ChatContentPage } from "db://assets/scripts/game/modules/chat/page/ChatContentPage";
import { ChatSettingsPage } from "db://assets/scripts/game/modules/chat/page/ChatSettingsPage";
import { ChatEmojiTypeBtn } from "db://assets/scripts/game/modules/chat/components/ChatEmojiTypeBtn";
import { ChatEmojiBtn } from "db://assets/scripts/game/modules/chat/components/ChatEmojiBtn";
import { ChatEmojiWin } from "db://assets/scripts/game/modules/chat/win/ChatEmojiWin";

const {ccclass, property} = _decorator;

export class ChatController extends BaseSingleton {

    onInit(): void {
        // 绑定脚本给组件
        FGUIManager.ins().bindScript("ui://chat/ChatLeftItemBtn", ChatLeftItemBtn);
        FGUIManager.ins().bindScript("ui://chat/ChatTabBtn", ChatTabBtn);
        FGUIManager.ins().bindScript("ui://chat/ChatPlayerAvatarComp", ChatPlayerAvatarComp);
        FGUIManager.ins().bindScript("ui://chat/ChatTypeChooseBoxBtn", ChatTypeChooseBoxBtn);
        FGUIManager.ins().bindScript("ui://chat/ChatContentPage", ChatContentPage);
        FGUIManager.ins().bindScript("ui://chat/ChatEmojiTypeBtn", ChatEmojiTypeBtn);
        FGUIManager.ins().bindScript("ui://chat/ChatEmojiBtn", ChatEmojiBtn);
        FGUIManager.ins().bindScript("ui://chat/ChatEmojiWin", ChatEmojiWin);
    }

}

ChatController.ins();
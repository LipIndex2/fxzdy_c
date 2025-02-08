import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { PlayerInfoConfigManager } from "db://assets/scripts/game/modules/player/config/PlayerInfoConfigManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";

export class SettingsChooseCache {
    titleId: number = 0;
    headIconId: number = 0;
    headFrameId: number = 0;
    imageId: number = 0;
    // 聊天背景
    chatBoxId: number = 0;
    // 聊天字体
    chatFontId: number = 0;

    refresh() {
        FacadeManager.ins().emit(NotificationKey.SETTINGS_CHOOSE_REFRESH);
    }

    reset() {
        this.titleId = PlayerInfoConfigManager.getConfigArrayInSortByType(ServerEnums.ShowInfoType.TITLE)[0]?.id || 0;
        this.headIconId = PlayerInfoConfigManager.getConfigArrayInSortByType(ServerEnums.ShowInfoType.HEAD_ICON)[0]?.id || 0;
        this.headFrameId = PlayerInfoConfigManager.getConfigArrayInSortByType(ServerEnums.ShowInfoType.HEAD_FRAME)[0]?.id || 0;
        this.imageId = PlayerInfoConfigManager.getConfigArrayInSortByType(ServerEnums.ShowInfoType.IMAGE)[0]?.id || 0;
        this.chatBoxId = PlayerInfoConfigManager.getConfigArrayInSortByType(ServerEnums.ShowInfoType.CHAT_BOX)[0]?.id || 0;
        this.chatFontId = PlayerInfoConfigManager.getConfigArrayInSortByType(ServerEnums.ShowInfoType.CHAT_WORD_COLOR)[0]?.id || 0;

        this.refresh();
    }
}
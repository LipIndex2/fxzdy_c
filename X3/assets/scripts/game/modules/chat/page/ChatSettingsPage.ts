import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import { ChatTypeChooseBoxBtn } from "db://assets/scripts/game/modules/chat/components/ChatTypeChooseBoxBtn";
import { ChatConfigManager } from "db://assets/scripts/game/modules/chat/config/ChatConfigManager";
import { ChatI18nKeys } from "db://assets/scripts/game/modules/chat/ChatI18nKeys";
import { UIManager } from "db://assets/scripts/core/mvc/UIManager";
import { PlayerUIKeys } from "db://assets/scripts/game/modules/player/PlayerUIKeys";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import { ChatSkinUtils } from "db://assets/scripts/game/modules/chat/utils/ChatSkinUtils";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { PlayerAvatar } from "db://assets/scripts/game/modules/common/playerInfo/PlayerAvatar";
import GIns from "db://assets/scripts/game/GIns";

@bindFguiExtension("ui://chat/ChatSettingsPage")
export class ChatSettingsPage extends FGUI.GComponent implements INotification {

    private _configArray: table.chat.ChatChannelConfig[];

    listenNotifications(): string[] {
        return [
            NotificationKey.CHAT_SKIN_CLOSE_SETTING_VIEW,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.CHAT_SKIN_CLOSE_SETTING_VIEW: {
                this.reset();
            }
        }
    }


    private get view(): ui.chat.page.ChatSettingsPage {
        return this as any;
    }

    protected onConstruct() {
        super.onConstruct();


        this.view.btnEdit.onClick(this.onClickEdit, this);

        this.view.labelTips.text = ChatI18nKeys.mianDaRaoTips;

        FacadeManager.ins().registerNotification(this);
        this.view.btnList.itemRenderer = this.irBtn.bind(this);

        this.view.avatar.touchable = false;
        
        this.reset();
    }

    onClickEdit() {
        // chat skin ui
        UIManager.ins().open(PlayerUIKeys.PlayerInfoChangeChatSkinView);
    }

    protected onPreDispose() {
        FacadeManager.ins().removeNotification(this);

        super.onPreDispose();

    }

    irBtn(index: number,
          btn: ChatTypeChooseBoxBtn
    ) {
        const config = this._configArray[index];
        btn.reset(config);
    }

    private reset() {
        // btn 频道
        this._configArray = ChatConfigManager.getAllChannelConfigArray();
        this.view.btnList.numItems = this._configArray.length;

        // 预览说话
        // chat font
        this.view.labelFakeChatMsg.color = ChatSkinUtils.getMyChatFontColor();
        // chat box
        this.view.imageChatBg.icon = ChatSkinUtils.getMyChatBgIconPath();


        FguiScriptUtils.toMyScriptClass(this.view.avatar, PlayerAvatar)
            .resetMe();

        this.view.labelPlayerName.text = GIns.playerModel.playerName;
    }
}
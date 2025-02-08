import { bindScript } from "db://assets/scripts/core/comm/UIScriptManager";
import { PlayerUIKeys } from "db://assets/scripts/game/modules/player/PlayerUIKeys";
import { PlayerInfoChatSkinTabBtn } from "db://assets/scripts/game/modules/player/btn/PlayerInfoChatSkinTabBtn";
import { SettingsModel } from "db://assets/scripts/game/modules/settings/model/SettingsModel";
import { SettingsContext } from "db://assets/scripts/game/modules/settings/context/SettingsContext";
import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";

/**
 * 玩家信息
 */
@bindScript(PlayerUIKeys.PlayerInfoChangeChatSkinView)
export class PlayerInfoChangeChatSkinView extends UICommWin {

    static pkgName: string = "playerInfo";
    static viewName: string = "PlayerInfoChangeChatSkinView";

    private _tabArray = [
        "颜色",
        "气泡",
    ]

    private get view(): ui.playerInfo.PlayerInfoChangeChatSkinView {
        return this._view as any;
    }


    listenNotifications(): string[] {
        return [
            // NotificationKey.PLAYER_INFO_REQ_DONE,
        ];
    }


    notificationHandler(event: string, args?: any) {
        switch (event) {
            // case NotificationKey.CHANGE_NAME:
            //     this.reset();
            //     break;
        }
    }

    public onInit(): void {
        const context: SettingsContext = SettingsModel.ins().context;
        context.chooseCache.reset();


        this.view.getController("subView").selectedIndex = 0;

        this.view.tabList.itemRenderer = this.irTab.bind(this);
        this.view.tabList.numItems = 2;
    }

    irTab(index: number, btn: PlayerInfoChatSkinTabBtn) {
        const name = this._tabArray[index];

        if (index == 0) {
            btn.fireClick();
        }
        btn.reset(this, index, name);
    }

    public onOpen(): void {
        this.reset();

    }

    protected onClose(dontDispose: boolean = false) {
        FacadeManager.ins().emit(NotificationKey.CHAT_SKIN_CLOSE_SETTING_VIEW);
    }

    private reset() {
        const context: SettingsContext = SettingsModel.ins().context;


    }

    clickTab(index: number) {
        this.view.getController("subView").selectedIndex = index;


    }
}

import { bindScript } from "db://assets/scripts/core/comm/UIScriptManager";
import { PlayerUIKeys } from "db://assets/scripts/game/modules/player/PlayerUIKeys";
import { PlayerInfoTabBtn } from "db://assets/scripts/game/modules/player/btn/PlayerInfoTabBtn";
import { SettingsModel } from "db://assets/scripts/game/modules/settings/model/SettingsModel";
import { SettingsContext } from "db://assets/scripts/game/modules/settings/context/SettingsContext";
import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";

/**
 * 玩家信息
 */
@bindScript(PlayerUIKeys.PlayerInfoChangeMainView)
export class PlayerInfoChangeMainView extends UICommWin {

    static pkgName: string = "playerInfo";
    static viewName: string = "PlayerInfoChangeMainView";

    private _tabArray = [
        "头像",
        "头像框",
        "称号",
        "形象",
    ]

    private get view(): ui.playerInfo.PlayerInfoChangeMainView {
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
        // context.chooseCache.reset();


        this.view.getController("subView").selectedIndex = 0;

        this.view.tabList.itemRenderer = this.irTab.bind(this);
        this.view.tabList.numItems = 4;
    }

    irTab(index: number, btn: PlayerInfoTabBtn) {
        const name = this._tabArray[index];

        if (index == 0) {
            btn.fireClick();
        }
        btn.reset(this, index, name);
    }

    public onOpen(): void {
        this.reset();

    }

    private reset() {
        const context: SettingsContext = SettingsModel.ins().context;

        const titleId = context.getTitleId();

    }

    clickTab(index: number) {
        this.view.getController("subView").selectedIndex = index;


    }
}

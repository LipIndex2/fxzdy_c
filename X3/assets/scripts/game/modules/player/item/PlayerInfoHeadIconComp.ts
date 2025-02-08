import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import { SettingsModel } from "db://assets/scripts/game/modules/settings/model/SettingsModel";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { HeroManager } from "db://assets/scripts/game/modules/hero/HeroManager";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";

@bindFguiExtension("ui://playerInfo/PlayerInfoHeadIconComp")
export class PlayerInfoHeadIconComp extends FGUI.GComponent implements INotification {


    private _config: table.set.SetShowConfig;

    get view(): ui.playerInfo.item.PlayerInfoHeadIconComp {
        return this as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.SETTINGS_CHOOSE_REFRESH
        ]
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.SETTINGS_CHOOSE_REFRESH: {
                this.reset(this._config);

                break;
            }
        }
    }

    protected onConstruct() {
        super.onConstruct();


        this.view.getController("isLock").selectedIndex = 0;
        this.view.getController("isChoose").selectedIndex = 0;
        this.view.getController("isWear").selectedIndex = 0;

        this.view.onClick(() => {

            const context = SettingsModel.ins().context;

            if (this._config) {
                context.chooseCache.headIconId = this._config.id;

                context.chooseCache.refresh();
            }
        }, this);
    }


    reset(config: table.set.SetShowConfig) {
        if (!config) {
            return
        }
        this._config = config;
        const settingsId = config?.id || 0;

        const context = SettingsModel.ins().context;

        this.view.avatar.imagePlayerAvatar.icon = config?.assetPath;


        // 需要拥有这个英雄

        let isHave = true;
        const heroId = config.heroId;
        if (heroId > 0) {
            isHave = HeroManager.ins().isHaveHero(heroId);
        }

        const isNotExpire = !context.isExpire(settingsId);
        this.view.getController("isLock").selectedIndex = (isHave && isNotExpire) ? 0 : 1;


        const headIconId = context.getHeadIconId();
        const isWear = headIconId === settingsId;
        this.view.getController("isWear").selectedIndex = isWear ? 1 : 0;

        // 是否选中
        const isChoose = context.chooseCache.headIconId == settingsId;
        this.view.getController("isChoose").selectedIndex = isChoose ? 1 : 0;

        FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom).reset(RedDotKeys.Set_skin_head_item, [config.id])
    }
}
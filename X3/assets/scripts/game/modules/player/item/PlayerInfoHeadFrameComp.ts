import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import { SettingsModel } from "db://assets/scripts/game/modules/settings/model/SettingsModel";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";

@bindFguiExtension("ui://playerInfo/PlayerInfoHeadFrameComp")
export class PlayerInfoHeadFrameComp extends FGUI.GComponent implements INotification {


    private _config: table.set.SetShowConfig;

    get view(): ui.playerInfo.item.PlayerInfoHeadFrameComp {
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
                context.chooseCache.headFrameId = this._config.id;

                context.chooseCache.refresh();
            }
        }, this);

        FacadeManager.ins().registerNotification(this);
    }

    protected onPreDispose() {
        FacadeManager.ins().removeNotification(this);
        super.onPreDispose();
    }


    reset(config: table.set.SetShowConfig) {
        if (!config) {
            return
        }
        this._config = config;
        const settingsId = config?.id || 0;

        const context = SettingsModel.ins().context;

        this.view.imageFrame.icon = config?.assetPath;

        const isExpire = context.isExpire(settingsId);
        this.view.getController("isLock").selectedIndex = isExpire ? 1 : 0;


        const headFrameId = context.getHeadFrameId();
        const isWear = headFrameId === settingsId;
        this.view.getController("isWear").selectedIndex = isWear ? 1 : 0;

        // 是否选中
        const isChoose = context.chooseCache.headFrameId == settingsId;
        this.view.getController("isChoose").selectedIndex = isChoose ? 1 : 0;

        FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom).reset(RedDotKeys.Set_skin_head_frame_item, [config.id])
    }
}
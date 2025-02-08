import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import { SettingsModel } from "db://assets/scripts/game/modules/settings/model/SettingsModel";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import { HeroConfigManager } from "db://assets/scripts/game/modules/hero/config/HeroConfigManager";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { HeroAvatar } from "db://assets/scripts/game/modules/common/hero/HeroAvatar";
import { ConditionManager } from "db://assets/scripts/game/modules/condition/ConditionManager";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import GIns from "../../../GIns";
import { EnumConditionType } from "../../condition/enum/EnumConditionType";

@bindFguiExtension("ui://playerInfo/PlayerInfoRoleItemComp")
export class PlayerInfoRoleItemComp extends FGUI.GComponent implements INotification {


    private _config: table.set.SetShowConfig;

    get view(): ui.playerInfo.item.PlayerInfoRoleItemComp {
        return this as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.SETTINGS_CHOOSE_REFRESH
        ]
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case  NotificationKey.SETTINGS_CHOOSE_REFRESH: {
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
                context.chooseCache.imageId = this._config.id;

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

        // hero
        const heroId = config.heroId;
        const heroAvatar = FguiScriptUtils.toMyScriptClass(this.view.avatar, HeroAvatar);
        let condtionValue = GIns.conditionMgr.getConditionValue(config.unlockCondition, EnumConditionType.ASSIGN_HERO_ACTIVE_SKIN);
        if (condtionValue > 0) {
            //皮肤读取皮肤道具属性
            heroAvatar.resetbyItemId(condtionValue);
        } else {
            heroAvatar.reset(heroId);
        }

        this.view.avatar.imageHero.icon = config?.assetPath;
        // this.view.avatar.imageBg.icon = config?.assetPath;
        
        // -- state
        const isLock = ConditionManager.ins().isLock(config.unlockCondition, true, false);
        this.view.getController("isLock").selectedIndex = isLock ? 1 : 0;
        
        const headFrameId = context.getHeadFrameId();
        const isWear = headFrameId === settingsId;
        this.view.getController("isWear").selectedIndex = isWear ? 1 : 0;

        // 是否选中
        const isChoose = context.chooseCache.imageId == settingsId;
        this.view.getController("isChoose").selectedIndex = isChoose ? 1 : 0;

        FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom).reset(RedDotKeys.Set_skin_image_item, [config.id])
    }
}
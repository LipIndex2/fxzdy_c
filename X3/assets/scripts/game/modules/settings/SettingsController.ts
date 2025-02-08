import G from "../../../core/comm/G";
import { BaseController } from "../../../core/mvc/controller/BaseController";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import { FloatingTextManager } from "../floatingText/FloatingTextManager";
import { PlayerInfoConfigManager } from "../player/config/PlayerInfoConfigManager";

export class SettingsController extends BaseController {
    listenNotifications(): string[] {
        return [
            NotificationKey.SETTINGS_SET_IMAGE_COMPLETE
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch(event) {
            case NotificationKey.SETTINGS_SET_IMAGE_COMPLETE:
                if (args > 0) {
                    let imgCfg = PlayerInfoConfigManager.getShowInfoConfigById(args)
                    if (imgCfg) {
                        GIns.floatingTextMgr.showTips('已更换为' + G.I18nManager.lang(imgCfg.name))
                    }
                }
                break
        }
    }
}

SettingsController.ins().doInit()
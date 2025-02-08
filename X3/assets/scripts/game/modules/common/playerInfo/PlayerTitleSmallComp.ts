import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { Logger } from "db://assets/scripts/core/log/Logger";
import { PlayerInfoConfigManager } from "db://assets/scripts/game/modules/player/config/PlayerInfoConfigManager";


/**
 * 小称号
 */
export class PlayerTitleSmallComp extends FGUI.GComponent {


    private get view(): ui.comm1.player.PlayerTitleSmallComp {
        return this as any;
    }

    /**
     * 称号id
     * @param titleId
     */
    resetByTitleId(titleId: number) {
        if (titleId > 0) {
            const config = PlayerInfoConfigManager.getTitleConfigById(titleId);
            if (config) {
                this.view.imageTitle.visible = true;
                this.view.imageTitle.icon = config.assetPath;
                return;
            } else {
                Logger.warn(`没找到称号. id = ${titleId}`);
            }
        }
        this.view.imageTitle.visible = false;
    }
}
import * as fgui from "fairygui-cc";
import { DailyBossConfigManager } from "db://assets/scripts/game/modules/dailyBoss/config/DailBossConfigManager";

/**
 * 每日boss 难度
 */
export class DailyBossDifficultyComp extends fgui.GComponent {
    private _config: table.dailyboss.DailyBossDifficultyConfig;


    protected onConstruct() {
        super.onConstruct();


    }

    private get view(): ui.dailyBoss.components.DailyBossDifficultyComp {
        return this as any;
    }

    reset(hardId: number) {
        const config = DailyBossConfigManager.getDifficultyConfig(hardId);
        if (!config) {
            return;
        }
        this._config = config;

        this.view.labelTitle.text = config.name;
        this.view.imageBg.icon = config.bgAssetPath;
        this.view.imageLogo.icon = config.logoAssetPath;


    }

}
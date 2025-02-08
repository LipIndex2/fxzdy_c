import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { ItemListComp } from "../../common/item/ItemListComp";
import { ItemUtils } from "../../item/utils/ItemUtils";
import * as fgui from "fairygui-cc";
/**
 * 一行排名奖励奖励
 */
export class SeasonOneRowComp extends fgui.GComponent {
    private _config: table.dailyboss.DailyBossRankConfig;


    private get view(): ui.dailyBoss.components.DailyBossOneRowComp {
        return this as any;
    }

    protected onConstruct() {
        super.onConstruct();


    }

    reset(config: table.dailyboss.DailyBossRankConfig) {
        if (!config) {
            return;
        }
        this._config = config;

        const minRank = config.minRank;
        const maxRank = config.maxRank;

        if (1 <= minRank && minRank <= 3) {
            this.view.getController("top3").selectedIndex = minRank
        } else {
            this.view.getController("top3").selectedIndex = 0;
            if (minRank == maxRank) {
                this.view.labelRankNumRange.text = `${maxRank}`;
            } else {
                this.view.labelRankNumRange.text = `${minRank}-${maxRank}`;

            }
        }

        let items = ItemUtils.parseKvArrayToItemArray(config.rewards);
        // items.forEach((value) => {
        //     value.count += PrivilegeAdditionController.ins().getDailyBossRankReward(value.itemId, value.count)
        // })
        FguiScriptUtils.toMyScriptClass(this.view.itemList, ItemListComp)
            .reset(items);

    }

}
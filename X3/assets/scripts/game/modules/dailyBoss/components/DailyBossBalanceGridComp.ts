import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import * as fgui from "fairygui-cc";
import { ItemFrameBtn } from "db://assets/scripts/game/modules/common/item/ItemFrameBtn";
import { Vec3 } from "cc";
import { DailyBossConfigManager } from "db://assets/scripts/game/modules/dailyBoss/config/DailBossConfigManager";
import { EnumProgressSide } from "db://assets/scripts/game/modules/common/enum/EnumProgressSide";
import { NumberFormatter } from "db://assets/scripts/core/utils/NumberFormatter";

/**
 * 每日boss 结算格子
 */
export class DailyBossBalanceGridComp extends fgui.GComponent {
    private _config: table.dailyboss.DailyBossProgressConfig;


    private get view(): ui.dailyBoss.components.DailyBossBalanceGridComp {
        return this as any;
    }

    protected onConstruct() {
        super.onConstruct();


    }

    reset(config: table.dailyboss.DailyBossProgressConfig) {
        if (!config) {
            return;
        }
        this._config = config;


        if (config.hardId == DailyBossConfigManager.getMaxDifficulty()) {
            // 最大难度, 特殊
            const value = DailyBossConfigManager.getProgressValueByConfig(config, EnumProgressSide.END);
            this.view.labelPercent.text = NumberFormatter.formatNumberToString(value);
            return;
        }


        // 没到做到难度, 百分比
        const percent = Math.floor(config.progressEnd / 100);
        this.view.labelPercent.text = `${percent}%`;

        const items = ItemUtils.parseKvArrayToOnlyOneItem(config.rewards);
        FguiScriptUtils.toMyScriptClass(this.view.itemBtn, ItemFrameBtn)
            .resetByNoOwnerItem(items);
    }

    setHaveGain(haveGain: boolean) {
        const itemBtn = FguiScriptUtils.toMyScriptClass(this.view.itemBtn, ItemFrameBtn);
        if (!haveGain) {
            itemBtn.setHaveGain(false);
            return;
        }

        itemBtn.setHaveGain(true);
    }

    // 获取奖励的世界坐标
    getRewardWorldPos(): Vec3 {
        return this.view.itemBtn.node.worldPosition;
    }
}
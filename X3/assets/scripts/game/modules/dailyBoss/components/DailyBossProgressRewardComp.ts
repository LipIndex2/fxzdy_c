import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { ItemFrameBtn } from "db://assets/scripts/game/modules/common/item/ItemFrameBtn";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { DailyBossModel } from "db://assets/scripts/game/modules/dailyBoss/model/DailyBossModel";
import * as fgui from "fairygui-cc";
import { DailyBossConfigManager } from "db://assets/scripts/game/modules/dailyBoss/config/DailBossConfigManager";
import { NumberFormatter } from "db://assets/scripts/core/utils/NumberFormatter";
import { EnumProgressSide } from "db://assets/scripts/game/modules/common/enum/EnumProgressSide";

/**
 * 进度奖励
 */
export class DailyBossProgressRewardComp extends fgui.GComponent {


    protected onConstruct() {
        super.onConstruct();


    }

    private get view(): ui.dailyBoss.components.DailyBossProgressRewardComp {
        return this as any;
    }

    reset(bossType: number,
          config: table.dailyboss.DailyBossProgressConfig
    ) {
        if (!config) {
            return;
        }
        const progressId = config.id;
        const context = DailyBossModel.ins().context;
        
        // config
        const progressStart = DailyBossConfigManager.getProgressValueByConfig(config, EnumProgressSide.START);
        const progressEnd = DailyBossConfigManager.getProgressValueByConfig(config, EnumProgressSide.END);

        const isMaxHard = config.hardId == DailyBossConfigManager.getMaxDifficulty();

        if (isMaxHard) {
            // 无尽难度
            this.view.labelTitle.text = NumberFormatter.formatNumberToString(progressEnd);
        } else {
            this.view.labelTitle.text = progressEnd.toPercentText(100);

        }

        // item
        const rewardItems = ItemUtils.parseKvArrayToOnlyOneItem(config.rewards);

        const itemComp = FguiScriptUtils.toMyScriptClass(this.view.itemComp, ItemFrameBtn);
        itemComp.resetByNoOwnerItem(rewardItems);


        // 领取过
        const isHaveGain = context.isHaveGainProgressId(progressId)
        if (isHaveGain) {
            this.view.bar.value = 100;
        } else {
            this.view.bar.value = 0;
        }

        // have gain ?
        const isHaveGainProgressId = context.isHaveGainProgressId(progressId);
        itemComp.setHaveGain(isHaveGainProgressId);
    }

}
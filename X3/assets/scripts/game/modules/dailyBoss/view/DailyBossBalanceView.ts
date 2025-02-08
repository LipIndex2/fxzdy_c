import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { DailyBossOneRowComp } from "db://assets/scripts/game/modules/dailyBoss/components/DailyBossOneRowComp";
import { DailyBossConfigManager } from "db://assets/scripts/game/modules/dailyBoss/config/DailBossConfigManager";
import { DailyBossModel } from "db://assets/scripts/game/modules/dailyBoss/model/DailyBossModel";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { ItemListComp } from "db://assets/scripts/game/modules/common/item/ItemListComp";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import ArrayUtils from "db://assets/scripts/core/utils/ArrayUtils";
import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import { DailyBossUIKeys } from "../DailyBossUIKeys";
import UIScriptManager from "../../../../core/comm/UIScriptManager";
import { PrivilegeAdditionController } from "../../vip/PrivilegeAdditionController";

/**
 * 每日 Boss | 结算奖励
 */
export class DailyBossBalanceView extends UICommWin {

    static pkgName: string = "dailyBoss";

    static viewName: string = "DailyBossBalanceView";
    private _configs: table.dailyboss.DailyBossRankConfig[];

    private get view(): ui.dailyBoss.DailyBossBalanceView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
        }

    }

    protected onInit() {

        this.view.rowList.setVirtual();
        this.view.rowList.itemRenderer = this.itemRenderer.bind(this);

        this._configs = DailyBossConfigManager.getRankRewardConfigs();
        this.view.rowList.numItems = this._configs.length;

    }

    itemRenderer(index: number, comp: DailyBossOneRowComp) {
        comp.reset(this._configs[index])
    }

    @LogBusiness("打开界面")
    public onOpen(args: any): void {

        this.reset();

    }


    @LogBusiness("关闭界面")
    protected onClose() {
        super.onClose();
    }

    reset() {
        const context = DailyBossModel.ins().context;

        const myRankNum = context.getMyRankNum();
        if (myRankNum > 0) {
            this.view.labelMyRank.text = `第${myRankNum}名`;
        } else {
            this.view.labelMyRank.text = `未上榜`;
        }


        // rank
        const rankConfig = DailyBossConfigManager.getRankRewardConfigByRankNum(myRankNum);
        if (rankConfig == null) {
            return;
        }

        const noOwnerItems = ItemUtils.parseKvArrayToItemArray(rankConfig.rewards);
        // noOwnerItems.forEach((value) => {
        //     value.count += PrivilegeAdditionController.ins().getDailyBossRankReward(value.itemId, value.count)
        // })
        const itemListComp = FguiScriptUtils.toMyScriptClass(this.view.myRewardComp, ItemListComp);
        itemListComp.reset(noOwnerItems);
        this.view.myRewardComp.visible = ArrayUtils.isNotEmpty(noOwnerItems);

    }
}

UIScriptManager.bindScript(DailyBossUIKeys.DailyBossBalanceView, DailyBossBalanceView);
import * as fgui from "fairygui-cc";
import UIScriptManager from "../../../../core/comm/UIScriptManager";
import { LogBusiness } from "../../../../core/log/LogBusiness";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import ArrayUtils from "../../../../core/utils/ArrayUtils";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { ItemListComp } from "../../common/item/ItemListComp";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { PrivilegeAdditionController } from "../../vip/PrivilegeAdditionController";
import { SeasonOneRowComp } from "../item/SeasonOneRowComp";
import { SeasonConfigManager } from "../SeasonConfigManager";
import { SeasonManager } from "../SeasonManager";
import { SeasonUIKeys } from "../SeasonUIKeys";
import GIns from "../../../GIns";
import G from "../../../../core/comm/G";
import { DailyBossOneRowComp } from "../../dailyBoss/components/DailyBossOneRowComp";

/**
 * 赛季活动 | 结算奖励
 */
export class SeasonBalanceView extends UICommWin {

    static pkgName: string = "dailyBoss";

    static viewName: string = "DailyBossBalanceView";
    private _configs: table.seasonactivity.SeasonRushRank.SeasonRushRankRewardConfig[];

    mRankingVo:Vo.ranking.RankingVo;
    /**所属活动id */
    _actId:number;

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
    }

    itemRenderer(index: number, comp: DailyBossOneRowComp) {
        comp.reset(this._configs[index])
    }

    @LogBusiness("打开界面")
    public onOpen(args: {rankInfo:Vo.ranking.RankingVo, actId:number} ): void {
        this.mRankingVo = args.rankInfo;
        this._actId = args.actId;

        this.view.myRewardComp.itemList.align = fgui.AlignType.Center;
        this._configs = SeasonConfigManager.getRankRewardConfigs(this._actId);
        this.view.rowList.numItems = this._configs.length;
        this.view.labelRewardTitle.text = '保持排名至赛季结算可获得以下奖励';
        this.view.labelTitle.text = '赛季结算奖励';
        this.reset();

    }


    @LogBusiness("关闭界面")
    protected onClose() {
        super.onClose();
    }

    reset() {
        const myRankNum = this.mRankingVo.rank;
        if (myRankNum > 0) {
            this.view.labelMyRank.text = `第${myRankNum}名`;
        } else {
            this.view.labelMyRank.text = `未上榜`;
        }

        const rankConfig = SeasonConfigManager.getRankRewardConfigByRankNum(myRankNum, this._actId);
        if (rankConfig == null) {
            return;
        }

        const noOwnerItems = ItemUtils.parseKvArrayToItemArray(rankConfig.rewards);
        noOwnerItems.forEach((value) => {
            value.count += PrivilegeAdditionController.ins().getDailyBossRankReward(value.itemId, value.count)
        })
        const itemListComp = FguiScriptUtils.toMyScriptClass(this.view.myRewardComp, ItemListComp);
        itemListComp.reset(noOwnerItems);
        this.view.myRewardComp.visible = ArrayUtils.isNotEmpty(noOwnerItems);

    }
}

UIScriptManager.bindScript(SeasonUIKeys.SeasonBalanceView, SeasonBalanceView);
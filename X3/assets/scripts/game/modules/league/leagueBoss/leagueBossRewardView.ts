import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { ItemListComp } from "../../common/item/ItemListComp";
import { ItemListComp2 } from "../../common/item/ItemListComp2";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { UILeagueKey } from "../const/UILeagueConst";
import { LeagueModel } from "../LeagueModel";
/**
 * 联盟boss奖励
 */
@bindScript(UILeagueKey.LeagueBossRewardView)
export class LeagueBossRewardView extends UICommWin {
    static pkgName: string = "leagueBoss";

    static viewName: string = "leagueBossRewardView";


    private mLeagueBossConfig: table.league.LeagueBossConfig;

    private get view(): ui.leagueBoss.leagueBossRewardView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {




        }
    }

    protected onInit(): void {
        let view = this.view;
        view.killReward.itemRenderer = this.onKillRewardItemRender.bind(this);
    }

    public onOpen(cfg: table.league.LeagueBossConfig): void {
        this.mLeagueBossConfig = cfg;
        this.updateView();

    }

    private rankRewardCfgs: table.league.LeagueBossRankRewardConfig[] = [];

    private updateView(): void {
        let view = this.view;
        //挑战奖励
        view.everyReward.itemList.scrollPane.touchEffect = false;
        const items = ItemUtils.parseKvArrayToItemArray(this.mLeagueBossConfig.challengeRewards);
        FguiScriptUtils.toMyScriptClass(view.everyReward, ItemListComp2).reset(items);

        //排名奖励
        this.rankRewardCfgs = LeagueModel.ins().getBossRankRewardConfig(this.mLeagueBossConfig.id);
        view.killReward.numItems = this.rankRewardCfgs.length;


    }


    private onKillRewardItemRender(index: number, item: ui.leagueBoss.component.rankBossRewardCell): void {
        let cfg = this.rankRewardCfgs[index];

        let min = cfg.minRank;
        let max = cfg.maxRank;
        let ctr = item.getController("rank");
        if (min == max && max < 4) {
            //前三名
            ctr.selectedIndex = max - 1;
        }
        else {
            ctr.selectedIndex = 3;
            item.rankTxt.text = max + "-" + min;
        }
        const items = ItemUtils.parseKvArrayToItemArray(cfg.rewards);
        FguiScriptUtils.toMyScriptClass(item.rewardList, ItemListComp)
            .reset(items);

    }
}
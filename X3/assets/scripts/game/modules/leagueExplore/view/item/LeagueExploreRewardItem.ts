import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { ItemFrameBtn } from "../../../common/item/ItemFrameBtn";
import { LeagueExploreRankRewardConfig } from "../../model/vo/LeagueExploreRankRewardConfig";

/**
 * 勘探奖励item
 */
@bindFguiExtension('ui://leagueExplore/LeagueExploreRewardItem')
export class LeagueExploreRewardItem extends fgui.GComponent {

    static pkgName: string = "leagueExplore";
    static viewName: string = "LeagueExploreRewardItem";

    protected _rewards: { k: any, v: any }[] = null;
    private get view(): ui.leagueExplore.item.LeagueExploreRewardItem {
        return this as any;
    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.listReward.setVirtual();
        this.view.listReward.itemRenderer = this.itemRendererForReward.bind(this);
    }

    protected onPreDispose(): void {

    }

    protected itemRendererForReward(index: number, item: ItemFrameBtn): void {
        item.resetByConfigKv(this._rewards[index]);
    }

    public setData(cfg: LeagueExploreRankRewardConfig): void {
        let minRank = cfg.minRank;
        let maxRank = cfg.maxRank;
        if (minRank == maxRank && minRank >= 1 && minRank <= 3) {
            //展示图标
            this.view.getController('rank').selectedIndex = minRank - 1;
        } else {
            this.view.getController('rank').selectedIndex = 3;
            this.view.lbRank.text = `${minRank}-${maxRank}`;
        }
        this._rewards = cfg.rewards ? cfg.rewards : [];
        this.view.listReward.numItems = this._rewards.length;
    }
}
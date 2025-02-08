import G from "../../../../../core/comm/G";
import { EnumUIViewLayer } from "../../../../../core/comm/LayerManager";
import { bindScript } from "../../../../../core/comm/UIScriptManager";
import { UIView, ViewAdaptType } from "../../../../../core/mvc/view/UIView";
import { TimeUtils } from "../../../../comm/utils/TimeUtils";
import { ServerEnums } from "../../../../../libs/extras/ServerEnums";
import NotificationKey from "../../../../event/NotificationKey";
import GIns from "../../../../GIns";
import { ItemFrameBtn } from "../../../common/item/ItemFrameBtn";
import { EventRankDataResp } from "../../../rank/event/EventRankData";
import { UILeagueExploreConfig } from "../../const/UILeagueExploreConfig";
import { LeagueExploreRankRewardConfig } from "../../model/vo/LeagueExploreRankRewardConfig";
import { LeagueExploreRewardItem } from "../item/LeagueExploreRewardItem";

/**
 * 勘探奖励UI
 */
@bindScript(UILeagueExploreConfig.LeagueExploreRewardSubView)
export class LeagueExploreRewardSubView extends UIView {

    static pkgName: string = "leagueExplore";
    static viewName: string = "LeagueExploreRewardSubView";

    /**界面层级 */
    protected _layer: EnumUIViewLayer = EnumUIViewLayer.SUBVIEW;
    /**适配类型 */
    protected adaptType = ViewAdaptType.TOP;

    protected _cfgs: LeagueExploreRankRewardConfig[];
    protected _rewards: { k: any, v: any }[] = [];
    protected _endTime: number = 0;
    /**排行榜类型*/
    protected _rankType: ServerEnums.RankingType;

    private get view(): ui.leagueExplore.subView.LeagueExploreRewardSubView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.RANK_ON_DATA_RESP,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.RANK_ON_DATA_RESP:
                let data = args as EventRankDataResp;
                if (data?.rankType == this._rankType) {
                    this.updateRank(data.myRankNum);
                }
                break;
        }
    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.listReward.setVirtual();
        this.view.listRank.setVirtual();
        this.view.listReward.itemRenderer = this.itemRendererForReward.bind(this);
        this.view.listRank.itemRenderer = this.itemRendererForRank.bind(this);
    }

    protected onClose(): void {
        G.GameTimer.clearAll(this);
    }


    protected itemRendererForReward(index: number, item: ItemFrameBtn): void {
        item.resetByConfigKv(this._rewards[index]);
    }

    protected itemRendererForRank(index: number, item: LeagueExploreRewardItem): void {
        item.setData(this._cfgs[index]);
    }

    protected onTimer(): void {
        let nowTime: number = G.TimeManager.serverNow;
        let remainTime: number = this._endTime - nowTime;
        if (remainTime <= 0) {
            G.GameTimer.clearAll(this);
            remainTime = 0;
        }
        this.view.lbTime.text = '结算倒计时:' + TimeUtils.formatTimeMsToDayHourMinuteSecondText(remainTime);
    }

    protected updateRank(rank: number): void {
        this.view.lbRank.text = rank > 0 ? `第${rank}名` : '未上榜';
        this._rewards = [];
        if (rank > 0) {
            let cfg = this._cfgs?.find(value => value.minRank <= rank && value.maxRank >= rank);
            if (cfg) {
                this._rewards = cfg.rewards;
            }
        }
        this.view.listReward.numItems = this._rewards.length;
    }

    protected udpateUI(rank: number, cfgs: LeagueExploreRankRewardConfig[]): void {
        this._cfgs = cfgs ? cfgs : [];
        this.updateRank(rank);
        this.view.listRank.numItems = this._cfgs.length;

        if (GIns.leagueExploreModel.activityinfo) {
            this._endTime = GIns.leagueExploreModel.activityinfo.endTime;
            G.GameTimer.clearAll(this);
            G.GameTimer.loop(500, this, this.onTimer);
        }
        this.onTimer();
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this._rankType = args.rankType;
        this.udpateUI(args.rank, args.cfgs);
        this.view.getController('style').selectedIndex = this._rankType == ServerEnums.RankingType.LEAGUE_EXPLORE_SCORE ? 1 : 0;
    }
}
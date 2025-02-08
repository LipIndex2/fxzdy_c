import G from "../../../../core/comm/G";
import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import UIScriptManager from "../../../../core/comm/UIScriptManager";
import { UIPage } from "../../../../core/mvc/view/UIPage";
import { UIView, ViewAdaptType } from "../../../../core/mvc/view/UIView";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import NotificationKey from "../../../event/NotificationKey";
import { HeaderItem } from "../../common/header/HeaderItem";
import { ItemListComp } from "../../common/item/ItemListComp";
import { ListPageController } from "../../common/list/ListPageController";
import { ModelNode } from "../../common/node/ModelNode";
import { PlayerAvatar } from "../../common/playerInfo/PlayerAvatar";
import { PlayerTitleSmallComp } from "../../common/playerInfo/PlayerTitleSmallComp";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { PlayerInfoConfigManager } from "../../player/config/PlayerInfoConfigManager";
import { PlayerModel } from "../../player/model/PlayerModel";
import { PlayerUIKeys } from "../../player/PlayerUIKeys";
import { PlayerInfoMainViewOpenArgs } from "../../player/structs/PlayerInfoMainViewOpenArgs";
import { RankUtils } from "../../rank/utils/RankUtils";
import { SettingsModel } from "../../settings/model/SettingsModel";
import { ActivityState } from "../EnumSeason";
import { SeasonConfigManager } from "../SeasonConfigManager";
import { SeasonManager, SeasonPageData } from "../SeasonManager";
import { SeasonModel } from "../SeasonModel";
import { SeasonUIKeys } from "../SeasonUIKeys";
import { rushRankRewardCell } from "../../activity/rushRank/rushRankRewardCell";

/**赛季子活动榜单 */
export class SeasonSubRankView extends UIPage {
    static pkgName: string = "rushRank";
    static viewName: string = "rushRankView";
    protected _layer: EnumUIViewLayer = EnumUIViewLayer.SUBVIEW;
    protected adaptType = ViewAdaptType.TOP;

    protected _listCtrl: ListPageController = new ListPageController();
    /**对应的活动 */
    private _activityId: number;

    private _cfgs: table.seasonactivity.SeasonRushRank.SeasonRushRankRewardConfig[] = [];

    private get view(): ui.rushRank.rushRankView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [NotificationKey.SEASON_RANK_UPDATE];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.SEASON_RANK_UPDATE:
            {   
                let clientData: Vo.seasonactivity.GetRankListC2S = args.clientData;
                if (clientData && clientData.subActivityId == this._activityId) {
                    this.mRankingVo = args.rankVo;
                    this.mGetRankListC2S = args.clientData;
                    this._listCtrl.recRequstData(this.mGetRankListC2S.page, this.mRankingVo.list, this.mRankingVo.maxPage);
                    if (this.mGetRankListC2S.page == 1) {
                        this.updateView();
                    }
                }
                break;
            }
        }
    }

    //排行榜数据
    private mRankingVo: Vo.ranking.RankingVo ;
    //客户端请求数据
    private mGetRankListC2S: Vo.activity.GetRankListC2S;
 
    //排行榜数据长度
    private rankLimit: number;

    protected onInit(): void {
        let view = this.view;

        view.tabList.onClick(this.onClickTab, this);
        view.rankList.setVirtual();
        view.rewardList.setVirtual();
        view.rankList.itemRenderer = this.irRow.bind(this);
        view.rewardList.itemRenderer = this.rewardListCellRander.bind(this);

        //自己的头像不可点击
        view.myRankCom.playerAvatar.touchable = false;

        view.top1.onClick(this.onClickTop1, this);
        view.top2.onClick(this.onClickTop2, this);
        view.top3.onClick(this.onClickTop3, this);
        this.view.ruleBtn.onClick(this.onClickRule, this);
        this.view.ruleBtn.visible = false;

        view.headerItem.visible = false;

        this._listCtrl.requestCallback = this.getRankDataByPage.bind(this);
    }

    protected onClickRule(): void {
        // RuleController.ins().openRule(this._vo.rushRankConfig.ruleId, this.view.ruleBtn);
    }

    protected onOpen(args: SeasonPageData, isReopen?: boolean): void {
        const t = this;
        t._activityId = args.subActId; 

        const svo = SeasonManager.ins().getSubActityVo(t._activityId);
        if(svo?.state == ActivityState.ING){
            t.view.tabList.selectedIndex = 1;
            t.tabIndex = 1;
        }else{
            t.view.tabList.selectedIndex = 0;
            t.tabIndex = 0;
        }



        t.view.endTimeTxt2.text = ``;
        t.view.gp_time2.visible = false;
        t.view.btn_first.visible = false; 
        if(!t._activityId){
            return;
        }

        this._cfgs = SeasonConfigManager.getRankRewardConfigs(this._activityId);

        const cfg = SeasonConfigManager.getRankConfig(t._activityId);
        t.view.T_title.text = cfg?.name;
        t.view.T_desc.text = cfg?.des;
        let type = ServerEnums.RankingType[cfg.type] || ServerEnums.RankingType['SEASON_SCORE'];

        const config = RankUtils.getRankTypeConfigByRankType(type);
        t.rankLimit = config.limit;

        let btn = t.view.tabList.getChildAt(1) as ui.rushRank.btn.rushRankTab;
        btn.title1.text = btn.title2.text = "奖励";

     
        t.endTime = svo?.endTime || 0;
        t.clearTick();
        G.GameTimer.loop(1000, t, t.onEndTimeTick);
        t.onEndTimeTick();
        //右上角道具
        const header1 = FguiScriptUtils.toMyScriptClass(this.view.headerItem, HeaderItem);
        header1.reset(1, true);

        t._listCtrl.init(
            t.view.rankList,
            {
                maxLimitCount: t.rankLimit,
                countOffset: 3,
            },
            t._activityId + ""
        );
    }

    protected onClose(): void {
        this.clearTick();
        this._listCtrl.dispose();
    }

    private endTime: number;

    //清除倒计时
    private clearTick() {
        G.GameTimer.clearAll(this);
    }

    //活动倒计时
    private onEndTimeTick(): void {
        let leftTime = this.endTime - G.TimeManager.serverNow;
        if (leftTime <= 0) {
            this.view.endTimeTxt.text = `活动已结束`;
            this.clearTick();
            return;
        }

        //如果剩余时间小于显示时间，则显示倒计时
        let timeStr = TimeUtils.formatTimeMsToDayHourMinuteSecond(leftTime);
        this.view.endTimeTxt.text = `活动倒计时：${timeStr}`;
    }

    private _page: number = 1;
    /**根据页数获取排行榜数据 */
    private getRankDataByPage(page: number) {
        const t = this;
        t._page = page;
        SeasonModel.ins().sendGetRankList({subActivityId:t._activityId,extraParam:null, page:page});
    }

    private onClickTab(): void {
        let index = this.view.tabList.selectedIndex;
        this.onSelectedChanged(index);
    }

    private tabIndex = 0;

    private onSelectedChanged(index: number) {
        this.tabIndex = index;
        this.updateView();
    }

    // 渲染每一行 top4~N
    private irRow(index: number, item: ui.rushRank.com.rushRankRankCell): void {
        let rankItem:Vo.ranking.RankItemVo = this._listCtrl.datas[index + 3];
        let ctr = item.getController("state");
        if (rankItem) {
            item.nameTxt.text = rankItem.baseVo.name;

            item.getController("isOne").selectedIndex = 0;
            ctr.selectedIndex = 1;
            const avatar = FguiScriptUtils.toMyScriptClass(item.playerAvatar, PlayerAvatar);
            avatar.resetByPlayerInfo(rankItem.baseVo);
            item.rankContext1.text = SeasonConfigManager.getValueStr(this._activityId);
            item.rankContext2.text = rankItem.value+'';

            FguiScriptUtils.toMyScriptClass(item.titleComp, PlayerTitleSmallComp).resetByTitleId(rankItem.baseVo.title);
        } else {
            ctr.selectedIndex = rankItem === undefined ? 5 : 0;
        }

        item.rankTxt.text = `${index + 4}`;
    }

    //排名奖励列表
    private rewardListCellRander(index: number, item: rushRankRewardCell): void {
        if(!this._activityId){
            return;
        }

        item.setDataBySeason(this._cfgs, index, this.mRankingVo.rank);
    }


    //排名奖励列表
    // private rewardListCellRander(index: number, item: ui.rushRank.com.rushRankRewardCell): void {
    //     if(!this._activityId){
    //         return;
    //     }
    //     const cfgs = SeasonConfigManager.getRankRewardConfigs(this._activityId);
    //     let cfg = cfgs[index];
    //     let min = cfg.minRank;

    //     let ctr = item.getController("state");
    //     let max = min;
    //     if (min < 4) {
    //         //前三名
    //         ctr.selectedIndex = min - 1;
    //     } else {
    //         let last = SeasonConfigManager.getRankRewardConfigs(this._activityId)[index - 1];
    //         max = last.minRank + 1;
    //         ctr.selectedIndex = 3;
    //         item.rankTxt.text = max + "-" + min;
    //     }
    //     const scoreRewards = cfg.scoreRewards || [];
    //     const rewards = cfg.rewards || [];
    //     const items = ItemUtils.parseKvArrayToItemArray(rewards.concat(scoreRewards));
    //     FguiScriptUtils.toMyScriptClass(item.rewardList, ItemListComp).reset(items);
    //     let myRank = this.mRankingVo?.rank || -1;
    //     if (myRank > 0 && myRank >= max && myRank <= min) {
    //         item.getController("myRank").selectedIndex = 1;
    //     } else {
    //         item.getController("myRank").selectedIndex = 0;
    //     }
    // }

    private updateView(): void {
        let view = this.view;

        //前三名
        this.threeRender(1, this._listCtrl.datas[0]);
        this.threeRender(2, this._listCtrl.datas[1]);
        this.threeRender(3, this._listCtrl.datas[2]);

        if (this.tabIndex == 0) {
            //我的
            this.showMyRank();
        } else {
            view.rewardList.numItems = SeasonConfigManager.getRankRewardConfigs(this._activityId).length;
        }
    }

    //前三名渲染
    private threeRender(index: number, data: Vo.secretinstance.SecretInstanceRankItemVo): void {
        let view = this.view[`top${index}`] as ui.rushRank.com.RankTop3Comp;
        let havePerson = view.getController("havePersonFlag");
        let state = view.getController("top3");
        if (data) {
            havePerson.selectedIndex = 1;

            const playerBaseVo = data.baseVo;
            if (playerBaseVo) {
                const modelId = PlayerInfoConfigManager.getModelIdByPlayerInfo(playerBaseVo);

                const modelNode = FguiScriptUtils.toMyScriptClass(view.modelNode, ModelNode);
                modelNode.setScale(2, 2);
                modelNode.loadByModelId(modelId);

                // text
                view.labelPlayerName.text = playerBaseVo.name;
            }

         
            view.labelRankValue.text = SeasonConfigManager.getValueStr(this._activityId)+ ` ${data.value}`;

            FguiScriptUtils.toMyScriptClass(view.titleComp, PlayerTitleSmallComp).resetByTitleId(data.baseVo.title);
        } else {
            //虚位以待
            havePerson.selectedIndex = 0;
        }

        state.selectedIndex = index;
    }

    protected onClickTop1(): void {
        this.showPlayerInfo(this._listCtrl.datas[0]);
    }

    protected onClickTop2(): void {
        this.showPlayerInfo(this._listCtrl.datas[1]);
    }

    protected onClickTop3(): void {
        this.showPlayerInfo(this._listCtrl.datas[2]);
    }


    protected showPlayerInfo(data: Vo.secretinstance.SecretInstanceRankItemVo): void {
        if (data && data.baseVo && data.baseVo.id != PlayerModel.ins().playerId) {
            G.UIManager.open(PlayerUIKeys.PlayerInfoMainView, PlayerInfoMainViewOpenArgs.create(data.baseVo.id));
        }
    }

    /**我的排行榜信息 */
    private showMyRank(): void {
        let vo = this.mRankingVo;
        if(!vo){
            this.view.myRankCom.myRank.text = `未上榜`;
            return;
        }
        let rank = vo ? vo.rank : 0;

        let ctr = this.view.myRankCom.getController("state");
        const avatar = FguiScriptUtils.toMyScriptClass(this.view.myRankCom.playerAvatar, PlayerAvatar);
        avatar.resetMe();
        const isHaveRank = rank && rank > 0;
        if (isHaveRank) {
            ctr.selectedIndex = 2;
            this.view.myRankCom.myRank.text = `${rank}`;
            this.view.myRankCom.getController("isOne").selectedIndex = 0;

            //是否挂机关卡
            this.view.myRankCom.rankContext1.text = SeasonConfigManager.getValueStr(this._activityId);
            this.view.myRankCom.rankContext2.text = `${vo.value}`;
        } else {
            ctr.selectedIndex = 3;
            this.view.myRankCom.getController("isOne").selectedIndex = 0;
            this.view.myRankCom.myRank.fontSize = 40;
            this.view.myRankCom.myRank.text = `未上榜`;

            this.view.myRankCom.rankContext1.text = SeasonConfigManager.getValueStr(this._activityId);
            this.view.myRankCom.rankContext2.text = `${vo.value}`;

            const cfgs = SeasonConfigManager.getRankConfig(this._activityId);
            const limitCount = (cfgs.limits || [])[0] || 1;
            this.view.myRankCom.rankContext3.text = `达到${limitCount}${SeasonConfigManager.getValueStr(this._activityId)}才可上榜`;
        }

        this.view.myRankCom.nameTxt.text = PlayerModel.ins().Vo.name;
        FguiScriptUtils.toMyScriptClass(this.view.myRankCom.titleComp, PlayerTitleSmallComp).resetByTitleId(SettingsModel.ins().context.getTitleId());
    }
}

UIScriptManager.bindScript(SeasonUIKeys.SeasonSubRankView, SeasonSubRankView);
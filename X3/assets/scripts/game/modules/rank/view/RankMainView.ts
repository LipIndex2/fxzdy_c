import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { Logger } from "db://assets/scripts/core/log/Logger";
import { UIManager } from "db://assets/scripts/core/mvc/UIManager";
import { UIView } from "db://assets/scripts/core/mvc/view/UIView";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { CommonSubTabListComp } from "db://assets/scripts/game/modules/common/item/CommonSubTabListComp";
import { ConditionManager } from "db://assets/scripts/game/modules/condition/ConditionManager";
import { DailyBossConfigManager } from "db://assets/scripts/game/modules/dailyBoss/config/DailBossConfigManager";
import { DailyBossUIKeys } from "db://assets/scripts/game/modules/dailyBoss/DailyBossUIKeys";
import { DailyBossModel } from "db://assets/scripts/game/modules/dailyBoss/model/DailyBossModel";
import { GodSequenceModel } from "db://assets/scripts/game/modules/godsequence/model/GodSequenceModel";
import { PVPModel } from "db://assets/scripts/game/modules/pvp/model/PVPModel";
import { RankFooterItemComp } from "db://assets/scripts/game/modules/rank/components/RankFooterItemComp";
import { RankForMeComp } from "db://assets/scripts/game/modules/rank/components/RankForMeComp";
import { RankOneRowComp } from "db://assets/scripts/game/modules/rank/components/RankOneRowComp";
import { RankTop3Comp } from "db://assets/scripts/game/modules/rank/components/RankTop3Comp";
import { RankConfigManager } from "db://assets/scripts/game/modules/rank/config/RankConfigManager";
import { EventRankDataResp } from "db://assets/scripts/game/modules/rank/event/EventRankData";
import { RankModel } from "db://assets/scripts/game/modules/rank/model/RankModel";
import { RankCommonData } from "db://assets/scripts/game/modules/rank/structs/RankCommonData";
import { RankFilterUtils } from "db://assets/scripts/game/modules/rank/utils/RankFilterUtils";
import { RankInfoUtils } from "db://assets/scripts/game/modules/rank/utils/RankInfoUtils";
import { RankUtils } from "db://assets/scripts/game/modules/rank/utils/RankUtils";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import G from "../../../../core/comm/G";
import { UiTweenMgr } from "../../../../core/comm/UiTweenMgr";
import GIns from "../../../GIns";
import { ILeagueExploreRewardOpenArgs, UILeagueExploreConfig } from "../../leagueExplore/const/UILeagueExploreConfig";

export class RankMainViewOpenArgs {
    rankType: ServerEnums.RankingType;
    subTab: number = 0;

    static create(
        rankType: ServerEnums.RankingType,
        subTab: number = 0
    ): RankMainViewOpenArgs {
        const args = new RankMainViewOpenArgs();
        args.rankType = rankType;
        args.subTab = subTab;
        return args;
    }
}

// 排行榜子类型
enum EnumControllerRankSubType {
    DEFAULT = 0,
    DAILY_BOSS = 1,
    LADDER = 2,
    SECRET_INSTANCE = 3,
}

/**
 * 排行榜
 */
export class RankMainView extends UIView {

    static pkgName: string = "rank";

    static viewName: string = "RankMainView";

    // type
    private _rankType: ServerEnums.RankingType;

    // <页数, is请求>
    private _pageNumToIsLoadMap = new Map<number, boolean>();
    // 排行榜数据
    private _rankNumToDataMap = new Map<number, RankCommonData>();
    private _curPageNum: number = 1;
    private _maxPage: number = 1;
    // top3 
    private _top3RankNumToUIMap = new Map<number, RankTop3Comp>();
    // 排行榜分类
    private _rankTypeConfigs: table.rank.RankingConfig[] = [];
    // 某排行榜子类型
    private _subTypeTabConfigs: Array<table.rank.RankingSubTypeTabConfig> = [];
    // tab
    private _curChooseTabIndex: number = 0;
    private _haveLogoFlag: boolean = false;
    private _subType: number;

    /**我的排名信息*/
    protected _myRankMap: Map<ServerEnums.RankingType, number> = new Map();

    private get view(): ui.rank.RankMainView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.RANK_ON_DATA_RESP,
            NotificationKey.RANK_SUB_TYPE_CHANGE,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.RANK_ON_DATA_RESP:
                this.onRankDataResp(args as EventRankDataResp);
                break;
            case NotificationKey.RANK_SUB_TYPE_CHANGE:
                this.changeSubType(args as number);
                break;
        }

    }


    protected onInit() {
        super.onInit();


        this.view.topRewardBtn.imageTab.icon = "ui://comm/png_baoxiang";
        this.view.topRewardBtn.text = "奖励";

        this.view.rankList.setVirtual();
        this.view.rankList.itemRenderer = this.itemRendererForRankRow.bind(this);

        this.view.tabList.setVirtual();
        this.view.tabList.itemRenderer = this.itemRendererForTab.bind(this);

        this.view.subTypeTabList.setVirtual();
        this.view.subTypeTabList.itemRenderer = UiTweenMgr.ins().listItemRendererEffect(
            this.view.subTypeTabList.node.uuid,
            this.itemRendererForSubTypeTab,
            this
        );

        this.view.topRewardBtn.onClick(this.onTopRewardBtnClick, this)
        this.view.rankList.on(FGUI.Event.SCROLL, this.onScrollRank, this);

        this.view.bgFooter.btnBack.onceClick(() => {
            this.closeSelf();
        }, this);

        this._top3RankNumToUIMap = new Map<number, RankTop3Comp>([
            [1, FguiScriptUtils.toMyScriptClass(this.view.rank1, RankTop3Comp)],
            [2, FguiScriptUtils.toMyScriptClass(this.view.rank2, RankTop3Comp)],
            [3, FguiScriptUtils.toMyScriptClass(this.view.rank3, RankTop3Comp)],
        ]);

        // 默认没人
        this._top3RankNumToUIMap.forEach((value, key) => {
            value.resetNoBody();
        });

        UiTweenMgr.ins().listShowEffect(this.view.rankList, this.view.bgRank)

        this.view.btnReward.onClick(this.onClickReward, this);
    }


    protected onPreDispose() {
        super.onPreDispose();

        GameTimer.ins().clearAll(this);
    }

    protected onClickReward(): void {
        if (this._rankType == ServerEnums.RankingType.LEAGUE_EXPLORE_PERSON_SCORE
            || this._rankType == ServerEnums.RankingType.LEAGUE_EXPLORE_SCORE) {
            let myRank: number = this._myRankMap.has(ServerEnums.RankingType.LEAGUE_EXPLORE_PERSON_SCORE) ? this._myRankMap.get(ServerEnums.RankingType.LEAGUE_EXPLORE_PERSON_SCORE) : 0;
            let leagueRank: number = this._myRankMap.has(ServerEnums.RankingType.LEAGUE_EXPLORE_SCORE) ? this._myRankMap.get(ServerEnums.RankingType.LEAGUE_EXPLORE_SCORE) : 0;
            let args: ILeagueExploreRewardOpenArgs = {
                myRank: myRank,
                leagueRank: leagueRank,
                defaultIndex: this._curChooseTabIndex
            }
            G.UIManager.open(UILeagueExploreConfig.LeagueExploreRewardWin, args);
        }
    }

    @LogBusiness("打开界面")
    public onOpen(args: RankMainViewOpenArgs): void {
        Logger.debug(" onOpen ");


        const rankType = args.rankType;
        this._rankType = rankType;
        this._subType = args.subTab;

        let isExploreRank: boolean = false
        if (rankType == ServerEnums.RankingType.LEAGUE_EXPLORE_PERSON_SCORE
            || rankType == ServerEnums.RankingType.LEAGUE_EXPLORE_SCORE) {
            isExploreRank = true;
            this.view.btnReward.visible = true;
        } else {
            this.view.btnReward.visible = false;
        }

        let subType: EnumControllerRankSubType;
        if (rankType == ServerEnums.RankingType.DAILY_BOSS) {
            subType = EnumControllerRankSubType.DAILY_BOSS;
        } else if (rankType == ServerEnums.RankingType.LADDER) {
            subType = EnumControllerRankSubType.LADDER;
        } else if (rankType == ServerEnums.RankingType.SECRET_INSTANCE) {
            subType = EnumControllerRankSubType.SECRET_INSTANCE;
        } else {
            subType = EnumControllerRankSubType.DEFAULT;
        }
        this.view.getController("subType").selectedIndex = subType;

        const config = RankUtils.getRankTypeConfigByRankType(rankType);
        if (config) {
            // 只显示开放的 + 同组的 tab
            this._rankTypeConfigs = RankUtils.getRankTypeConfigs().filter(it => {
                if (!config.groupType && ServerEnums.RankingType[it.id] != rankType) {
                    return false;
                }
                if (config.groupType != it.groupType) {
                    return false;
                }
                const isNotCanSee = RankFilterUtils.isNotCanSee(it.groupType)
                if (isNotCanSee) {
                    return false;
                }
                return ConditionManager.ins().checkCondition(it.verifyStr);
            });
            this.view.tabList.numItems = this._rankTypeConfigs.length;


            // sub type tab
            this._subTypeTabConfigs = RankConfigManager.getSubTypeConfigArrayByRankType(rankType);
            this.view.subTypeTabList.numItems = this._subTypeTabConfigs.length;
        }

        this.resetFirst(rankType);
    }

    /**
     * 某个排行榜 | 首次刷新
     * @param rankType
     * @private
     */
    private resetFirst(rankType: ServerEnums.RankingType) {

        // 选中的 tab (rankType/ subType)
        if (rankType == ServerEnums.RankingType.LADDER) {

        } else {
            // 重置 tab
            const chooseIndex = this._rankTypeConfigs.findIndex(it => ServerEnums.RankingType[it.id] == rankType);
            this._curChooseTabIndex = chooseIndex >= 0 ? chooseIndex : 0;

            console.info(`当前选中 index = ${chooseIndex}`);
        }


        // 滚到顶部, 位于 pageNum 1
        this.view.rankList.scrollPane.cancelDragging();
        this.view.rankList.scrollPane.scrollTop(false);
        this._curPageNum = 1;

        // 标题名
        this.view.labelTitle.text = RankUtils.getRankTypeConfigByRankType(rankType)?.name || "";

        this.view.tabList.refreshVirtualList();


        // glist 滚动分帧和列表刷新一起会有问题
        GameTimer.ins().once(30, this, () => {
            // 抓取首次数据
            this.fetchFirstRankDataByType(rankType, this._subType);
        });
    }

    // 获取排行榜数据
    private fetchFirstRankDataByType(
        rankType: ServerEnums.RankingType,
        subType: number
    ) {
        // 清空历史数据
        this._rankNumToDataMap.clear();

        // 首次请求, 直接拉 page [1, 3] 
        for (let pageNum = 1; pageNum <= 3; pageNum++) {
            let subTypeStr: string | null = subType?.toString() || null;
            switch (rankType) {
                case ServerEnums.RankingType.DAILY_BOSS:
                    // 每日boss

                    // subType tab
                    const toMyScriptClass = FguiScriptUtils.toMyScriptClass(this.view.subTypeDailyBossComp, CommonSubTabListComp);
                    toMyScriptClass.reset(
                        this._rankType,
                        DailyBossConfigManager.getAllBossTypeArray(),
                        subType
                    );

                    // 排行榜
                    DailyBossModel.ins().sendLoadBossRank({
                        bossType: subType,
                        page: pageNum,
                    });
                    break;
                case ServerEnums.RankingType.ARENA:
                    // JJC
                    PVPModel.ins().sendLoadArenaRank({
                        page: pageNum,
                    });
                    break;
                case ServerEnums.RankingType.GUARD_SHIP:
                    // 守卫母舰
                    GIns.guardShipModel.sendLoadRankList({
                        page: pageNum,
                    });
                    break;
                case ServerEnums.RankingType.SECRET_INSTANCE:
                    GIns.secretAreaModule.sendLoadRankList(pageNum);
                    break
                default:
                    // 通用
                    RankModel.ins().sendRankList({
                        type: rankType,
                        subRankParam: subTypeStr,
                        page: pageNum
                    });
                    break;
            }

            // 特殊部分
            if (rankType == ServerEnums.RankingType.LADDER) {
                // 神之序列 top3 特殊
                GodSequenceModel.ins().sendLoadTopLadder({
                    ladderType: subType,
                });
            }
        }
    }

    @LogBusiness("关闭界面")
    protected onClose() {
        UiTweenMgr.ins().removeTweenEffect(this.view.rankList, this.view.bgRank)
        super.onClose();
    }

    // rank row
    itemRendererForRankRow(index: number, item: RankOneRowComp): void {
        // rank 4 
        const rankNum = RankUtils.Top3Num + index + 1;

        const rankItemVo: RankCommonData | null = this._rankNumToDataMap.get(rankNum);

        item.reset(this._rankType, rankNum, rankItemVo);
    }

    itemRendererForSubTypeTab(index: number, comp: RankFooterItemComp): void {

        const subTypeTabConfig = this._subTypeTabConfigs[index];
        comp.bindParent(this);
        comp.resetBySubTypeConfig(subTypeTabConfig, index, this._subType);


    }

    onClickTabButton(rankType: ServerEnums.RankingType, index: number) {
        if (index == this._curChooseTabIndex) {
            console.info(`当前tab已选中. rankType = ${rankType}, index = ${index}`);
            return;
        }
        this._curChooseTabIndex = index;

        this.view.tabList.refreshVirtualList();

        this.resetFirst(rankType);
    }

    onClickSubTypeTabButton(rankType: ServerEnums.RankingType, index: number, subType: number) {
        if (index == this._curChooseTabIndex) {
            console.info(`当前 subType 已选中. rankType = ${rankType}, index = ${index}`);
            return;
        }
        this._curChooseTabIndex = index;
        this._subType = subType;

        this.view.subTypeTabList.refreshVirtualList();

        this.resetFirst(rankType);
    }

    /**
     * 排行榜分类
     * @param index
     * @param comp
     */
    itemRendererForTab(index: number, comp: RankFooterItemComp): void {

        const rankingConfig = this._rankTypeConfigs[index];
        comp.bindParent(this);
        comp.resetByRankingConfig(rankingConfig, index, this._curChooseTabIndex);
    }

    /**
     * 排行榜数据响应
     * @param event
     * @private
     */
    private onRankDataResp(event: EventRankDataResp) {
        if (!event) {
            return;
        }
        //记录我的排名
        this._myRankMap.set(event.rankType, event.myRankNum);

        if (event.rankType == ServerEnums.RankingType.LADDER) {
            // TODO 序列校验, 不用检查多级, 他是基于 _subType 对应 LadderTypeConfig.id 的职业枚举, 做切换的
            // 兴春的和历史逻辑冲突了
            // enum = ServerEnums.Career[职业英文]
        } else {
            // 其他会有多级
            let curShowRankType = this._rankType;
            if (this._rankTypeConfigs.length > 0) {
                curShowRankType = ServerEnums.RankingType[this._rankTypeConfigs[this._curChooseTabIndex]?.id];
            }
            if (curShowRankType != event.rankType) {
                //代表不是当前页签的数据 不处理
                Logger.warn("返回的数据和当前展示的类型不一致 不处理数据 ");
                return;
            }
        }
        const newRankType = event.rankType;
        const newSubType = event.subType;


        // 是否同一个排行榜
        const isNotSameRankType = this._rankType != newRankType;
        const isNotSameSubType = this._subType != newSubType;

        // 切换排行榜了
        const isChangeRankType = isNotSameRankType || isNotSameSubType;
        if (isChangeRankType) {
            this._curPageNum = 1;
            this._rankNumToDataMap.clear();
            this._pageNumToIsLoadMap.clear();

        }
        this._rankType = newRankType;
        this._subType = newSubType;
        this._maxPage = event.maxPage;

        // logo
        this._haveLogoFlag = RankInfoUtils.isHaveLogo(this._rankType);


        // 记录 data
        for (let rankItemVo of (event?.dataList || [])) {
            this._rankNumToDataMap.set(rankItemVo.rankNum, rankItemVo)
        }

        // list size
        const config: table.rank.RankingConfig = RankUtils.getRankTypeConfigByRankType(this._rankType);
        if (config) {
            this.view.rankList.numItems = Math.max(0, (config.limit || 8) - RankUtils.Top3Num);
        } else {
            this.view.rankList.numItems = 997;
        }

        // top3 
        for (let i = 1; i <= 3; i++) {
            this.setTop3UI(i);
        }

        // me
        this.updateMyRank0(event);
    }

    // top3 特殊处理
    private setTop3UI(rankNum: number) {
        const top3Comp = this._top3RankNumToUIMap.get(rankNum);
        if (!top3Comp) {
            return;
        }
        const rankCommonData = this._rankNumToDataMap.get(rankNum);

        top3Comp.reset(this._rankType, rankNum, rankCommonData);

    }

    onTopRewardBtnClick() {
        if (this._rankType == ServerEnums.RankingType.DAILY_BOSS) {
            UIManager.ins().open(DailyBossUIKeys.DailyBossBalanceView);
        }
    }

    onScrollRank() {
        const itemH = 150 + this.view.rankList.lineGap;

        const canSeeItemCount = Math.floor(this.view.rankList._uiTrans.height / itemH);
        const canSeeRankNumCount = Math.ceil(this.view.rankList.scrollPane.scrollingPosY / itemH);

        const curStartRankNum = RankUtils.Top3Num + canSeeRankNumCount;
        const curEndRankNum = curStartRankNum + canSeeItemCount;

        // 服务器写死 5 个
        const newPageNum = Math.ceil(curEndRankNum / RankUtils.SERVER_ONE_PAGE_COUNT);
        // Logger.debug(`startRowNum=${curStartRankNum}, endRowNum=${curEndRankNum}, newPageNum=${newPageNum}`);

        // 发生变更
        if (this._curPageNum != newPageNum) {
            this._curPageNum = newPageNum;


            // 取一个范围
            const offsetPageCount = 3
            const start = Math.max(1, this._curPageNum - offsetPageCount);
            const end = newPageNum + offsetPageCount;
            for (let pageNum = start; pageNum <= end; pageNum++) {
                if (pageNum > this._maxPage) {
                    break;
                }

                // 是否加载过
                if (this._pageNumToIsLoadMap.has(pageNum)) {
                    continue;
                }
                this._pageNumToIsLoadMap.set(pageNum, true);

                // net
                this.requestRankDataByTypeAndPage(pageNum);
            }

            // 第一页
            if (!this._pageNumToIsLoadMap.has(1)) {
                this._pageNumToIsLoadMap.set(1, true);
                // net
                this.requestRankDataByTypeAndPage(1);
            }

        }


    }

    /**
     * 我的排行榜
     * @param rankDataResp
     * @private
     */
    private updateMyRank0(rankDataResp: EventRankDataResp) {
        const comp = FguiScriptUtils.toMyScriptClass(this.view.myRank, RankForMeComp);
        comp.reset(rankDataResp);
    }

    /**
     * 请求排行榜数据
     * @param pageNum
     * @private
     */
    private requestRankDataByTypeAndPage(pageNum: number) {

        if (this._rankType == ServerEnums.RankingType.ARENA) {
            // JJC
            PVPModel.ins().sendLoadArenaRank({
                page: pageNum,
            });
            return;
        }
        if (this._rankType == ServerEnums.RankingType.DAILY_BOSS) {
            // 每日boss
            DailyBossModel.ins().sendLoadBossRank({
                bossType: this._subType,
                page: pageNum,
            });
            return;
        }
        if (this._rankType == ServerEnums.RankingType.GUARD_SHIP) {
            // 守卫母舰
            GIns.guardShipModel.sendLoadRankList({
                page: pageNum,
            });
            return;
        }
        if(this._rankType == ServerEnums.RankingType.SECRET_INSTANCE) {
            GIns.secretAreaModule.sendLoadRankList(pageNum);
            return;
        }

        // 通用
        RankModel.ins().sendRankList({
            type: this._rankType,
            subRankParam: this._subType?.toString() || null,
            page: pageNum
        });
    }

    /**
     * 切换子类型
     * @param subType
     * @private
     */
    private changeSubType(subType: number) {
        if (this._subType == subType) {
            return;
        }

        // 重置
        this.fetchFirstRankDataByType(this._rankType, subType);
    }
}
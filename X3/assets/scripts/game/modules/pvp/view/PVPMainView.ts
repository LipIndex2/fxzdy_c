import { UIView } from "../../../../core/mvc/view/UIView";
import G from "db://assets/scripts/core/comm/G";
import * as fgui from "fairygui-cc";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { PVPModel } from "db://assets/scripts/game/modules/pvp/model/PVPModel";
import { PVPContext } from "db://assets/scripts/game/modules/pvp/context/PVPContext";
import { PVPUtils } from "db://assets/scripts/game/modules/pvp/utils/PVPUtils";
import { PVPRankBigLogoComp } from "db://assets/scripts/game/modules/pvp/components/PVPRankBigLogoComp";
import { HeaderItem } from "db://assets/scripts/game/modules/common/header/HeaderItem";
import ArrayUtils from "db://assets/scripts/core/utils/ArrayUtils";
import { PVPUIKeys } from "db://assets/scripts/game/modules/pvp/PVPUIKeys";
import { FloatingTextManager } from "db://assets/scripts/game/modules/floatingText/FloatingTextManager";
import { UICommonKey } from "db://assets/scripts/game/modules/common/const/UICommonConfig";
import {
    BuyInLimitTodayConfirmViewOpenArgs
} from "db://assets/scripts/game/modules/common/confirm/BuyInLimitTodayConfirmView";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import { TimeUtils } from "db://assets/scripts/game/comm/utils/TimeUtils";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { JumpManager } from "db://assets/scripts/game/modules/jump/JumpManager";
import { PVPDailyRewardTipsComp } from "db://assets/scripts/game/modules/pvp/components/PVPDailyRewardTipsComp";
import { BackpackManager } from "db://assets/scripts/game/modules/backpack/BackpackManager";
import { RankCommonData } from "db://assets/scripts/game/modules/rank/structs/RankCommonData";
import { PVPRankLvUpViewOpenArgs } from "db://assets/scripts/game/modules/pvp/view/PVPRankLvUpView";
import { PVPI18nKeys } from "db://assets/scripts/game/modules/pvp/PVPI18nKeys";
import {
    PVPWeeklyChallengeRewardComp
} from "db://assets/scripts/game/modules/pvp/components/PVPWeeklyChallengeRewardComp";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { FormationUtils } from "db://assets/scripts/game/modules/formation/utils/FormationUtils";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { RankTop3Comp } from "db://assets/scripts/game/modules/rank/components/RankTop3Comp";
import { RuleController } from "db://assets/scripts/game/modules/rule/RuleController";
import { EnumRuleKeys } from "db://assets/scripts/game/modules/rule/enums/EnumRuleKeys";
import { RedDotUtils } from "db://assets/scripts/game/modules/common/redDot/utils/RedDotUtils";
import { RedDotKeys } from "db://assets/scripts/game/modules/common/redDot/RedDotKeys";
import { ModelNode } from "../../common/node/ModelNode";
import GIns from "../../../GIns";
import { UIFormationKey } from "../../formation/const/UIFormationConfig";
import { PVPController } from "../PVPController";


const { GObject } = fgui;

/**
 * PVP 主界面
 */
export class PVPMainView extends UIView {

    static pkgName: string = "pvp";

    static viewName: string = "PVPMainView";


    private _context: PVPContext;
    private _config: table.arena.ArenaRankConfig;
    private _headerItemId1: number;
    private _index: number = 0;
    // 挑战小号的道具
    private _challengeCostItem: NoOwnerItem;
    // tab
    private _tabConfigs: table.arena.ArenaTabConfig[] = [];
    private _sidForAnimPanel: number = 0;

    private get view(): ui.pvp.PVPMainView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.PVP_REFRESH_DATA,
            NotificationKey.PVP_RANK_TOP_3,
            NotificationKey.PVP_WEEKLY_CHALLENGE_REWARD_GAIN,
            NotificationKey.EVENT_CHANGE_ITEMS,
            NotificationKey.PVP_RANK_BE_LV_UP,
            NotificationKey.SYSTEM_NEW_DAY,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.PVP_WEEKLY_CHALLENGE_REWARD_GAIN: {
                // 领取了每周奖励
                this.resetWeeklyPart();
                return;
            }
            case NotificationKey.PVP_REFRESH_DATA: {
                // 重置面板
                this.resetView();
                return;
            }
            case NotificationKey.PVP_RANK_TOP_3: {
                // top3 玩家
                this.resetTop3(args as RankCommonData[]);
                return;
            }
            case NotificationKey.EVENT_CHANGE_ITEMS: {
                // header item
                this.resetHeaderItem();
                this.resetView();
                return;
            }
            case NotificationKey.PVP_RANK_BE_LV_UP: {
                // header item
                let tempArgs: { newScore: number, oldScore: number } = args
                G.UIManager.open(PVPUIKeys.PVPRankLvUpView, PVPRankLvUpViewOpenArgs.create(tempArgs.newScore, tempArgs.oldScore));
                return;
            }
            case NotificationKey.SYSTEM_NEW_DAY: {
                //新的一天需要刷新数据
                PVPModel.ins().sendLoadArenaInfo();
                PVPModel.ins().sendLoadArenaRank({
                    page: 1
                });
                break;
            }
        }

    }


    public onInit(): void {
        G.Logger.debug(" onInit ")
        this.view.getController("openWeekFlag").selectedIndex = 0;

        //header
        this.view.header1.onClick(this.onClickHeaderItem1, this)
        this.view.btnRule.onClick(this.onClickBtnRule, this)

        this.view.btnBack.onClick(this.onBack, this);
        this.view.btnChallenge.onClick(this.onClickChallenge, this);

        const redDotCom1 = RedDotUtils.castComp(this.view.btnChallenge.redDot);
        redDotCom1.reset(RedDotKeys.jjcChallenge);

        this.view.btnSetUpFormation.onClick(this.onClickSetUpFormation, this);
        this.view.btnWeeklyChallengeBox.onClick(this.onClickWeeklyChallengeBox, this);
        this.view.mainInfoComp.onClick(this.onClickOpenRankUI, this);
        this.view.maskForClickSettleRewards.onClick(this.onClickOpenRankUI, this);

        // this.view.tabList.setVirtual();
        this.view.tabList.itemRenderer = this.itemRendererForTab.bind(this);
        this._tabConfigs = PVPUtils.getPVPTabConfigs();
        this.view.tabList.numItems = this._tabConfigs.length;
        this.resetHeaderItem();

        const top3Array = [
            this.view.top1,
            this.view.top2,
            this.view.top3
        ];
        let count = 1;
        for (let rankTop3Comp of top3Array) {
            rankTop3Comp.rankTop3.getController("havePersonFlag").selectedIndex = 0;
            rankTop3Comp.rankTop3.getController("top3").selectedIndex = count;
            rankTop3Comp.getTransition("t0").play();
            count++;
        }

        // time
        GameTimer.ins().frameLoop(10, this, this.updateCountDownTimeText);
        GameTimer.ins().loop(5000, this, this.playAnimForPanelDailyAndWeekly);

        this.view.getTransition("t0").play();
        this.resetTop3([]);
    }

    // rule
    onClickBtnRule() {
        RuleController.ins().openRule(EnumRuleKeys.JJC, this.view.btnRule);
    }

    private resetHeaderItem() {
        const headerItemId = PVPUtils.getHeaderItemId();
        this._headerItemId1 = headerItemId;

        const headerItem = FguiScriptUtils.toMyScriptClass(this.view.header1, HeaderItem);
        headerItem.reset(headerItemId, false);
    }

    protected onDestroy() {
        GameTimer.ins().clearAll(this);
        clearTimeout(this._sidForAnimPanel);

        super.onDestroy();
    }

    playAnimForPanelDailyAndWeekly() {
        const config = this._config;
        if (!config) {
            return;
        }
        this._index += 1;
        const i = this._index % 2;

        this.view.getTransition("loopPanel").play();

        // p2
        if (i == 0) {
            FguiScriptUtils.toMyScriptClass(this.view.dailyRewardComp2, PVPDailyRewardTipsComp).resetByDaily(config);
        } else {
            FguiScriptUtils.toMyScriptClass(this.view.dailyRewardComp2, PVPDailyRewardTipsComp).resetByWeekly(config);

        }

        // p1
        this._sidForAnimPanel = setTimeout(() => {
            if (i == 0) {
                // timely panel reward

                FguiScriptUtils.toMyScriptClass(this.view.dailyRewardComp1, PVPDailyRewardTipsComp).resetByDaily(config);
            } else {
                // timely panel reward

                FguiScriptUtils.toMyScriptClass(this.view.dailyRewardComp1, PVPDailyRewardTipsComp).resetByWeekly(config);
            }
        }, 400);

    }

    onClickOpenRankUI() {
        G.UIManager.open(PVPUIKeys.PVPRankRewardView);
    }

    onClickWeeklyChallengeBox() {

        // 如果可领取, 直接领奖
        const nextWeekId = this._context.getCanGainNextWeeklyChallengeRewardId();
        if (nextWeekId > 0) {
            PVPModel.ins().sendDrawWeeklyReward({
                weeklyChallengeTimes: nextWeekId
            });
            return;
        }


        const controller = this.view.getController("openWeekFlag");
        controller.selectedIndex = (controller.selectedIndex + 1) % 2;

        this.view.maskForWeek.onceClick(() => {
            controller.selectedIndex = 0;
        }, this);
    }

    // cdt
    updateCountDownTimeText() {
        const curTimeMs = G.TimeManager.serverNow;
        const nextRefreshTimeMs = PVPUtils.getPVPDailyNextRefreshTimeMs(curTimeMs);

        const restTimeMs = Math.max(0, nextRefreshTimeMs - curTimeMs);

        const timeText = TimeUtils.formatTimeMsToPositiveTimeText(restTimeMs);
        this.view.labelResetTime.text = `${timeText}后结算`;

    }

    public onOpen(): void {
        // try 同步主线阵容
        FormationUtils.copyMainFormationIfMyTypeFormationEmpty(ServerEnums.FightType.ARENA);

        PVPModel.ins().sendLoadArenaInfo();
        PVPModel.ins().sendLoadArenaRank({
            page: 1
        });

        if (PVPController.ins().battleToRankLvUpScore)
            G.UIManager.open(PVPUIKeys.PVPRankLvUpView, PVPRankLvUpViewOpenArgs.create(PVPController.ins().battleToRankLvUpScore, PVPController.ins().battleToRankLvUpOldScore));
        PVPController.ins().battleToRankLvUpScore = 0;
    }

    public onClose(): void {
        GameTimer.ins().clearAll(this);
        G.Logger.debug(" onClose ");
    }

    // click header item 1
    onClickHeaderItem1() {
        // 今日剩余可购买的次数 buyCount
        const restBuyCount = PVPUtils.getTodayMaxBuyCount() - this._context.todayBuyChallengeTimes;
        if (restBuyCount <= 0) {
            GIns.floatingTextMgr.showTips(PVPI18nKeys.TODAY_BUY_COUNT_MAX);
            return;
        }


        // count > 0
        const headerItemId = PVPUtils.getHeaderItemId();
        const itemCount = BackpackManager.ins().getItemCountByItemId(headerItemId);
        // have count 
        if (itemCount >= PVPUtils.getDailyRecoverItemCount()) {
            GIns.floatingTextMgr.showTips(PVPI18nKeys.BUY_WHEN_NO_CHALLENGE_ITEM);
            return;
        }

        // buyg
        const costItem = PVPUtils.getCostItemForBuyChallengeCount();

        G.UIManager.open(UICommonKey.BuyInLimitTodayConfirmView, BuyInLimitTodayConfirmViewOpenArgs.create(
            costItem,
            this._context.todayBuyChallengeTimes,
            PVPUtils.getTodayMaxBuyCount(),
            () => {
                PVPModel.ins().sendBuyChallengeTimes();
            }
        ));
        return;

    }

    onBack() {
        this.closeSelf();
    }

    onClickChallenge() {
        // 有对手, 直接进入
        if (ArrayUtils.isNotEmpty(this._context.opponentVos)) {
            G.UIManager.open(PVPUIKeys.PVPChooseOppoView);
            return;
        }

        // 无对手, 够门票
        const isCanPayForChallenge = this._challengeCostItem.isCanPay(false);
        if (isCanPayForChallenge) {
            PVPModel.ins().sendLoadChallengeList();
            return;
        }


        // 无对手, 无门票
        const costItem = PVPUtils.getCostItemForBuyChallengeCount();
        if (!costItem) {
            GIns.floatingTextMgr.showTips(PVPI18nKeys.TODAY_CHALLENGE_USE_MAX);
            return;
        }

        // 不够门票
        G.UIManager.open(UICommonKey.BuyInLimitTodayConfirmView, BuyInLimitTodayConfirmViewOpenArgs.create(
            costItem,
            this._context.todayBuyChallengeTimes,
            PVPUtils.getTodayMaxBuyCount(),
            () => {
                PVPModel.ins().sendBuyChallengeTimes();
            }
        ));


    }


    // tab 信息
    itemRendererForTab(index: number, btn: ui.pvp.btn.PVPTabBtn) {

        const config = this._tabConfigs[index];
        if (!config) {
            return;
        }

        btn.title = config.name;
        btn.imageTab.icon = config.iconPath;

        btn.clearClick();
        btn.onClick(() => {
            JumpManager.ins().jumpById(config.jumpId);

        }, this);
    }

    onClickSetUpFormation() {
        // 设置防御阵容
        G.UIManager.open(UIFormationKey.FormationDefendView, ServerEnums.FightType.ARENA);
    }

    @LogBusiness("刷新界面")
    private resetView() {
        this._context = PVPModel.ins().getContext();

        this.updateCountDownTimeText();

        // config
        const score = this._context.score;
        const curConfig = PVPUtils.getConfigById(this._context.myConfigId);
        if (!curConfig) {
            console.error(`没找到这个积分对应的配置. score = ${score}`)
            return;
        }
        this._config = curConfig;

        // timely panel reward

        FguiScriptUtils.toMyScriptClass(this.view.dailyRewardComp1, PVPDailyRewardTipsComp).resetByDaily(curConfig);

        FguiScriptUtils.toMyScriptClass(this.view.dailyRewardComp2, PVPDailyRewardTipsComp).resetByWeekly(curConfig);

        // first reach reward
        const nextConfig: table.arena.ArenaRankConfig | null = PVPUtils.getNextConfigByCurrentId(curConfig.id);
        if (nextConfig) {
            const firstReachReward = ItemUtils.parseKvArrayToOnlyOneItem(nextConfig.firstReachRankRewards);
            this.view.mainInfoComp.dialogComp.visible = firstReachReward != null;
            if (firstReachReward) {
                // dialog
                this.view.mainInfoComp.dialogComp.imageIcon.icon = firstReachReward.getItemSmallIconPath();
                this.view.mainInfoComp.dialogComp.labelCount.text = `x${firstReachReward.count}`;
            }
            const historyMaxRankConfig = PVPUtils.getConfigById(this._context.historyMaxRankConfigId);
            const isHaveReachHistory = historyMaxRankConfig.id >= nextConfig.id;
            this.view.mainInfoComp.dialogComp.visible = !isHaveReachHistory;
        } else {
            // 满段位了
            this.view.mainInfoComp.dialogComp.visible = false;
        }


        // bar
        const maxBarValue = Math.max(0, curConfig.maxScore - curConfig.minScore);
        this.view.mainInfoComp.barForRankScore.value = Math.max(0, score - curConfig.minScore);
        this.view.mainInfoComp.barForRankScore.max = maxBarValue;
        if (curConfig.maxScore > 0) {
            // 有上限分
            this.view.mainInfoComp.barForRankScore.labelTitle.text = `${score}/${curConfig.maxScore}`;
        } else {
            // 没有上限分, 直接去掉坟墓
            this.view.mainInfoComp.barForRankScore.labelTitle.text = `${score}`;
        }

        // rank
        this.view.mainInfoComp.labelRankLogoName.text = curConfig.name;

        // logo 

        const logoComp = FguiScriptUtils.toMyScriptClass(this.view.mainInfoComp.logoRank, PVPRankBigLogoComp);
        logoComp.reset(curConfig);

        // btn challenge
        const challengeCostItem = PVPUtils.getChallengeCostItem();
        this._challengeCostItem = challengeCostItem;
        this.view.btnChallenge.imageSmallItem.icon = challengeCostItem.getItemSmallIconPath();

        // 用剩余次数来显示按钮
        const haveCount = challengeCostItem.getPlayerBackpackItemCount();
        // const haveCount = this._context.todayBuyChallengeTimes;
        this.view.btnChallenge.labelCount.text = `${haveCount}/${challengeCostItem.count}`;
        const haveCostFlag = ArrayUtils.isNotEmpty(this._context.opponentVos);
        this.view.btnChallenge.getController("haveCostFlag").selectedIndex = haveCostFlag ? 1 : 0;

        // weekly challenge count
        const myWeekChallengeCount = this._context.todayChallengeTimes;
        const weeklyMaxChallengeTimes = PVPUtils.getWeeklyMaxChallengeTimes();
        this.view.btnWeeklyChallengeBox.labelTitle.text = `${myWeekChallengeCount}/${weeklyMaxChallengeTimes}`;

        const redDotCom = RedDotUtils.castComp(this.view.btnWeeklyChallengeBox.redDot);
        redDotCom.reset(RedDotKeys.jjcRewardWeekly);

        // 我的每周挑战次数可以拿的箱子
        const weeklyRewardBox = PVPUtils.getCanGainMaxWeeklyRewardBox(myWeekChallengeCount)
        if (weeklyRewardBox) {
            const maxCanGainId = weeklyRewardBox.id;

            // set weekly box state 
            let selectIndexForWeeklyReward = 0;
            // if (maxCanGainId == weeklyMaxChallengeTimes) {
            //     // max can gain weekly
            //     selectIndexForWeeklyReward = 2;
            // } else {
            const notGainFlag = this._context.drawWeeklyChallengeRewardIds.indexOf(maxCanGainId) < 0;
            if (notGainFlag) {
                // not gain 
                selectIndexForWeeklyReward = 1;
            } else {
                // have gain 
                selectIndexForWeeklyReward = 0;
            }
            // }
            this.view.btnWeeklyChallengeBox.getController("gainState").selectedIndex = selectIndexForWeeklyReward;
        } else {
            const haveGainMaxWeeklyReward = this._context.isHaveGainMaxWeeklyReward();
            if (haveGainMaxWeeklyReward) {
                this.view.btnWeeklyChallengeBox.getController("gainState").selectedIndex = 2;
            } else {
                this.view.btnWeeklyChallengeBox.getController("gainState").selectedIndex = 0;
            }
        }

        let modelNode = this.view.btnWeeklyChallengeBox.modelNode as ModelNode
        if (this.view.btnWeeklyChallengeBox.getController("gainState").selectedIndex == 1) {
            modelNode.visible = true
            modelNode.loadByPath('spine/ui/J_kelingqu/J_kelingqu')
            modelNode.playOrders([
                {
                    name: 'idle',
                    isLoop: true
                }
            ])
        } else {
            modelNode.visible = false
            modelNode.clearOrders()
        }

        this.resetWeeklyPart();
        this.resetHeaderItem();

        let useTimes: number = GIns.pvpModel.getContext().extraChallengeRewardTimes;
        let maxTimes: number = PVPUtils.getChallengeRewardsMaxCount();
        let remainTimes: number = Math.max(0, maxTimes - useTimes);
        if (remainTimes <= 0) {
            this.view.lbTimes.text = `(本日挑战额外奖励：<color=#ff0202>${remainTimes}/${maxTimes}</color>)`;
        } else {
            this.view.lbTimes.text = `(本日挑战额外奖励：<color=#5fff6e>${remainTimes}/${maxTimes}</color>)`;
        }

    }

    // top3 
    private resetTop3(array: RankCommonData[]) {

        const rankMap = new Map([
            [0, FguiScriptUtils.toMyScriptClass(this.view.top1.rankTop3, RankTop3Comp)],
            [1, FguiScriptUtils.toMyScriptClass(this.view.top2.rankTop3, RankTop3Comp)],
            [2, FguiScriptUtils.toMyScriptClass(this.view.top3.rankTop3, RankTop3Comp)],
        ]);

        rankMap.forEach((top3Comp, index) => {
            const rankCommonData = array[index];
            if (!rankCommonData) {
                top3Comp.resetNoBody();
                return;
            }

            // 排名
            const rankNum = index + 1;
            top3Comp.reset(
                ServerEnums.RankingType.ARENA,
                rankNum,
                rankCommonData
            );

        });
    }

    private resetWeeklyPart() {
        FguiScriptUtils.toMyScriptClass(this.view.weekRewardComp, PVPWeeklyChallengeRewardComp)
            .reset();
    }

    // 尝试显示升段位奖励
    private tryShowLvUpRankReward() {

        PVPModel.ins().getContext().getForgetGainRewardRankId()


    }
}
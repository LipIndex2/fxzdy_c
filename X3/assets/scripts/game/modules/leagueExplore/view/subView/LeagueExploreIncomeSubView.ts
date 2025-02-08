import G from "../../../../../core/comm/G";
import { EnumUIViewLayer } from "../../../../../core/comm/LayerManager";
import { bindScript } from "../../../../../core/comm/UIScriptManager";
import { UIView, ViewAdaptType } from "../../../../../core/mvc/view/UIView";
import { FguiScriptUtils } from "../../../../../core/utils/FguiScriptUtils";
import { TimeUtils } from "../../../../comm/utils/TimeUtils";
import { ServerEnums } from "../../../../../libs/extras/ServerEnums";
import NotificationKey from "../../../../event/NotificationKey";
import GIns from "../../../../GIns";
import { ItemFrameBtn } from "../../../common/item/ItemFrameBtn";
import { RedDotCom } from "../../../common/redDot/redDotCom";
import { RedDotKeys } from "../../../common/redDot/RedDotKeys";
import { UIMonthCardConfig } from "../../../monthCard/const/UIMonthCardConfig";
import { EnumRuleKeys } from "../../../rule/enums/EnumRuleKeys";
import { RuleController } from "../../../rule/RuleController";
import { PrivilegeAdditionController } from "../../../vip/PrivilegeAdditionController";
import { UILeagueExploreConfig } from "../../const/UILeagueExploreConfig";
import { ILeagueExploreIncomeVo } from "../../model/vo/ILeagueExploreIncomeVo";
import { LeagueExploreIncomeItem } from "../item/LeagueExploreIncomeItem";

/**
 * 勘探收益页面
 */
@bindScript(UILeagueExploreConfig.LeagueExploreIncomeSubView)
export class LeagueExploreIncomeSubView extends UIView {

    static pkgName: string = "leagueExplore";
    static viewName: string = "LeagueExploreIncomeSubView";

    /**界面层级 */
    protected _layer: EnumUIViewLayer = EnumUIViewLayer.SUBVIEW;
    /**适配类型 */
    protected adaptType = ViewAdaptType.TOP;

    protected _buildingId: number = -1;
    protected _incomes: ILeagueExploreIncomeVo[] = [];
    protected _rewards: { k: any, v: any }[] = [];
    protected _startTime: number = 0;
    protected _totalTime: number = 0;
    /**已过分钟数 用分钟来计算奖励*/
    protected _elapsedMin: number = -1;
    /**是否第一次打开*/
    protected _isFirstOpen: boolean = true;
    protected _timerKey: string = null;
    /**生产一个的最小时间*/
    protected _minMsForOneItem: number = 1000;
    /**一小时毫秒数*/
    protected _oneHourMsTime: number = 3600000;

    protected _additionStr:string = '';
    private get view(): ui.leagueExplore.subView.LeagueExploreIncomeSubView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.MONTHCARD_DATA_CHANGE,
            NotificationKey.LEAGUE_EXPLORE_MY_INFO_CHANGE,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.MONTHCARD_DATA_CHANGE:
                this._totalTime = GIns.leagueExploreMgr.getIncomeTotalTime();
                this.refreshMinMsForOneItem();
                this._elapsedMin = -1;
                this.updateUI();
                break;
            case NotificationKey.LEAGUE_EXPLORE_MY_INFO_CHANGE:
                this.updateUI();
                break;
        }
    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.listReward.setVirtual();
        this.view.listIncome.setVirtual();
        this.view.listReward.itemRenderer = this.itemRendererForReward.bind(this);
        this.view.listIncome.itemRenderer = this.itemRendererForIncome.bind(this);

        this.view.btnDraw.onClick(this.onClickDraw, this);
        this.view.btnGoto.onClick(this.onClickGoto, this);
        this.view.btnBuyCard.onClick(this.onClickBuyCard, this);
        this.view.btnRule.onClick(this.onClickRule, this);
        this.view.btnZuan.onClick(this.onClickZuan, this);

        FguiScriptUtils.toMyScriptClass(this.view.btnDraw.redDot, RedDotCom).reset(RedDotKeys.LeagueExplore_Income);
    }

    protected onPreDispose(): void {
        this.removeTimer();
    }

    protected onClickDraw(): void {
        let playerInfoVo = GIns.leagueExploreModel.activityinfo?.playerInfoVo;
        if (playerInfoVo && playerInfoVo.occupyBuildingConfigId > 0 && this._elapsedMin > 0) {
            GIns.leagueExploreModel.sendDrawHangUpReward();
        } else {
            GIns.floatingTextMgr.showTips('暂无收益');
        }
    }

    protected onClickGoto(): void {
        if (GIns.leagueExploreMgr.gotoNearFactory()) {
            G.UIManager.close(UILeagueExploreConfig.LeagueExploreIncomeWin);
        }
    }

    protected onClickBuyCard(): void {
        if (GIns.moduleOpenMgr.isCanOpenModule(ServerEnums.SystemType.MONTH_CARD) == false) {
            return;
        }
        G.UIManager.open(UIMonthCardConfig.MonthCardMineMainWin);
    }

    protected onClickRule(): void {
        RuleController.ins().openRule(EnumRuleKeys.LEAGUE_EXPLORE_INCOME, this.view.btnRule);
    }

    protected onClickZuan(): void {
        G.UIManager.open(UILeagueExploreConfig.LeagueExploreQuickWin);
    }

    protected itemRendererForReward(index: number, item: ItemFrameBtn): void {
        item.resetByConfigKv(this._rewards[index]);
    }

    protected itemRendererForIncome(index: number, item: LeagueExploreIncomeItem): void {
        item.setData(this._incomes[index], this._additionStr);
    }

    /**添加计时器*/
    protected addTimer(): void {
        if (!this._timerKey) {
            this._timerKey = G.GameTimer.loop(500, this, this.onTimer)
        }
        this.onTimer();
    }

    /**移除计时器*/
    protected removeTimer(): void {
        if (this._timerKey) {
            G.GameTimer.clearByKey(this._timerKey)
            this._timerKey = null
        }
    }

    protected onTimer(): void {
        if (this._startTime <= 0) {
            //没有占领
            this.removeTimer();
            this.view.lbNoneTip.visible = true;
            this.view.listReward.numItems = 0;
            this.view.lbTime.text = TimeUtils.formatTimeMsToPositiveTimeText(this._totalTime);
            return;
        }
        let nowTime: number = G.TimeManager.serverNow;
        let elapsedTime = nowTime - this._startTime;
        if (elapsedTime >= this._totalTime) {
            this.removeTimer();
            elapsedTime = this._totalTime;
        }
        let elapsedMin = Math.floor(elapsedTime / this._minMsForOneItem);
        if (this._elapsedMin != elapsedMin) {
            this._elapsedMin = elapsedMin;
            this._rewards.length = 0;
            this._incomes.forEach((value) => {
                let cnt = Math.floor(value.itemAmountPerHour * (this._minMsForOneItem * this._elapsedMin) / this._oneHourMsTime);
                if (cnt > 0) {
                    cnt += PrivilegeAdditionController.ins().getLeagueExploreReward(value.itemId, cnt);
                    this._rewards.push({ k: value.itemId, v: cnt });
                }
            })
            this.view.listReward.numItems = this._rewards.length;
            this.view.lbNoneTip.visible = this._rewards.length <= 0;
        }

        this.view.lbTime.text = TimeUtils.formatTimeMsToPositiveTimeText(this._totalTime - elapsedTime);
    }

    protected refreshMinMsForOneItem(): void {
        this._minMsForOneItem = 0;
        this._incomes.forEach((value) => {
            let ms = Math.floor(this._oneHourMsTime / value.itemAmountPerHour);
            if (this._minMsForOneItem == 0 || this._minMsForOneItem > ms) {
                this._minMsForOneItem = ms;
            }
        })
        if (this._minMsForOneItem < 1000) {
            this._minMsForOneItem = 1000;
        }
    }

    protected updateUI(): void {
        let myOccupyId: number = 0;
        //今日剩余进攻奖励次数
        let todayAttackRewardRemainCount = 0;
        this._startTime = 0;
        let playerInfoVo = GIns.leagueExploreModel.activityinfo?.playerInfoVo;
        if (playerInfoVo) {
            myOccupyId = playerInfoVo.occupyBuildingConfigId;
            this._startTime = myOccupyId > 0 ? playerInfoVo.hangUpStartTime : 0;
            todayAttackRewardRemainCount = Math.max(0, GIns.leagueExploreModel.constCfg.dailyOccupyRewardTimes - playerInfoVo.todayAttackRewardCount);
        }

        if (this._buildingId != myOccupyId) {
            this._buildingId = myOccupyId;
            this._incomes.length = 0;
            if (this._buildingId > 0) {
                //我有占领建筑
                let buildVo = GIns.leagueExploreModel.getBuildingVo(myOccupyId);
                if (buildVo) {
                    //更新占领信息
                    this._incomes = GIns.leagueExploreModel.getBuildingIncomes(buildVo);
                    let trunkCfg = GIns.miniMapMgr.getBuildingTrunkCfg(buildVo.buildingCfg.building_type);
                    this.view.iconBuilding.icon = trunkCfg ? trunkCfg.myOccupyIconPath : '';
                    this.view.lbBuildingName.text = buildVo.buildingCfg.name;
                }
            }
            this.refreshMinMsForOneItem();
        }
        let additionPercent:number = PrivilegeAdditionController.ins().getLeagueExploreRewardPercent();
        if (additionPercent > 0) {
            this._additionStr = `+${additionPercent}%`
        } else {
            this._additionStr = '';
        }
        if (this._incomes.length > 0) {
            //有收益
            this.view.getController('state').selectedIndex = 1;
            this.view.listIncome.numItems = this._incomes.length;
            this.addTimer();
        } else {
            this.view.getController('state').selectedIndex = 0;
            this.view.lbTime.text = TimeUtils.formatTimeMsToPositiveTimeText(this._totalTime);
            this.onTimer();
        }
        this.view.lbAttkTimes.text = todayAttackRewardRemainCount + '';
        this.view.getController('times').selectedIndex = todayAttackRewardRemainCount > 0 ? 0 : 1;
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        if (this._isFirstOpen) {
            this._isFirstOpen = false;
            this._totalTime = GIns.leagueExploreMgr.getIncomeTotalTime();
            this.updateUI();
        }
    }

    protected onClose(dontDispose?: boolean): void {
        
    }
}
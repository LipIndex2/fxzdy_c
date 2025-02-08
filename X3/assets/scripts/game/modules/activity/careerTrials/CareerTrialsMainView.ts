import * as fgui from "fairygui-cc";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIView, ViewAdaptType } from "../../../../core/mvc/view/UIView";
import { UIActivityKey } from "../const/UIActivityConfig";
import { ActivityCareerTrialsVo } from "../model/ActivityCareerTrialsVo";
import GIns from "../../../GIns";
import { ActivitySyncData } from "../../../comm/activity/model/ActivityModel";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { TableManager } from "../../../../core/table/TableManager";
import { ModelNode } from "../../common/node/ModelNode";
import { QualityUtils } from "../../common/quality/QualityUtils";
import { ItemFrameBtn } from "../../common/item/ItemFrameBtn";
import G from "../../../../core/comm/G";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import FGUIManager from "../../../../core/fgui/FGUIManager";
import FacadeManager from "../../../../core/mvc/FacadeManager";
import NotificationKey from "../../../event/NotificationKey";
import { BtnConfirmViewOpenArgs } from "../../common/confirm/BtnConfirmView";
import { CommonI18nKeys } from "../../common/i18n/CommonI18nKeys";
import { UICommonKey } from "../../common/const/UICommonConfig";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { UIManager } from "../../../../core/mvc/UIManager";
import { UIViewItemDetailsKey } from "../../itemDetails/UIViewItemDetailsKey";
import { HeroItemTipsViewOpenArgs } from "../../itemDetails/HeroItemTipsView";
import { RuleController } from "../../rule/RuleController";
import { EnumRedDotReadType } from "../../common/redDot/enums/EnumRedDotReadType";

/**
 * 职业试炼
 * 推荐阵容
 */
@bindScript(UIActivityKey.CareerTrialsMainView)
export class CareerTrialsMainView extends UIView {
    static pkgName: string = "activityCareerTrials";
    static viewName: string = "CareerTrialsMainView";
    protected _layer: EnumUIViewLayer = EnumUIViewLayer.SUBVIEW;
    protected adaptType = ViewAdaptType.TOP;

    private get view(): ui.activityCareerTrials.CareerTrialsMainView {
        return this._view as any;
    }

    private _vo: ActivityCareerTrialsVo;

    //当前选择的tabId
    private _selTabId: number = 0;
    private _ruleId: number = 0;

    private _qualityNames = ["", "普通", "高级", "稀有", "史诗", "传说", "神话", "神话+", "彩"];

    listenNotifications(): string[] {
        return [
            // NotificationKey.CHARGE_COMPLETE,
            NotificationKey.ACTIVITY_END_REFRESH,
            NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK,
            NotificationKey.ACTIVITY_UPDATE,
            NotificationKey.ACTIVITY_REQUEST_BACK,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            // case NotificationKey.CHARGE_COMPLETE:
            //     if (this._vo && !this._vo.isActivityOver()) {
            //         GIns.activityModel.sendActivity(this._vo.activityId);
            //     }
            //     break;
            case NotificationKey.ACTIVITY_UPDATE:
                if (args === this._vo.activityId && UIManager.ins().isOpened(UIActivityKey.CareerTrialsMainView)) {
                    GIns.activityModel.sendActivity(this._vo.activityId);
                }
                break;
            case NotificationKey.ACTIVITY_END_REFRESH:
                if (args === this._vo.activityId) {
                    this.closeSelf();
                }
                break;
            case NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK:
                if (args === this._vo.activityId) {
                    this._vo = GIns.activityModel.getActivityVoById(args);
                    this.updateUI();
                }
                break;
            case NotificationKey.ACTIVITY_REQUEST_BACK:
                this.updateUI();
                break;
        }
    }

    protected onInit(): void {
        this.view.btn_open.on(fgui.Event.CLICK, this.openConfirmView, this);
        this.view.btnRule.on(fgui.Event.CLICK, this.openRule, this);
        this.view.demoBtn.on(fgui.Event.CLICK, this.openDemo, this);
        this.view.demoGetBtn.on(fgui.Event.CLICK, this.onGetDemoReward, this);
        this.view.list_tab.itemRenderer = this.tabItemRenderer.bind(this);

        this.view.btn_mod.on(fgui.Event.CLICK, this.onClickModel, this);

        // 标记已读
        // GIns.redDotMgr.markRedDotForeverRead(RedDotKeys.CareerTrials_login, [this._vo.activityId]);
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this._vo = GIns.activityModel.getActivityVoById(args?.typeParam) as ActivityCareerTrialsVo;
        this._ruleId = args.ruleId;
        if (!this._vo) {
            this.closeSelf();
            return;
        }
        let clinetCfg: table.activity.ActivityConstant.ActivityClientConfig = args;
        this._selTabId = this._vo.trialId;

        // FguiScriptUtils.toMyScriptClass(this.view.item_award.redDot, RedDotCom).reset(RedDotKeys.CareerTrials_reward);
        if (GIns.redDotMgr.isHaveRedDot(RedDotKeys.CareerTrials_login, [this._vo.activityId])) {
            GIns.redDotMgr.markRedDotForeverRead(RedDotKeys.CareerTrials_login, [clinetCfg.typeParam]);
            FacadeManager.ins().emit(NotificationKey.ACTIVITY_RED_DOT_CHANGE);
        }

        // this.view.list_tab.numItems = this._vo.cfgs.length;
        this.updateUI();
    }

    public updateUI() {
        //@ts-ignore
        this.view.mainpage.setData(this._vo, this._selTabId);

        this.view.list_tab.numItems = this._vo.cfgs.length;

        //是否选择了试炼
        // if (this._vo.activityVo.trialId > 0) {
        this.view.getController("c1").selectedIndex = 1;
        this.onTimer();
        // FacadeManager.ins().emit(NotificationKey.ACTIVITY_SET_BOTTOM_STYLE, 0);
        // } else {
        //     this.view.getController("c1").selectedIndex = 0;
        //     FacadeManager.ins().emit(NotificationKey.ACTIVITY_SET_BOTTOM_STYLE, 1);
        // }

        let showHeroId = this._vo.getCfgById(this._selTabId).coreHeroIds[0];
        let heroCfg = TableManager.getDataById(table.hero.HeroConfig, showHeroId);
        //展示英雄模型
        let modelNode = this.view.modelNode as ModelNode;
        modelNode.loadByModelId(heroCfg.showModelId, true);
        modelNode.setScale(-3.5, 3.5);
        this.view.T_heroName.text = heroCfg.name;
        this.view.T_quality.text = this._qualityNames[heroCfg.quality];
        QualityUtils.setFGUIFontColorByQuality(this.view.T_quality, heroCfg.quality);
        let raceCfg = TableManager.getDataById(table.hero.HeroRaceConfig, heroCfg.camp);
        this.view.img_car.icon = raceCfg.assetPath;
        //队伍描述
        this.view.T_desc1.text = this._vo.getCfgById(this._selTabId).formationName;
        this.view.T_desc2.text = this._vo.getCfgById(this._selTabId).desc;
        this.view.T_tips.text = this._vo.getCfgById(this._selTabId).coreDesc;

        //阵容试玩按钮
        this.view.gp_demo.visible = !!this._vo.getCfgById(this._selTabId).showFightId;
        this.view.demoGetBtn.visible = !this._vo.isGetDemoReward(false, this._selTabId);

        //奖励
        // let item = this.view.item_award as any;
        // item.reset(this._vo.cfg.rewards[0].k, this._vo.cfg.rewards[0].v);
        // let isGetParticipateReward = this._vo.isGetParticipateReward();
        // item.setHaveGain(isGetParticipateReward);
        // item.isCanClick(isGetParticipateReward);
        // if (!isGetParticipateReward) {
        //     item.clearClick();
        //     item.onClick(() => {
        //         this.getParticipateReward();
        //     }, this);
        // }

        //开启按钮
        // if (this._vo.activityVo.finishTrialIds.indexOf(this._selTabId) != -1) {
        // this.view.btn_open.title = `已完成该试炼`;
        // this.view.btn_open.grayed = true;
        // this.view.btn_open.touchable = false;
        // } else {
        //     this.view.btn_open.title = `开启试炼`;
        //     this.view.btn_open.grayed = false;
        //     this.view.btn_open.touchable = true;
        // }

        //试玩奖励

        let rewardItem = ItemUtils.parseKvArrayToOnlyOneItem(this._vo.cfg.trialRewards);
        this.view.demoGetBtn.demoRewardLab.text = `x${rewardItem.count}`;
        this.view.demoGetBtn.demoRewardItem.icon = rewardItem.getItemSmallIconPath();

        FguiScriptUtils.toMyScriptClass(this.view.demoGetBtn.redDot, RedDotCom).reset(RedDotKeys.CareerTrials_reward, [this._selTabId]);

        // let demoItem = this.view.item_demoAward as any;
        // demoItem.reset(this._vo.cfg.trialRewards[0].k, this._vo.cfg.trialRewards[0].v);
        // let isGetDemoReward = this._vo.isGetDemoReward();
        // demoItem.setHaveGain(isGetDemoReward);
        // demoItem.isCanClick(isGetDemoReward);
        // if (!isGetParticipateReward) {
        //     item.clearClick();
        //     item.onClick(() => {
        //         this.getParticipateReward();
        //     }, this);
        // }
    }

    //领取参与奖
    private onGetDemoReward() {
        if (!this._vo.canGetDemoReward(true, this._selTabId)) {
            return;
        }

        if (this._vo.isGetDemoReward(true, this._selTabId)) {
            return;
        }

        let syncData = {
            activityId: this._vo.activityId,
            itemId: "TRIAL_FIGHT_REWARD:" + this._selTabId,
            hidePopWin: 2,
        } as ActivitySyncData;
        GIns.activityModel.sendDrawItemReward(syncData);
    }

    private onTimer() {
        G.GameTimer.clearAll(this);
        let time = this._vo.getLeftTime();
        if (time > 0) {
            let timeTest = TimeUtils.formatTimeMsToDayHourMinuteSecondText(time);
            this.view.T_time.text = `活动倒计时:[color=#3CFE37]${timeTest}[/color]`;
        } else {
            this.view.T_time.text = "";
        }
        G.GameTimer.once(1000, this, this.onTimer);
    }

    //确认弹窗
    private openConfirmView() {
        let careerCfg = TableManager.getDataById(table.hero.HeroClassConfig, this._vo.cfg.career);
        let uiParam: BtnConfirmViewOpenArgs = {
            title: CommonI18nKeys.tipsForConfirm,
            content: `是否选择[color=#FFFF00]${careerCfg.name}[/color]阵容作为培养目标开启职业试炼？[color=#FF0000]（选择之后不可更改，请谨慎选择）[/color]`,
            titleCancel: CommonI18nKeys.cancel,
            titleConfirm: CommonI18nKeys.confirm,
            onBtnYes: () => {
                this.openTtial();
            },
        };
        G.UIManager.open(UICommonKey.BtnConfirmWarnView, uiParam);
    }

    //开启试炼
    private openTtial() {
        let syncData = {
            activityId: this._vo.activityId,
            itemId: "CHOOSE_TRIAL",
            otherParams: this._selTabId.toString(),
        } as ActivitySyncData;
        GIns.activityModel.sendBuyGoods(syncData);
    }

    //试玩按钮
    private openDemo() {
        GIns.careerTrialModel.sendEnterBattle(this._vo.getCfgById(this._selTabId).showFightId);
    }

    //规则
    private openRule() {
        RuleController.ins().openRule(this._ruleId, this.view.btnRule);
    }

    //点击模型
    private onClickModel() {
        let itemConfig = ItemUtils.getItemConfigByItemId(this._vo.getCfgById(this._selTabId).coreHeroIds[0]);
        UIManager.ins().open(UIViewItemDetailsKey.HeroCardDetails, {
            itemConfig: itemConfig,
        } as HeroItemTipsViewOpenArgs);
    }

    private tabItemRenderer(index: number, item: ui.activityCareerTrials.item.tabItem) {
        let cfg = this._vo.cfgs[index];
        let careerCfg = TableManager.getDataById(table.hero.HeroClassConfig, cfg.career);
        item.T_title1.text = item.T_title2.text = careerCfg.name;

        item.getController("c1").selectedIndex = 0;
        if (this._selTabId == cfg.id) {
            this.view.list_tab.selectedIndex = index;
        }
        // if (this._vo.activityVo.finishTrialIds.indexOf(cfg.id) != -1) {
        //     item.getController("c1").selectedIndex = 2;
        // } else if (this._vo.activityVo.trialId == cfg.id) {
        //     item.getController("c1").selectedIndex = 1;
        // }

        item.clearClick();
        item.onClick(() => {
            this._selTabId = cfg.id;
            this._vo.trialId = cfg.id;
            this.view.list_tab.selectedIndex = index;
            this.updateUI();
        }, this);
    }

    protected onClose(dontDispose?: boolean): void {
        G.GameTimer.clearAll(this);
    }
}

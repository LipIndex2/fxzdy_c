import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIManager } from "../../../../core/mvc/UIManager";
import { UIView, ViewAdaptType } from "../../../../core/mvc/view/UIView";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import GIns from "../../../GIns";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { EnumRuleKeys } from "../../rule/enums/EnumRuleKeys";
import { RuleController } from "../../rule/RuleController";
import { UIActivityKey } from "../const/UIActivityConfig";
import { ActivityCareerTrialsVo } from "../model/ActivityCareerTrialsVo";
import { TrialsBattlePassItem1 } from "./item/TrialsBattlePassItem1";
import { TrialsBattlePassItem2 } from "./item/TrialsBattlePassItem2";
import { ItemUtils } from "../../item/utils/ItemUtils";
import NotificationKey from "../../../event/NotificationKey";

/**
 * 职业试炼
 * 异能之路 （试炼通行证）
 */
@bindScript(UIActivityKey.CareerTrialsBattlePassView)
export class CareerTrialsBattlePassView extends UIView {
    static pkgName: string = "activityCareerTrials";
    static viewName: string = "CareerTrialsBattlePassView";
    protected _layer: EnumUIViewLayer = EnumUIViewLayer.SUBVIEW;
    protected adaptType = ViewAdaptType.TOP;

    private get view(): ui.activityCareerTrials.CareerTrialsBattlePassView {
        return this._view as any;
    }

    private _vo: ActivityCareerTrialsVo;
    private tabList = ["奖励", "任务"];

    private _ruleId = 0;

    //当前选择的tab
    private _taskTab: number = 0;

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
                if (args === this._vo.activityId && UIManager.ins().isOpened(UIActivityKey.CareerTrialsBattlePassView)) {
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
        this.view.list_award.setVirtual();
        this.view.list_task.setVirtual();
        this.view.list_award.itemRenderer = this.itemAwardRenderer.bind(this);
        this.view.list_task.itemRenderer = this.itemTaskRenderer.bind(this);
        this.view.list_taskBtn.itemRenderer = this.itemTaskBtnRenderer.bind(this);
        this.view.list_tab.itemRenderer = this.itemTabRenderer.bind(this);

        this.view.btn_buy.on(fgui.Event.CLICK, this.onBuyClick, this);
        // this.view.btn_get.on(fgui.Event.CLICK, this.onGetClick, this);
        this.view.btnRule.on(fgui.Event.CLICK, this.onClickRule, this);

        //@ts-ignore
        FguiScriptUtils.toMyScriptClass(this.view.list_tab.getChildAt(0).redDot, RedDotCom).reset(RedDotKeys.CareerTrials_pass_tab);
        //@ts-ignore
        FguiScriptUtils.toMyScriptClass(this.view.list_tab.getChildAt(1).redDot, RedDotCom).reset(RedDotKeys.CareerTrials_pass_task);

        this.view.getController("c1").selectedIndex = 0;
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this._vo = GIns.activityModel.getActivityVoById(args?.typeParam) as ActivityCareerTrialsVo;
        this._ruleId = args.ruleId;
        if (!this._vo) {
            this.closeSelf();
            return;
        }

        let keys = Object.keys(this._vo.taskTypeMap);
        this.view.list_taskBtn.numItems = keys.length;
        this.view.list_tab.numItems = this.tabList.length;

        //英雄图片
        // this.view.img_hero.icon = this._vo.cfg.showHeroIcon;

        this.updateUI();

        this.onTimer();
        G.GameTimer.loop(1000, this, this.onTimer);
    }

    private updateUI() {
        if (!this._vo) {
            this.closeSelf();
            return;
        }

        // this._data.checkRedDot();

        this.updateAward();
        this.updateTask();

        this.view.bar_level.max = this._vo.maxExp;
        let value = this._vo.exp > this._vo.maxExp ? this._vo.maxExp : this._vo.exp;
        this.view.bar_level.value = value;
        this.view.T_bar.text = `${value}/${this._vo.maxExp}`;

        this.view.T_level.text = this._vo.level.toString();

        this.view.btn_buy.visible = true;
        this.view.T_tips.visible = false;
        if (this._vo.activityVo.boughtPassIds.indexOf(+this._vo.passCfg.chargeGoodsId) >= 0) {
            this.view.btn_buy.visible = false;
            this.view.T_tips.visible = true;
        }

        this.view.T_title_bai1.text = this.view.T_title_lan1.text = this.view.T_title_zi1.text = this._vo.cfg.passTitle.substring(0, 1);
        this.view.T_title_bai2.text = this.view.T_title_lan2.text = this.view.T_title_zi2.text = this._vo.cfg.passTitle.substring(1);

        this.view.img_item.icon = ItemUtils.getItemConfigByItemId(this._vo.passCfg.expItemId).iconPath;
    }

    private onTimer() {
        let time = this._vo.getLeftTime();
        if (time > 0) {
            let timeTest = TimeUtils.formatTimeMsToDayHourMinuteSecondText(time);
            this.view.T_time.text = `活动倒计时:[color=#3CFE37]${timeTest}[/color]`;
        } else {
            this.view.T_time.text = "活动已结束!";
            G.GameTimer.clearAll(this);
        }
    }

    //更新奖励
    private updateAward() {
        this.view.list_award.numItems = this._vo.passAwardList.length;

        G.GameTimer.once(200, this, () => {
            this.view.list_award.scrollToView(this._vo.curAwardIndex, true);
        });
    }

    //奖励列表
    private itemAwardRenderer(index: number, item: TrialsBattlePassItem1): void {
        let data = this._vo.passAwardList[index];
        item.updateData(data, this._vo);

        this.updateBigAward(index);
    }

    private _scrollIndex: number;
    private updateBigAward(index: number) {
        // 获取当前滚动位置
        const scrollIndex = this.view.list_award.childIndexToItemIndex(this.view.list_award.numChildren);

        if (this._scrollIndex != scrollIndex) {
            let cfg = this._vo.getNextAward(scrollIndex);
            if (cfg) {
                this.view.bigAwardItem.visible = true;
                // @ts-ignore
                let item = this.view.bigAwardItem as TrialsBattlePassItem3;
                item.updateData(cfg, this._vo);
            } else {
                this.view.bigAwardItem.visible = false;
            }
        }
        this._scrollIndex = scrollIndex;
    }

    //任务列表
    private itemTaskRenderer(index: number, item: TrialsBattlePassItem2): void {
        let key = Object.keys(this._vo.taskTypeMap)[this._taskTab];
        let data: table.activity.BattlePass.BattlePassTaskConfig = this._vo.taskTypeMap[key][index];
        item.updateData(data, this._vo);
    }

    //任务按钮列表
    private itemTaskBtnRenderer(index: number, item: ui.activityCareerTrials.btn.TaskSelBtn): void {
        let key = Object.keys(this._vo.taskTypeMap)[index];
        switch (key) {
            case "DAILY":
                item.T_tips1.text = "每日任务";
                item.T_tips2.text = "每日任务";
                break;
            case "WEEKLY":
                item.T_tips1.text = "每周任务";
                item.T_tips2.text = "每周任务";
                break;
            case "NEVER":
                item.T_tips1.text = "养成任务";
                item.T_tips2.text = "养成任务";
                break;
        }

        FguiScriptUtils.toMyScriptClass(item.redDot, RedDotCom).reset(RedDotKeys.CareerTrials_pass_task_type, [key]);

        let self = this;
        item.clearClick();
        item.onClick(() => {
            self._taskTab = index;
            self.updateTask();
        }, self);
    }

    //切换任务列表
    private updateTask() {
        let keys = Object.keys(this._vo.taskTypeMap);
        this.view.list_task.numItems = this._vo.taskTypeMap[keys[this._taskTab]].length;
        this.view.list_taskBtn.selectedIndex = this._taskTab;
    }

    //tab列表
    private itemTabRenderer(index: number, item: ui.activityCareerTrials.btn.BattlePassTabBtn) {
        item.T_tips1.text = this.tabList[index];
        item.T_tips2.text = this.tabList[index];
    }

    private onBuyClick() {
        UIManager.ins().open(UIActivityKey.CareerTrialsBattlePassBuyTipsWin, this._vo);
    }

    protected onClickRule(): void {
        RuleController.ins().openRule(this._ruleId, this.view.btnRule);
    }

    protected onClose(): void {
        G.GameTimer.clearAll(this);
    }
}

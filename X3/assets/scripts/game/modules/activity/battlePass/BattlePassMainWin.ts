import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import UIScriptManager, { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { ActivityModel, ActivitySyncData } from "../../../comm/activity/model/ActivityModel";
import NotificationKey from "../../../event/NotificationKey";
import { UIActivityKey } from "../const/UIActivityConfig";
import { ActivityBattlePassVo } from "../model/ActivityBattlePassVo";
import { BattlePassAwardItem1 } from "./item/BattlePassAwardItem1";
import { BattlePassTaskItem } from "./item/BattlePassTaskItem";
import { FloatingTextManager } from "../../floatingText/FloatingTextManager";
import { RuleController } from "../../rule/RuleController";
import { EnumRuleKeys } from "../../rule/enums/EnumRuleKeys";
import { BattlePassAwardItem3 } from "./item/BattlePassAwardItem3";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import GIns from "../../../GIns";

/**
 * 通行证主界面弹窗
 */
@bindScript(UIActivityKey.BattlePassMainWin)
export class BattlePassMainWin extends UICommWin {
    static pkgName: string = "activityBattlePass";
    static viewName: string = "BattlePassMainWin";

    //当前选择的tab
    private _taskTab: number = 0;

    /**  通行证vo */
    private _data: ActivityBattlePassVo;

    private tabList = ["奖励", "任务"];

    private get view(): ui.activityBattlePass.BattlePassMainWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.ACTIVITY_END_REFRESH,
            NotificationKey.CHARGE_COMPLETE,
            NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK,
            NotificationKey.ACTIVITY_UPDATE,
            NotificationKey.ACTIVITY_REQUEST_BACK,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.CHARGE_COMPLETE:
                if (this._data && !this._data.isActivityOver()) {
                    ActivityModel.ins().sendActivity(this._data.activityId);
                }
                break;
            case NotificationKey.ACTIVITY_UPDATE:
                if (args === this._data.activityId) {
                    ActivityModel.ins().sendActivity(this._data.activityId);
                }
                break;
            case NotificationKey.ACTIVITY_END_REFRESH:
                if (args === this._data.activityId) {
                    this.closeSelf();
                }
                break;
            case NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK:
                if (args === this._data.activityId) {
                    this._data = ActivityModel.ins().getActivityVoById(args);
                    this.updateView();
                }
                break;
            case NotificationKey.ACTIVITY_REQUEST_BACK:
                this.updateView();
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
        this.view.btn_get.on(fgui.Event.CLICK, this.onGetClick, this);
        this.view.btnRule.onClick(this.onClickRule, this);

        this.view.footer.btnBack.on(fgui.Event.CLICK, this.closeSelf, this);

        // this.view.list_award.

        //@ts-ignore
        FguiScriptUtils.toMyScriptClass(this.view.list_tab.getChildAt(0).redDot, RedDotCom).reset(RedDotKeys.StarPass_reward);
        //@ts-ignore
        FguiScriptUtils.toMyScriptClass(this.view.list_tab.getChildAt(1).redDot, RedDotCom).reset(RedDotKeys.StarPass_taskAll);
    }

    protected onClickRule(): void {
        RuleController.ins().openRule(EnumRuleKeys.PASS_STAR, this.view.btnRule);
    }

    protected onClose(): void {
        G.GameTimer.clearAll(this);
    }

    protected onOpen(activityId: number, isReopen?: boolean): void {
        if (!activityId && !ActivityModel.ins().getActivityVoByType(ServerEnums.ActivityType.BATTLE_PASS)) {
            this.closeSelf();
            return;
        }
        if (activityId) {
            this._data = ActivityModel.ins().getActivityVoById(activityId) as ActivityBattlePassVo;
        } else {
            this._data = ActivityModel.ins().getActivityVoByType(ServerEnums.ActivityType.BATTLE_PASS) as ActivityBattlePassVo;
        }
        this.view.getController("c1").selectedIndex = 0;
        ActivityModel.ins().sendActivity(this._data.activityId);
        let keys = Object.keys(this._data.taskTypeMap);
        this.view.list_taskBtn.numItems = keys.length;

        this.view.list_tab.numItems = this.tabList.length;

        this.updateView();
        this.onTimer();
        G.GameTimer.loop(1000, this, this.onTimer);
    }

    private onTimer() {
        if (this._data.getLeftTime() > 0) {
            let endTimeText = TimeUtils.formatTimeMsToDayHourMinuteSecondText(this._data.getLeftTime());
            this.view.T_time.text = `${endTimeText}`;
        } else {
            this.view.T_time.text = `活动已结束!`;
            this.closeSelf();
        }
    }

    private updateView() {
        if (!this._data) {
            this.closeSelf();
            return;
        }

        this._data.checkRedDot();

        this.updateAward();
        this.updateTask();

        this.view.bar_level.max = this._data.maxExp;
        let value = this._data.exp > this._data.maxExp ? this._data.maxExp : this._data.exp;
        this.view.bar_level.value = value;
        this.view.T_bar.text = `${value}/${this._data.maxExp}`;

        this.view.T_level.text = this._data.level.toString();

        this.view.btn_buy.text = `激活通行证`;
        if (this._data.activityVo.boughtPass) {
            this.view.btn_buy.text = `升级豪华通行证`;
        }
        if (this._data.activityVo.boughtSuperPass) {
            this.view.btn_buy.text = `查看奖励`;
        }
    }

    //更新奖励
    private updateAward() {
        this.view.list_award.numItems = this._data.passAwardList.length;

        G.GameTimer.once(200, this, () => {
            this.view.list_award.scrollToView(this._data.curAwardIndex, true);
        });
    }

    //更新任务
    private updateTask() {
        let keys = Object.keys(this._data.taskTypeMap);
        this.view.list_task.numItems = this._data.taskTypeMap[keys[this._taskTab]].length;
        this.view.list_taskBtn.selectedIndex = this._taskTab;
    }

    private itemTabRenderer(index: number, item: ui.activityBattlePass.btn.BattlePassTabBtn) {
        item.T_tips1.text = this.tabList[index];
        item.T_tips2.text = this.tabList[index];
    }

    //奖励列表
    private itemAwardRenderer(index: number, item: BattlePassAwardItem1): void {
        let data = this._data.passAwardList[index];
        item.updateData(data, this._data);

        this.updateBigAward(index);
    }

    private _scrollIndex: number;
    private updateBigAward(index: number) {
        // 获取当前滚动位置
        const scrollIndex = this.view.list_award.childIndexToItemIndex(this.view.list_award.numChildren);

        if (this._scrollIndex != scrollIndex) {
            let cfg = this._data.getNextAward(scrollIndex);
            // @ts-ignore
            let item = this.view.bigAwardItem as BattlePassAwardItem3;
            item.updateData(cfg, this._data);
        }
        this._scrollIndex = scrollIndex;
    }

    //任务列表
    private itemTaskRenderer(index: number, item: BattlePassTaskItem): void {
        let key = Object.keys(this._data.taskTypeMap)[this._taskTab];
        let data: table.activity.BattlePass.BattlePassTaskConfig = this._data.taskTypeMap[key][index];
        item.updateData(data, this._data);
    }

    //任务按钮列表
    private itemTaskBtnRenderer(index: number, item: ui.activityBattlePass.btn.TaskSelBtn): void {
        let key = Object.keys(this._data.taskTypeMap)[index];
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
                item.T_tips1.text = "挑战任务";
                item.T_tips2.text = "挑战任务";
                break;
        }

        FguiScriptUtils.toMyScriptClass(item.redDot, RedDotCom).reset(RedDotKeys.StarPass_taskTab, [key]);

        let self = this;
        item.clearClick();
        item.onClick(() => {
            self._taskTab = index;
            self.updateTask();
        }, self);
    }

    private onBuyClick() {
        G.UIManager.open(UIActivityKey.BattlePassPreviewWin, this._data.activityId);
    }

    private onGetClick() {
        if (!this._data.isRewardCanGetList) {
            GIns.floatingTextMgr.showTips("没有可领取奖励");
            return;
        }

        let syncData = {
            activityId: this._data.activityId,
            itemId: "PASS",
            hidePopWin: 2,
        } as ActivitySyncData;
        ActivityModel.ins().sendDrawItemReward(syncData);
    }
}

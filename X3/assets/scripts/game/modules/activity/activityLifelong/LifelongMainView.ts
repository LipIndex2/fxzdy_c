import * as fgui from "fairygui-cc";
import { bindScript } from "db://assets/scripts/core/comm/UIScriptManager";
import { UIActivityKey } from "../const/UIActivityConfig";
import { ActivityReachStandardVo } from "../model/ActivityReachStandardVo";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import G from "db://assets/scripts/core/comm/G";
import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import { LifelongAwardItem } from "./item/LifelongAwardItem";
import { LifelongGiftItem } from "./item/LifelongGiftItem";
import { LifelongTaskItem } from "./item/LifelongTaskItem";
import GIns from "../../../GIns";
import NotificationKey from "../../../event/NotificationKey";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { EnumRedDotShowType } from "../../common/redDot/enums/EnumRedDotShowType";
import { RuleController } from "../../rule/RuleController";

/**
 * 终身活动
 * 主界面
 */
@bindScript(UIActivityKey.LifelongMainView)
export class LifelongMainView extends UICommWin {
    static pkgName: string = "activityLifelong";
    static viewName: string = "LifelongMainView";

    private get view(): ui.activityLifelong.LifelongMainView {
        return this._view as any;
    }

    private _vo: ActivityReachStandardVo;

    //任务
    private _task1Cfgs: table.activity.Task.ActivityTaskConfig[] = [];
    //奖励
    private _task2Cfgs: table.activity.Task.ActivityTaskConfig[] = [];

    private _firstInit = true;

    listenNotifications(): string[] {
        return [
            NotificationKey.ACTIVITY_UPDATE,
            NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK,
            NotificationKey.CHARGE_COMPLETE,
            NotificationKey.REACH_ACTIVITY_TASK_UPDATE,
            NotificationKey.ACTIVITY_END_REFRESH,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.ACTIVITY_UPDATE:
                if (args == this._vo.activityId) {
                    GIns.activityModel.sendActivity(this._vo.activityId);
                }
                break;
            case NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK:
                if (args == this._vo.activityId) {
                    this._vo = GIns.activityModel.getActivityVoById(args);
                    G.GameTimer.once(200, this, this.updateView);
                    // this.updateView();
                }
                break;
            case NotificationKey.CHARGE_COMPLETE:
                GIns.activityModel.sendActivity(this._vo.activityId);
                break;
            case NotificationKey.REACH_ACTIVITY_TASK_UPDATE:
                this.updateView();
                break;
            case NotificationKey.ACTIVITY_END_REFRESH:
                let activityId = this._vo.activityId;
                if (args === activityId) {
                    this.closeSelf();
                }
                break;
        }
    }

    protected onInit(): void {
        this.view.list_award.setVirtual();
        this.view.list_gift.setVirtual();
        this.view.list_task.setVirtual();
        this.view.list_award.itemRenderer = this.awardItemRenderer.bind(this);
        this.view.list_gift.itemRenderer = this.giftItemRenderer.bind(this);
        this.view.list_task.itemRenderer = this.taskItemRenderer.bind(this);
        this.view.list_tab.itemRenderer = this.tabItemRenderer.bind(this);

        this.view.btn_jump.on(fgui.Event.CLICK, this.onJumpClick, this);
        this.view.btnRule.on(fgui.Event.CLICK, this.onRuleClick, this);
    }

    protected onOpen(activityId: number, isReopen?: boolean): void {
        if (!activityId) {
            this.closeSelf();
            return;
        }
        this._vo = GIns.activityModel.getActivityVoById(activityId) as ActivityReachStandardVo;
        if (!this._vo) {
            this.closeSelf();
            return;
        }

        this.view.getController("c1").selectedIndex = 0;

        this.view.T_title.text = this._vo.activityCfg.name;

        this._task2Cfgs = this._vo.lifelongRewardCfgs;
        this._vo.showItemIndex = this._task2Cfgs.length - 1;
        this.updateView();
    }

    private updateView(): void {
        this._task1Cfgs = this._vo.lifelongTaskCfgs;

        this.view.list_task.numItems = this._task1Cfgs.length;
        this._vo.showItemIndex = -1;
        this.view.list_award.numItems = this._task2Cfgs.length;
        if (this._vo.showItemIndex < 0) {
            this._vo.showItemIndex = this._task2Cfgs.length - 1;
        }
        this.view.list_tab.numItems = 3;
        this.view.list_gift.refreshVirtualList();
        let count = GIns.backpackMgr.getItemById(this._vo.reachStandardCfg.scoreId)?.count || 0;
        this.view.T_count.text = `累计招募${count}次`;
        this.view.btn_jump.icon = this._vo.reachStandardCfg.jumpIcon;

        this.onTimer();
        G.GameTimer.loop(1000, this, this.onTimer);
    }

    onTimer() {
        let time = this._vo.getLeftTime();
        if (time > 0) {
            let timeTest = TimeUtils.formatTimeMsToDayHourMinuteSecondText(time);
            this.view.T_time.text = `活动倒计时:${timeTest}`;
        } else {
            this.view.T_time.text = "";
            G.GameTimer.clearAll(this);
        }
    }

    protected onClose(dontDispose?: boolean): void {
        G.GameTimer.clearAll(this);
    }

    /** 奖励 */
    private awardItemRenderer(index: number, item: LifelongAwardItem): void {
        let cfg = this._task2Cfgs[index];
        item.updateView(this._vo, cfg, index, this._task2Cfgs[index + 1]);
    }

    /** 礼包 */
    private giftItemRenderer(index: number, item: LifelongGiftItem): void {
        let cfg = this._vo.giftCfgs[index];
        item.updateView(this._vo, cfg);
    }

    /** 任务 */
    private taskItemRenderer(index: number, item: LifelongTaskItem): void {
        let cfg = this._task1Cfgs[index];
        item.updateView(this._vo, cfg);
    }

    /** 标签 */
    private tabItemRenderer(index: number, item: ui.activityLifelong.btn.tabBtn): void {
        item.clearClick();

        switch (index) {
            case 0:
                item.title = "任务";
                item.onClick(() => {
                    this.view.getController("c1").selectedIndex = index;
                    this.view.list_task.refreshVirtualList();
                });
                FguiScriptUtils.toMyScriptClass(item.redDot, RedDotCom).showByType(this._vo.taskRedDot ? EnumRedDotShowType.REWARD : EnumRedDotShowType.NULL);
                break;
            case 1:
                item.title = "奖励";
                item.onClick(() => {
                    this.view.getController("c1").selectedIndex = index;
                    if (this._firstInit) {
                        this.view.list_award.scrollToView(this._vo.showItemIndex, true);
                        this._firstInit = false;
                    }
                    this.view.list_award.refreshVirtualList(); // 不知道为什么，不刷新一下 可领取item的动画会播放不出来
                });
                FguiScriptUtils.toMyScriptClass(item.redDot, RedDotCom).showByType(this._vo.rewardRedDot ? EnumRedDotShowType.REWARD : EnumRedDotShowType.NULL);
                break;
            case 2:
                item.title = "礼包";
                item.onClick(() => {
                    this.view.getController("c1").selectedIndex = index;
                    if (this.view.list_gift.numItems != this._vo.giftCfgs.length) {
                        this.view.list_gift.numItems = this._vo.giftCfgs.length;
                    }
                    this.view.list_gift.refreshVirtualList();
                });
                FguiScriptUtils.toMyScriptClass(item.redDot, RedDotCom).showByType(this._vo.fallRedDot ? EnumRedDotShowType.REWARD : EnumRedDotShowType.NULL);
                break;
            default:
                break;
        }
    }

    private onJumpClick() {
        GIns.jumpManager.jumpById(this._vo.reachStandardCfg.jumpId);
    }

    private onRuleClick() {
        RuleController.ins().openRule(this._vo.reachStandardCfg.tipsId, this.view.btnRule);
    }
}

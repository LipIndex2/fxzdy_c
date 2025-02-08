import G from "db://assets/scripts/core/comm/G";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { ActivityController } from "../../activity/ActivityController";
import { ItemFrameBtn } from "../../common/item/ItemFrameBtn";
import { UIActivityAutoPopConfig } from "../const/UIActivityAutoPopConfig";
import { ActivityAutoPopZYZMItem } from "./item/ActivityAutoPopZYZMItem";

/**
 * 职业招募banner弹框
 */
@bindScript(UIActivityAutoPopConfig.ActivityAutoPopZYZMWin)
export class ActivityAutoPopZYZMWin extends UICommWin {
    static pkgName: string = "activityAutoPop";
    static viewName: string = "ActivityAutoPopZYZMWin";

    protected _args: table.activity.ActivityConstant.ActivityAutoPopConfig = null;
    protected _endTime: number = 0;
    protected _closeTime: number = 0;
    protected _timerKey: string = null;
    protected _rewards: { k: number, v: number }[] = [];
    protected _itemList: ActivityAutoPopZYZMItem[] = [];
    private get view(): ui.activityAutoPop.view.ActivityAutoPopZYZMWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK,
            NotificationKey.ACTIVITY_UPDATE,
            NotificationKey.ACTIVITY_REQUEST_BACK,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.ACTIVITY_UPDATE:
                if (args === this._args.activityId) {
                    this.updateUI();
                }
                break;
            case NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK:
                if (args === this._args.activityId) {
                    this.updateUI();
                }
                break;
            case NotificationKey.ACTIVITY_REQUEST_BACK:
                this.updateUI();
                break;
        }
    }

    protected onInit(): void {
        this._itemList = [
            FguiScriptUtils.toMyScriptClass(this.view.item1, ActivityAutoPopZYZMItem),
            FguiScriptUtils.toMyScriptClass(this.view.item2, ActivityAutoPopZYZMItem),
            FguiScriptUtils.toMyScriptClass(this.view.item3, ActivityAutoPopZYZMItem),
            FguiScriptUtils.toMyScriptClass(this.view.item4, ActivityAutoPopZYZMItem),
            FguiScriptUtils.toMyScriptClass(this.view.item5, ActivityAutoPopZYZMItem),
            FguiScriptUtils.toMyScriptClass(this.view.item6, ActivityAutoPopZYZMItem),
        ];
        this.view.btnGoto.onClick(this.onClickGoto, this);
    }

    protected itemRendererForReward(index: number, item: ItemFrameBtn): void {
        item.resetByConfigKv(this._rewards[index]);
    }

    protected onClickGoto(): void {
        GIns.jumpManager.jumpByActivityId(this._args.activityId);
        this.closeSelf();
    }

    protected onTimer(): void {
        if (this.view.lbTime.visible) {
            let diffTime: number = this._endTime - G.TimeManager.serverNow;
            if (diffTime <= 0) {
                diffTime = 0;
                this.closeSelf();
                return;
            }
            this.view.lbTime.text = `活动倒计时：<color=#3cfe37>${TimeUtils.formatTimeMsToDayHourMinuteSecondText(diffTime)}</color>`;
        }
    }

    protected onTimer2(): void {
        if (this.view.lbClose.visible) {
            if (this._closeTime <= 0) {
                this.closeSelf();
                return;
            }
            this.view.lbClose.text = `${this._closeTime}秒后自动关闭`;
            this._closeTime--;
        }
    }

    protected updateUI(): boolean {
        if (ActivityController.ins().isActivityUnlock(this._args.activityId) == false) {
            //活动不存在
            this.closeSelf();
            return false;
        }
        let vo = GIns.activityModel.getActivityVoById(this._args.activityId);
        if (vo) {
            this._endTime = vo.getEndTimeMs();
        }
        this.view.btnGoto.visible = !this._args.noJump;
        this.view.gTodayOnce.visible = this._args.canPopOnceToday;
        this.view.lbTime.visible = this._args.showEndTime;
        this.view.lbClose.visible = this._args.autoCloseTime > 0;
        if (this._args.showEndTime) {
            if (this._timerKey) {
                G.GameTimer.clearByKey(this._timerKey);
                this._timerKey = null;
            }
            this._timerKey = G.GameTimer.loop(1000, this, this.onTimer);
            this.onTimer();
        }
        return true;
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this._args = args;
        let result:boolean = this.updateUI();

        if (result) {
            this._closeTime = this._args.autoCloseTime;
            if (this._args.autoCloseTime > 0) {
                G.GameTimer.loop(1000, this, this.onTimer2);
                this.onTimer2();
            } else {
                this.view.lbClose.text = `点击空白处关闭`;
            }
    
            this._rewards = this._args.rewards ? this._args.rewards : [];
            this._itemList.forEach((item, index) => {
                if (index < this._rewards.length) {
                    item.visible = true;
                    item.setItemId(this._rewards[index].k);
                } else {
                    item.visible = false;
                }
            })
        }
    }

    protected onClose(dontDispose?: boolean): void {
        G.GameTimer.clearAll(this);
        if (this.view.btnGouXuan.selected) {
            //选中了今日只提示一次
            GIns.activityAutoPopMgr.addNoTopTodayToLocal(this._args);
        }
    }
}

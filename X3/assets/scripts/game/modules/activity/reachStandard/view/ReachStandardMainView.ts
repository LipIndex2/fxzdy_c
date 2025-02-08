import * as fgui from "fairygui-cc";
import { EnumUIViewLayer } from "../../../../../core/comm/LayerManager";
import { bindScript } from "../../../../../core/comm/UIScriptManager";
import { UIView, ViewAdaptType } from "../../../../../core/mvc/view/UIView";
import { UIActivityKey } from "../../const/UIActivityConfig";
import { ReachStandardGoodsItem } from "../item/ReachStandardGoodsItem";
import { ReachStandardTaskItem } from "../item/ReachStandardTaskItem";
import NotificationKey from "../../../../event/NotificationKey";
import GIns from "../../../../GIns";
import { ActivityReachStandardVo } from "../../model/ActivityReachStandardVo";
import { RuleController } from "../../../rule/RuleController";
import { TimeUtils } from "../../../../comm/utils/TimeUtils";
import G from "../../../../../core/comm/G";
import { FguiScriptUtils } from "../../../../../core/utils/FguiScriptUtils";
import { RedDotCom } from "../../../common/redDot/redDotCom";
import { RedDotKeys } from "../../../common/redDot/RedDotKeys";
import { EnumActivityReachType } from "db://assets/scripts/game/modules/activity/reachStandard/enums/EnumActivityReachType";

/**
 * 达标活动
 */
@bindScript(UIActivityKey.ReachStandardMainView)
export class ReachStandardMainView extends UIView {
    static pkgName: string = "activityReachStandard";
    static viewName: string = "ReachStandardMainView";
    protected _layer: EnumUIViewLayer = EnumUIViewLayer.SUBVIEW;
    protected adaptType = ViewAdaptType.TOP;
    private _clientUIType: EnumActivityReachType;

    private get view(): ui.activityReachStandard.ReachStandardMainView {
        return this._view as any;
    }

    private tabList = ["任务", "礼包"];

    private _vo: ActivityReachStandardVo;

    //当前轮次
    private _round: number = 0;

    listenNotifications(): string[] {
        return [
            NotificationKey.ACTIVITY_UPDATE,
            NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK,
            NotificationKey.CHARGE_COMPLETE,
            NotificationKey.REACH_ACTIVITY_TASK_UPDATE,
            NotificationKey.ACTIVITY_END_REFRESH,
            NotificationKey.EVENT_CHANGE_ITEMS2,
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
                    this.updateUI();
                }
                break;
            case NotificationKey.CHARGE_COMPLETE:
                GIns.activityModel.sendActivity(this._vo.activityId);
                break;
            case NotificationKey.REACH_ACTIVITY_TASK_UPDATE:
                this.updateUI();
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
        this.view.list_Goods.setVirtual();
        this.view.list_task.setVirtual();
        this.view.list_tab.itemRenderer = this.tabItemRenderer.bind(this);
        this.view.list_Goods.itemRenderer = this.goodsItemRenderer.bind(this);
        this.view.list_task.itemRenderer = this.taskItemRenderer.bind(this);

        this.view.btnRule.on(fgui.Event.CLICK, this.onRuleClick, this);
        // jmp
        this.view.btn_jump.on(fgui.Event.CLICK, this.onJumpClick, this);
        this.view.btn_jumpSec.on(fgui.Event.CLICK, this.onJumpClick, this);
        this.view.btn_jumpBlack.on(fgui.Event.CLICK, this.onJumpClick, this);

        this.view.btn_left.on(fgui.Event.CLICK, this.onLeftBtnClick, this);
        this.view.btn_right.on(fgui.Event.CLICK, this.onRightBtnClick, this);
    }

    protected onOpen(args: table.activity.ActivityConstant.ActivityClientConfig, isReopen?: boolean): void {
        if (!args) {
            this.closeSelf();
            return;
        }

        this._clientUIType = EnumActivityReachType[args.clientUIType] || EnumActivityReachType.drawCard;
        this.view.getController("type").selectedIndex = this._clientUIType;

        const activityId = args.typeParam;
        this._vo = GIns.activityModel.getActivityVoById(activityId);
        // GIns.activityModel.sendActivity(this._vo.activityId);

        if (this._vo.reachStandardCfg.itemId) {
            this.view.headerItem2.visible = true;
            //@ts-ignore
            this.view.headerItem2.reset(this._vo.reachStandardCfg.itemId, true);
        } else {
            this.view.headerItem2.visible = false;
        }
        this.view.list_tab.numItems = this.tabList.length;

        this.updateUI();

        this.loopTime();
        G.GameTimer.loop(1000, this, this.loopTime);
    }

    protected onClose(dontDispose?: boolean): void {
        G.GameTimer.clearAll(this);
    }

    private loopTime() {
        let time = TimeUtils.formatTimeMsToDayHourMinuteSecondText(this._vo.getLeftTime());
        this.view.T_time.text = `活动倒计时:[color=#3CFE37]${time}[/color]`;

        if (this._vo.isActivityOver()) {
            this.closeSelf();
            return;
        }
    }

    private updateUI() {
        // this._vo.isShowRed();
        this._round = this._vo.round;
        this.view.list_Goods.numItems = this._vo.giftCfgs.length;
        this.view.list_task.numItems = this._vo.taskCfgs.length;

        this.view.T_title.text = this._vo.reachStandardCfg.name;
        this.view.img_bg.icon = this._vo.reachStandardCfg.bgPath;
        this.view.btn_jump.icon = this._vo.reachStandardCfg.jumpIcon;

        if (this._vo.activityVo.totalGroupNum <= 1) {
            this.view.T_count.visible = false;
            this.view.btn_left.visible = false;
            this.view.btn_right.visible = false;
        } else {
            this.view.T_count.visible = true;
            this.view.btn_left.visible = true;
            this.view.btn_right.visible = true;
            this.view.T_count.text = `当前奖励轮数:[color=#FF8651]${this._vo.round}/ ${this._vo.activityVo.totalGroupNum}[/color]`;
        }

        this.view.btn_left.visible = this.view.getController("c1").selectedIndex == 0 && this._vo.activityVo.totalGroupNum > 1;
        this.view.btn_right.visible = this.view.getController("c1").selectedIndex == 0 && this._vo.activityVo.totalGroupNum > 1;
        this.view.btn_left.grayed = this._round <= 1;
        this.view.btn_right.grayed = this._round >= this._vo.activityVo.totalGroupNum;
    }

    //tab页签
    private tabItemRenderer(index: number, item: ui.activityReachStandard.btn.tabBtn) {
        item.T_title1.text = this.tabList[index];
        item.T_title2.text = this.tabList[index];

        // 红点
        if (index == 0) {
            FguiScriptUtils.toMyScriptClass(item.redDot, RedDotCom).reset(RedDotKeys.StandardActivity_taskTab, [this._vo.activityId]);
        } else {
            FguiScriptUtils.toMyScriptClass(item.redDot, RedDotCom).reset(RedDotKeys.StandardActivity_freeTab, [this._vo.activityId]);
        }

        item.onClick(() => {
            this.view.btn_left.visible = this.view.getController("c1").selectedIndex == 0 && this._vo.activityVo.totalGroupNum > 1;
            this.view.btn_right.visible = this.view.getController("c1").selectedIndex == 0 && this._vo.activityVo.totalGroupNum > 1;
        }, this);
    }

    //礼包
    private goodsItemRenderer(index: number, item: ReachStandardGoodsItem) {
        let cfg = this._vo.giftCfgs[index];
        item.setData(cfg, this._vo);
    }

    //任务
    private taskItemRenderer(index: number, item: ReachStandardTaskItem) {
        if (this._round == this._vo.round) {
            let cfg = this._vo.taskCfgs[index];
            item.setData(cfg, this._vo, this._round);
        } else {
            let cfg = this._vo.getTaskCfgsByRound(this._round)[index];
            item.setData(cfg, this._vo, this._round);
        }
    }

    private onJumpClick() {
        if (this._vo.reachStandardCfg.jumpId) {
            GIns.jumpManager.jumpById(this._vo.reachStandardCfg.jumpId);
        } else {
            console.error("未配置跳转");
        }
    }

    private onRuleClick() {
        RuleController.ins().openRule(this._vo.reachStandardCfg.tipsId, this.view.btnRule);
    }

    //上一轮奖励
    private onLeftBtnClick() {
        this._round--;
        if (this._round < 1) {
            this._round = 1;
        }
        // this.updateUI();
        this.view.list_task.numItems = this._vo.getTaskCfgsByRound(this._round).length;

        this.checkRedDot();
    }

    //下一轮奖励
    private onRightBtnClick() {
        this._round++;
        if (this._round > this._vo.activityVo.totalGroupNum) {
            this._round = this._vo.activityVo.totalGroupNum;
        }
        // this.updateUI();
        this.view.list_task.numItems = this._vo.getTaskCfgsByRound(this._round).length;
        this.checkRedDot();
    }

    //箭头红点
    private checkRedDot() {
        this.view.btn_right.redDot.visible = false;
        this.view.btn_left.redDot.visible = false;
        if (this._round < this._vo.round) {
            this.view.btn_right.redDot.visible = true;
            FguiScriptUtils.toMyScriptClass(this.view.btn_right.redDot, RedDotCom).reset(RedDotKeys.StandardActivity_taskTab, [this._vo.activityId]);
        } else if (this._round > this._vo.round) {
            this.view.btn_left.redDot.visible = true;
            FguiScriptUtils.toMyScriptClass(this.view.btn_left.redDot, RedDotCom).reset(RedDotKeys.StandardActivity_taskTab, [this._vo.activityId]);
        }

        this.view.btn_left.grayed = this._round <= 1;
        this.view.btn_right.grayed = this._round >= this._vo.activityVo.totalGroupNum;
    }
}

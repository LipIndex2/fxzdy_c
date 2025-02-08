import * as fgui from "fairygui-cc";
import { EnumUIViewLayer } from "../../../../../core/comm/LayerManager";
import { bindScript } from "../../../../../core/comm/UIScriptManager";
import { UIView, ViewAdaptType } from "../../../../../core/mvc/view/UIView";
import { UIActivityKey } from "../../const/UIActivityConfig";
import { ActivityLimitTimeCareerDrawVo } from "../../model/ActivityLimitTimeCareerDrawVo";
import { TimeUtils } from "../../../../comm/utils/TimeUtils";
import G from "../../../../../core/comm/G";
import GIns from "../../../../GIns";
import { TableManager } from "../../../../../core/table/TableManager";
import { ItemUtils } from "../../../item/utils/ItemUtils";
import { ActivitySyncData } from "../../../../comm/activity/model/ActivityModel";
import NotificationKey from "../../../../event/NotificationKey";
import { NoOwnerItem } from "../../../backpack/vo/NoOwnerItem";
import { FguiScriptUtils } from "../../../../../core/utils/FguiScriptUtils";
import { HeaderItem } from "../../../common/header/HeaderItem";
import { RuleController } from "../../../rule/RuleController";
import { UIManager } from "../../../../../core/mvc/UIManager";
import { RedDotCom } from "../../../common/redDot/redDotCom";
import { RedDotKeys } from "../../../common/redDot/RedDotKeys";

/**
 * 限时职业招募
 * 主界面
 */
@bindScript(UIActivityKey.LimitTimeCareerDrawMainView)
export class LimitTimeCareerDrawMainView extends UIView {
    static pkgName: string = "activityLimitTimeCareerDraw";
    static viewName: string = "LimitTimeCareerDrawMainView";
    protected _layer: EnumUIViewLayer = EnumUIViewLayer.SUBVIEW;
    protected adaptType = ViewAdaptType.TOP;

    private get view(): ui.activityLimitTimeCareerDraw.LimitTimeCareerDrawMainView {
        return this._view as any;
    }

    private _vo: ActivityLimitTimeCareerDrawVo;

    //招募表
    private _recruitCfg: table.recruit.RecruitConfig;

    private _ruleId: number = 0;

    listenNotifications(): string[] {
        return [
            // NotificationKey.CHARGE_COMPLETE,
            NotificationKey.ACTIVITY_UPDATE,
            NotificationKey.ACTIVITY_END_REFRESH,
            NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK,
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
                if (args === this._vo.activityId) {
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
        this.view.btnBack.on(fgui.Event.CLICK, this.closeSelf, this);
        this.view.btn_get.on(fgui.Event.CLICK, this.onGetClick.bind(this, 1), this);
        this.view.btn_get10.on(fgui.Event.CLICK, this.onGetClick.bind(this, 10), this);

        this.view.skipItem.on(fgui.Event.CLICK, this.onSkipClick, this);
        this.view.btnRule.on(fgui.Event.CLICK, this.onClickRule, this);

        FguiScriptUtils.toMyScriptClass(this.view.redDot1, RedDotCom).reset(RedDotKeys.CareerRecruit_single);
        FguiScriptUtils.toMyScriptClass(this.view.redDot2, RedDotCom).reset(RedDotKeys.CareerRecruit_ten);
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this._vo = GIns.activityModel.getActivityVoById(args?.typeParam) as ActivityLimitTimeCareerDrawVo;
        this._ruleId = args.ruleId;
        if (!this._vo) {
            this.closeSelf();
            return;
        }

        //右上角道具
        const header1 = FguiScriptUtils.toMyScriptClass(this.view.headerItem1, HeaderItem);
        header1.reset(this._vo.recruitCfg.costItems[0].k, true);
        this.view.skipItem.getController("c1").selectedIndex = this._vo.isSkip ? 1 : 0;
        this.updateUI();
    }

    protected onClose(dontDispose?: boolean): void {
        G.GameTimer.clearAll(this);
    }

    private updateUI() {
        //@ts-ignore
        this.view.page.setData(this._vo);

        this.onTimer();
        G.GameTimer.loop(1000, this, this.onTimer);

        let costItem = NoOwnerItem.createByConfigKv(this._vo.recruitCfg.costItems[0]);
        const totalCostItems = costItem.multiply(10);
        //@ts-ignore
        this.view.btn_get10.reset("招募10次", totalCostItems);
        //@ts-ignore
        this.view.btn_get.reset("招募1次", costItem);

        this.view.T_count.text = this._vo.remainMiniCount.toString();
    }

    private onTimer() {
        let time = this._vo.getLeftTime();
        if (time > 0) {
            let timeTest = TimeUtils.formatTimeMsToDayHourMinuteSecondText(time);
            this.view.T_time.text = `活动倒计时:[color=#3CFE37]${timeTest}[/color]`;
        } else {
            this.view.T_time.text = "";
        }
    }

    private onGetClick(drawCount: number, evt: fgui.Event) {
        if (!this._vo.cfg) {
            GIns.floatingTextMgr.showTips("请先选择心愿职业");
            UIManager.ins().open(UIActivityKey.LimitTimeCareerDrawWishWin, this._vo);
            return;
        }
        if (!this._recruitCfg) this._recruitCfg = TableManager.getDataById(table.recruit.RecruitConfig, this._vo.cfg.recruitId);

        //消耗道具
        let costItem = ItemUtils.parseKvArrayToOnlyOneItem(this._recruitCfg.costItems);

        const totalCostItems = costItem.multiply(drawCount);
        const result = GIns.backpackMgr.isCanPayReturnResult([totalCostItems]);

        if (result.isCanPay) {
            // 抽奖
            //@ts-ignore
            this.view.page.showDrawAnim1(drawCount);
            // let syncData = {
            //     activityId: this._vo.activityId,
            //     itemId: "RECRUIT",
            //     times: drawCount,
            //     key: "RECRUIT",
            // } as ActivitySyncData;
            // GIns.activityModel.sendActionByKey(syncData);
            return;
        } else {
            GIns.floatingTextMgr.showTips("消耗道具不足");
            GIns.backpackMgr.isCanPayItem(totalCostItems, true);
        }
    }

    private onSkipClick() {
        this._vo.isSkip = !this._vo.isSkip;
        this.view.skipItem.getController("c1").selectedIndex = this._vo.isSkip ? 1 : 0;
    }

    private onClickRule() {
        RuleController.ins().openRule(this._ruleId, this.view.btnRule);
    }
}

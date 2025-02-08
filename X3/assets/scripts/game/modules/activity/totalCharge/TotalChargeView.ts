import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIView, ViewAdaptType } from "../../../../core/mvc/view/UIView";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { ActivityModel } from "../../../comm/activity/model/ActivityModel";
import NotificationKey from "../../../event/NotificationKey";
import { EnumCurrencyItemId } from "../../backpack/vo/BackpackContext";
import { UIActivityKey } from "../const/UIActivityConfig";
import { ActivityTotalChargeVo } from "../model/ActivityTotalChargeVo";
import { TotalChargeItem } from "./item/TotalChargeItem";
import { RuleController } from "../../rule/RuleController";

/** 开服累充 */
@bindScript(UIActivityKey.totalChargeView)
export class TotalChargeView extends UIView {
    static pkgName: string = "activityTotalCharge";
    static viewName: string = "TotalChargeView";

    protected _layer: EnumUIViewLayer = EnumUIViewLayer.SUBVIEW;
    protected adaptType = ViewAdaptType.TOP;

    /** vo */
    private _vo: ActivityTotalChargeVo;
    protected _maxShowCount: number = 5;
    protected _showDatas: table.activity.TotalCharge.TotalChargeConfig[] = [];

    private _ruleId: number = 0;

    private get view(): ui.activityTotalCharge.view.TotalChargeView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK, NotificationKey.ACTIVITY_UPDATE, NotificationKey.ACTIVITY_REQUEST_BACK];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK:
            case NotificationKey.ACTIVITY_UPDATE:
                if (args === this._vo?.activityId) {
                    this._vo = ActivityModel.ins().getActivityVoById(args);
                    this.updateUI();
                }
                break;
            case NotificationKey.ACTIVITY_REQUEST_BACK:
                this.updateUI();
                break;
        }
    }

    protected onInit() {
        //@ts-ignore
        let headItem = this.view.headerItem as HeaderItem;
        headItem.reset(EnumCurrencyItemId.DIAMOND, true);

        this.view.list.setVirtual();
        this.view.list.itemRenderer = this.itemRendererForCharge.bind(this);

        this.view.btnRule.on(fgui.Event.CLICK, this.onClickRule, this);

        this._vo = ActivityModel.ins().getActivityVoByType(ServerEnums.ActivityType.TOTAL_CHARGE) as ActivityTotalChargeVo;

        G.GameTimer.loop(500, this, this.onTimer);
    }

    protected onClose(): void {
        G.GameTimer.clearAll(this);
    }

    protected itemRendererForCharge(index: number, item: TotalChargeItem): void {
        item.setData(this._showDatas[index], this._vo);
    }

    protected onTimer(): void {
        const leftTimeMs = this._vo?.getLeftTime();
        this.view.lbTime.text = "活动倒计时:" + TimeUtils.formatTimeMsToDayHourMinuteSecondText(leftTimeMs);
    }

    protected sortDatas(list: table.activity.TotalCharge.TotalChargeConfig[]): void {
        list.sort((a, b) => {
            return a.chargeMoney - b.chargeMoney;
        });
    }

    public updateUI(): void {
        this._showDatas = this._vo.chargeCfgs;
        let noDraws = [];
        let isDraws = [];
        this._vo.chargeCfgs.forEach((value) => {
            if (this._vo.activityVo.rewardIds.indexOf(value.id) != -1) {
                isDraws.push(value);
            } else {
                noDraws.push(value);
            }
        });
        this.sortDatas(isDraws);
        this.sortDatas(noDraws);
        if (noDraws.length > this._maxShowCount) {
            noDraws = noDraws.slice(0, this._maxShowCount);
        }
        this._showDatas = noDraws.concat(isDraws);
        this.view.list.numItems = this._showDatas.length;
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        let openArgs = args as table.activity.ActivityConstant.ActivityClientConfig;
        let activityId = openArgs?.typeParam;
        this._ruleId = openArgs?.ruleId;
        this._vo = ActivityModel.ins().getActivityVoById(activityId);
        if (this._vo == null) {
            return;
        }
        this.updateUI();
        this.onTimer();
    }

    onClickRule() {
        RuleController.ins().openRule(this._ruleId, this.view.btnRule);
    }
}

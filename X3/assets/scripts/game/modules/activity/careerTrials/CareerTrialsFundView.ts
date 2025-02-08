import * as fgui from "fairygui-cc";
import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIView, ViewAdaptType } from "../../../../core/mvc/view/UIView";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { UIActivityKey } from "../const/UIActivityConfig";
import { ActivityCareerTrialsVo } from "../model/ActivityCareerTrialsVo";
import { TrialsFundItem } from "./item/TrialsFundItem";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import G from "../../../../core/comm/G";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import { RuleController } from "../../rule/RuleController";
import { UIManager } from "../../../../core/mvc/UIManager";

/**
 * 职业试炼
 * 养成赠礼 （试炼基金）
 */
@bindScript(UIActivityKey.CareerTrialsFundView)
export class CareerTrialsFundView extends UIView {
    static pkgName: string = "activityCareerTrials";
    static viewName: string = "CareerTrialsFundView";
    protected _layer: EnumUIViewLayer = EnumUIViewLayer.SUBVIEW;
    protected adaptType = ViewAdaptType.TOP;

    private get view(): ui.activityCareerTrials.CareerTrialsFundView {
        return this._view as any;
    }

    private _vo: ActivityCareerTrialsVo;

    private _ruleId: number = 0;

    listenNotifications(): string[] {
        return [
            NotificationKey.CHARGE_COMPLETE,
            NotificationKey.ACTIVITY_END_REFRESH,
            NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK,
            NotificationKey.ACTIVITY_UPDATE,
            NotificationKey.ACTIVITY_REQUEST_BACK,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.CHARGE_COMPLETE:
                if (this._vo && !this._vo.isActivityOver()) {
                    GIns.activityModel.sendActivity(this._vo.activityId);
                }
                break;
            case NotificationKey.ACTIVITY_UPDATE:
                if (args === this._vo.activityId && UIManager.ins().isOpened(UIActivityKey.CareerTrialsFundView)) {
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
        this.view.list_award.itemRenderer = this.awardItemRenderer.bind(this);
        this.view.btnRule.on(fgui.Event.CLICK, this.onClickRule, this);

        this.view.btn_goto.on(fgui.Event.CLICK, this.onClickGoto, this);
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this._vo = GIns.activityModel.getActivityVoById(args?.typeParam) as ActivityCareerTrialsVo;
        this._ruleId = args.ruleId;
        if (!this._vo) {
            this.closeSelf();
            return;
        }

        this.updateUI();
    }

    private updateUI() {
        this.view.list_award.numItems = this._vo.fundCfgs.length;

        // let heroVo = GIns.heroMgr.getHeroVoByID(this._vo.cfg.fundShowHeroId[0]);
        // this.view.img_hero.icon = this._vo.cfg.showHeroIcon;
        // this.view.T_heroName.text = heroVo.heroCfg.name;
        let lv = GIns.captainSkillModel.context.coreLv >= 0 ? GIns.captainSkillModel.context.coreLv : 0;
        this.view.T_task.text = "Lv." + lv;

        this.onTimer();
        G.GameTimer.clearAll(this);
        G.GameTimer.loop(1000, this, this.onTimer);
    }

    private onTimer() {
        let time = this._vo.getLeftTime();
        if (time > 0) {
            let timeTest = TimeUtils.formatTimeMsToDayHourMinuteSecondText(time);
            this.view.T_time.text = `活动倒计时:[color=#6AFF63]${timeTest}[/color]`;
        } else {
            this.view.T_time.text = "";
            G.GameTimer.clearAll(this);
        }
    }

    private awardItemRenderer(index: number, item: TrialsFundItem) {
        let cfg = this._vo.fundCfgs[index];
        let isLastOne = index === this._vo.fundCfgs.length - 1;
        item.setData(this._vo, cfg, isLastOne);
    }

    protected onClickRule(): void {
        RuleController.ins().openRule(this._ruleId, this.view.btnRule);
    }

    private onClickGoto() {
        GIns.jumpManager.jumpById(56);
    }

    protected onClose(dontDispose?: boolean): void {
        G.GameTimer.clearAll(this);
    }
}

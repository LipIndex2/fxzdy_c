import * as fgui from "fairygui-cc";
import { EnumUIViewLayer } from "../../../../../core/comm/LayerManager";
import { bindScript } from "../../../../../core/comm/UIScriptManager";
import { UIView, ViewAdaptType } from "../../../../../core/mvc/view/UIView";
import { UIActivityKey } from "../../const/UIActivityConfig";
import { DoubleWeekAwardItem } from "../item/DoubleWeekAwardItem";
import { ActivityDoubleWeekVo } from "../../model/ActivityDoubleWeekVo";
import GIns from "../../../../GIns";
import G from "../../../../../core/comm/G";
import { TimeUtils } from "../../../../comm/utils/TimeUtils";
import NotificationKey from "../../../../event/NotificationKey";
import { RuleController } from "../../../rule/RuleController";
import { ServerEnums } from "../../../../../libs/extras/ServerEnums";

/**
 * 双周活动
 * 主界面
 */
@bindScript(UIActivityKey.DoubleWeekMainView)
export class DoubleWeekMainView extends UIView {
    static pkgName: string = "activityDoubleWeek";
    static viewName: string = "DoubleWeekMainView";
    protected _layer: EnumUIViewLayer = EnumUIViewLayer.SUBVIEW;
    protected adaptType = ViewAdaptType.TOP;

    private get view(): ui.activityDoubleWeek.DoubleWeekMainView {
        return this._view as any;
    }

    private _vo: ActivityDoubleWeekVo;

    listenNotifications(): string[] {
        return [NotificationKey.DOUBLE_WEEK_TASK_UPDATE, NotificationKey.ACTIVITY_UPDATE, NotificationKey.ACTIVITY_END_REFRESH];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.DOUBLE_WEEK_TASK_UPDATE:
                this.view.list_award.numItems = this._vo.cfgs.length;
                break;
            case NotificationKey.ACTIVITY_UPDATE:
                if (args == this._vo.activityId) {
                    this.view.list_award.numItems = this._vo.cfgs.length;
                }
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
        // this.view.list_award.setVirtual();
        this.view.list_award.itemRenderer = this.awardItemRenderer.bind(this);

        this.view.btn_jump.on(fgui.Event.CLICK, this.onJumpClick, this);
        this.view.btnRule.on(fgui.Event.CLICK, this.onRuleClick, this);

        this.view.footer.btnBack.on(fgui.Event.CLICK, this.closeSelf, this);
    }

    protected onOpen(arge: any, isReopen?: boolean): void {
        if (arge) {
            this._vo = GIns.activityModel.getActivityVoById(arge.typeParam);
        } else {
            this._vo = GIns.activityModel.getActivityVoByType(ServerEnums.ActivityType.DOUBLE_WEEKLY);
        }

        if (!this._vo || this._vo.isActivityOver()) {
            this.closeSelf();
            return;
        }
        this.view.list_award.numItems = this._vo.cfgs.length;
        this.loopTime();
        G.GameTimer.loop(1000, this, this.loopTime);

        this.view.btn_jump.icon = this._vo.cfg.jumpIcon;
        this.view.img_bg.icon = this._vo.cfg.icon;
        this.view.T_title.text = this._vo.cfg.title;
        if (this._vo.cfg.itemid) {
            this.view.headerItem1.visible = true;
            //@ts-ignore
            this.view.headerItem1.reset(1, true);
        } else {
            this.view.headerItem1.visible = false;
        }
    }

    private loopTime() {
        let time = TimeUtils.formatTimeMsToDayHourMinuteSecondText(this._vo.getLeftTime());
        this.view.T_time.text = `活动剩余时间:[color=#3CFE37]${time}[/color]`;
    }

    private awardItemRenderer(index: number, item: DoubleWeekAwardItem) {
        let data = this._vo.cfgs[index];
        item.setData(data, this._vo);
    }

    private onJumpClick() {
        if (!this._vo.cfg.jumpId) return false;
        GIns.jumpManager.jumpById(this._vo.cfg.jumpId);
    }

    private onRuleClick() {
        RuleController.ins().openRule(this._vo.cfg.ruleId, this.view.btnRule);
    }

    protected onClose(dontDispose?: boolean): void {
        G.GameTimer.clearAll(this);
    }
}

import G from "../../../../core/comm/G";
import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIView, ViewAdaptType } from "../../../../core/mvc/view/UIView";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import { ActivityModel } from "../../../comm/activity/model/ActivityModel";
import NotificationKey from "../../../event/NotificationKey";
import { UIActivityKey } from "../const/UIActivityConfig";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { HeaderItem } from "db://assets/scripts/game/modules/common/header/HeaderItem";
import { RuleController } from "db://assets/scripts/game/modules/rule/RuleController";
import { I18nManager } from "db://assets/scripts/core/i18n/I18nManager";
import GIns from "db://assets/scripts/game/GIns";
import { TableManager } from "db://assets/scripts/core/table/TableManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { ActivityReachStandardVo } from "db://assets/scripts/game/modules/activity/model/ActivityReachStandardVo";
import { ItemListComp } from "db://assets/scripts/game/modules/common/item/ItemListComp";
import { BackpackManager } from "db://assets/scripts/game/modules/backpack/BackpackManager";
import { Logger } from "db://assets/scripts/core/log/Logger";
import { FloatingTextManager } from "db://assets/scripts/game/modules/floatingText/FloatingTextManager";
import { RedDotUtils } from "db://assets/scripts/game/modules/common/redDot/utils/RedDotUtils";
import { RedDotKeys } from "db://assets/scripts/game/modules/common/redDot/RedDotKeys";


/**
 * 翻牌 进度
 */
@bindScript(UIActivityKey.ActivityFlipCardScoreRewardSubView)
export class ActivityFlipCardScoreRewardSubView extends UIView {

    static pkgName: string = "activityFlipCard";
    static viewName: string = "ActivityFlipCardScoreRewardSubView";
    protected _layer: EnumUIViewLayer = EnumUIViewLayer.SUBVIEW;
    protected adaptType = ViewAdaptType.TOP;

    private _vo: ActivityReachStandardVo;
    private _activityId: number = 0;
    private _showConfig: table.activity.ActivityConstant.ActivityClientConfig;
    private _isHaveTask: boolean = true;

    private get view(): ui.activityFlipCard.ActivityFlipCardScoreRewardSubView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK,
            NotificationKey.ACTIVITY_UPDATE,
            NotificationKey.ACTIVITY_REQUEST_BACK,
            NotificationKey.CLOSE_ViEW,
            NotificationKey.CHARGE_COMPLETE,
        ];
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK:
            case NotificationKey.ACTIVITY_UPDATE:
                if (args === this._vo?.activityId) {
                    this._vo = ActivityModel.ins().getActivityVoById(args);
                    this.reset();
                }
                break;

            case NotificationKey.CHARGE_COMPLETE:
                GIns.activityModel.sendActivity(this._vo.activityId);
                break;
            case NotificationKey.CLOSE_ViEW:
            case NotificationKey.ACTIVITY_REQUEST_BACK:
                this.reset();
                break;
        }
    }

    protected onInit() {

        // 子界面
        // this.view.getController("isSubView").selectedIndex = this._layer == EnumUIViewLayer.SUBVIEW ? 1 : 0;


        this.view.btnRule.onClick(this.openRule, this);
        this.view.btnGain.onClick(this.onClickGain, this);

        G.GameTimer.loop(500, this, this.updateTime)

    }

    openRule() {
        RuleController.ins().openRule(this._showConfig.ruleId, this.view.btnRule);
    }

    onClickGain() {
        if (!this._isHaveTask) {
            Logger.game("已经全部领取完了");
            return;
        }

        //  积分
        const progress = this._vo.getCurrentRoundProgress();
        const maxProgress = this._vo.getCurrentRoundMaxProgress();
        const isCanGain = progress >= maxProgress;
        if (!isCanGain) {
            FloatingTextManager.ins().showTips("当前积分不足");
            return;
        }

        // net
        this._vo.sendGainFirstTask();
    }

    protected updateTime(): void {
        const leftTimeMs = this._vo?.getLeftTime();
        this.view.T_restTime.text = TimeUtils.formatTimeMsToDayHourMinuteSecondText(leftTimeMs);

    }


    protected onOpen(clientConfig: table.activity.ActivityConstant.ActivityClientConfig,
                     isReopen?: boolean
    ): void {
        if (this._layer != EnumUIViewLayer.SUBVIEW) {
            const activityIdByType = ActivityModel.ins().getActivityIdByType(ServerEnums.ActivityType.LOTTERY);
            clientConfig = TableManager.getAllData(table.activity.ActivityConstant.ActivityClientConfig)
                .filter(it => it.typeParam == activityIdByType)[0]
            ;
        }
        let activityId = clientConfig?.typeParam || 0;
        this._vo = ActivityModel.ins().getActivityVoById(activityId)
        if (this._vo == null) {
            return
        }
        this._activityId = activityId;
        this._showConfig = clientConfig;

        const name = I18nManager.ins().translateOrBlank(clientConfig.name);
        this.view.T_title1.text = name[0];
        this.view.T_title2.text = name.substring(1);


        // header 
        if (this._showConfig.headerItemId > 0) {
            this.view.headerItem.visible = true;
            FguiScriptUtils.toMyScriptClass(this.view.headerItem, HeaderItem)
                .reset(this._showConfig.headerItemId, true);

        } else {
            this.view.headerItem.visible = false;
        }

        G.GameTimer.once(2, this, () => {
            this.reset();
        })
    }


    public reset(): void {

        const curTaskConfig = this._vo.getCurrentRoundFirstTaskConfig();
        const redDotCom = RedDotUtils.castComp(this.view.btnGain.redDot);
        if (curTaskConfig) {

            redDotCom.reset(RedDotKeys.StandardActivity_task, [this._vo.activityId, curTaskConfig.id]);
        } else {
            redDotCom.reset(RedDotKeys.Null);
        }

        this.view.lebalTurnCount.text = `完成轮次: ${this._vo.round}/${this._vo.maxRound}`

        const curRoundRewards = this._vo.getCurrentRoundRewards();
        FguiScriptUtils.toMyScriptClass(this.view.itemList, ItemListComp)
            .reset(curRoundRewards);
        // FguiScriptUtils.toMyScriptClass(this.view.itemList2, ItemListComp)
        //     .reset(curRoundRewards);

        //  积分
        const progress = this._vo.getCurrentRoundProgress();
        const maxProgress = this._vo.getCurrentRoundMaxProgress();

        this.view.scoreComp.bar.value = Math.min(progress, maxProgress);
        this.view.scoreComp.bar.max = maxProgress;

        // 累计积分
        const scoreItemId = this._vo.getScoreItemId();
        const count = BackpackManager.ins().getItemCountByItemId(scoreItemId)
        this.view.scoreComp.T_score.text = `${count}`;

        const isHaveTask = maxProgress > 0;
        this._isHaveTask = isHaveTask;

        // this.view.itemList2.visible = !isHaveTask;


        if (isHaveTask) {
            this.view.btnGain.grayed = false;
            this.view.btnGain.title = "领取"
        }

        const isCanGain = progress >= maxProgress;
        this.view.btnGain.grayed = !isCanGain;

        if (!isHaveTask) {
            this.view.btnGain.grayed = true;
            this.view.btnGain.title = "已完成";
        }

        this.updateTime();
    }

    protected onClose(): void {
        G.GameTimer.clearAll(this);
    }
}
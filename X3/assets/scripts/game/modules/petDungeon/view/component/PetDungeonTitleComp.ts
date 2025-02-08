import G from "../../../../../core/comm/G";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { FguiNotificationGComponent } from "../../../../../core/mvc/view/FguiNotificationGComponent";
import { TimeUtils } from "../../../../comm/utils/TimeUtils";
import NotificationKey from "../../../../event/NotificationKey";
import GIns from "../../../../GIns";
import { EnumRuleKeys } from "../../../rule/enums/EnumRuleKeys";
import { RuleController } from "../../../rule/RuleController";

@bindFguiExtension('ui://petDungeon/PetDungeonTitleComp')
export class PetDungeonTitleComp extends FguiNotificationGComponent {

    static pkgName: string = "petDungeon";
    static viewName: string = "PetDungeonTitleComp";

    protected _timerKey: string = null;
    protected _endTime: number = 0;

    listenNotifications(): string[] {
        return [
            NotificationKey.PET_DUNGEON_TIME_CHANGE
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.PET_DUNGEON_TIME_CHANGE:
                this.updateUI();
                break;
        }
    }

    private get view(): ui.petDungeon.component.PetDungeonTitleComp {
        return this as any;
    }

    /***组件初始化 */
    protected onInit(): void {
        super.onInit();
        this.view.btnRule.onClick(this.onClickRule, this);
    }

    protected onPreDispose(): void {
        this.removeTimer();
        super.onPreDispose();
    }

    protected onClickRule():void {
        RuleController.ins().openRule(EnumRuleKeys.PET_DUNGEON, this.view.btnRule);
    }

    /**添加计时器*/
    protected addTimer(): void {
        if (!this._timerKey) {
            this._timerKey = G.GameTimer.loop(500, this, this.onTimer)
        }
        this.onTimer();
    }

    /**移除计时器*/
    protected removeTimer(): void {
        if (this._timerKey) {
            G.GameTimer.clearByKey(this._timerKey)
            this._timerKey = null
        }
    }

    protected onTimer(): void {
        let nowTime: number = G.TimeManager.serverNow;
        let remainTime = this._endTime - nowTime;
        if (remainTime < 0) {
            this.removeTimer();
            remainTime = 0;
        }
        this.view.lbTime.text = TimeUtils.formatTimeMsToDayHourMinuteSecondText(remainTime) + '后结算';
    }

    public updateUI(): void {
        this._endTime = GIns.petDungeonModel.activityInfo.endTime;
        this.addTimer();
    }
}
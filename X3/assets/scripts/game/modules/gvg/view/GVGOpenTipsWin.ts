import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { bindScript } from "db://assets/scripts/core/comm/UIScriptManager";
import { GVGUIKeys } from "db://assets/scripts/game/modules/gvg/GVGUIKeys";
import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import { GVGModel } from "db://assets/scripts/game/modules/gvg/GVGModel";
import { TimeManager } from "db://assets/scripts/core/time/TimeManager";
import { TimeUtils } from "db://assets/scripts/game/comm/utils/TimeUtils";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { GVGOpenConditionComp } from "db://assets/scripts/game/modules/gvg/components/GVGOpenConditionComp";
import { EnumGVGConditionType } from "db://assets/scripts/game/modules/gvg/enums/EnumGVGConditionType";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { FloatingTextManager } from "db://assets/scripts/game/modules/floatingText/FloatingTextManager";

/**
 * 联盟对决
 */
@bindScript(GVGUIKeys.GVGOpenTipsWin)
export class GVGOpenTipsWin extends UICommWin {

    static pkgName: string = "gvg";
    static viewName: string = "GVGOpenTipsWin";

    private get view(): ui.gvg.GVGOpenTipsWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.EVENT_LEAGUE_INFO_CHANGE,
            NotificationKey.EVENT_HAVE_LEAGUE,
            NotificationKey.EVENT_LEAGUE_MEMBER_CHANGE,
            NotificationKey.LEAGUE_MEMBER_COUNT_CHANGE
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_LEAGUE_INFO_CHANGE:
            case NotificationKey.LEAGUE_MEMBER_COUNT_CHANGE:
            case NotificationKey.EVENT_HAVE_LEAGUE:
            case NotificationKey.EVENT_LEAGUE_MEMBER_CHANGE: {
                this.reset();
                break;
            }
        }

    }

    protected onInit() {

        GameTimer.ins().loop(30, this, this.updateCdTime);
    }

    @LogBusiness("打开界面")
    public onOpen(args: any): void {


        this.reset();
    }


    @LogBusiness("关闭界面")
    protected onClose() {
        GameTimer.ins().clearAll(this);

        super.onClose();


    }

    updateCdTime() {

        //  TODO 开赛倒计时
        const context = GVGModel.ins().context;

        const stage = context.getStage();

        if (stage != ServerEnums.LeagueWarStatus.END) {
            FloatingTextManager.ins().showTips("阶段发生变化");
            this.closeSelf();
            return;
        }
        
        const phaseEndTimeMs = context.getPhaseEndTimeMs();

        const serverNow = TimeManager.serverNow;

        const diffTimeMs = Math.max(0, phaseEndTimeMs - serverNow);
        const cdTimeText = TimeUtils.formatTimeMsToPositiveTimeText(diffTimeMs);
        this.view.labelCdTime.text = cdTimeText;
    }

    reset() {
        // TODO 条件
        this.view.labelContent.text = "  星际大乱，联盟对决，各联盟为了稳定星际秩序，角逐最强联盟，大战一触即发...";


        const comp1 = FguiScriptUtils.toMyScriptClass(this.view.condition1, GVGOpenConditionComp);
        const isOpen1 = comp1.reset(EnumGVGConditionType.C_1);
        const comp2 = FguiScriptUtils.toMyScriptClass(this.view.condition2, GVGOpenConditionComp);
        const isOpen2 = comp2.reset(EnumGVGConditionType.C_2);

        const isAllOpen = isOpen1 && isOpen2;
        if (isAllOpen) {
            this.view.labelIsCanJoin.text = "已满足本轮参与条件";
        } else {
            this.view.labelIsCanJoin.text = "未满足本轮参与条件";
        }
    }

}
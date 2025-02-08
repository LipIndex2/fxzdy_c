import G from "db://assets/scripts/core/comm/G";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import UIScriptManager from "db://assets/scripts/core/comm/UIScriptManager";
import { GrowthPathUIKeys } from "db://assets/scripts/game/modules/growthpath/GrowthPathUIKeys";
import { ActivityModel } from "db://assets/scripts/game/comm/activity/model/ActivityModel";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { ActivityGrowthPathVo } from "db://assets/scripts/game/modules/activity/model/ActivityGrowUpVo";
import { GrowthPathTaskRowComp } from "db://assets/scripts/game/modules/growthpath/components/GrowthPathTaskRowComp";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { GrowthPathPanelComp } from "db://assets/scripts/game/modules/growthpath/components/GrowthPathPanelComp";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import { TimeUtils } from "db://assets/scripts/game/comm/utils/TimeUtils";
import { TaskData } from "db://assets/scripts/game/modules/task/structs/TaskData";
import { UIManager } from "db://assets/scripts/core/mvc/UIManager";
import { UIPage } from "db://assets/scripts/core/mvc/view/UIPage";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { HeaderItem3 } from "db://assets/scripts/game/modules/common/header/HeaderItem3";
import { GrowthPathConfigManager } from "db://assets/scripts/game/modules/growthpath/config/GrowthPathConfigManager";
import { TimeI18nKeys } from "db://assets/scripts/game/modules/common/i18n/TimeI18nKeys";
import { DateUtils } from "db://assets/scripts/core/utils/DateUtils";
import ActivityType = ServerEnums.ActivityType;
import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import { ViewAdaptType } from "../../../../core/mvc/view/UIView";
import { UiTweenMgr } from "../../../../core/comm/UiTweenMgr";

/**
 * 成长之路
 */
export class GrowthPathMainView extends UIPage {

    static pkgName: string = "growthPath";
    static viewName: string = "GrowthPathMainView";
    protected _layer: EnumUIViewLayer = EnumUIViewLayer.SUBVIEW;
    protected adaptType = ViewAdaptType.TOP;

    private _vo: ActivityGrowthPathVo;
    // 普通任务
    private _normalTaskArray: Array<TaskData> = [];

    private get view(): ui.growthPath.GrowthPathMainView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.GROW_UP_TASK_UPDATE
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case  NotificationKey.GROW_UP_TASK_UPDATE:
                this.reset();
                break;
        }

    }

    protected onInit() {

        this._vo = ActivityModel.ins().getDefaultActivityVoByType<ActivityGrowthPathVo>(ActivityType.GROW_UP);
        
        // this.view.footer.btnBack.onClick(() => {
        //     this.closeSelf();
        // }, this);

        this.view.labelTime.text = "";

        this.view.rowList.setVirtual();
        this.view.rowList.itemRenderer = this.itemRenderForRow.bind(this);

        this.view.btnReward.onClick(this.onBtnRewardClick, this);

        this.updateTime();

        this.view.header1.visible = false
        this.view.header2.visible = false
    }

    onBtnRewardClick() {
        UIManager.ins().open(GrowthPathUIKeys.GrowthPathRewardView);
    }

    updateTime() {
        if (!this._vo) {
            return;
        }
        const leftTimeMs = this._vo.getLeftTime();
        // 1年以上
        if (leftTimeMs >= DateUtils.yearTimes) {
            this.view.labelTime.text = TimeI18nKeys.forever;
            return;
        }
        this.view.labelTime.text = TimeUtils.formatTimeMsToDayHourMinuteText(leftTimeMs);
    }

    @LogBusiness("打开界面")
    public onOpen(args: any): void {
        G.Logger.debug(" onOpen ");


        GameTimer.ins().clearAll(this);
        GameTimer.ins().frameLoop(30, this, this.updateTime);

        this.reset();

        this.view.getTransition('t0').play()
        UiTweenMgr.ins().listShowEffect(this.view.rowList)
    }


    private reset() {
        const vo = this._vo;
        if (!vo) {
            return;
        }
        const header1 = FguiScriptUtils.toMyScriptClass(this.view.header1, HeaderItem3);
        header1.reset(GrowthPathConfigManager.headerItemId1);
        const header2 = FguiScriptUtils.toMyScriptClass(this.view.header2, HeaderItem3);
        header2.reset(GrowthPathConfigManager.headerItemId2);

        // 小任务
        this._normalTaskArray = vo.getNormalTaskSortArray() || [];
        this.view.rowList.numItems = this._normalTaskArray.length;
        this.view.rowList.refreshVirtualList();

        // 大奖面板
        const bigRewardTask = this._vo.getBigRewardTask();
        if (bigRewardTask) {
            const panelComp = FguiScriptUtils.toMyScriptClass(this.view.rewardP, GrowthPathPanelComp);
            panelComp.reset(bigRewardTask);
        }
    }

    @LogBusiness("关闭界面")
    protected onClose() {

        GameTimer.ins().clearAll(this);
        UiTweenMgr.ins().removeTweenEffect(this.view.rowList)
        super.onClose();
    }

    itemRenderForRow(index: number, comp: GrowthPathTaskRowComp) {
        const taskVo = this._normalTaskArray[index];
        comp.reset(taskVo);
    }
}

UIScriptManager.bindScript(GrowthPathUIKeys.GrowthPathMainView, GrowthPathMainView);
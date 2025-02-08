import G from "db://assets/scripts/core/comm/G";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import UIScriptManager from "db://assets/scripts/core/comm/UIScriptManager";
import { GrowthPathUIKeys } from "db://assets/scripts/game/modules/growthpath/GrowthPathUIKeys";
import { ActivityModel } from "db://assets/scripts/game/comm/activity/model/ActivityModel";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { ActivityGrowthPathVo } from "db://assets/scripts/game/modules/activity/model/ActivityGrowUpVo";
import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import {
    GrowthPathOneRowRewardComp
} from "db://assets/scripts/game/modules/growthpath/components/GrowthPathOneRowRewardComp";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import ActivityType = ServerEnums.ActivityType;

/**
 * 成长之路
 */
export class GrowthPathRewardView extends UICommWin {

    static pkgName: string = "growthPath";
    static viewName: string = "GrowthPathRewardView";

    private _vo: ActivityGrowthPathVo;
    
    // <stageId, rewardArray>
    private _stageIdToRewardArrayMap: Map<number, NoOwnerItem[]> = new Map();

    private get view(): ui.growthPath.GrowthPathRewardView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
        }

    }

    protected onInit() {
        this.view.rowList.setVirtual();
        this.view.rowList.itemRenderer = this.iRForRow.bind(this);
    }

    @LogBusiness("打开界面")
    public onOpen(args: any): void {
        G.Logger.debug(" onOpen ");

        const vo = ActivityModel.ins().getDefaultActivityVoByType<ActivityGrowthPathVo>(ActivityType.GROW_UP);
        if (!vo) {
            return;
        }
        this._vo = vo;

        this._stageIdToRewardArrayMap = vo.getRewardArrayGroupByStageId();
        this.view.rowList.numItems = this._stageIdToRewardArrayMap.size;

    }


    @LogBusiness("关闭界面")
    protected onClose() {
        super.onClose();
    }

    iRForRow(index: number, comp: GrowthPathOneRowRewardComp) {
        const rowId = index + 1;
        const rewards = this._stageIdToRewardArrayMap.get(rowId);
        comp.reset(rowId, rewards);
    }
}

UIScriptManager.bindScript(GrowthPathUIKeys.GrowthPathRewardView, GrowthPathRewardView);
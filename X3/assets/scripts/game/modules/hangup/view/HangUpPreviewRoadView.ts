import * as fgui from "fairygui-cc";
import { HangUpReviewRoadItemComp } from "db://assets/scripts/game/modules/hangup/components/HangUpReviewRoadItemComp";
import { HangUpConfigManager } from "db://assets/scripts/game/modules/hangup/config/HangUpConfigManager";
import { HangUpModel } from "db://assets/scripts/game/modules/hangup/model/HangUpModel";
import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { HangUpUIKeys } from "../HangUpUIKeys";

const {GObject} = fgui;

/**
 * 挂机关卡, 战斗界面
 */
@bindScript(HangUpUIKeys.HangUpPreviewRoadView)
export class HangUpPreviewRoadView extends UICommWin {

    static pkgName: string = "hangUp";
    static viewName: string = "HangUpPreviewRoadView";

    // 挂机关卡id 
    private _levelId: number;
    private _configs: table.trunkinstance.TrunkInstanceConfig[];

    private get view(): ui.hangUp.HangUpPreviewRoadView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [];
    }

    notificationHandler(eventName: string, args?: any): void {

    }

    public onInit(): void {
        console.debug(" onInit ");

        this.view.btnBack.onClick(() => {
            this.closeSelf();
        }, this);

        this.view.roadList.setVirtual();
        this.view.roadList.itemRenderer = this.irRoad.bind(this);
    }


    protected onOpen(args: any, isReopen?: boolean) {
        super.onOpen(args, isReopen);

        this.reset();

    }

    reset() {
        this._configs = HangUpConfigManager.getCanSeeConfigArrayByCurLevelId();
        this.view.roadList.numItems = this._configs.length;


        const context = HangUpModel.ins().context;
        const showLevelId = context.getCurrentLevelConfig().showLevelId;

        if (showLevelId > 20) {
            this.view.roadList.scrollToView(20, false, true);
        } else {
            this.view.roadList.scrollToView(showLevelId, false, true);
        }

    }

    irRoad(index: number,
           comp: HangUpReviewRoadItemComp
    ) {
        comp.reset(this._configs[index]);

    }
}
import { bindScript } from "db://assets/scripts/core/comm/UIScriptManager";
import { UIActivityKey } from "db://assets/scripts/game/modules/activity/const/UIActivityConfig";
import { SevenDayTabBtn } from "db://assets/scripts/game/modules/activity/sevenDay/btn/SevenDayTabBtn";
import { UIPage } from "db://assets/scripts/core/mvc/view/UIPage";
import { EnumUIViewLayer } from "db://assets/scripts/core/comm/LayerManager";
import { ViewAdaptType } from "db://assets/scripts/core/mvc/view/UIView";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { SevenDayLoginSubView } from "db://assets/scripts/game/modules/activity/sevenDay/subView/SevenDayLoginSubView";
import { FGUIMaskUtils } from "db://assets/scripts/game/ui/common/mask/FGUIMaskUtils";


/**
 *  七日登录 task
 *  子页面
 */
@bindScript(UIActivityKey.SevenDayLoginSubPage)
export class SevenDayLoginSubPage extends UIPage {


    static pkgName: string = "sevenDay";
    static viewName: string = "SevenDayLoginSubPage";
    protected _layer: EnumUIViewLayer = EnumUIViewLayer.SUBVIEW;


    /** 活动id */
    private _aid: number;

    private get view(): ui.sevenDay.SevenDayLoginSubPage {
        return this._view as any;
    }

    protected onInit() {

        // FGUIMaskUtils.createBackgroundMask(this.view);
    }


    protected onOpen(config: table.activity.ActivityConstant.ActivityClientConfig, isReopen?: boolean): void {
        const activityId = config.typeParam;
        this._aid = activityId;

        FguiScriptUtils.toMyScriptClass(this.view.login, SevenDayLoginSubView)
            .reset(activityId)


    }


    irTab(index: number, btn: SevenDayTabBtn) {
        btn.reset(index);
    }


    protected onClose(dontDispose: boolean = false) {


        super.onClose(dontDispose);
    }
}
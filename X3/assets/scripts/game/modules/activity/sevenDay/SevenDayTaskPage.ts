import { bindScript } from "db://assets/scripts/core/comm/UIScriptManager";
import { UIActivityKey } from "db://assets/scripts/game/modules/activity/const/UIActivityConfig";
import { SevenDayTabBtn } from "db://assets/scripts/game/modules/activity/sevenDay/btn/SevenDayTabBtn";
import { UIPage } from "db://assets/scripts/core/mvc/view/UIPage";
import { EnumUIViewLayer } from "db://assets/scripts/core/comm/LayerManager";
import { ViewAdaptType } from "db://assets/scripts/core/mvc/view/UIView";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { SevenDayTaskSubView } from "./subView/SevenDayTaskSubView";


/**
 *  头七 task
 *  子页面
 */
@bindScript(UIActivityKey.SevenDayTaskPage)
export class SevenDayTaskPage extends UIPage {


    static pkgName: string = "sevenDay";
    static viewName: string = "SevenDayTaskPage";
    protected _layer: EnumUIViewLayer = EnumUIViewLayer.SUBVIEW;
    protected adaptType = ViewAdaptType.TOP;

    private get view(): ui.sevenDay.SevenDayTaskPage {
        return this._view as any;
    }

    protected onInit() {
    }

    protected onOpen(args: table.activity.ActivityConstant.ActivityConstantConfig, isReopen?: boolean) {
        super.onOpen(args, isReopen);
        FguiScriptUtils.toMyScriptClass(this.view.task, SevenDayTaskSubView).onOpen()

    }

    irTab(index: number, btn: SevenDayTabBtn) {
        btn.reset(index);
    }


    protected onClose(dontDispose: boolean = false) {


        super.onClose(dontDispose);
    }
}
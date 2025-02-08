import { UIView } from "db://assets/scripts/core/mvc/view/UIView";
import { bindScript } from "db://assets/scripts/core/comm/UIScriptManager";
import { UIActivityKey } from "db://assets/scripts/game/modules/activity/const/UIActivityConfig";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { SevenDayLoginSubView } from "db://assets/scripts/game/modules/activity/sevenDay/subView/SevenDayLoginSubView";
import { SevenDayTabBtn } from "db://assets/scripts/game/modules/activity/sevenDay/btn/SevenDayTabBtn";


@bindScript(UIActivityKey.SevenDayMainView)
export class SevenDayMainView extends UIView {


    static pkgName: string = "sevenDay";
    static viewName: string = "SevenDayMainView";

    private get view(): ui.sevenDay.SevenDayMainView {
        return this._view as any;
    }

    protected onInit() {
        super.onInit();

        this.view.btnBack.onClick(() => {
            this.closeSelf()
        }, this);

        this.view.tabList.itemRenderer = this.irTab.bind(this);
        this.view.tabList.numItems = 2;
    }


    protected onOpen(args: table.activity.ActivityConstant.ActivityConstantConfig, isReopen?: boolean) {
        super.onOpen(args, isReopen);


        // 先写死活动id
        FguiScriptUtils.toMyScriptClass(this.view.loginSubView, SevenDayLoginSubView)
            .reset(1021, true);
        
        this.view.tabList.selectedIndex = 0;
    }

    irTab(index: number, btn: SevenDayTabBtn) {
        btn.reset(index);
    }


    protected onClose(dontDispose: boolean = false) {


        super.onClose(dontDispose);
    }
}
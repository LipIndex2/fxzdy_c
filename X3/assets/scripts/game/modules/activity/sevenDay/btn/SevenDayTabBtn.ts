import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";

@bindFguiExtension("ui://sevenDay/SevenDayTabBtn")
export class SevenDayTabBtn extends FGUI.GButton {

    get view(): ui.sevenDay.btn.SevenDayTabBtn {
        return this as any;
    }

    protected onConstruct() {
        super.onConstruct();

        this.view.onClick(this.onClick0, this);
    }

    onClick0() {
        
    }

    reset(index: number) {
        if (index == 0) {

            this.view.imgLogoChoose.icon = "ui://sevenDay/img_sevenDay_login_yes";
            this.view.imgLogoNoChoose.icon = "ui://sevenDay/img_sevenDay_login_no";
            this.view.labelNoChoose.text = "七日登录";
            this.view.labelChoose.text = "七日登录";
            
        }
        if (index == 1) {

            this.view.imgLogoChoose.icon = "ui://sevenDay/img_sevenDay_task_yes";
            this.view.imgLogoNoChoose.icon = "ui://sevenDay/img_sevenDay_task_no";
            this.view.labelNoChoose.text = "七日任务";
            this.view.labelChoose.text = "七日任务";

        }
    }

}
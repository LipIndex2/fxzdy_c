import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import { SystemSettingManager } from "db://assets/scripts/core/settings/SystemSettingManager";

@bindFguiExtension("ui://systemSetting/SystemSettingBatteryBtn")
export class SystemSettingBatteryBtn extends FGUI.GButton {

    private _index: number = 0;
    private _isOpen: boolean = true;
    private _keepMinute: number = 0;

    get view(): ui.systemSetting.btn.SystemSettingBatteryBtn {
        return this as any;
    }

    protected onConstruct() {

        this.view.onClick(this.onClickSwitch, this);
    }

    onClickSwitch() {

        // TODO

        // 记录
        SystemSettingManager.ins().localStorageData.keepBatteryMinute = this._keepMinute;
    }

    reset(index: number) {
        this._index = index;


        if (index == 0) {
            this._keepMinute = 5;
            this.view.textTitle.text = "5分钟";
        } else if (index == 1) {
            this._keepMinute = 10;
            this.view.textTitle.text = "10分钟";
        } else {
            this._keepMinute = 0;
            this.view.textTitle.text = "从不";
        }


        // 选中的
        if (this._keepMinute == SystemSettingManager.ins().localStorageData.keepBatteryMinute) {
            this.view.fireClick();
        }
    }
}
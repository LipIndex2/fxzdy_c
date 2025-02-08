import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { bindScript } from "db://assets/scripts/core/comm/UIScriptManager";
import { SystemSettingUIKeys } from "db://assets/scripts/game/modules/systemsetting/SystemSettingUIKeys";
import { SystemSettingBaseComp } from "db://assets/scripts/game/modules/systemsetting/components/SystemSettingBaseComp";
import {
    SystemSettingBatteryBtn
} from "db://assets/scripts/game/modules/systemsetting/components/SystemSettingBatteryBtn";
import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import { UIManager } from "db://assets/scripts/core/mvc/UIManager";
import { RedemptionUIKeys } from "db://assets/scripts/game/modules/redemption/RedemptionUIKeys";
import { DebugUtils } from "db://assets/scripts/core/utils/DebugUtils";
import { Logger } from "db://assets/scripts/core/log/Logger";

/**
 * 系统设置
 */
@bindScript(SystemSettingUIKeys.SystemSettingBaseView)
export class SystemSettingBaseView extends UICommWin {

    static pkgName: string = "systemSetting";

    static viewName: string = "SystemSettingBaseView";

    private get view(): ui.systemSetting.SystemSettingBaseView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return null;
    }


    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
        }

    }

    protected onInit() {
        // TODO 初始化
        this.view.settingList.itemRenderer = this.irSystemSettingRow.bind(this);
        this.view.batteryList.itemRenderer = this.irBatterySwitch.bind(this);


        this.view.settingList.numItems = 3;
        this.view.batteryList.numItems = 3;


        this.view.btnBottom1.title = "兑换码";
        this.view.btnBottom2.title = "切换服务器";
        this.view.btnBottom3.title = "提醒设置";

        this.view.btnBottom1.onClick(this.onClickBottom1, this);
        this.view.btnBottom2.onClick(this.onClickBottom2, this);
        this.view.btnBottom3.onClick(this.onClickBottom3, this);

        // debug env
        if (DebugUtils.isEnableGM()) {
            this.view.btnGM.onClick(this.openGM, this);
        }
    }

    openGM() {
        Logger.game("【Debug 环境】打开 GM");
        UIManager.ins().open("GMView");
    }

    onClickBottom1() {
        // 兑换码
        UIManager.ins().open(RedemptionUIKeys.RedemptionCodeWin);

    }

    onClickBottom2() {
        // 切换服务器
        UIManager.ins().open(SystemSettingUIKeys.ChooseServerInGameWin);
    }

    onClickBottom3() {
        // 提醒
        UIManager.ins().open(SystemSettingUIKeys.SystemSettingRemindView);
    }

    irSystemSettingRow(index: number, comp: SystemSettingBaseComp) {
        comp.reset(index);
    }

    irBatterySwitch(index: number, comp: SystemSettingBatteryBtn) {
        comp.reset(index);
    }

    public onOpen(args: any): void {

        // TODO


    }


    protected onClose() {
        super.onClose();
    }


}
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { bindScript } from "db://assets/scripts/core/comm/UIScriptManager";
import { SystemSettingUIKeys } from "db://assets/scripts/game/modules/systemsetting/SystemSettingUIKeys";
import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import {
    SystemSettingConfigManager
} from "db://assets/scripts/game/modules/systemsetting/config/SystemSettingConfigManager";
import {
    SystemSettingOneRowComp
} from "db://assets/scripts/game/modules/systemsetting/components/SystemSettingOneRowComp";

/**
 * 系统设置
 */
@bindScript(SystemSettingUIKeys.SystemSettingRemindView)
export class SystemSettingRemindView extends UICommWin {

    static pkgName: string = "systemSetting";
    static viewName: string = "SystemSettingRemindView";
    
    private _configs: table.systemsetting.SystemSettingRemindConfig[];

    private get view(): ui.systemSetting.SystemSettingRemindView {
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
        
        this.view.itemList.setVirtual();
        this.view.itemList.itemRenderer = this.irItem.bind(this);


        this._configs = SystemSettingConfigManager.getRemindConfigArray();
        this.view.itemList.numItems = this._configs.length;

    }

    irItem(index: number, comp: SystemSettingOneRowComp) {
        comp.reset(this._configs[index]);
    }


    @LogBusiness("打开界面")
    public onOpen(args: any): void {
        console.debug(" onOpen ")

        // TODO


    }


    @LogBusiness("关闭界面")
    protected onClose() {
        super.onClose();
    }
}
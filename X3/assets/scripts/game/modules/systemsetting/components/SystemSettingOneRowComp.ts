import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import {
    EnumSystemSettingRemindType
} from "db://assets/scripts/game/modules/systemsetting/enums/EnumSystemSettingRemindType";
import { SystemSettingManager } from "db://assets/scripts/core/settings/SystemSettingManager";

@bindFguiExtension("ui://systemSetting/SystemSettingOneRowComp")
export class SystemSettingOneRowComp extends FGUI.GComponent {

    private _isOpen: boolean = true
    private _config: table.systemsetting.SystemSettingRemindConfig;

    get view(): ui.systemSetting.components.SystemSettingOneRowComp {
        return this as any;
    }

    protected onConstruct() {

        this.view.btnSwitch.onClick(this.onClickSwitch, this);
    }

    onClickSwitch() {
        const isOpenNew = !this._isOpen;
        this._isOpen = isOpenNew;

        this.view.btnSwitch.getController("isOpen").selectedIndex = isOpenNew ? 1 : 0;

        SystemSettingManager.ins().localStorageData.setIsOpenByRemindType(
            this._config.type,
            isOpenNew
        );

    }

    reset(config: table.systemsetting.SystemSettingRemindConfig) {
        this._config = config;


        this.view.labelTitle.text = config.name;
        this.view.labelContent.text = config.content;

        const type = config.type as EnumSystemSettingRemindType;

        // 是否开启
        let isOpen = SystemSettingManager.ins().localStorageData.getIsOpenByRemindType(type);

        this._isOpen = isOpen;
        this.view.btnSwitch.getController("isOpen").selectedIndex = isOpen ? 1 : 0;

    }


}
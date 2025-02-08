import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import { SystemSettingManager } from "db://assets/scripts/core/settings/SystemSettingManager";

@bindFguiExtension("ui://systemSetting/SystemSettingBaseComp")
export class SystemSettingBaseComp extends FGUI.GComponent {

    private _isOpen: boolean = true;
    private _index: number = 0;

    get view(): ui.systemSetting.components.SystemSettingBaseComp {
        return this as any;
    }

    protected onConstruct() {

        this.view.btnSwitch.onClick(this.onClickSwitch, this);
    }

    onClickSwitch() {
        const isOpenOld = this._isOpen;
        const isOpenNew = !this._isOpen;
        this._isOpen = isOpenNew;


        this.view.btnSwitch.getController("isOpen").selectedIndex = isOpenNew ? 1 : 0;

        // 记录
        if (this._index == 0) {
            SystemSettingManager.ins().localStorageData.isOpenAudioMusic = isOpenNew;
        } else if (this._index == 1) {
            SystemSettingManager.ins().localStorageData.isOpenAudioEffect = isOpenNew;
        } else {
            SystemSettingManager.ins().localStorageData.isOpenShake = isOpenNew;
        }
    }

    reset(index: number) {
        this._index = index;


        // TODO 恢复状态
        let isOpen = true;
        if (index == 0) {
            this.view.labelTitle.text = "音乐";
            this.view.imageLogo.icon = "ui://systemSetting/img_sound_music";

            isOpen = SystemSettingManager.ins().localStorageData.isOpenAudioMusic;

        } else if (index == 1) {
            this.view.labelTitle.text = "音效";
            this.view.imageLogo.icon = "ui://systemSetting/img_sound_effect";

            isOpen = SystemSettingManager.ins().localStorageData.isOpenAudioEffect;
        } else {
            this.view.labelTitle.text = "震动";
            this.view.imageLogo.icon = "ui://systemSetting/img_shake";

            isOpen = SystemSettingManager.ins().localStorageData.isOpenShake;
        }

        this._isOpen = isOpen;
        this.view.btnSwitch.getController("isOpen").selectedIndex = isOpen ? 1 : 0;
    }
}
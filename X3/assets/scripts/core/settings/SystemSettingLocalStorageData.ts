import { LocalStorageUtils } from "db://assets/scripts/core/utils/LocalStorageUtils";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import BaseNotificationKey from "../mvc/event/BaseNotificationKey";

/**
 * 系统设置 | 本地存储数据
 */
export class SystemSettingLocalStorageData {

    /**设置本地存储关键字 */
    static SettingsSaveKey = "systemSetting";

    // 开启音乐
    private _isOpenAudioMusic: boolean = true;
    // 开启音效
    private _isOpenAudioEffect: boolean = true;
    // 开启震动
    private _isOpenShake: boolean = true;

    // 省电设置, min | 0 = 从不
    private _keepBatteryMinute: number = 0;

    //<提醒类型, 是否开启>  |  <EnumSystemSettingRemindType : boolean>
    private _remindTypeToIsOpenObj: { [key: string]: boolean } = {}

    // 初始化游戏
    initGame() {
        FacadeManager.ins().emit(BaseNotificationKey.SYSTEM_AUDIO_MUSIC_CHANGE_OPEN, this._isOpenAudioMusic);
        FacadeManager.ins().emit(BaseNotificationKey.SYSTEM_AUDIO_EFFECT_CHANGE_OPEN, this._isOpenAudioEffect);
        FacadeManager.ins().emit(BaseNotificationKey.SYSTEM_SHAKE_CHANGE_OPEN, this._isOpenShake);
    }

    get isOpenAudioMusic(): boolean {
        return this._isOpenAudioMusic;
    }

    get isOpenAudioEffect(): boolean {
        return this._isOpenAudioEffect;
    }

    get isOpenShake(): boolean {
        return this._isOpenShake;
    }

    get keepBatteryMinute(): number {
        return this._keepBatteryMinute;
    }

    set isOpenAudioMusic(value: boolean) {
        this._isOpenAudioMusic = value;
        FacadeManager.ins().emit(BaseNotificationKey.SYSTEM_AUDIO_MUSIC_CHANGE_OPEN, value);

        this.flush();
    }

    set isOpenAudioEffect(value: boolean) {
        this._isOpenAudioEffect = value;
        FacadeManager.ins().emit(BaseNotificationKey.SYSTEM_AUDIO_EFFECT_CHANGE_OPEN, value);

        this.flush();
    }

    set isOpenShake(value: boolean) {
        this._isOpenShake = value;
        FacadeManager.ins().emit(BaseNotificationKey.SYSTEM_SHAKE_CHANGE_OPEN, value);

        this.flush();
    }

    set keepBatteryMinute(value: number) {
        this._keepBatteryMinute = value;
        this.flush();
    }

    // 提醒 get 
    getIsOpenByRemindType(type: string): boolean {
        const isOpen = this._remindTypeToIsOpenObj[type];
        if (isOpen == null) {
            return true;
        }
        return isOpen;
    }

    // 提醒 set
    setIsOpenByRemindType(type: string, isOpen: boolean) {
        this._remindTypeToIsOpenObj[type] = isOpen;
        this.flush();
    }

    flush() {
        console.info("[系统设置] 更新!")
        LocalStorageUtils.set(SystemSettingLocalStorageData.SettingsSaveKey, this);
        // event
        FacadeManager.ins().emit(BaseNotificationKey.SYSTEM_SETTING_UPDATE);
    }
}
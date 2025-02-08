import BaseSingleton from "db://assets/scripts/core/base/BaseSingleton";
import {
    SystemSettingLocalStorageData
} from "db://assets/scripts/core/settings/SystemSettingLocalStorageData";
import { LocalStorageUtils } from "db://assets/scripts/core/utils/LocalStorageUtils";

/**
 * 系统设置
 * */
export class SystemSettingManager extends BaseSingleton {

    // 本地数据
    private _localStorageData = new SystemSettingLocalStorageData();

    onInit(): void {
        // 恢复本地数据
        this._localStorageData = LocalStorageUtils.get(
            SystemSettingLocalStorageData.SettingsSaveKey,
            SystemSettingLocalStorageData,
            () => {
                return new SystemSettingLocalStorageData();
            });

        this._localStorageData.initGame();
    }


    // 音乐 ?
    isOpenMusic(): boolean {
        return this._localStorageData.isOpenAudioMusic;
    }

    // 音效 ?
    isOpenAudioEffect(): boolean {
        return this._localStorageData.isOpenAudioEffect;
    }

    // 震动 ?
    isOpenShake(): boolean {
        return this._localStorageData.isOpenShake;
    }

    /**
     * 是否开启了提醒 ?
     * @param type
     */
    isOpenRemindOpen(type: string): boolean {
        return this._localStorageData.getIsOpenByRemindType(type);
    }

    get localStorageData(): SystemSettingLocalStorageData {
        return this._localStorageData;
    }


}
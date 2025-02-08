export default class BaseNotificationKey {
    /**
     * Laya.Stage舞台大小发生改变时调用
     */
    static readonly STAGE_RESIZE: string = "STAGE_RESIZE";

    /**广告奖励 */
    static readonly AD_REWARD_ARRIVE: string = "AD_REWARD_ARRIVE";

    
    /******************************************* 多语言 i18n ************************************/

    // 切换了语言
    static readonly EVENT_CHANGE_I18N_LANGUAGE = "event:i18n:changeLanguage";


    /*********************************************** UI ****************************************/
    /** 打开UI界面 */
    static readonly OPEN_ViEW = "OPEN_ViEW";
    /** 关闭UI界面 */
    static readonly CLOSE_ViEW = "CLOSE_ViEW";

    
    /******************************************* 系统设置 ********************************/

    /**
     * 系统设置更新
     */
    static readonly SYSTEM_SETTING_UPDATE = "SYSTEM_SETTING_UPDATE";

    /**
     * 系统音乐
     * {@link boolean}
     * */
    static readonly SYSTEM_AUDIO_MUSIC_CHANGE_OPEN = "SYSTEM_AUDIO_MUSIC_CHANGE";

    /**
     * 系统音效
     * {@link boolean}
     * */
    static readonly SYSTEM_AUDIO_EFFECT_CHANGE_OPEN = "SYSTEM_AUDIO_EFFECT_CHANGE";

    /**
     * 震动
     {@link boolean}
     * */
    static readonly SYSTEM_SHAKE_CHANGE_OPEN = "SYSTEM_SHAKE_CHANGE";
}
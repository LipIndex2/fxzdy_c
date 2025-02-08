import { Color } from "cc";
import { SettingsConfigManager } from "db://assets/scripts/game/modules/settings/config/SettingsConfigManager";
import { Logger } from "db://assets/scripts/core/log/Logger";
import { SettingsModel } from "db://assets/scripts/game/modules/settings/model/SettingsModel";

export class ChatSkinUtils {

    /**
     * 获取聊天字体颜色
     */
    static getMyChatFontColor(): Color {
        const settingsContext = SettingsModel.ins().context;
        const settingId = settingsContext.getChatFontId();
        return this.getChatFontColor(settingId);
    }

    /**
     * 聊天字体颜色
     * @param settingId
     */
    static getChatFontColor(settingId: number) {
        let config = SettingsConfigManager.getShowConfigById(settingId);
        if (!config) {
            Logger.warn(`没找到聊天字体皮肤id = ${settingId}`);
            config = SettingsConfigManager.getShowConfigById(SettingsConfigManager.defaultChatColorId);
        }
        const fontColor = config?.fontColor;
        return new Color(fontColor);
    }

    /**
     * 聊天背景
     */
    static getMyChatBgIconPath(): string {
        const settingsContext = SettingsModel.ins().context;
        const settingId = settingsContext.getChatBoxId();
        return this.getChatBgIconPath(settingId);
    }


    /**
     * 聊天背景
     * @param settingId
     */
    static getChatBgIconPath(settingId: number) {
        let config = SettingsConfigManager.getShowConfigById(settingId);
        if (!config) {
            Logger.warn(`没找到聊天字体皮肤id = ${settingId}`);
            config = SettingsConfigManager.getShowConfigById(SettingsConfigManager.defaultChatBoxId);
        }
        return config?.assetPath;
    }
}
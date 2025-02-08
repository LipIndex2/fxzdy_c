import ObjectUtils from "db://assets/scripts/core/utils/ObjectUtils";

export class I18nUtils {
    /**
     * 是否是一个 i18n key
     * @param message 消息
     */
    static isI18nKey(message: string): boolean {
        if (!message) {
            return false
        }
        if (!ObjectUtils.isString(message)) {
            return false;
        }
        return message.trim().startsWith('i18n:');
    }
}
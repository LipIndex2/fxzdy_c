export enum ConstantI18n {
    
    // 多语言翻译 key 前缀
    I18N_KEY_START = "i18n:"
}

/**
 * 语言类型
 */
export enum EnumI18nLanguageType {
    // 中文
    CN = "Chinese",
    // 英文
    EN = "English",
}

export class I18nLanguage {
    // 语言类型 = I18nConfig 策划表的列名
    type: EnumI18nLanguageType;

    constructor(columnName: EnumI18nLanguageType) {
        this.type = columnName;
    }

    getValue(config: table.i18n.I18nConfig) {
        return config[this.type];
    }
}

/**
 * 常量类 | 用于映射 I18nConfig 策划表
 */
export class ConstantI18nObject {
    // 中文
    static readonly Chinese = new I18nLanguage(EnumI18nLanguageType.CN)
    // 英文
    static readonly English = new I18nLanguage(EnumI18nLanguageType.EN)
}
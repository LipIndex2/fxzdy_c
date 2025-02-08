import BaseSingleton from "db://assets/scripts/core/base/BaseSingleton";
import G from "db://assets/scripts/core/comm/G";
import { MapUtils } from "db://assets/scripts/core/utils/MapUtils";
import { ConstantI18nObject, EnumI18nLanguageType, I18nLanguage } from "db://assets/scripts/core/i18n/ConstantI18n";
import { KvTemplate } from "db://assets/scripts/core/utils/KvTemplate";
import { TableManager } from "../table/TableManager";
import { I18nUtils } from "db://assets/scripts/core/i18n/I18nUtils";
import { StringUtils } from "db://assets/scripts/core/utils/StringUtils";
import { Logger } from "db://assets/scripts/core/log/Logger";
import BaseNotificationKey from "../mvc/event/BaseNotificationKey";

interface II18nConfigData {
    id: string;
    Chinese: string;
    English: string;
}

/**
 * I18n 配置数据
 */
class I18ConfigDataLike {
    id: string;
    Chinese: string;
    English: string;

    static fromStructLike(it: II18nConfigData): I18ConfigDataLike {
        const data1 = new I18ConfigDataLike();
        data1.id = it.id;
        data1.Chinese = it.Chinese;
        data1.English = it.English;
        return data1
    }
}

/**
 * I18n 多语言管理器
 */
export class I18nManager extends BaseSingleton {


    // 当前语言 | 默认中文
    private currentLanguage: EnumI18nLanguageType = EnumI18nLanguageType.CN;

    // 是否初始化完成
    private _isInitDone: boolean = false;

    // 语言映射表
    private _language2Uid2ContentMap = new Map<EnumI18nLanguageType, Map<string, string>>();


    // 没找到的提示
    public static readonly NOT_FOUND_TIPS: string = "i18nNotFound";


    /**
     * 设置语言
     * @param language
     */
    public setLanguage(language: EnumI18nLanguageType) {
        const oldLanguage = this.currentLanguage
        this.currentLanguage = language

        Logger.game(`切换了 i18n 语言! oldLanguage = ${oldLanguage}, new language = ${language}`)

        // event
        G.FacadeManager.emit(BaseNotificationKey.EVENT_CHANGE_I18N_LANGUAGE, language)
    }

    public getCurrentLanguage(): EnumI18nLanguageType {
        return this.currentLanguage
    }

    /**是否是中文 */
    public isChinese() {
        return this.currentLanguage == EnumI18nLanguageType.CN;
    }

    /**
     * 初始化 i18n 管理器
     */
    public init(): void {
        if (!TableManager.isComplete()) return;

        //all
        const i18nConfigs: I18ConfigDataLike[] = [
            ...G.TableManager.getAllData(table.i18n.I18nConfig).map(it => I18ConfigDataLike.fromStructLike(it)),
            ...G.TableManager.getAllData(table.i18n.I18nTipsConfig).map(it => I18ConfigDataLike.fromStructLike(it)),
            ...G.TableManager.getAllData(table.i18n.I18nErrorCodeConfig).map(it => I18ConfigDataLike.fromStructLike(it)),
        ];

        // 初始化数据
        for (let i18nConfig of i18nConfigs) {
            const keys = Object.keys(ConstantI18nObject);

            for (let key of keys) {
                const language = ConstantI18nObject[key] as I18nLanguage;

                const languageMap = MapUtils.getOrCreate(
                    this._language2Uid2ContentMap,
                    language.type,
                    () => new Map<string, string>()
                );
                // 该语言的值
                const i18nUid = i18nConfig.id;
                const i18nValue = i18nConfig[language.type];

                // 没有数据
                if (!i18nValue) {
                    continue
                }

                // 空内容不加入
                if (!languageMap || i18nValue.toString().trim() == "") {
                    continue;
                }

                languageMap.set(i18nUid, i18nValue);
            }
        }

        if (i18nConfigs.length > 0) {
            this._isInitDone = true;

            const languageTypeArrayStr = Array.from(this._language2Uid2ContentMap.keys()).join(", ");
            G.Logger.game(`${I18nManager.name} 初始化完成. 当前语言 = ${this.currentLanguage}, 支持的语言类型 = ${languageTypeArrayStr}`)
        } else {
            G.Logger.error(`${I18nManager.name} 没有找到 i18n 数据`)
        }
    }

    /**新增更加简单的
     * 必须是${key0}...${key10}才行
     * 格式 ${key数字}
     */
    public lang(i18nUid: string, ...args: any[]) {
        let kvArgsMap = new Map<string, any>();
        for (let i = 0; i < args.length; i++) {
            const arg = args[i]?.toString() || "";
            let value = ""
            if (StringUtils.isNotBlank(arg)) {
                if (I18nUtils.isI18nKey(arg)) {
                    value = this.translateOrBlank(arg);
                } else {
                    value = arg;
                }
            }
            kvArgsMap.set(`key${i}`, value);
        }
        return this.translate(i18nUid, kvArgsMap, this.currentLanguage)
    }

    /**
     * 翻译
     * @param i18nUid 配置表中标记了 client type = "lang" 的列内容, 最终读取时都会被转换为 i18nUid (唯一标识 id)
     * @param kvArgsMap 模板参数
     * @param languageType 默认当前语言
     * @returns 翻译值，如果找不到返回空字符串
     */
    public translate(
        i18nUid: string,
        kvArgsMap: Map<string, any> = null,
        languageType: EnumI18nLanguageType = this.currentLanguage
    ): string {
        // 未初始化完成
        if (!this._isInitDone) {
            this.init();
            //return "i18nNotInit";
        }

        if (this._language2Uid2ContentMap.size == 0) {
            G.Logger.error(`${I18nManager.name} 没有初始化配置内容`)
            return I18nManager.NOT_FOUND_TIPS;
        }

        const languageMap = this._language2Uid2ContentMap.get(languageType);
        if (!languageMap) {
            G.Logger.error(`没找到翻译. language='${this.currentLanguage}', key=${i18nUid}`);
            return i18nUid;
        }
        let translation = languageMap.get(i18nUid);

        if (kvArgsMap) {
            translation = KvTemplate.create(translation, kvArgsMap).render()
        }

        return translation || I18nManager.NOT_FOUND_TIPS;
    }

    /**
     * 翻译纯文本, 如果找不到返回空字符串
     * @param i18nUid
     */
    translateOrBlank(i18nUid: string): string {
        // 未初始化完成
        if (!this._isInitDone) {
            this.init();
        }

        if (this._language2Uid2ContentMap.size == 0) {
            G.Logger.error(`${I18nManager.name} 没有初始化配置内容`)
            return "";
        }

        const languageMap = this._language2Uid2ContentMap.get(this.currentLanguage);
        if (!languageMap) {
            return "";
        }
        let translation = languageMap.get(i18nUid);

        return translation || "";
    }

    /**
     * 翻译成中文
     * @param i18nUid
     */
    public translateToChinese(i18nUid: string) {
        return this.translate(i18nUid, null, EnumI18nLanguageType.CN)
    }


}
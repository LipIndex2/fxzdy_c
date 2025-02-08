import { I18nUtils } from "db://assets/scripts/core/i18n/I18nUtils";
import G from "db://assets/scripts/core/comm/G";
import * as fgui from "fairygui-cc";


export class FguiGRichTextExtension {
}

/**
 * 富文本, 支持 i18n
 * @param name
 * @param value
 */
fgui.GRichTextField.prototype.setVar = function (name: string, value: string): fgui.GRichTextField {
    if (!this._templateVars) {
        this._templateVars = {};
    }
    if (value == null) {
        return this;
    }
    // 支持 i18n 
    if (I18nUtils.isI18nKey(value)) {
        value = G.I18nManager.translateOrBlank(value)
    }
    // 原值
    this._templateVars[name] = value;
    return this;
}


Object.defineProperty(fgui.GRichTextField.prototype, 'text', {
    get: function (): string | null {
        return this._text;
    },
    set: function (value: string | null) {
        // 翻译 i18n
        if (value && I18nUtils.isI18nKey(value)) {
            value = G.I18nManager.translateOrBlank(value);
        }
        this._text = value;

        if (this._text == null) {
            this._text = "";
        }
        this.updateGear(6);
        this.markSizeChanged();
        try {
            this.updateText();

        } catch (e) {
            console.error("FGUI.text 刷写异常. 应该是初始化问题 ", e);
        }
    },
    configurable: true,
    enumerable: true
});

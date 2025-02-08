import { I18nUtils } from "db://assets/scripts/core/i18n/I18nUtils";
import G from "db://assets/scripts/core/comm/G";
import * as fgui from "fairygui-cc";


export class FguiGTextFieldPrototypeExtension {
}

// FGUI 支持 i18n 机制
fgui.GTextField.prototype.setVar = function (name: string, value: string): fgui.GTextField {
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


Object.defineProperty(fgui.GTextField.prototype, 'text', {
    get: function (): string | null {
        return this._text;
    },
    set: function (value: string | null) {

        if (value) {
            if (value.length >= 5 && value[value.length - 3] == ":" && this._label?.cacheMode == 1) {
                //时间不缓存
                this._label.cacheMode = 0;
            }

            if (I18nUtils.isI18nKey(value)) {
                value = G.I18nManager.translateOrBlank(value);
            }
        }


        this._text = value;
        if (this._text == null) {
            this._text = "";
        }
        this.updateGear(6);
        this.markSizeChanged();
        this.updateText();
    },
    configurable: true,
    enumerable: true
});

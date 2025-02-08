import { _decorator, CCFloat, Color, Component, Font, math, Size, SpriteFrame, v2, Vec2, } from 'cc';
import { DEBUG } from "cc/env";
import G from "db://assets/scripts/core/comm/G";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import {
    FloatingTextHelper
} from "db://assets/scripts/gm/floatingText/FloatingTextHelper";
import { I18nUtils } from "db://assets/scripts/core/i18n/I18nUtils";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { DebugUtils } from '../../core/utils/DebugUtils';

const { menu, ccclass, property } = _decorator;


/**
 * 漂浮文字参数
 */
export class FloatingTextParameters {
    align?: string;
    font?: Font;
    fontSize?: number;
    color?: Color;
    time?: number;
    bg?: { spf: SpriteFrame, size: Size; };
    textHeight?: number;
    xyShift?: Vec2;
}


/**
 * Debug Only
 * 漂浮提示字
 * 
 * @author luohaojun
 * 
 * @deprecated
 */
@ccclass('FloatingTextComponent')
export class FloatingTextComponent extends Component implements INotification {

    // 当前字体
    @property({ type: Font })
    font: Font = null;

    // 当前的背景
    @property({ type: SpriteFrame })
    sf_background: SpriteFrame = null;

    @property(CCFloat)
    showTimeSecond = 2;

    // 字体颜色
    private _colorForFont = Color.WHITE;
    // 当前字体大小
    private _currentFontSize = 22;

    listenNotifications(): string[] | null {
        return [
            NotificationKey.EVENT_FLOATING_TEXT_DEBUG,
            NotificationKey.EVENT_FLOATING_TEXT,
            NotificationKey.EVENT_SET_FLOATING_TEXT,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_FLOATING_TEXT: {
                const content = args as string;
                this.floatingText(content);
                break;
            }
            case NotificationKey.EVENT_SET_FLOATING_TEXT:
                this.floatingText2(args[0], args[1]);
                break
            case NotificationKey.EVENT_FLOATING_TEXT_DEBUG:
                {
                    // debug 才打印
                    if (DEBUG) {
                        const content = args as string;
                        this.floatingText("[Debug]\n" + content + "\n[/Debug]");
                    }
                    break;
                }
        }
    }

    start() {
        // events
        if (DebugUtils.isDebugMode()) {
            G.FacadeManager.registerNotification(this);
        }
    }

    // 测试用
    testFloatingText() {
        this.floatingText("demo")
    }

    // 漂字
    floatingText(message: string) {
        // i18n 
        if (I18nUtils.isI18nKey(message)) {
            message = G.I18nManager.translate(message);
        }

        const params: FloatingTextParameters = {
            font: this.font,
            fontSize: this._currentFontSize,
            color: this._colorForFont,
            time: this.showTimeSecond,
        };
        if (this.sf_background) {
            params.bg = {
                spf: this.sf_background,
                size: new Size(351, this._currentFontSize + 20),
            };
            params.textHeight = this._currentFontSize + 30;
            params.xyShift = v2(0, -4);
        }
        if (params.align) {
            const aList = params.align.split("_");
            const wrongFormat = () => {
                params.align = 'c_0_c_0';
                params.color = Color.RED;
                message = '相对位置align，格式错误！';
            };
            if (aList.length != 4) {
                wrongFormat();
            } else {
                for (let i = 0; i < aList.length; i++) {
                    if (i % 2 == 0) {
                        const ak = {
                            l: 'Left',
                            r: 'Right',
                            t: 'Top',
                            b: 'Bottom',
                            c: i == 0 ? 'Horizontal' : 'Vertical',
                        }[aList[i]];
                        if (!ak || +aList[i + 1] !== +aList[i + 1]) {
                            wrongFormat();
                            break;
                        }
                    }
                }
            }
        }

        // 漂浮文字
        FloatingTextHelper.floatingText(message, this.node, params);
    }

    // 漂字(自定义位置和颜色等)
    floatingText2(message: string, setParams: FloatingTextParameters) {
        // i18n 
        if (I18nUtils.isI18nKey(message)) {
            message = G.I18nManager.translate(message);
        }

        const params: FloatingTextParameters = {
            font: setParams.font || this.font,
            fontSize: setParams.fontSize || this._currentFontSize,
            color: setParams.color || this._colorForFont,
            time: setParams.time || this.showTimeSecond,
            align: setParams.align,
            xyShift: setParams.xyShift,
        };
        if (this.sf_background) {
            params.bg = {
                spf: this.sf_background,
                size: new Size(351, this._currentFontSize + 20),
            };
            params.textHeight = setParams.textHeight ? setParams.textHeight : this._currentFontSize + 30;
            params.xyShift = setParams.xyShift || v2(0, -4);
        }
        if (params.align) {
            const aList = params.align.split("_");
            const wrongFormat = () => {
                params.align = 'c_0_c_0';
                params.color = Color.RED;
                message = '相对位置align，格式错误！';
            };
            if (aList.length != 4) {
                wrongFormat();
            } else {
                for (let i = 0; i < aList.length; i++) {
                    if (i % 2 == 0) {
                        const ak = {
                            l: 'Left',
                            r: 'Right',
                            t: 'Top',
                            b: 'Bottom',
                            c: i == 0 ? 'Horizontal' : 'Vertical',
                        }[aList[i]];
                        if (!ak || +aList[i + 1] !== +aList[i + 1]) {
                            wrongFormat();
                            break;
                        }
                    }
                }
            }
        }

        // 漂浮文字
        FloatingTextHelper.floatingText(message, this.node, params);
    }

    setFont(font: Font) {
        this.font = font;
        console.log(`[FloatingText] 字体 = `, font)
    }

    setFontSize(fontSize: number) {
        let finalFontSize = math.clamp(fontSize, 4, 999);
        this._currentFontSize = finalFontSize;
        console.log(`[FloatingText] 字体大小 = ${finalFontSize}`)
    }

    setFontColor(color: Color) {
        this._colorForFont = color;
        console.log(`[FloatingText] 字体颜色 = `, color)
    }

    setShowTimeSecond(showTime: number) {
        this.showTimeSecond = math.clamp(showTime, 0.1, 5.0);
        console.log(`[FloatingText] 消失时间${this.showTimeSecond.toFixed(1)}s`)
    }

    setFloatingBackGround(sf_bg: SpriteFrame) {
        this.sf_background = sf_bg;
        console.log(`[FloatingText] 背景 = `, sf_bg)
    }
}
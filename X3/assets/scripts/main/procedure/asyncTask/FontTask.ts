import { MINIGAME } from "cc/env";
import { Res } from "../../../core/res/Res";
import { ResRef } from "../../../core/res/ResRef";
import { ResURL } from "../../../core/res/ResURL";
import { TableManager } from "../../../core/table/TableManager";
import { Task } from "../../../core/task/TaskManager";
import * as fgui from "fairygui-cc";

declare let wx: any;
/**
 * 数据表
 */
export default class FontTask extends Task {
    static _fontName = "default";
    static _fontNameMini = "default_mini";//小游戏手机端 临时处理方案

    static isComplete() {
        return fgui.UIConfig.defaultFont === FontTask._fontName;
    }

    static resName() {
        let fontName = FontTask._fontName;
        if (MINIGAME) {
            let deviceInfo = wx?.getDeviceInfo();
            if (deviceInfo.platform == "android" || deviceInfo.platform == "ios") {
                fontName = FontTask._fontNameMini;
            }
        }
        return 'font/' + fontName;
    }


    run(args?: any): void {

        if (!FontTask.isComplete()) {
            let fontName = FontTask._fontName;

            Res.getResRef({ url: FontTask.resName() } as ResURL, "FontTask", (ref: ResRef) => {
                if (!ref) this.exit();

                fgui.registerFont(fontName, ref.content);
                fgui.UIConfig.defaultFont = fontName;
                this.onComplete();
            });
        } else {
            this.onComplete();
        }
    }

    private onComplete() {
        // 加载完成
        this.end();
    }
}
import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import { GirlGroupUtil } from "../GirlGroupUtil";
import { DialogData } from "../page/DialogBoxPage";

/**
 * 女团
 * 对话框容器
 */
@bindFguiExtension("ui://girlGroup/dialogBoxItem")
export class DialogBoxItem extends fgui.GComponent {
    static pkgName: string = "girlGroup";
    static viewName: string = "dialogBoxItem";

    private get view(): ui.girlGroup.item.dialogBoxItem {
        return this as any;
    }

    public setData(textData: DialogData) {
        this.view.T_text.text = this.msgContent(textData);
        this.view.getController("c1").selectedIndex = textData.type;
        this.view.img_bg.width = this.view.T_text.width + 50;
    }

    /** 消息内容 */
    public msgContent(data: DialogData): string {
        if (data.type == 0) {
            return data.text;
        }
        if (data.type == 1) {
            let str = `欢迎[color=#f9cb7c]${data.text}[/color]进入直播间`;
            return str;
        }
        if (data.type == 2) {
            let name = GirlGroupUtil.getPasswordName(data.text);
            let str = `玩家[color=#fff773]${name}[/color]购买了礼包`;
            return str;
        }
        return "";
    }
}

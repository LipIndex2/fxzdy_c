import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import { ItemUtils } from "../../item/utils/ItemUtils";

/**
 * 召唤英雄
 * 对话框容器
 */
@bindFguiExtension("ui://activitySummonHero/dialogBoxItem")
export class SummonHeroDialogBoxItem extends fgui.GComponent {
    static pkgName: string = "activitySummonHero";
    static viewName: string = "dialogBoxItem";

    private get view(): ui.activitySummonHero.dialogBoxItem {
        return this as any;
    }

    public setData(textData: Vo.activity.CallHeroJackpotRecordVo) {
        this.view.T_text.text = this.msgContent(textData);
    }

    /** 消息内容 */
    public msgContent(data: Vo.activity.CallHeroJackpotRecordVo): string {
        let itemCfg = ItemUtils.getItemConfigByItemId(data.jackpotId);
        //转一遍i18n编码
        this.view.T_text.text = itemCfg.name;
        let str = `[color=#19DF51]${data.playerName}[/color]获得[color=#FF5555]${this.view.T_text.text}*1[/color]`;
        return str;
    }
}

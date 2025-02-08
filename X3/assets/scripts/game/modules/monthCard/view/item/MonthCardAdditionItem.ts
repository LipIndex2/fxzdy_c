import { RichText } from "cc";
import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { RichTextUtils } from "../../../../../core/utils/RichTextUtils";
import { ServerEnums } from "../../../../../libs/extras/ServerEnums";
import { MonthCardAdditionDesc } from "../../model/MonthCardModel";


/** 月卡加成item */
@bindFguiExtension('ui://activityPass/MonthCardAdditionItem')
export class MonthCardAdditionItem extends fgui.GComponent {
    static pkgName: string = "activityPass";
    static viewName: string = "MonthCardAdditionItem";

    private get view(): ui.activityPass.monthCard.item.MonthCardAdditionItem {
        return this as any;
    }

    constructor() {
        super();
    }

    protected onInit(): void {

    }

    public setData(data: MonthCardAdditionDesc, type: number): void {
        if (type == ServerEnums.MonthCardType.FOREVER) {
            this.view.getController('c1').selectedIndex = 1
        } else {
            this.view.getController('c1').selectedIndex = 0
        }

        if (data.iconPath) {
            let richText: RichText = this.view.lbDes.node?.getComponent(RichText)
            RichTextUtils.setTextWithImg(data.desc, richText, data.iconPath)
        } else {
            this.view.lbDes.text = data.desc
        }
    }
}
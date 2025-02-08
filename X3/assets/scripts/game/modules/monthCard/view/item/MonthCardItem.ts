import * as fgui from "fairygui-cc";
import G from "../../../../../core/comm/G";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { FguiScriptUtils } from "../../../../../core/utils/FguiScriptUtils";
import { ServerEnums } from "../../../../../libs/extras/ServerEnums";
import { RedDotCom } from "../../../common/redDot/redDotCom";
import { RedDotKeys } from "../../../common/redDot/RedDotKeys";
import { MonthCardI18nKeys } from "../../const/MonthCardI18nKeys";
import { MonthCardData, MonthCardModel } from "../../model/MonthCardModel";


/** 月卡item */
@bindFguiExtension('ui://activityPass/MonthCardItem')
export class MonthCardItem extends fgui.GComponent {
    static pkgName: string = "activityPass";
    static viewName: string = "MonthCardItem";

    protected _cardData: MonthCardData = null
    protected _firstRewardId: number = 0
    protected _rewards: { k: any, v: any }[] = []

    private get view(): ui.activityPass.monthCard.item.MonthCardItem {
        return this as any;
    }

    protected onInit() {
        this.view.lbNoActive.text = G.I18nManager.lang(MonthCardI18nKeys.noActive);
        this.view.lbActive.text = G.I18nManager.lang(MonthCardI18nKeys.active);
    }

    public get cardData(): MonthCardData {
        return this._cardData
    }

    public setData(data: MonthCardData): void {
        this._cardData = data;
        let typeCtrl = this.view.getController('type')
        let type = ServerEnums.MonthCardType[data.cfg.type];
        if (type <= typeCtrl.pageCount) {
            typeCtrl.selectedIndex = type - 1;
        } else {
            typeCtrl.selectedIndex = 0;
        }
        this.view.lbName.text = data.cfg.name;
        if (data.cfg.validDays > 0) {
            //有有效期
            this.view.lbDes.text = G.I18nManager.lang(MonthCardI18nKeys.validDays, data.cfg.validDays);
        } else {
            //永久
            this.view.lbDes.text = G.I18nManager.lang(MonthCardI18nKeys.validForever);
        }

        let isActive = MonthCardModel.ins().isActive(data)
        this.view.getController('isActive').selectedIndex = isActive ? 1 : 0;
        if (isActive) {
            FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom).reset(RedDotKeys.MonthCard_item, [data.id])
        }
        else if (data.id == ServerEnums.MonthCardType.MONTH)
            FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom).reset(RedDotKeys.MonthCard_act)
    }
}
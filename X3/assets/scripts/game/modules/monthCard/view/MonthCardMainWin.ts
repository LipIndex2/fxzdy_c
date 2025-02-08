import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import GIns from "../../../GIns";
import { ChargeI18nKeys } from "../../charge/const/ChargeI18nKeys";
import { ItemFrameBtn } from "../../common/item/ItemFrameBtn";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { EnumRuleKeys } from "../../rule/enums/EnumRuleKeys";
import { RuleController } from "../../rule/RuleController";
import { MonthCardI18nKeys } from "../const/MonthCardI18nKeys";
import { UIMonthCardConfig } from "../const/UIMonthCardConfig";
import { MonthCardData, MonthCardModel } from "../model/MonthCardModel";
import { MonthCardItem } from "./item/MonthCardItem";

/**
 * 月卡界面
 */
@bindFguiExtension('ui://activityPass/MonthCardMainWin')
export class MonthCardMainWin extends fgui.GComponent {

    static pkgName: string = "activityPass";
    static viewName: string = "MonthCardMainWin";
    protected _lastUIKey: string = '';
    protected _lastUIArgs: any = null;

    protected _showDatas: MonthCardData[] = [];

    private get view(): ui.activityPass.monthCard.view.MonthCardMainWin {
        return this as any;
    }

    protected onInit(): void {
        this.view.lbTitleFree.text = G.I18nManager.lang(MonthCardI18nKeys.tip4)
        this.view.btnFree.title = G.I18nManager.lang(ChargeI18nKeys.free)
        this.view.btnDrawAll.title = G.I18nManager.lang(MonthCardI18nKeys.drawAll)

        this.view.btnFree.onClick(this.onClickFree, this)
        this.view.btnDrawAll.onClick(this.onClickDrawAll, this)
        this.view.listFreeReward.itemRenderer = this.itemRenderForFreeReward.bind(this)
        this.view.listCard.itemRenderer = this.itemRenderForCard.bind(this)
        this.view.listCard.on(fgui.Event.CLICK_ITEM, this.onClickCard, this)
        FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom).reset(RedDotKeys.MonthCard_drawAll);
        this.view.btnRule.onClick(this.onClickRule, this);
    }

    protected onClickRule(): void {
        RuleController.ins().openRule(EnumRuleKeys.MONTHCARD, this.view.btnRule)
    }

    protected onClickFree(): void {
        MonthCardModel.ins().sendReceiveDailyFreeReward()
    }

    protected onClickDrawAll(): void {
        MonthCardModel.ins().sendReceiveAllRewards()
    }

    protected onClickCard(item: MonthCardItem, event: fgui.Event): void {
        if (item.cardData) {
            let type = ServerEnums.MonthCardType[item.cardData.cfg.type]
            switch (type) {
                case ServerEnums.MonthCardType.MONTH:
                    G.UIManager.open(UIMonthCardConfig.MonthCardBuyWin, item.cardData)
                    break
                case ServerEnums.MonthCardType.FOREVER:
                    G.UIManager.open(UIMonthCardConfig.MonthCardForeverBuyWin, item.cardData)
                    break
                case ServerEnums.MonthCardType.MINERAL:
                    G.UIManager.open(UIMonthCardConfig.MonthCardMineBuyWin, item.cardData)
                    break
            }
        }
    }

    protected itemRenderForTab(index: number, item: ui.activityPass.monthCard.component.MonthCardFreeBtn): void {
        if (index == 0) {
            item.title = '通行证'
            item.getController('c1').selectedIndex = 0
            FguiScriptUtils.toMyScriptClass(item.redDot, RedDotCom).reset(RedDotKeys.Pass_Fund)
        } else {
            item.title = G.I18nManager.lang(MonthCardI18nKeys.title)
            item.getController('c1').selectedIndex = 1
            FguiScriptUtils.toMyScriptClass(item.redDot, RedDotCom).reset(RedDotKeys.MonthCard_enter)
        }
    }

    protected itemRenderForFreeReward(index: number, item: ItemFrameBtn): void {
        let reward = MonthCardModel.ins().freeRewards[index]
        item.reset(reward.k, reward.v)
    }

    protected itemRenderForCard(index: number, item: MonthCardItem): void {
        item.setData(this._showDatas[index])
    }

    public updateUI(): void {
        let freeReward = MonthCardModel.ins().freeRewards
        this.view.listFreeReward.numItems = freeReward.length

        this.view.btnFree.enabled = !MonthCardModel.ins().gainDailyFreeReward

        this._showDatas.length = 0;
        MonthCardModel.ins().datas?.forEach((data) => {
            if (GIns.conditionMgr.checkCondition(data.cfg.displayVerify)) {
                this._showDatas.push(data);
            }
        })
        this.view.listCard.numItems = this._showDatas.length

        this.view.btnDrawAll.enabled = MonthCardModel.ins().hasReward()

        FguiScriptUtils.toMyScriptClass(this.view.btnFree.redDot, RedDotCom).reset(RedDotKeys.MonthCard_free)
    }
}
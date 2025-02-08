import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { UIMonthCardConfig } from "../const/UIMonthCardConfig";
import { MonthCardData, MonthCardModel } from "../model/MonthCardModel";
import { MonthCardItem } from "./item/MonthCardItem";

/**
 * 月卡界面
 */
@bindScript(UIMonthCardConfig.MonthCardMineMainWin)
export class MonthCardMineMainWin extends UICommWin {

    static pkgName: string = "activityPass";
    static viewName: string = "MonthCardMineMainWin";
    protected _lastUIKey: string = '';
    protected _lastUIArgs: any = null
    protected _cardDatas: MonthCardData[] = null;
    private get view(): ui.activityPass.monthCard.view.MonthCardMineMainWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.MONTHCARD_DATA_CHANGE,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.MONTHCARD_DATA_CHANGE:
                this.updateUI()
        }
    }

    protected onInit(): void {
        this.centerPanel.listCard.itemRenderer = this.itemRenderForCard.bind(this)
        this.centerPanel.listCard.on(fgui.Event.CLICK_ITEM, this.onClickCard, this)
    }

    protected get centerPanel(): ui.activityPass.monthCard.component.MonthCardMineCenterPanel {
        return this.view.pCenter.pCenter;
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

    protected itemRenderForCard(index: number, item: MonthCardItem): void {
        item.setData(this._cardDatas[index])
    }

    public updateUI(): void {
        this.centerPanel.listCard.numItems = this._cardDatas.length;
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this._cardDatas = GIns.monthCardModel.getCardsByAdditions([
            ServerEnums.MonthCardAdditionType.LEAGUE_EXPLORE_HANG_UP_TIME_ADDITION,
            ServerEnums.MonthCardAdditionType.LEAGUE_EXPLORE_REWARD_ADDITION
        ]);
        this.updateUI();
        this.view.pCenter.getTransition('t0').play();
    }

    protected onClose(dontDispose?: boolean): void {

    }
}
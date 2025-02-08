import * as fgui from "fairygui-cc";
import NotificationKey from "../../../event/NotificationKey";
import { LeagueModel } from "../LeagueModel";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { TableManager } from "../../../../core/table/TableManager";
import G from "../../../../core/comm/G";
import { EventClickItem } from "../../item/event/EventClickItem";
import { UITransform } from "cc";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { leagueRedDotCtr } from "../leagueRedDotCtr";
import { EnumRedDotShowType } from "db://assets/scripts/game/modules/common/redDot/enums/EnumRedDotShowType";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UILeagueKey } from "../const/UILeagueConst";

/**
 * 赠礼界面，通关购买礼包获得道具
 */
@bindScript(UILeagueKey.LeagueBoxGiftListView)
export class LeagueBoxGiftListView extends UICommWin {
    static pkgName: string = "leagueBox";

    static viewName: string = "leagueBoxGiftView";


    private get view(): ui.leagueBox.leagueBoxGiftView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [NotificationKey.EVENT_LEAGUE_SENDd_GIFT_CHANGE];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_LEAGUE_SENDd_GIFT_CHANGE:
                this.updateView();
                break;


        }
    }

    protected onInit(): void {
        let view = this.view;
        view.list.itemRenderer = this.itemRander.bind(this);
    }

    public onOpen(): void {


        this.updateView();
    }

    private listVo: Vo.league.LeagueGiftItemVo[] = [];

    private updateView(): void {
        let view = this.view;
        this.listVo = LeagueModel.ins().getSendGiftList();
        view.list.setVirtual();
        view.list.numItems = this.listVo.length;

        view.noList.visible = this.listVo.length == 0;

    }

    private itemRander(index: number, item: ui.leagueBox.com.giftListCell): void {
        let vo = this.listVo[index];
        let cfg = TableManager.getDataById(table.league.LeagueGiftConfig, vo.leagueGiftConfigId);
        item.boxIcon.icon = cfg.iconPath;
        item.boxName.text = cfg.giftName;
        item.sendBtn.clearClick();
        item.sendBtn.onClick(() => {

            LeagueModel.ins().sendLeagueGift(vo.id);
        });
        FguiScriptUtils.toMyScriptClass(item.redDot, RedDotCom).resetListCell(EnumRedDotShowType.NEW, leagueRedDotCtr.ins().newGiftItem.indexOf(vo) != -1);
        let itemConfig = ItemUtils.getItemConfigByItemId(vo.leagueGiftConfigId);
        item.boxIcon.clearClick();
        item.boxIcon.onClick((event: fgui.Event) => {
            // event 点击道具
            G.FacadeManager.emit(NotificationKey.CLICK_ITEM, EventClickItem.create(
                event,
                itemConfig,
                item.node.getComponent(UITransform),
            ));

        });
    }

    protected onPreDispose(): void {
        //清掉红点
        leagueRedDotCtr.ins().newGiftItem = [];
        leagueRedDotCtr.ins().checkLeagueBoxNewGiftRedDot();
    }


}
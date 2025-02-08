import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import { UIView, ViewAdaptType } from "../../../../core/mvc/view/UIView";
import * as fgui from "fairygui-cc";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import { UIPage } from "../../../../core/mvc/view/UIPage";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import NotificationKey from "../../../event/NotificationKey";
import { LeagueManager } from "../leagueManager";
import { LeagueModel } from "../LeagueModel";
import { NoOwnerItem } from "../../backpack/vo/NoOwnerItem";
import { Color } from "cc";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UILeagueKey } from "../const/UILeagueConst";
import { ForbiddenManager } from "db://assets/scripts/core/comm/ForbiddenManager";
import { FloatingTextManager } from "db://assets/scripts/game/modules/floatingText/FloatingTextManager";
/**
 * 联盟创建界面
 */
@bindScript(UILeagueKey.LeagueCreateView)
export class LeagueCreateView extends UICommWin {
    static pkgName: string = "league";

    static viewName: string = "leagueCreateView";


    private get view(): ui.league.leagueCreateView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [NotificationKey.EVENT_LEAGUE_ICON_BANNER_CHANGE];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_LEAGUE_ICON_BANNER_CHANGE:
                this.onUpdateFlag();
                break;


        }
    }

    protected onInit(): void {
        this.view.createBtn.onClick(this.onCreate, this);
        this.view.flagBtn.onClick(this.onOpenFlag, this);
        //名字最大字数
        this.view.nameTxt.maxLength = LeagueModel.ins().getLeagueNameMaxLen();
    }


    public onOpen(): void {

        this.onUpdateFlag();
        this.showCost();
    }

    private onOpenFlag(): void {
        LeagueModel.ins().openFlagSelectView();
    }

    public onUpdateFlag(): void {
        let data = LeagueManager.ins().createSelectData;
        if (data) {
            let iconUrl = LeagueModel.ins().getLeagueIconUrl(data[0] + 1);
            let flagUrl = LeagueModel.ins().getLeagueBannerUrl(data[1] + 1);

            let com = this.view.flagCom;
            com.iconLoader.url = iconUrl;
            com.flagLoader.url = flagUrl;
        }

    }

    private onCreate(): void {
        let data = LeagueManager.ins().createSelectData;
        let name = this.view.nameTxt.text;

        ForbiddenManager.isForbidden(name, (content: string) => {
            if (!content) {
                FloatingTextManager.ins().showTips("名字中含有敏感词")
                return;
            }

            LeagueModel.ins().createLeague(name, data[0] + 1, data[1] + 1);
        });
    }

    /**显示消耗 */
    private showCost(): void {
        let data = LeagueModel.ins().getCreateLeagueCost();
        let NotItem = NoOwnerItem.create(data.itemId, data.count);
        this.view.createBtn.costIcon.url = NotItem.getIconPath();
        this.view.createBtn.getController("state").selectedIndex = 0;
        this.view.createBtn.costNum.text = `${data.count}`;
        if (NotItem.isCanPay()) {
            this.view.createBtn.costNum.color = new Color("#ffffff");
            this.view.createBtn.costNum.strokeColor = new Color("#C96B06");
        } else {
            this.view.createBtn.costNum.color = new Color("#FF0000");
            this.view.createBtn.costNum.strokeColor = new Color("#000000");
        }

    }


}
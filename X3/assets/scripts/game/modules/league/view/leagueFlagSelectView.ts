import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import { UIView, ViewAdaptType } from "../../../../core/mvc/view/UIView";
import * as fgui from "fairygui-cc";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import { UIPage } from "../../../../core/mvc/view/UIPage";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { LeagueModel } from "../LeagueModel";
import { LeagueManager } from "../leagueManager";
import G from "../../../../core/comm/G";
import NotificationKey from "../../../event/NotificationKey";
import { NoOwnerItem } from "../../backpack/vo/NoOwnerItem";
import { Color } from "cc";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UILeagueKey } from "../const/UILeagueConst";
/**
 * 联盟旗帜选择界面
 */
@bindScript(UILeagueKey.LeagueFlagSelectView)
export class LeagueFlagSelectView extends UICommWin {
    static pkgName: string = "league";

    static viewName: string = "leagueFlagView";


    private get view(): ui.league.leagueFlagView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {


        }
    }

    protected onInit(): void {

        //默认不可点击
        this.view.sureBtn.grayed = true;
        this.view.sureBtn.enabled = false;


        this.view.list.itemRenderer = this.listRender.bind(this);
        this.view.sureBtn.onClick(this.onSure, this);
    }

    private allIconCfgs: table.league.LeagueIconConfig[];
    private allFlagCfgs: table.league.LeagueBannerConfig[];

    public onOpen(): void {
        this.allIconCfgs = LeagueModel.ins().getLeagueIconAllCfg();
        this.allFlagCfgs = LeagueModel.ins().getLeagueBannerAllCfg();
        this.view.tab.on(fgui.Event.CLICK_ITEM, () => {
            this.onUpdateList(this.view.tab.selectedIndex);
        }, this);
        this.view.tab.selectedIndex = 0;
        let loginVo = LeagueManager.ins().mPlayerLeagueLoginVo;
        let btnState = this.view.sureBtn.getController("state");
        if (loginVo && loginVo.leagueId > 0) {
            let vo = LeagueManager.ins().mLeagueVo;
            LeagueManager.ins().createSelectData = [vo.icon, vo.banner];
            let cfg = LeagueModel.ins().getChangeLeagueBannerCost();
            let item = NoOwnerItem.create(cfg.itemId, cfg.count);
            this.view.sureBtn.costIcon.url = item.getIconPath();
            this.view.sureBtn.costNum.text = `${item.count}`;;
            this.view.sureBtn.cost.visible = true;

            if (item.isCanPay()) {
                this.view.sureBtn.costNum.color = new Color("#ffffff");
                this.view.sureBtn.costNum.strokeColor = new Color("#C96B06");
            } else {
                this.view.sureBtn.costNum.color = new Color("#FF0000");
                this.view.sureBtn.costNum.strokeColor = new Color("#000000");
            }
            btnState.selectedIndex = 0;

        }
        else {
            LeagueManager.ins().createSelectData = [0, 0];
            btnState.selectedIndex = 1;

        }

        this.onUpdateList(0);
        this.onUpdateFlag();

    }

    public onUpdateFlag(): void {
        let data = LeagueManager.ins().createSelectData;
        if (data) {
            let icon = data[0] + 1;
            let iconUrl = LeagueModel.ins().getLeagueIconUrl(icon);
            let flag = data[1] + 1;
            let flagUrl = LeagueModel.ins().getLeagueBannerUrl(flag);

            let com = this.view.flagCom;
            com.iconLoader.url = iconUrl;
            com.flagLoader.url = flagUrl;

            let vo = LeagueManager.ins().mLeagueVo;
            if (vo) {
                if (vo.banner == icon && vo.icon == flag) {
                    this.view.sureBtn.grayed = true;
                    this.view.sureBtn.enabled = false;
                }
                else {
                    this.view.sureBtn.grayed = false;
                    this.view.sureBtn.enabled = true;
                }

            }
            else {
                this.view.sureBtn.grayed = false;
                this.view.sureBtn.enabled = true;
            }
        }

        this.onUpdateList(this.currentTabIndex);

    }
    private currentTabIndex = 0;
    public onUpdateList(tabIndex: number): void {
        this.currentTabIndex = tabIndex;
        if (tabIndex == 0) {
            this.view.list.numItems = this.allIconCfgs.length;
        }
        else if (tabIndex == 1) {
            this.view.list.numItems = this.allFlagCfgs.length;
        }

    }

    private listRender(index: number, obj: ui.league.btn.flagIconCell): void {
        let item: table.league.LeagueIconConfig | table.league.LeagueBannerConfig;
        if (this.currentTabIndex == 0) {
            item = this.allIconCfgs[index];
            obj.select_img.visible = (index) == LeagueManager.ins().createSelectData[0];
        }
        else {
            item = this.allFlagCfgs[index];
            obj.select_img.visible = (index) == LeagueManager.ins().createSelectData[1];
        }

        //是否被选中

        obj.imageLoader.url = item.path;
        obj.clearClick();
        obj.onClick(() => {
            this.onSelectFlag(index);
        }, this);
    }

    private onSelectFlag(index: number): void {
        if (this.currentTabIndex == 0) {

            LeagueManager.ins().createSelectData[0] = index;
        }
        else {

            LeagueManager.ins().createSelectData[1] = index;
        }
        this.onUpdateFlag();
    }

    private onSure(): void {
        //有联盟的时候就改变图标
        if (LeagueManager.ins().mPlayerLeagueLoginVo && LeagueManager.ins().mPlayerLeagueLoginVo.leagueId > 0) {
            let data = LeagueManager.ins().createSelectData;
            LeagueModel.ins().changeLeagueBanner(data[0] + 1, data[1] + 1);

        }
        else {
            this.closeSelf();
            G.FacadeManager.emit(NotificationKey.EVENT_LEAGUE_ICON_BANNER_CHANGE);
        }

    }


}
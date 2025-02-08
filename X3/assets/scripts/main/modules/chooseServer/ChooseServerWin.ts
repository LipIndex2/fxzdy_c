import * as fgui from "fairygui-cc";
import UIScriptManager from "../../../core/comm/UIScriptManager";
import { ChooseServerModel } from "../login/model/ChooseServerModel";
import { IRoleVo, IServerVo } from "../login/vo/ILoginVo";
import LoginNotificationKey from "../LoginNotificationKey";
import { ServerState, UIChooseServerKey } from "./const/UIChooseServerConfig";
import { UICommWin } from "../../../core/mvc/view/UICommWin";
import { NumberFormatter } from "../../../core/utils/NumberFormatter";
import { Logger } from "db://assets/scripts/core/log/Logger";
import { TableManager } from "../../../core/table/TableManager";

/**
 * 选服
 */
export class ChooseServerWin extends UICommWin {

    static pkgName: string = "server";
    static viewName: string = "ChooseServerWin";

    /**页签 */
    protected _tabItems: Array<number | string>;
    /**我的服务器 */
    protected _MyItems: Array<IServerVo>;
    /**本区服务器 */
    protected _serverItems: Array<IServerVo>;

    protected currentSelectTabIndex: number;

    protected get view(): ui.server.ChooseServerWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [];
    }

    notificationHandler(event: string, args?: any): void {

    }

    protected onInit(): void {
        this.view.areaList.setVirtual();
        this.view.myList.setVirtual();
        this.view.serverList.setVirtual();
        this.view.areaList.itemRenderer = this.onAreaRender.bind(this);
        this.view.myList.itemRenderer = this.onPlayerRender.bind(this);
        this.view.serverList.itemRenderer = this.onServerRender.bind(this);

        this.view.areaList.on(fgui.Event.CLICK_ITEM, this.onSelectTabServer, this);

        this.view.myList.on(fgui.Event.CLICK_ITEM, (item) => {
            let index = this.view.myList.childIndexToItemIndex(this.view.myList.getChildIndex(item));
            this.onChooseServer(this._MyItems[index]);
        }, this);

        this.view.serverList.on(fgui.Event.CLICK_ITEM, (item) => {
            let index = this.view.serverList.childIndexToItemIndex(this.view.serverList.getChildIndex(item));
            this.onChooseServer(this._serverItems[index]);
        }, this);

    }

    protected onOpen(): void {
        let pages = ChooseServerModel.ins().getPageIdList().reverse();//倒序

        let hasRole = !!ChooseServerModel.ins().getHasRoleNum();
        this._tabItems = [];
        hasRole && this._tabItems.push(-1);
        this._tabItems.push(-2);
        this._tabItems.push(...pages);

        this.view.areaList.numItems = this._tabItems.length;
        this.view.areaList.selectedIndex = 0;
        this.onSelectTabServer();
    }

    protected onClose(): void {
    }

    private onSelectTabServer() {
        let index = this.view.areaList.selectedIndex;

        if (this.currentSelectTabIndex === index) {
            return;
        }
        this.currentSelectTabIndex = index;

        let pageId = +this._tabItems[index];
        let isMy = pageId == -1;
        if (isMy) {
            this._MyItems = ChooseServerModel.ins().getHistoryServer();
            this.view.myList.numItems = this._MyItems.length;
        } else {
            if (pageId < 0) {
                //-2
                this._serverItems = [ChooseServerModel.ins().getNewServerVo()];
            } else {
                this._serverItems = ChooseServerModel.ins().getServerVosByPage(pageId).reverse();//倒序
            }
            this.view.serverList.numItems = this._serverItems.length;
        }

        this.view.myList.visible = isMy;
        this.view.serverList.visible = !isMy;

        this.view.serverList.scrollToView(0);
    }


    /**获取区域名 */
    private getAreaNameByPage(pageId) {
        let startId = (pageId - 1) * ChooseServerModel.PER_PAGE_COUNT + 1;
        return startId + "-" + (startId + ChooseServerModel.PER_PAGE_COUNT - 1); //如 1-10 11-20
    }

    private onAreaRender(index: number, item: ui.server.item.AreaItem) {
        let pageId = Number(this._tabItems[index]);
        if (pageId < 0) {
            if (pageId == -1) {
                item.areaName.text = "我的区服";
            } else {
                item.areaName.text = "推荐区服";
            }
        } else {
            item.areaName.text = this.getAreaNameByPage(pageId);
        }
    }

    private onServerRender(index: number, item: ui.server.item.ServerItem) {

        let data = this._serverItems[index];
        item.serverName.text = data.name;

        item.state.visible = data.states == ServerState.MAINTENANCE;
        if (data.states == 3) {
            item.state.getController("state").selectedIndex = data.states;
        }
    }

    protected onPlayerRender(index: number, item: ui.server.item.PlayerItem) {
        let data = this._MyItems[index];
        const serverId = data.id;
        let roleVo: IRoleVo = ChooseServerModel.ins().getRoleVoByServerId(serverId);

        item.serverName.text = data.name;
        item.roleName.text = roleVo.name;
        item.fightTxt.text = NumberFormatter.formatNumberToString(roleVo.fight);

        if (TableManager.isComplete()) {
            let cfg = TableManager.getDataById(table.set.SetShowConfig, roleVo.headIcon);
            if (cfg) {
                item.headIcon.icon = cfg.assetPath;
            }
        }
    }

    protected onChooseServer(serverVo: IServerVo) {
        Logger.game(`选择了服务器 serverId = ${serverVo.id}`);

        let ret = ChooseServerModel.ins().checkServerState(serverVo, true);
        if (ret) {
            ChooseServerModel.ins().serverVo = serverVo;
            this.emit(LoginNotificationKey.CHOOSE_SERVER_CHANGED);

            this.closeSelf();
        }
    }
}

UIScriptManager.bindScript(UIChooseServerKey.ChooseServerWin, ChooseServerWin);
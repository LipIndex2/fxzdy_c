import * as fgui from "fairygui-cc";
import G from "../../../../../core/comm/G";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import NotificationKey from "../../../../event/NotificationKey";

/**
 * 勘探分享item
 */
@bindFguiExtension('ui://leagueExplore/LeagueExploreShareItem')
export class LeagueExploreShareItem extends fgui.GComponent {

    static pkgName: string = "leagueExplore";
    static viewName: string = "LeagueExploreShareItem";

    protected _channel: string = null;
    private get view(): ui.leagueExplore.item.LeagueExploreShareItem {
        return this as any;
    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.btnGouXuan.onClick(this.onClickGouXuan, this);
    }

    protected onPreDispose(): void {

    }

    protected onClickGouXuan(): void {
        if (this.view.btnGouXuan.selected) {
            G.FacadeManager.emit(NotificationKey.LEAGUE_EXPLORE_SHARE_SELECT, this._channel);
        } else {
            G.FacadeManager.emit(NotificationKey.LEAGUE_EXPLORE_SHARE_SELECT_CANCEL, this._channel);
        }
    }

    public setData(channel: string, isSelect:boolean): void {
        this._channel = channel;
        let cfg = G.TableManager.getDataById(table.chat.ChatChannelConfig, channel);
        this.view.lbChannel.text = cfg ? cfg.name : '';
        this.view.btnGouXuan.selected = isSelect;
    }
}
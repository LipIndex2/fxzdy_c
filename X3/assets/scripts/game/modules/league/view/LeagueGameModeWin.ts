import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import NotificationKey from "../../../event/NotificationKey";
import { UILeagueKey } from "../const/UILeagueConst";
import { LeagueGameModeItem } from "../item/LeagueGameModeItem";

/**
 * 联盟玩法界面
 */
@bindScript(UILeagueKey.LeagueGameModeWin)
export class LeagueGameModeWin extends UICommWin {
    static pkgName: string = "league";

    static viewName: string = "LeagueGameModeWin";

    protected _allCfgs: table.league.LeagueGameModeConfig[] = null;
    private get view(): ui.league.LeagueGameModeWin {
        return this._view as any;
    }

    protected onInit(): void {
        this.view.list.setVirtual();
        this.view.list.itemRenderer = this.itemRendererForList.bind(this);
    }

    protected onPreDispose(): void {

    }

    protected itemRendererForList(index: number, item: LeagueGameModeItem): void {
        item.setData(this._allCfgs[index]);
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this._allCfgs = G.TableManager.getAllData(table.league.LeagueGameModeConfig);
        this.view.list.numItems = this._allCfgs.length;
    }

    protected onClose(dontDispose?: boolean): void {

    }
}
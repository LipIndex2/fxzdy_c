import { Vec2 } from "cc";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { UILeagueExploreConfig } from "../const/UILeagueExploreConfig";
import { LeagueExploreShareItem } from "./item/LeagueExploreShareItem";
import { BattleUtils } from "../../../comm/battle/BattleUtils";
import { FightType } from "../../../comm/battle/enum/FightType";

@bindScript(UILeagueExploreConfig.LeagueExploreShareWin)
export class LeagueExploreShareWin extends UICommWin {
    static pkgName: string = "leagueExplore";
    static viewName: string = "LeagueExploreShareWin";

    protected _buildingId: number = 0;
    protected _channels: string[] = [];
    protected _selectMap: Map<string, number> = new Map();
    private get view(): ui.leagueExplore.view.LeagueExploreShareWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.LEAGUE_EXPLORE_SHARE_SELECT,
            NotificationKey.LEAGUE_EXPLORE_SHARE_SELECT_CANCEL,
            NotificationKey.LEAGUE_EXPLORE_SHARE_COMPLETE,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.LEAGUE_EXPLORE_SHARE_SELECT:
                this._selectMap.set(args, Number(ServerEnums.ChannelType[args]));
                break;
            case NotificationKey.LEAGUE_EXPLORE_SHARE_SELECT_CANCEL:
                this._selectMap.delete(args);
                break;
            case NotificationKey.LEAGUE_EXPLORE_SHARE_COMPLETE:
                GIns.floatingTextMgr.showTips('分享成功');
                break;
        }
    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.listShare.setVirtual();
        this.view.listShare.itemRenderer = this.itemRendererForShare.bind(this);

        this.view.btnShare.onClick(this.onClickShare, this);
    }

    protected onPreDispose(): void {

    }

    protected itemRendererForShare(index: number, item: LeagueExploreShareItem): void {
        item.setData(this._channels[index], this._selectMap.has(this._channels[index]));
    }

    protected onClickShare(): void {
        let channelIds: number[] = Array.from(this._selectMap.values());
        let endPos:Vec2 = GIns.battleMgr.mainScene.getHeroTeam().pos;
        endPos = BattleUtils.setPosNotBlockPos(FightType.LEAGUE_EXPLORE_MAP, endPos);
        GIns.leagueExploreMgr.shareBuilding(this._buildingId, channelIds, endPos);
    }

    protected updateUI(): void {
        this.view.listShare.numItems = this._channels.length;
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this._buildingId = args;
        this._channels = Array.from(GIns.leagueExploreModel.constCfg.shareChannelTypeMap.keys());
        this.updateUI();
    }

    protected onClose(dontDispose?: boolean): void {
    }
}
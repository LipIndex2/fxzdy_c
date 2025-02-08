import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { MiniMapShowBuildingItem } from "../../miniMap/item/MiniMapShowBuildingItem";
import { EnumRuleKeys } from "../../rule/enums/EnumRuleKeys";
import { RuleController } from "../../rule/RuleController";
import { UILeagueExploreConfig } from "../const/UILeagueExploreConfig";
import { ILeagueExploreBuildingFactoryVo } from "../model/vo/ILeagueExploreBuildingFactoryVo";
import { ILeagueExploreBuildingVo } from "../model/vo/ILeagueExploreBuildingVo";
import { LeagueExploreMiniDetailItem } from "./item/LeagueExploreMiniDetailItem";
import { LeagueExploreMiniItem } from "./item/LeagueExploreMiniItem";

@bindScript(UILeagueExploreConfig.LeagueExploreMiniWin)
export class LeagueExploreMiniWin extends UICommWin {
    static pkgName: string = "leagueExplore";
    static viewName: string = "LeagueExploreMiniWin";

    protected _openIdxMap: Map<number, boolean> = new Map();
    protected _starId: number = 0;
    protected _factorys: ILeagueExploreBuildingFactoryVo[] = null;
    protected _mines: ILeagueExploreBuildingVo[] = null;
    
    private get view(): ui.leagueExplore.view.LeagueExploreMiniWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.LEAGUE_EXPLORE_MINI_ITEM_CHANGE,
            NotificationKey.LEAGUE_EXPLORE_BUILDING_INFO_CHANGE,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.LEAGUE_EXPLORE_MINI_ITEM_CHANGE:
                if (this._openIdxMap.has(args)) {
                    this._openIdxMap.delete(args)
                } else {
                    this._openIdxMap.set(args, true);
                }
                this.view.listFactory.refreshVirtualList();
                if (this._openIdxMap.has(args)) {
                    this.view.listFactory.scrollToView(args, false, true);
                }
                break;
            case NotificationKey.LEAGUE_EXPLORE_BUILDING_INFO_CHANGE:
                this.updateFactorys();
                this.updateMiniMap(args);
                break;
        }
    }

    /***组件初始化 */
    protected onInit(): void {
        // this.view.map.mapItem.draggable = true;
        this.view.listFactory.scrollItemToViewOnClick = false;
        this.view.listFactory.setVirtual();
        this.view.listMine.setVirtual();
        this.view.listFactory.itemRenderer = this.itemRendererForFactory.bind(this);
        this.view.listMine.itemRenderer = this.itemRendererForMine.bind(this);
        this.view.btnRule.onClick(this.onClickRule, this);
    }

    protected onPreDispose(): void {

    }

    protected itemRendererForFactory(index: number, item: LeagueExploreMiniItem): void {
        item.setData(this._factorys[index], index, this._openIdxMap.has(index));
    }

    protected itemRendererForMine(index: number, item: LeagueExploreMiniDetailItem): void {
        item.setData(this._mines[index], index);
    }

    protected onClickRule(): void {
        RuleController.ins().openRule(EnumRuleKeys.LEAGUE_EXPLORE_MINIMAP, this.view.btnRule);
    }

    /**更新小地图*/
    protected updateMiniMap(id?: number): void {
        let mapitem = FguiScriptUtils.toMyScriptClass(this.view.map.mapItem.mapItem, MiniMapShowBuildingItem);
        mapitem.updateData(true, id);
        this.view.bgLoader.icon = GIns.miniMapMgr.getMiniMapBgPath();
        this.setMiniMapPosition();
    }

    protected setMiniMapPosition():void {
        let mapitem = FguiScriptUtils.toMyScriptClass(this.view.map.mapItem.mapItem, MiniMapShowBuildingItem);
        let mapSize = GIns.mapMgr.getMapSize();
        mapitem.setMiniMapPosition({ x: mapSize.width * 0.5, y: mapSize.height * 0.5 });
    }

    protected updateFactorys(): void {
        this._factorys = GIns.leagueExploreModel.getFactorys(this._starId);
        if (this._factorys.length == 1 && this._factorys[0].factory == null) {
            //没有工厂
            this._mines = this._factorys[0].mines;
            this.view.listFactory.visible = false;
            this.view.listMine.visible = true;
            this.view.listMine.numItems = this._mines.length;
        } else {
            this.view.listFactory.visible = true;
            this.view.listMine.visible = false;
            this.view.listFactory.numItems = this._factorys.length;
        }
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this._starId = args;
        if (GIns.leagueExploreModel.isLoadMiniMap == false) {
            // 小地图   不加延迟位置可能会有偏移
            G.GameTimer.once(1000, this, () => {
                if (this.view.node?.isValid) {
                    this.updateMiniMap();
                }
            });
        } else {
            this.updateMiniMap();
        }

        this.updateFactorys();

        let starCfg = G.TableManager.getDataById(table.leagueexplore.LeagueExploreStarConfig, args)
        this.view.lbTitle.text = starCfg ? starCfg.name : '';
    }

    protected onClose(dontDispose?: boolean): void {

    }
}
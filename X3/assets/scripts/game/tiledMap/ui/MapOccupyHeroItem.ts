import * as fgui from "fairygui-cc";
import G from "../../../core/comm/G";
import { bindFguiExtension } from "../../../core/comm/UIScriptManager";
import GIns from "../../GIns";
import { ModelNode } from "../../modules/common/node/ModelNode";

/** 勘探工厂建筑占领英雄 */
@bindFguiExtension("ui://map/MapOccupyHeroItem")
export class MapOccupyHeroItem extends fgui.GComponent {
    static pkgName: string = "map";
    static viewName: string = "MapOccupyHeroItem";

    protected _imageId: number = -1;
    private get view(): ui.map.item.MapOccupyHeroItem {
        return this as any;
    }

    constructor() {
        super();
    }

    protected onInit() {

    }

    protected onPreDispose() {

    }

    setData(baseInfo: Vo.player.PlayerBaseVo): void {
        if (baseInfo == null) {
            //无人占领
            this._imageId = 0;
            this.view.getTransition('t0').stop();
            this.view.light1.visible = false;
            this.view.getController('state').selectedIndex = 3;
            return;
        }
        this.view.light1.visible = true;
        this.view.getTransition('t0').play(null, -1);
        let myPlayerId: number = GIns.playerModel.playerId;
        let myLeagueId: number = GIns.LeagueModel.getLeagueId();
        let imageId: number = baseInfo.imageId;
        if (baseInfo.id == myPlayerId) {
            //我自己
            this.view.getController('state').selectedIndex = 2;
            imageId = GIns.settingsModel.context.getImageId();
        } else if (baseInfo.leagueId == myLeagueId) {
            //我方
            this.view.getController('state').selectedIndex = 0;
        } else {
            //敌方
            this.view.getController('state').selectedIndex = 1;
        }
        this.view.lbName.text = baseInfo.name;
        if (this._imageId != imageId) {
            this._imageId = imageId;
            let cfg = G.TableManager.getDataById(table.set.SetShowConfig, imageId);
            if (cfg) {
                let spineHero = this.view.spineHero as ModelNode;
                spineHero.loadByModelId(cfg.heroModelId);
                spineHero.playOrders([{
                    name: 'idle',
                    isLoop: true
                }])
            }
        }
    }
}

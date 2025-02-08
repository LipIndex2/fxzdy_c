import * as fgui from "fairygui-cc";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";

export class PVPRankStarListComp extends fgui.GComponent {
    private _config: table.arena.ArenaRankConfig;

    private get view(): ui.pvp.components.PVPRankStarListComp {
        return this as any;
    }

    constructor() {
        super();
    }


    onConstruct() {
        this.view.starList.setVirtual();
        this.view.starList.itemRenderer = this.itemRenderForStar.bind(this);

    }


    @LogBusiness("段位星星 ")
    reset(config: table.arena.ArenaRankConfig) {
        if (!config) {
            return;
        }
        this._config = config;

        this.view.starList.numItems = config.starMaxCount;
    }


    itemRenderForStar(index: number, comp: ui.pvp.list.PVPRankStarComp) {
        if (!this._config) {
            return;
        }
        const myStarCount = this._config.starCount;
        const isReach = myStarCount >= index + 1;
        comp.getController("reachFlag").selectedIndex = isReach ? 1 : 0;
        
    }

}
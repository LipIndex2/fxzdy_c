import * as fgui from "fairygui-cc";
import { PVPUtils } from "db://assets/scripts/game/modules/pvp/utils/PVPUtils";

/**
 * jjc 段位小 logo
 */
export class CommonPVPRankSmallLogoComp extends fgui.GComponent {

    private _config: table.arena.ArenaRankConfig;

    private get view(): ui.comm.pvp.CommonPVPRankSmallLogoComp {
        return this as any;
    }

    protected onConstruct() {
        super.onConstruct();

        this.view.starComp.starList.setVirtual();
        this.view.starComp.starList.itemRenderer = this.renderStar.bind(this);

    }


    protected onPreDispose() {
        super.onPreDispose();
    }


    reset(rankNum: number, pvpRankConfigId: number) {
        const configId = pvpRankConfigId || 0;
        const config = PVPUtils.getConfigById(configId);
        if (!config) {
            return;
        }
        this._config = config;

      
        // assets
        this.view.imageRankLogo.icon = config.logoSmallAssetPath;
        this.view.starComp.starList.numItems = config.starMaxCount;
    }

    private renderStar(index: number, starComp: ui.comm.pvp.CommonPVPRankStarComp) {
        const myStarCount = this._config.starCount;
        const isReach = index < myStarCount;
        starComp.getController("reachFlag").selectedIndex = isReach ? 1 : 0;

    }
}
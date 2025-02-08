import * as fgui from "fairygui-cc";

export class PVPRankBigLogoComp extends fgui.GComponent {
    private _config: table.arena.ArenaRankConfig;


    private get view(): ui.pvp.logo.PVPRankBigLogoComp {
        return this as any;
    }

    constructor() {
        super();
    }


    onConstruct() {
        this.onInit()
    }

    public onInit() {
        this.view.starComp.starList.setVirtual();
        this.view.starComp.starList.itemRenderer = this.itemRenderForStar.bind(this);


    }

    reset(config: table.arena.ArenaRankConfig) {
        if (config == null) {
            return;
        }
            
        if (this._config?.id == config.id) {
            return;
        }
        this._config = config;


        this.view.imageRankLogo.icon = config.logoBigAssetPath;
        this.view.starComp.starList.numItems = config.starMaxCount;
    }

    itemRenderForStar(index: number, starComp: ui.pvp.list.PVPRankStarComp) {
        const myStarCount = this._config.starCount;
        const isReach = index < myStarCount;
        starComp.getController("reachFlag").selectedIndex = isReach ? 1 : 0;

    }

}
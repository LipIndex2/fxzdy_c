import * as fgui from "fairygui-cc";
import { HeroUtils } from "../../hero/utils/HeroUtils";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { QualityUtils } from "../quality/QualityUtils";
import { HeroManager } from "../../hero/HeroManager";
import { TableManager } from "../../../../core/table/TableManager";

/**
 * 详细英雄头像 带星和等级
 */
export class HeroDetailsAvatar extends fgui.GComponent {

    static pkgName: string = "comm";
    static viewName: string = "HeroDetailsAvatar";

    // 英雄
    private _heroId: number;
    private _heroConfig: table.hero.HeroConfig;
    private _star: number;
    private _lv: number;
    private _useSkinId:number;

    private get view(): ui.comm.hero.HeroDetailsAvatar {
        return this as any;
    }

    protected onConstruct(): void {
        this.view.list_star.itemRenderer = this.starItem.bind(this);
    }

    private starItem(index: number, item: ui.comm.item.StarIconItem) {
        item.starIcon.icon = ItemUtils.getStarIcon(this._star);
    }

    reset(heroId: number, star: number = 0, lv: number = 0, skinId:number = 0) {
        this._heroId = heroId;
        this._heroConfig = HeroUtils.getHeroConfigById(heroId)
        this._star = star;
        this._lv = lv;
        this._useSkinId = skinId;

        this.updateUI();
    }

    

    private updateUI() {

        const heroConfig = this._heroConfig;
        if (!heroConfig) {
            console.error(`heroConfig is null. heroId = ${this._heroId} `);
            this.view.imageHero.visible = false
            this.view.imageBg.icon = QualityUtils.getQualityConfigById(1)?.itemQualityBgPath ?? "";
            this.view.starMc.visible = false;
            this.view.lvLab.text = "";
            return;
        }

        // 头像
        this.view.imageHero.visible = true;

        if(this._useSkinId){
            let skinCfg = TableManager.getDataById(table.hero.HeroSkinConfig, this._useSkinId);
            this.view.imageHero.icon = ItemUtils.getNormalHeroHead(skinCfg.headPath);
        }else{
            this.view.imageHero.icon = ItemUtils.getNormalHeroHead(heroConfig.headPath);
        }

        this.view.imageBg.icon = QualityUtils.getQualityConfigById(heroConfig.quality)?.itemQualityBgPath ?? "";

        this.view.lvLab.text = "";
        if (this._lv) {
            this.view.lvLab.text = this._lv.toString();
        }

        this.view.starMc.visible = false;
        if (this._star) {
            this.view.starMc.visible = true;
            let num = this._star % 5;
            this.view.list_star.numItems = num == 0 ? 5 : num;
        }
    }


}
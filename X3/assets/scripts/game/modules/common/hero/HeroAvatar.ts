import * as fgui from "fairygui-cc";
import { HeroUtils } from "db://assets/scripts/game/modules/hero/utils/HeroUtils";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { QualityUtils } from "db://assets/scripts/game/modules/common/quality/QualityUtils";
import G from "db://assets/scripts/core/comm/G";


/**
 * 英雄头像 | 纯展示用, 非养成
 */
export class HeroAvatar extends fgui.GComponent {

    static pkgName: string = "comm";
    static viewName: string = "HeroAvatar";

    // 英雄
    private _heroId: number;
    private _heroConfig: table.hero.HeroConfig;
    protected _itemId:number = 0;

    private get view(): ui.comm.hero.HeroAvatar {
        return this as any;
    }

    protected onConstruct(): void {

    }


    reset(heroId: number,) {
        this._heroId = heroId;
        this._heroConfig = HeroUtils.getHeroConfigById(heroId)


        this.updateUI();
    }

    resetbyItemId(itemId:number):void {
        if (this._itemId != itemId) {
            this._itemId = itemId;
            let itemCfg = G.TableManager.getDataById(table.item.ItemConfig, itemId);
            if (itemCfg) {
                this.view.imageHero.icon = ItemUtils.getNormalHeroHead(itemCfg.iconPath);
                this.view.imageBg.icon = QualityUtils.getQualityConfigById(itemCfg.quality)?.itemQualityBgPath ?? "";
            }
        }
    }

    private updateUI() {

        const heroConfig = this._heroConfig;
        if (!heroConfig) {
            console.error(`heroConfig is null. heroId = ${this._heroId} `);
            return;
        }
        
        // 头像
        this.view.imageHero.icon = ItemUtils.getNormalHeroHead(heroConfig.headPath);
        this.view.imageBg.icon = QualityUtils.getQualityConfigById(heroConfig.quality)?.itemQualityBgPath ?? "";

    }
}
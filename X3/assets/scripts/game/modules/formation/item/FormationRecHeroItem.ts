import G from "db://assets/scripts/core/comm/G";
import * as fgui from "fairygui-cc";
import { HeroManager } from "../../hero/HeroManager";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { HeroUtils } from "../../hero/utils/HeroUtils";
import { UIManager } from "../../../../core/mvc/UIManager";
import { UIViewItemDetailsKey } from "../../itemDetails/UIViewItemDetailsKey";
import { HeroItemTipsViewOpenArgs } from "../../itemDetails/HeroItemTipsView";
import { HeroVo } from "../../hero/HeroVo";


const { GObject } = fgui;

/**
 * 道具图标 ItemFrame
 */
export class FormationRecHeroItem extends fgui.GButton {
    static pkgName: string = "formation";
    static viewName: string = "FormationRecHeroItem";
    public _heroVo: HeroVo = null
    public _heroId = null
    public isHave: boolean = false;

    private get view(): ui.formation.item.FormationRecHeroItem {
        return this as any;
    }

    protected onInit(): void {
        this.view.list_star.itemRenderer = this.itemRendererForStar.bind(this)
        this.view.onClick(this.onClickHero, this);
    }

    onClickHero() {
        let itemConfig = G.TableManager.getDataById(table.item.ItemConfig, this._heroId);
        UIManager.ins().open(UIViewItemDetailsKey.HeroCardDetails, {
            itemConfig: itemConfig,
        } as HeroItemTipsViewOpenArgs);
    }

    protected itemRendererForStar(index: number, item: ui.comm.item.StarIconItem): void {
        item.starIcon.icon = ItemUtils.getStarIcon(this._heroVo.star)
    }

    /**
     * 设置道具数据
     * @param heroId 物品id
     * @param count 数量
     */
    reset(heroId: number, bestId: string) {
        this._heroId = heroId;
        const itemConfig = G.TableManager.getDataById(table.item.ItemConfig, heroId);
        if (!itemConfig) {
            G.Logger.error(`找不到物品配置 ${heroId}`);
            return;
        }

        // 品质
        const qualityConfig = G.TableManager.getDataById(table.quality.QualityConfig, itemConfig.quality);
        if (qualityConfig) {
            this.view.img_frame.icon = qualityConfig.itemQualityBgPath;
        }
        let heroCfg = HeroUtils.getHeroConfigById(heroId);

        this.view.lb_type.text = heroCfg.discountShow + "";// ItemUtils.getCareerName(ServerEnums.Career[heroCfg.career]);
        this.view.img_type.icon = ItemUtils.getCareerIcon(ServerEnums.Career[heroCfg.career]);
        this.view.img_best.visible = bestId.split(";").indexOf(String(heroId)) != -1;

        this._heroVo = HeroManager.ins().getHeroVoByID(heroId);
        this.isHave = HeroManager.ins().isHaveHero(heroId);
        
        this.view.img_item.icon = ItemUtils.getNormalHeroHead(this._heroVo.headPath);
        if (this.isHave) {
            this.view.img_bg_star.visible = this.view.list_star.visible = true;
            this.view.img_gray.visible = false;

            let num = 0;
            num = this._heroVo.star % 5;
            this.view.list_star.numItems = num == 0 ? 5 : num;
        } else {
            this.view.img_bg_star.visible = this.view.list_star.visible = false;
            this.view.img_gray.visible = true;

            this.view.list_star.numItems = 0;
        }

    }
}
import * as fgui from "fairygui-cc";
import { ItemUtils } from "../../../item/utils/ItemUtils";
import { HeroItem } from "../../../common/item/HeroItem";
import { HeroManager } from "../../../hero/HeroManager";
import { ActivitySignInVo } from "../../model/ActivitySignInVo";
import { UIManager } from "../../../../../core/mvc/UIManager";
import { UIViewItemDetailsKey } from "../../../itemDetails/UIViewItemDetailsKey";
import { HeroItemTipsViewOpenArgs } from "../../../itemDetails/HeroItemTipsView";
import { TableManager } from "../../../../../core/table/TableManager";

/**
 * 签到送英雄
 * 奖励预览item
 */
export class AwardItem extends fgui.GComponent {
    static pkgName: string = "activityGiveHero";
    static viewName: string = "AwardItem";

    /** 签到vo */
    private _data: ActivitySignInVo;

    private _heroIds = [];

    private _qualityNames = ["", "普通", "高级", "稀有", "史诗", "传说", "神话", "神话+", "彩"];

    private get view(): ui.activityGiveHero.item.AwardItem {
        return this as any;
    }

    onInit() {
        this.view.list_hero.itemRenderer = this.itemRendererForHero.bind(this);
    }

    onOpen() {}

    public updateItem(data: any, heroIds: any, Vo: any) {
        let quality = this._qualityNames[+data];
        this.view.T_hero.text = `${quality}英雄`;
        this._heroIds = heroIds;
        this._data = Vo;
        this.view.list_hero.numItems = heroIds.length;
    }

    private itemRendererForHero(index: number, item: HeroItem) {
        let heroId = this._heroIds[index];
        let heroVo = HeroManager.ins().getHeroVoByID(heroId);
        item.setHeroVo(heroVo, true);
        item.isShowName(false);
        item.isShowLevel(false);
        item.isShowCamp(false);

        if (this._data.getHadDrawRewardIds(heroId)) {
            item.getController("isGet").selectedIndex = 2;
        } else {
            item.getController("isGet").selectedIndex = 1;
        }

        item.setClickFun(() => {
            let itemConfig = TableManager.getDataById(table.item.ItemConfig, heroId);
            UIManager.ins().open(UIViewItemDetailsKey.HeroCardDetails, {
                itemConfig: itemConfig,
            } as HeroItemTipsViewOpenArgs);
        });
    }
}

import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { ViewBlackBgComp } from "../../../../core/mvc/view/comp/ViewBlackBgComp";
import { ViewEffectComp } from "../../../../core/mvc/view/comp/ViewEffectComp";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import { TableManager } from "../../../../core/table/TableManager";
import { StringUtils } from "../../../../core/utils/StringUtils";
import NotificationKey from "../../../event/NotificationKey";
import { HeroItem } from "../../common/item/HeroItem";
import { HeroManager } from "../../hero/HeroManager";
import { DrawCardManager } from "../DrawCardManager";
import { DrawCardUIKeys } from "../DrawCardUIKeys";
import { DrawCardModel } from "../model/DrawCardModel";

/**
 * 抽卡
 * 心愿英雄
 */
@bindScript(DrawCardUIKeys.DrawCardWishWin)
export class DrawCardWishWin extends UICommWin {
    static pkgName: string = "drawCard";
    static viewName: string = "DrawCardWishWin";

    private _heroIds = [];

    private _upHeroId: number;

    private _item: HeroItem;

    private get view(): ui.drawCard.win.DrawCardWishWin {
        return this._view as any;
    }

    protected onInit(): void {
        this.view.list_hero.itemRenderer = this.heroItem.bind(this);
    }

    protected onOpen(args: any): void {
        this._upHeroId = DrawCardManager.ins().upHeroId;

        let idsStr = TableManager.getDataById(table.recruit.RecruitConstantConfig, "RECRUIT:SPECIAL_GUARANTEE_HERO_BASE_IDS").content;
        let count = TableManager.getDataById(table.recruit.RecruitConstantConfig, "RECRUIT:SPECIAL_GUARANTEE_TIMES").content;
        this.view.T_counts.text = `${count}次星际招募必得心愿英雄`;
        let strArr = idsStr.split(",");
        for (let str of strArr) {
            this._heroIds.push(+StringUtils.repInvalid2(str));
        }
        // idsStr = StringUtils.repInvalid2(idsStr);
        // this._heroIds = idsStr.split(",");
        this.view.list_hero.numItems = this._heroIds.length;

        this.updateHeroInfo();
    }

    //心愿英雄
    private updateHeroInfo() {
        if (this._upHeroId > 0) {
            this.view.heroItem.visible = true;
            //@ts-ignore
            let item = this.view.heroItem as HeroItem;
            item.isShowName(false);
            let heroVo = HeroManager.ins().getHeroVoByID(this._upHeroId);
            item.setHeroVo(heroVo, true);
            item.isShowLevel(false);
            //名字
            item.isShowName(false);
            this.view.T_tips.text = this.view.heroItem.T_name.text;
            this.view.T_tips.color = this.view.heroItem.T_name.color;
        } else {
            this.view.heroItem.visible = false;
        }
    }

    private heroItem(index: number, item: HeroItem) {
        let heroVo = HeroManager.ins().getHeroVoByID(this._heroIds[index]);
        item.setHeroVo(heroVo, true);
        item.isShowLevel(false);

        if (this._upHeroId == this._heroIds[index]) {
            if (this._item) {
                this._item.isShowGou(false);
            }
            item.isShowGou(true);
            this._item = item;
        }

        let self = this;
        item.onClick(() => {
            self._upHeroId = self._heroIds[index];
            if (self._item) {
                self._item.isShowGou(false);
            }
            item.isShowGou(true);
            self._item = item;
            self.updateHeroInfo();
        }, this);
    }

    protected onClose(): void {
        if (this._upHeroId != DrawCardManager.ins().upHeroId) {
            DrawCardModel.ins().sendSpecialRecruitSetUpHero(this._upHeroId);
        }
    }
}

import { Tween } from "cc";
import * as fgui from "fairygui-cc";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { FormationManager } from "../../formation/FormationManager";
import { HeroVo } from "../../hero/HeroVo";
import { HeroUtils } from "../../hero/utils/HeroUtils";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";

/** 英雄基础列表item */
@bindFguiExtension('ui://comm/HeroBaseItem')
export class HeroBaseItem extends fgui.GComponent {
    static pkgName: string = "comm";
    static viewName: string = "HeroBaseItem";

    //英雄Vo
    protected _heroVo: HeroVo;
    /**星级 可单独设置*/
    protected _star: number;
    /**等级 可单独设置*/
    protected _lv: number;

    private get view(): ui.comm.item.HeroBaseItem {
        return this as any;
    }

    protected onInit() {
        this.view.list_star.itemRenderer = this.itemRendererForStar.bind(this);
    }

    protected onPreDispose(): void {
        Tween.stopAllByTarget(this.view)
    }

    protected itemRendererForStar(index: number, item: ui.comm.item.StarIconItem) {
        item.starIcon.icon = ItemUtils.getStarIcon(this._star);;
    }

    protected updateUI() {
        let self = this.view;
        const quality = this._heroVo.heroCfg.quality;
        self.img_frame.icon = ItemUtils.getQualityIconResourcePath(quality);
        self.img_item.icon = ItemUtils.getNormalHeroHead(this._heroVo.headPath);
        self.img_camp.icon = ItemUtils.getCampIcon(this._heroVo.heroCfg.camp);
        self.img_career.icon = ItemUtils.getCareerIcon(ServerEnums.Career[this._heroVo.heroCfg.career]);

        this.setStar(this._heroVo.star);
        this.setLevel(FormationManager.ins().getCommonLevel());
    }

    /**
     * 设置英雄vo
     * @param heroVo 英雄Vo
     */
    public setHeroVo(heroVo: HeroVo) {
        this._heroVo = heroVo;
        this.updateUI();
    }

    public setStar(star: number): void {
        if (this._star != star) {
            this._star = star;
            this.view.list_star.numItems = HeroUtils.getShowStarCount(star)
        }
    }

    public setLevel(lv: number): void {
        if (this._lv != lv) {
            this._lv = lv;
            this.view.T_level.text = lv > 0 ? lv + '' : ''
        }
    }

    /** 是否显示职业 */
    public isShowCareer(isShow: boolean) {
        this.view.img_career.visible = isShow;
    }

    /** 是否显示阵营 */
    public isShowCamp(isShow: boolean) {
        this.view.img_camp.visible = isShow;
    }
}
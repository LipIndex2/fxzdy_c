import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { ServerEnums } from "../../../../../libs/extras/ServerEnums";
import { HeroVo } from "../../../hero/HeroVo";
import { ItemUtils } from "../../../item/utils/ItemUtils";

/**
 * 星际工厂英雄信息item
 */
@bindFguiExtension('ui://factory/FactoryHeroItem')
export class FactoryHeroItem extends fgui.GComponent {

    static pkgName: string = "factory";
    static viewName: string = "FactoryHeroItem";

    protected _heroVo: HeroVo = null
    private get view(): ui.factory.item.FactoryHeroItem {
        return this as any;
    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.listStar.itemRenderer = this.itemRendererForStar.bind(this);
    }

    protected onPreDispose(): void {

    }

    protected itemRendererForStar(index: number, item: ui.comm.item.StarIconItem) {
        item.starIcon.icon = ItemUtils.getStarIcon(this._heroVo.star);
    }

    public setData(data: HeroVo, level: number): void {
        this._heroVo = data
        this.view.heroLoader.icon = ItemUtils.getHalfHeroHead(data.headPath)
        this.view.campLoader.icon = ItemUtils.getCareerIcon(ServerEnums.Career[data.heroCfg.career])
        this.view.lbLv.text = level + ''
        this.view.lbName.text = data.heroCfg.name
        this.view.lbName.color = ItemUtils.getTextColor(data.heroCfg.quality);
        this.view.lbName.strokeColor = ItemUtils.getTextOutlineColor(data.heroCfg.quality);
        this.view.qualityLoader.icon = ItemUtils.getHeroItem2Bg(data.heroCfg.quality);

        let num = this._heroVo.star % 5;
        this.view.listStar.numItems = num == 0 ? 5 : num;
    }
}
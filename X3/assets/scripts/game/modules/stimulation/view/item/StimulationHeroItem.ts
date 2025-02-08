import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { FguiScriptUtils } from "../../../../../core/utils/FguiScriptUtils";
import GIns from "../../../../GIns";
import { HeroItem } from "../../../common/item/HeroItem";

@bindFguiExtension('ui://stimulation/StimulationHeroItem')
export class StimulationHeroItem extends fgui.GComponent {

    static pkgName: string = "stimulation";
    static viewName: string = "StimulationHeroItem";

    protected _heroId: number = 0;

    private get view(): ui.stimulation.item.StimulationHeroItem {
        return this as any;
    }

    protected onInit(): void {

    }

    protected onPreDispose(): void {

    }

    protected updateUI(): void {

    }

    public get heroId():number {
        return this._heroId;
    }

    public setHeroId(heroId: number, itemId: number = 0, isSelect: boolean = false) {
        let heroItem: HeroItem = FguiScriptUtils.toMyScriptClass(this.view.heroItem, HeroItem);
        if (this._heroId != heroId) {
            this._heroId = heroId;
            let heroVo = GIns.heroMgr.getHeroVoByID(heroId);
            heroItem.setHeroVo(heroVo);
            heroItem.isShowName(false);

            this.view.lbCapacity.text = GIns.stimulationMgr.getAdditionDesForHero(heroVo, itemId)
        }
        heroItem.isShowGou(isSelect);
    }
}
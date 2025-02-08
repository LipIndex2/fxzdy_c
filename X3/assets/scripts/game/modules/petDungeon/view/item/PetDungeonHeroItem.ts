import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { ServerEnums } from "../../../../../libs/extras/ServerEnums";
import GIns from "../../../../GIns";
import { HeroVo } from "../../../hero/HeroVo";
import { HeroUtils } from "../../../hero/utils/HeroUtils";
import { ItemUtils } from "../../../item/utils/ItemUtils";
import { IPetDungeonHeroVo } from "../../model/vo/IPetDungeonHeroVo";

@bindFguiExtension('ui://petDungeon/PetDungeonHeroItem')
export class PetDungeonHeroItem extends fgui.GComponent {

    static pkgName: string = "petDungeon";
    static viewName: string = "PetDungeonHeroItem";

    protected _heroVo: HeroVo = null;

    private get view(): ui.petDungeon.item.PetDungeonHeroItem {
        return this as any;
    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.listStar.itemRenderer = this.itemRendererForStar.bind(this);

        this.view.hpBar.min = 0;
        this.view.hpBar.max = 10000;
    }

    protected onPreDispose(): void {

    }

    protected itemRendererForStar(index: number, item: ui.comm.item.StarIconItem): void {
        item.starIcon.icon = ItemUtils.getStarIcon(this._heroVo.star);
    }

    public setData(data: IPetDungeonHeroVo): void {
        this._heroVo = GIns.heroMgr.getHeroVoByID(data.heroId);
        if (this._heroVo == null) {
            return;
        }

        this.view.bgLoader.icon = ItemUtils.getQualityIconResourcePath(this._heroVo.heroCfg.quality);
        this.view.iconLoader.icon = ItemUtils.getNormalHeroHead(this._heroVo.headPath);
        this.view.careerLoader.icon = ItemUtils.getCareerIcon(ServerEnums.Career[this._heroVo.heroCfg.career]);
        this.view.listStar.numItems = HeroUtils.getShowStarCount(this._heroVo.star)

        this.view.hpBar.value = data.hpRatio;
    }

    public setDataById(heroId:number):void {
        let vo = GIns.petDungeonModel.prepareHeroMap.get(heroId);
        if (vo) {
            this.setData(vo);
        }
    }
}
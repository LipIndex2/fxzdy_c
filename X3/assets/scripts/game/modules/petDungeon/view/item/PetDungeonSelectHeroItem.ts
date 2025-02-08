import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { ServerEnums } from "../../../../../libs/extras/ServerEnums";
import GIns from "../../../../GIns";
import { QualityUtils } from "../../../common/quality/QualityUtils";
import { HeroVo } from "../../../hero/HeroVo";
import { HeroUtils } from "../../../hero/utils/HeroUtils";
import { ItemUtils } from "../../../item/utils/ItemUtils";
import G from "../../../../../core/comm/G";
import NotificationKey from "../../../../event/NotificationKey";

@bindFguiExtension('ui://petDungeon/PetDungeonSelectHeroItem')
export class PetDungeonSelectHeroItem extends fgui.GComponent {

    static pkgName: string = "petDungeon";
    static viewName: string = "PetDungeonSelectHeroItem";

    protected _heroVo: HeroVo = null;

    private get view(): ui.petDungeon.item.PetDungeonSelectHeroItem {
        return this as any;
    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.listStar.itemRenderer = this.itemRendererForStar.bind(this);
        this.view.onClick(this.onClickItem, this);
    }

    protected onPreDispose(): void {
        
    }

    protected itemRendererForStar(index: number, item: ui.comm.item.StarIconItem): void {
        item.starIcon.icon = ItemUtils.getStarIcon(this._heroVo.star);
    }

    protected onClickItem():void {
        if (this._heroVo) {
            if (GIns.petDungeonModel.isPrepareHero(this._heroVo.baseId)) {
                //已经锁定备战了
                GIns.floatingTextMgr.showTips('已锁定英雄无法取消');
                return;
            }
            G.FacadeManager.emit(NotificationKey.PET_DUNGEON_SELECT_HERO_CHANGE, this._heroVo.baseId);
        }
    }

    public setData(data: HeroVo, isSelect: boolean): void {
        this._heroVo = data;
        if (this._heroVo == null) {
            return;
        }

        this.view.bgLoader.icon = ItemUtils.getHeroItem2Bg(this._heroVo.heroCfg.quality);
        this.view.iconLoader.icon = ItemUtils.getHalfHeroHead(this._heroVo.headPath);
        this.view.careerLoader.icon = ItemUtils.getCareerIcon(ServerEnums.Career[this._heroVo.heroCfg.career]);
        this.view.listStar.numItems = HeroUtils.getShowStarCount(this._heroVo.star)
        this.view.lbName.text = this._heroVo.heroCfg.name;
        QualityUtils.setFGUIFontColorByQuality(this.view.lbName, this._heroVo.heroCfg.quality);
        this.view.lbLv.text = GIns.formationMgr.getCommonLevel() + '';

        this.view.gSelect.visible = isSelect;
    }

    public setDataById(heroId: number, isSelect: boolean): void {
        let vo = GIns.heroMgr.getHeroVoByID(heroId);
        if (vo) {
            this.setData(vo, isSelect);
        }
    }
}
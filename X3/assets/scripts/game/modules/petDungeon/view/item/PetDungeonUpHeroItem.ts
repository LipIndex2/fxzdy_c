import * as fgui from "fairygui-cc";
import G from "../../../../../core/comm/G";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { ServerEnums } from "../../../../../libs/extras/ServerEnums";
import NotificationKey from "../../../../event/NotificationKey";
import GIns from "../../../../GIns";
import { HeroVo } from "../../../hero/HeroVo";
import { HeroUtils } from "../../../hero/utils/HeroUtils";
import { ItemUtils } from "../../../item/utils/ItemUtils";

@bindFguiExtension('ui://petDungeon/PetDungeonUpHeroItem')
export class PetDungeonUpHeroItem extends fgui.GComponent {

    static pkgName: string = "petDungeon";
    static viewName: string = "PetDungeonUpHeroItem";

    protected _heroVo: HeroVo = null;

    private get view(): ui.petDungeon.item.PetDungeonUpHeroItem {
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

    protected onClickItem(): void {
        if (this._heroVo) {
            if (GIns.petDungeonModel.isPrepareHero(this._heroVo.baseId)) {
                //已经锁定备战了
                GIns.floatingTextMgr.showTips('当前英雄已锁定');
                return;
            }
            G.FacadeManager.emit(NotificationKey.PET_DUNGEON_SELECT_HERO_CHANGE, this._heroVo.baseId);
        }
    }

    public setData(heroId: number, index: number): void {
        if (heroId <= 0) {
            //空位置
            this._heroVo = null;
            let isUnlock = GIns.petDungeonModel.curUnlockUpPositionCount > index;
            if (isUnlock) {
                this.view.getController('state').selectedIndex = 1;
            } else {
                this.view.getController('state').selectedIndex = 2;
                let needFloorId: number = GIns.petDungeonModel.getPositionIndexNeedFloorId(index);
                // let floorIdx:number = needFloorId > 0 ? needFloorId - GIns.petDungeonModel.firstFloorId + 1 : 0;
                // this.view.lbLock.text = `${floorIdx}`;
                let cfg = G.TableManager.getDataById(table.petdungeon.PetDungeonConfig, needFloorId);
                this.view.lbLock.text = cfg ? cfg.name : '';
            }
            return;
        }
        this.view.getController('state').selectedIndex = 0;
        this.view.iconUpLock.visible = GIns.petDungeonModel.isPrepareHero(heroId);
        this._heroVo = GIns.heroMgr.getHeroVoByID(heroId);
        if (this._heroVo == null) {
            //没有上阵英雄
            return;
        }
        this.view.bgLoader.icon = ItemUtils.getQualityIconResourcePath(this._heroVo.heroCfg.quality);
        this.view.iconLoader.icon = ItemUtils.getNormalHeroHead(this._heroVo.headPath);
        this.view.careerLoader.icon = ItemUtils.getCareerIcon(ServerEnums.Career[this._heroVo.heroCfg.career]);
        this.view.listStar.numItems = HeroUtils.getShowStarCount(this._heroVo.star)
    }
}
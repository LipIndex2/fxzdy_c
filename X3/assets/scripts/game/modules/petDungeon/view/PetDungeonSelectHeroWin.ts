import * as fgui from "fairygui-cc";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { HeroVo } from "../../hero/HeroVo";
import { UIPetDungeonConfig } from "../const/UIPetDungeonConfig";
import { PetDungeonSelectHeroItem } from "./item/PetDungeonSelectHeroItem";
import { PetDungeonUpHeroItem } from "./item/PetDungeonUpHeroItem";

@bindScript(UIPetDungeonConfig.PetDungeonSelectHeroWin)
export class PetDungeonSelectHeroWin extends UICommWin {
    static pkgName: string = "petDungeon";
    static viewName: string = "PetDungeonSelectHeroWin";

    protected _allHeroVos: HeroVo[] = [];
    protected _selectHeroMap: Map<number, boolean> = new Map();
    protected _selectHeroIds: number[] = [];
    protected _curCareerType: number = 0;
    protected _showSelectHeros: HeroVo[] = null;

    private get view(): ui.petDungeon.view.PetDungeonSelectHeroWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.PET_DUNGEON_INFO_CHANGE,
            NotificationKey.PET_DUNGEON_SELECT_HERO_CHANGE,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.PET_DUNGEON_INFO_CHANGE:
                this.updateUI();
                break;
            case NotificationKey.PET_DUNGEON_SELECT_HERO_CHANGE:
                this.handleChangeHeroSelect(args);
                break;
        }
    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.listUp.setVirtual();
        this.view.listSelect.setVirtual();

        this.view.listUp.itemRenderer = this.itemRendererForUp.bind(this);
        this.view.listSelect.itemRenderer = this.itemRendererForUpSelect.bind(this);
        this.view.btnLock.onClick(this.onClickLock, this);
        this.view.careerComp.btnAll.onClick(this.onClickAllCareer, this);
        this.view.careerComp.listCareer.on(fgui.Event.CLICK_ITEM, this.onClickCareer, this);
    }

    protected onPreDispose(): void {

    }

    protected itemRendererForUp(index: number, item: PetDungeonUpHeroItem): void {
        if (index < this._selectHeroIds.length) {
            item.setData(this._selectHeroIds[index], index)
        } else {
            item.setData(0, index);
        }
    }

    protected itemRendererForUpSelect(index: number, item: PetDungeonSelectHeroItem): void {
        item.setData(this._showSelectHeros[index], this._selectHeroMap.has(this._showSelectHeros[index].baseId));
    }

    protected onClickLock(): void {
        if (this._selectHeroIds.length != GIns.petDungeonModel.prepareHeroMap.size) {
            //有变动
            let arr = this._selectHeroIds.filter((value) => GIns.petDungeonModel.isPrepareHero(value) == false);
            if (arr.length > 0) {
                GIns.petDungeonModel.sendSetUpPrepareHero({ heroBaseIds: arr });
            }
        }
        this.closeSelf();
    }

    protected sortAllHeroVos(): void {
        this._allHeroVos.sort((a, b) => {
            let hasA = this._selectHeroMap.has(a.baseId);
            let hasB = this._selectHeroMap.has(b.baseId);
            if (hasA != hasB) {
                return hasA ? -1 : 1;
            }
            if (a.Level != b.Level) {
                return b.Level - a.Level;
            }
            if (a.star != b.star) {
                return b.star - a.star;
            }
            return b.heroCfg.id - a.heroCfg.id;
        })
    }

    protected onClickAllCareer(): void {
        this._curCareerType = 0;
        this.view.careerComp.listCareer.clearSelection();
        this.view.careerComp.btnAll.selected = true;
        this._showSelectHeros = this._allHeroVos;
        this.updateSelectUI();
    }

    protected onClickCareer(item: ui.petDungeon.component.PetDungeonCareerSelectBtn): void {
        let childIndex = this.view.careerComp.listCareer.getChildIndex(item)
        let itemIndex = this.view.careerComp.listCareer.childIndexToItemIndex(childIndex)
        let clickCareer = itemIndex + 1;
        if (this._curCareerType != clickCareer) {
            //不同就选择对应职业
            this.view.careerComp.listCareer.selectedIndex = itemIndex;
            this.view.careerComp.btnAll.selected = false;
            this._curCareerType = clickCareer;
            this._showSelectHeros = [];
            this._allHeroVos.forEach((heroVo: HeroVo) => {
                if (ServerEnums.Career[heroVo.heroCfg.career] == this._curCareerType) {
                    this._showSelectHeros.push(heroVo);
                }
            })
            this.updateSelectUI();
        } else {
            this.onClickAllCareer();
        }
    }

    protected handleChangeHeroSelect(heroId: number): void {
        if (this._selectHeroMap.has(heroId)) {
            this._selectHeroMap.delete(heroId);
            let index = this._selectHeroIds.indexOf(heroId);
            if (index != -1) {
                this._selectHeroIds.splice(index, 1);
            }
        } else {
            if (this._selectHeroIds.length >= GIns.petDungeonModel.curUnlockUpPositionCount) {
                GIns.floatingTextMgr.showTips('备战英雄已满');
                return;
            }
            this._selectHeroMap.set(heroId, true);
            this._selectHeroIds.push(heroId);
        }
        this.updateUI();
    }

    protected updateSelectUI(): void {
        this.view.listSelect.numItems = this._showSelectHeros.length;
    }

    protected updateUI(): void {
        this.updateSelectUI();
        this.view.listUp.numItems = GIns.petDungeonModel.maxUpPositionCount;
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this._selectHeroMap.clear();
        this._selectHeroIds.length = 0;
        GIns.petDungeonModel.prepareHeroMap?.forEach((value) => {
            this._selectHeroMap.set(value.heroId, true);
            this._selectHeroIds.push(value.heroId);
        });

        this._allHeroVos = GIns.heroMgr.getAllHeroVo().filter((value) => value.heroVoData.isActivate);
        this.sortAllHeroVos();
        if (!this._showSelectHeros) {
            this._showSelectHeros = this._allHeroVos;
            this._curCareerType = 0;
            this.view.careerComp.btnAll.selected = true;
        }

        this.updateUI();
    }

    protected onClose(dontDispose?: boolean): void {

    }
}
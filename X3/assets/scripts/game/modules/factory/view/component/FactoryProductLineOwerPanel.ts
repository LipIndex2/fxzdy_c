import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { FguiScriptUtils } from "../../../../../core/utils/FguiScriptUtils";
import { PlayerAvatar } from "../../../common/playerInfo/PlayerAvatar";
import { FormationSkillInfo } from "../../../formation/components/FormationSkillInfo";
import { HeroVo, HeroVoDate } from "../../../hero/HeroVo";
import { FactoryHeroItem } from "../item/FactoryHeroItem";

/**
 * 星际工厂生产线拥有者信息
 */
@bindFguiExtension('ui://factory/FactoryProductLineOwerPanel')
export class FactoryProductLineOwerPanel extends fgui.GComponent {

    static pkgName: string = "factory";
    static viewName: string = "FactoryProductLineOwerPanel";

    protected _heroVos: HeroVo[] = []
    protected _levels: number[] = []
    private get view(): ui.factory.component.FactoryProductLineOwerPanel {
        return this as any;
    }

    /***组件初始化 */
    protected onInit(): void {
        this.setShowState(0)
        this.view.listHero.itemRenderer = this.itemRendererForHero.bind(this)
    }

    protected onPreDispose(): void {

    }

    protected itemRendererForHero(index: number, item: FactoryHeroItem): void {
        item.setData(this._heroVos[index], this._levels[index])
    }

    /**更新玩家信息*/
    public updatePlayerInfo(data: Vo.player.PlayerBaseVo): void {
        FguiScriptUtils.toMyScriptClass(this.view.avatar, PlayerAvatar).resetByPlayerInfo(data)
        this.view.lbName.text = data.name
        this.view.lbFight.text = '战力：' + data.fight
    }

    /**更新英雄列表*/
    public updateHeros(datas: Vo.formation.PositionVisitVo[]): void {
        this._heroVos.length = 0
        this._levels.length = 0
        datas?.forEach((data, index) => {

            if (data.heroBaseId) {
                let heroVo = new HeroVo()
                let heroVoData: HeroVoDate = {
                    id: index,
                    baseId: data.heroBaseId,
                    fragment: 0,
                    star: data.star,
                    isActivate: true,
                    useSkinId: data.useSkinId,
                    heroSkinIds: [],
                    isCanUse: true
                }
                heroVo.setHeroVoData(heroVoData)
                this._heroVos.push(heroVo)
                this._levels.push(data.heroLevel)
            }
        })
        this.view.listHero.numItems = this._heroVos.length
    }

    /**更新收藏品*/
    public updateCollections(vo: Vo.formation.CollectiblesVisitVo): void {
        FguiScriptUtils.toMyScriptClass(this.view.pCollections, FormationSkillInfo).updateByVisitVo(vo)
    }

    /**更新宠物*/
    public updatePet(vo: Vo.formation.PetVisitVo): void {
        FguiScriptUtils.toMyScriptClass(this.view.pPet, FormationSkillInfo).updateByVisitVo(vo)
    }

    /**状态 0未初始化 1占领中 2未占领*/
    public setShowState(state: number): void {
        this.view.getController('state').selectedIndex = state
    }

    /**展示场景 0工厂详情界面 1战报界面*/
    public setStyle(style: number): void {
        this.view.getController('style').selectedIndex = style
    }
}
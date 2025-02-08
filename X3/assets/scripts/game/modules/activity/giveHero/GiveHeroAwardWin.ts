import * as fgui from "fairygui-cc";
import UIScriptManager from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { UIActivityKey } from "../const/UIActivityConfig";
import { ActivitySignInVo } from "../model/ActivitySignInVo";
import { AwardItem } from "./item/AwardItem";
import { js } from "cc";
import { UiTweenMgr } from "../../../../core/comm/UiTweenMgr";

/**
 * 签到送英雄
 * 奖励预览界面
 */
export class GiveHeroAwardWin extends UICommWin{
    static pkgName: string = "activityGiveHero";
    static viewName: string = "GiveHeroAwardWin";

    /** 签到vo */
    private _data: ActivitySignInVo;
    
    private get view(): ui.activityGiveHero.GiveHeroAwardWin {
        return this._view as any;
    }

    protected onInit(): void {
        //UiTweenMgr.ins().listItemRendererEffect(self.list_upHero.node.uuid, this.heroFormationRenderer, this, { delay: 300 })
        this.view.list_hero.itemRenderer = UiTweenMgr.ins().listItemRendererEffect(this.view.list_hero.node.uuid, this.itemRendererForHero, this)
        // this.view.list_hero.itemRenderer = this.itemRendererForHero.bind(this);
    }

    protected onClose(): void {
        UiTweenMgr.ins().removeListItemRendererEffect(this.view.list_hero.node.uuid)
    }

    protected onOpen(vo: ActivitySignInVo, isReopen?: boolean): void {
        if(!vo) return;
        this._data = vo;

        this.updateView();
    }

    private updateView(): void {
        let keys = Object.keys(this._data.totalHeroIds);
        this.view.list_hero.numItems = keys.length;
    }

    private itemRendererForHero(index: number, item: AwardItem): void {
        let keys = Object.keys(this._data.totalHeroIds);
        // map排序
        keys.sort((a, b) => {
            return Number(b) - Number(a);
        });

        let heroIds = this._data.totalHeroIds[keys[index]];
        item.updateItem(keys[index] ,heroIds, this._data);

        let height = Math.ceil(heroIds.length/4) * 180 + 58;
        item.height = height;
    }


}
UIScriptManager.bindScript(UIActivityKey.GiveHeroAwardWin, GiveHeroAwardWin);
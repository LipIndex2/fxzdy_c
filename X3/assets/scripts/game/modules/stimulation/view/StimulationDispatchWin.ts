import * as fgui from "fairygui-cc";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { HeroVo } from "../../hero/HeroVo";
import { UIStimulationConfig } from "../const/UIStimulationConfig";
import { IStimulationData } from "../model/vo/IStimulationData";
import { StimulationHeroItem } from "./item/StimulationHeroItem";
import { StimulationPosItem } from "./item/StimulationPosItem";
import { RuleController } from "../../rule/RuleController";
import { EnumRuleKeys } from "../../rule/enums/EnumRuleKeys";

/**
 * 派遣界面
 */
@bindScript(UIStimulationConfig.StimulationDispatchWin)
export class StimulationDispatchWin extends UICommWin {

    static pkgName: string = "stimulation";
    static viewName: string = "StimulationDispatchWin";

    protected _data: IStimulationData = null;
     /**上一次上阵英雄id列表*/
     protected _lastHeroIds: number[] = [];
    /**当前上阵英雄id列表*/
    protected _posHeroIds: number[] = [];
    /**英雄列表*/
    protected _allHeros: HeroVo[] = [];

    private get view(): ui.stimulation.view.StimulationDispatchWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.STIMULATION_DISPATCH_COMPLETE,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.STIMULATION_DISPATCH_COMPLETE:
                this.closeSelf();
                break;
        }
    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.listPos.setVirtual();
        this.view.listHero.setVirtual();
        this.view.listPos.itemRenderer = this.itemRendererForPos.bind(this);
        this.view.listHero.itemRenderer = this.itemRendererForHero.bind(this);
        this.view.listPos.on(fgui.Event.CLICK_ITEM, this.onClickPos, this);
        this.view.listHero.on(fgui.Event.CLICK_ITEM, this.onClickHero, this);
        this.view.btnRule.onClick(this.onClickRule, this);
    }

    protected onPreDispose(): void {
        
    }

    protected onClickRule(): void {
        RuleController.ins().openRule(EnumRuleKeys.STIMULATION_DISPATCH, this.view.btnRule);
    }

    protected itemRendererForPos(index: number, item: StimulationPosItem): void {
        item.setData(this._data, index, this._posHeroIds[index]);
    }

    protected itemRendererForHero(index: number, item: StimulationHeroItem): void {
        item.setHeroId(this._allHeros[index].baseId, this._data.cfg.cfg.itemId, this._posHeroIds.indexOf(this._allHeros[index].baseId) != -1);
    }

    protected onClickPos(item:StimulationPosItem):void {
        let index = item.posData.id;
        if (item.posData.isUnlock == false) {
            let tipStr: string = GIns.stimulationMgr.getUnlockTipForLv(item.deviceData.cfg.cfg.id, item.posData.needLv);
            GIns.floatingTextMgr.showTips(tipStr);
            return
        }
        if (this._posHeroIds[index] == 0) {
            return;
        }
        //取消上阵
        this._posHeroIds[index] = 0;
        this._posHeroIds.splice(index, 1);
        this._posHeroIds.push(0);
        this.view.listPos.refreshVirtualList();
        this.view.listHero.refreshVirtualList();
    }

    protected onClickHero(item: StimulationHeroItem): void {
        let index: number = this._posHeroIds.indexOf(item.heroId);
        if (index != -1) {
            //取消上阵
            this._posHeroIds[index] = 0;
            this._posHeroIds.splice(index, 1);
            this._posHeroIds.push(0);
            this.view.listPos.refreshVirtualList();
            this.view.listHero.refreshVirtualList();
        } else {
            let emptyIdx: number = this._posHeroIds.indexOf(0);
            if (emptyIdx != -1 && this._data.posMap.get(emptyIdx).isUnlock) {
                //有空位置 并且解锁了
                this._posHeroIds[emptyIdx] = item.heroId;
                this.view.listPos.refreshVirtualList();
                this.view.listHero.refreshVirtualList();
            } else {
                GIns.floatingTextMgr.showTips('上阵角色已满');
            }

        }
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        let deviceId = args;
        this._data = GIns.stimulationModel.getDeviceData(deviceId);
        if (this._data == null || this._data.vo == null) {
            //数据不存在或者未激活
            this.closeSelf();
            return
        }
        let maxPosCnt = GIns.stimulationModel.getMaxPosCnt(deviceId);
        this._posHeroIds = new Array(maxPosCnt).fill(0);
        for (let key in this._data.vo.dispatchIndex2HeroBaseId) {
            this._posHeroIds[Number(key)] = this._data.vo.dispatchIndex2HeroBaseId[key];
        }
        this._lastHeroIds = this._posHeroIds.concat();
        this.view.listPos.numItems = maxPosCnt;
        this._allHeros = GIns.stimulationMgr.getHeroListForDispatch(deviceId);
        this.view.listHero.numItems = this._allHeros.length;
    }

    protected onClose(dontDispose?: boolean): void {
        if (this._posHeroIds.toString() == this._lastHeroIds.toString()) {
            //阵容没有变化
            return
        }
        let deviceId:number = this._data.cfg.cfg.id;
        let dispatchIndex2HeroBaseId = {};
        this._posHeroIds.forEach((heroId, index) => {
            if (heroId > 0) {
                dispatchIndex2HeroBaseId[index] = heroId;
            }
        })
        GIns.stimulationModel.sendDispatch({deviceId:deviceId, dispatchIndex2HeroBaseId:dispatchIndex2HeroBaseId});
    }
}
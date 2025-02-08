import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { FguiScriptUtils } from "../../../../../core/utils/FguiScriptUtils";
import { IStimulationData, IStimulationPosData } from "../../model/vo/IStimulationData";
import { StimulationHeroItem } from "./StimulationHeroItem";

@bindFguiExtension('ui://stimulation/StimulationPosItem')
export class StimulationPosItem extends fgui.GComponent {

    static pkgName: string = "stimulation";
    static viewName: string = "StimulationPosItem";

    protected _data: IStimulationData = null;
    protected _posData: IStimulationPosData = null;
    protected _isCanClick: boolean = false;

    private get view(): ui.stimulation.item.StimulationPosItem {
        return this as any;
    }

    protected onInit(): void {

    }

    protected onPreDispose(): void {

    }

    public get deviceData(): IStimulationData {
        return this._data;
    }

    public get posData(): IStimulationPosData {
        return this._posData;
    }

    public setData(data: IStimulationData, posId: number, heroId: number = -1) {
        this._data = data;
        this._posData = data.posMap.get(posId);
        if (this._posData.isUnlock == false) {
            //未解锁
            this.view.getController('state').selectedIndex = 1;
            this.view.lbNeedLv.text = `设备${this._posData.needLv}级`;
            return
        }
        if (heroId == -1 && data.vo.dispatchIndex2HeroBaseId.hasOwnProperty(posId)) {
            //没有传heroId就使用当前已有的数据
            heroId = data.vo.dispatchIndex2HeroBaseId[posId]
        }
        if (heroId > 0) {
            //有派遣英雄
            this.view.getController('state').selectedIndex = 2;
            let heroItem: StimulationHeroItem = FguiScriptUtils.toMyScriptClass(this.view.heroItem, StimulationHeroItem);
            heroItem.setHeroId(heroId, data.cfg.cfg.itemId)
        } else {
            this.view.getController('state').selectedIndex = 0;
        }
    }
}
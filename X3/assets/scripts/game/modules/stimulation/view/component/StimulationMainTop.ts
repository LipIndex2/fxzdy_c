import * as fgui from "fairygui-cc";
import G from "../../../../../core/comm/G";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { INotification } from "../../../../../core/mvc/interface/INotification";
import NotificationKey from "../../../../event/NotificationKey";
import GIns from "../../../../GIns";
import { IStimulationData } from "../../model/vo/IStimulationData";

@bindFguiExtension('ui://stimulation/StimulationMainTop')
export class StimulationMainTop extends fgui.GComponent implements INotification {

    static pkgName: string = "stimulation";
    static viewName: string = "StimulationMainTop";

    protected _data: IStimulationData = null;

    private get view(): ui.stimulation.component.StimulationMainTop {
        return this as any;
    }

    listenNotifications(): string[] | null {
        return [
            NotificationKey.STIMULATION_DEVICE_UPDATE,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.STIMULATION_DEVICE_UPDATE:
                if (args == this._data?.vo?.id) {
                    this.updateUI();
                }
                break;
        }
    }

    protected onInit(): void {
        G.FacadeManager.registerNotification(this);
    }

    protected onPreDispose(): void {
        G.FacadeManager.removeNotification(this);
    }

    protected updateUI(): void {
        let addition = GIns.stimulationMgr.getAdditionMap(this._data, this._data.vo.level);
        this.view.lbTitle.text = this._data.cfg.buildingCfg.name;
        this.view.lbAllCapacity.text = this._data.vo.capacity + '';
        this.view.lbAddSpeed.text = `效率：${GIns.stimulationMgr.getSpeedShowStr(this._data, addition.itemAmountPerHour)}`;
    }

    public setData(data: IStimulationData): void {
        if (this._data != data) {
            this._data = data;
            let itemCfg = G.TableManager.getDataById(table.item.ItemConfig, data.cfg.cfg.itemId);
            this.view.iconLoader.icon = itemCfg ? itemCfg.smallIconPath : '';
            this.updateUI();
        }
    }
}
import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { IGuardShipBattleBuffQuality } from "../../model/vo/GuardShipBattleBuffVo";

@bindFguiExtension('ui://guardShip/GuardShipBuffItem')
export class GuardShipBuffItem extends fgui.GComponent {

    static pkgName: string = "guardShip";
    static viewName: string = "GuardShipBuffItem";

    /**当前品质*/
    protected _quality: number = 0

    private get view(): ui.guardShip.item.GuardShipBuffItem {
        return this as any;
    }

    protected onInit(): void {

    }

    public updateQuality(quality: number): void {
        let qualityCtrl = this.view.getController('quality')
        if (quality <= 0 || quality >= qualityCtrl?.pageCount) {
            quality = 0
        }
        if (this._quality != quality) {
            this._quality = quality
            this.view.getController('quality').selectedIndex = quality
        }
    }
    public setData(data: IGuardShipBattleBuffQuality): void {
        this.updateQuality(data.quality)
        this.view.lbCount.text = data.cnt + ''
    }
}
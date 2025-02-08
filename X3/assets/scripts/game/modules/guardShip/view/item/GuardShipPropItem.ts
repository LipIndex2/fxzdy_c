import * as fgui from "fairygui-cc";
import G from "../../../../../core/comm/G";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { GuardShipController } from "../../GuardShipController";

@bindFguiExtension('ui://guardShip/GuardShipPropItem')
export class GuardShipPropItem extends fgui.GButton {

    static pkgName: string = "guardShip";
    static viewName: string = "GuardShipPropItem";

    protected _itemId: number = 0

    private get view(): ui.guardShip.item.GuardShipPropItem {
        return this as any;
    }

    protected onInit(): void {
        this.view.onClick(this.onClickItem, this)
    }

    protected onClickItem(): void {
        GuardShipController.ins().useDropItem(this._itemId)
    }

    public setData(id: number): void {
        if (this._itemId != id) {
            this._itemId = id
            let cfg = G.TableManager.getDataById(table.battle.ClientDropConfig, id)
            if (cfg) {
                this.view.iconLoader.icon = cfg.iconPath
            }
        }

    }
}
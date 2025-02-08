import * as fgui from "fairygui-cc";
import { ItemFrameBtn } from "../../../common/item/ItemFrameBtn";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { ICondition } from "../../../condition/ICondition";
import GIns from "../../../../GIns";

@bindFguiExtension('ui://guardShip/GuardShipLockItem')
export class GuardShipLockItem extends fgui.GComponent {

    static pkgName: string = "guardShip";
    static viewName: string = "GuardShipConditionItem";

    protected _rewards: { k: any, v: any }[] = []

    private get view(): ui.guardShip.item.GuardShipLockItem {
        return this as any;
    }

    public setData(condition: ICondition): void {
        let isUnlock = condition.check()
        this.view.getController('c1').selectedIndex = isUnlock ? 0 : 1
        this.view.lbDes.text = GIns.conditionMgr.getUnlockTipByCondition(condition)
    }
}
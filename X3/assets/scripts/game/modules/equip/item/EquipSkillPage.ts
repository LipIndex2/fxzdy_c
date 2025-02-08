import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import GIns from "../../../GIns";

/**
 * 装备
 * 套装详情页Item
 */
@bindFguiExtension("ui://equip/EquipSkillPage")
export class EquipSkillPage extends fgui.GComponent {
    static pkgName: string = "equip";
    static viewName: string = "EquipSkillPage";

    private get view(): ui.equip.page.EquipSkillPage {
        return this as any;
    }

    private _suitId: number;
    private _suitCfgs: table.equip.EquipSuitConfig[];
    private _suitCount = 0;

    onInit() {
        this.view.list_attr.itemRenderer = this.attrItemRenderer.bind(this);
        // SuitCfgsBySuitId
    }

    public setData(suitId: number) {
        this._suitId = suitId;
        this._suitCfgs = GIns.equipMgr.SuitCfgsBySuitId(suitId);
        this._suitCount = GIns.equipMgr.suitIds[suitId] || 0;
        this.view.list_attr.numItems = this._suitCfgs.length;

        let name = "";
        let allCount = 0;
        for (let cfg of this._suitCfgs) {
            if (cfg.suitId == suitId) {
                name = cfg.suitName;
                allCount = cfg.activeCount;
            }
        }

        this.view.T_suitName.text = `${name}(${this._suitCount}/${allCount})`;
    }

    private attrItemRenderer(index: number, item: ui.equip.item.EquipSuitAttrTextItem) {
        let cfg = this._suitCfgs[index];
        item.T_text.text = `(${cfg.activeCount})：${cfg.suitDesc}`;
        item.height = item.T_text.height;

        if (this._suitCount >= cfg.activeCount) {
            item.getController("c1").selectedIndex = 1;
        } else {
            item.getController("c1").selectedIndex = 0;
        }
    }
}

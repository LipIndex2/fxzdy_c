import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import { TableManager } from "../../../../core/table/TableManager";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import GIns from "../../../GIns";
import { EquipItem } from "../../common/item/EquipItem";
import { EnumRedDotShowType } from "../../common/redDot/enums/EnumRedDotShowType";
import { RedDotUtils } from "../../common/redDot/utils/RedDotUtils";
import { UIEquipKey } from "../const/UIEquipConfig";
import { equipData } from "../EquipManager";

/** 装备穿戴Item */
@bindFguiExtension('ui://equip/EquipWearItem')
export class EquipWearItem extends fgui.GComponent {
    static pkgName: string = "equip";
    static viewName: string = "EquipWearItem";

    private _posVoData: equipData;

    private get view(): ui.equip.item.EquipWearItem {
        return this as any;
    }

    onInit() {
        this.view.onClick(this.onClickItem, this)
    }

    protected onClickItem(): void {
        if (!this._posVoData.isUnlock) {
            let cfg = TableManager.getDataById(table.equip.EquipPositionConfig, this._posVoData.id);
            if (cfg) {
                let lockTipStr = GIns.conditionMgr.getOpenConditionTips(cfg.unlockConditions)
                GIns.floatingTextMgr.showTips(lockTipStr);
            }
            return;
        }

        if (GIns.equipMgr.getEquipVosByPosId(this._posVoData.id).length > 0) {
            G.UIManager.open(UIEquipKey.EQUIP_DETAIL_PAGE, this._posVoData);
        } else {
            GIns.floatingTextMgr.showTips("暂无可穿戴装备！");
        }
        return;
    }

    setData(data: equipData, index: number) {
        this._posVoData = data;
        this.updateUI();

        const redDotCom = RedDotUtils.castComp(this.view.redDot);
        redDotCom.showByType(EnumRedDotShowType.NULL);
        if (GIns.equipMgr.posRedPoint(index + 1)) {
            redDotCom.showByType(EnumRedDotShowType.LV_UP_GREEN);
        }
    }

    private updateUI() {
        let state = 0
        if (!this._posVoData.isUnlock) {
            //未解锁
            state = 1
        } else if (this._posVoData.equipId) {
            //有装备
            state = 2
        }
        this.view.getController('state').selectedIndex = state
        if (state == 2) {
            //更新装备
            FguiScriptUtils.toMyScriptClass(this.view.item, EquipItem).setData(this._posVoData)
        }
    }
}

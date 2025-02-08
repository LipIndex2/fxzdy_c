import * as fgui from "fairygui-cc";
import { EquipAttrData, EquipVo } from "../vo/EquipVo";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { AttrManager } from "../../attr/AttrManager";
import { TableManager } from "../../../../core/table/TableManager";

/** 装备属性页Item */
export class EquipAttrItem extends fgui.GComponent {
    static pkgName: string = "equip";
    static viewName: string = "EquipAttrItem";

    private get view(): ui.equip.item.EquipAttrItem {
        return this as any;
    }

    constructor() {
        super();
    }

    protected onConstruct(): void {}

    onInit() {}

    setData(data: EquipAttrData, type: number) {
        let self = this.view;
        self.getController("c1").selectedIndex = type;

        self.T_attr1.text = self.T_attr0.text = AttrManager.ins().getAttrNameByType(data.type);

        let cfg = TableManager.getDataById(table.battle.AttributeConfig, data.type);
        if (cfg.isPermyriad) {
            self.T_num2.text = self.T_num0.text = data.num / 100 + "%";
        } else {
            self.T_num2.text = self.T_num0.text = data.num + "";
        }

        if (data.quality) {
            self.T_attr1.color = self.T_attr0.color = ItemUtils.getTextColorByQualityCfg(data.quality);
            self.T_num2.color = self.T_num0.color = ItemUtils.getTextColorByQualityCfg(data.quality);
        }
    }
}

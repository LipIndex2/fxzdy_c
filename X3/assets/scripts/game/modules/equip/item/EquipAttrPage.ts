import * as fgui from "fairygui-cc";
import { EquipVo } from "../vo/EquipVo";
import { EquipAttrItem } from "./EquipAttrItem";
import { TableManager } from "../../../../core/table/TableManager";
import { EquipManager } from "../EquipManager";
import { Input } from "cc";
import { TouchUtils } from "../../../../core/utils/TouchUtils";

/** 装备属性页Item */
export class EquipAttrPage extends fgui.GComponent {
    static pkgName: string = "equip";
    static viewName: string = "EquipAttrPage";

    private _equipVo: EquipVo;
    private _attrMap;

    private get view(): ui.equip.item.EquipAttrPage {
        return this as any;
    }

    constructor() {
        super();
    }

    protected onConstruct(): void {
        this.onInit();
    }

    onInit() {
        this.view.list.itemRenderer = this.attrItem.bind(this);
        this.view.btn_Tips.on(fgui.Event.CLICK, this.onTipsClick, this);
    }

    setData(equipVo: EquipVo) {
        this._equipVo = equipVo;
        this.updateUI();
    }

    private updateUI() {
        let self = this.view;

        //一级属性
        let data = {
            type: this._equipVo.getBaseAttrs.type,
            num: this._equipVo.getBaseAttrs.num,
        };
        //@ts-ignore
        self.item.setData(data, 0);

        //二级属性
        // if (this._equipVo.equipCfg.fixedSecondAttrs) {
        //     this._attrMap = EquipManager.ins().getEquipFixedAttrs(this._equipVo.equipCfg.id);
        // } else {
        this._attrMap = this._equipVo.initSecondAttrMap;
        // }
        self.list.numItems = this._attrMap.length;

        //套装
        self.gp_skill.visible = this._equipVo.equipSuitId ? true : false;
        self.T_skill.text = this._equipVo.getSuitStr();

        if (this._equipVo.equipSuitId) {
            //@ts-ignore
            self.skillPage.setData(this._equipVo.equipSuitId);
        }
    }

    private attrItem(index: number, item: EquipAttrItem) {
        item.getController("c1").selectedIndex = index >= 1 ? 1 : 0;
        let data = this._attrMap[index];
        item.setData(data, 1);
        item.height = 36;
    }

    private onTipsClick() {
        this.view.skillPage.visible = !this.view.skillPage.visible;
    }
}

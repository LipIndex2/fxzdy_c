import * as fgui from "fairygui-cc";
import { EquipAttrData, EquipVo } from "../equip/vo/EquipVo";
import { EquipAttrItem } from "../equip/item/EquipAttrItem";
import { TableManager } from "../../../core/table/TableManager";
import { FguiScriptUtils } from "../../../core/utils/FguiScriptUtils";
import { StringUtils } from "../../../core/utils/StringUtils";
import { EquipManager } from "../equip/EquipManager";
import { Attribute } from "../attr/AttrEnum";

/** 装备属性页Item */
export class EquipTipsAttrComp extends fgui.GComponent {
    static pkgName: string = "equip";
    static viewName: string = "EquipAttrPage";

    private _equipVo: EquipVo;
    private secondAttrs: EquipAttrData[] = [];

    private get view(): ui.itemDetails.item.EquipAttrPage {
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

    setEquipSuitId(id: number) {
        if (id) {
            //@ts-ignore
            this.view.skillPage.setData(id);
        }
    }

    private updateUI() {
        let self = this.view;
        self.notItem.visible = false;

        //一级属性
        let data: EquipAttrData = {
            type: this._equipVo.getBaseAttrs.type as Attribute,
            num: this._equipVo.getBaseAttrs.num,
        };
        FguiScriptUtils.toMyScriptClass(this.view.item, EquipAttrItem).setData(data, 0);

        //二级属性
        // if (this._equipVo.equipCfg.fixedSecondAttrs) {
        //     //固定属性
        //     this.secondAttrs = EquipManager.ins().getEquipFixedAttrs(this._equipVo.equipCfg.id);
        // } else {
        this.secondAttrs = this._equipVo.initSecondAttrMap;
        // }
        self.list.numItems = this.secondAttrs.length;

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
        let data = this.secondAttrs[index];
        item.setData(data, 1);
        item.height = 36;
    }

    /***显示不在背包时的展示属性 */
    public showNotEquipVoList(equipCfg: table.equip.EquipConfig): void {
        let str = equipCfg.baseAttrs.split(";")[0].split(":");
        let attrs = { type: str[0], num: Number(str[1]) };
        //一级属性
        let data: EquipAttrData = {
            type: attrs.type as Attribute,
            num: attrs.num,
        };

        FguiScriptUtils.toMyScriptClass(this.view.item, EquipAttrItem).setData(data, 0);
        this.view.list.numItems = 0;
        if (equipCfg.fixedSecondAttrs) {
            this.view.notItem.visible = false;
            //固定属性
            this.secondAttrs = EquipManager.ins().getEquipFixedAttrs(equipCfg.id);
            this.view.list.numItems = this.secondAttrs.length;
        }
        if (equipCfg.secondAttrCountWeights && equipCfg.secondAttrCountWeights[0].k - this.secondAttrs.length > 0) {
            this.view.notItem.visible = true;
            let min = 9999999;
            let max = 0;
            for (let i = 0; i < equipCfg.secondAttrCountWeights.length; i++) {
                min = Math.min(equipCfg.secondAttrCountWeights[i].k, min) - this.secondAttrs.length;
                max = Math.max(equipCfg.secondAttrCountWeights[i].k, max) - this.secondAttrs.length;
            }

            if (min == max) {
                this.view.desLab.setVar("count", min.toString()).flushVars();
            } else {
                this.view.desLab.setVar("count", `${min.toString()}~${max.toString()}`).flushVars();
            }
            this.view.notItem.y = 82 + (5 + 36) * this.secondAttrs.length;
        }
        //套装
        this.view.gp_skill.visible = equipCfg.suitId ? true : false;
        let suitCfgs = TableManager.getAllData(table.equip.EquipSuitConfig);
        let name = "";
        let max: number = 0;
        for (let cfg of suitCfgs) {
            if (cfg.suitId == equipCfg.suitId) {
                name = cfg.suitName;
                max = Math.max(max, cfg.activeCount);
            }
        }
        this.view.T_skill.text = name + "(" + 0 + "/" + max + ")";
    }

    private onTipsClick() {
        this.view.skillPage.visible = !this.view.skillPage.visible;
    }
}

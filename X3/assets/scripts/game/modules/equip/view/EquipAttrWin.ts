import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import GIns from "../../../GIns";
import { Attribute } from "../../attr/AttrEnum";
import { AttrConfigEffect } from "../../attr/structs/AttrConfigEffect";
import { UIEquipKey } from "../const/UIEquipConfig";
import { EquipAttrItem1 } from "../item/EquipAttrItem1";
import { EquipAttrItem2 } from "../item/EquipAttrItem2";

/** 装备主界面 */
@bindScript(UIEquipKey.EquipAttrWin)
export class EquipAttrWin extends UICommWin {
    static pkgName: string = "equip";
    static viewName: string = "EquipAttrWin";

    protected _mainAttrs: AttrConfigEffect[] = []
    protected _otherAttrs: AttrConfigEffect[][] = []

    private get view(): ui.equip.view.EquipAttrWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {

        }
    }

    protected onInit(): void {
        this.view.listAttrMain.setVirtual()
        this.view.listAttrOther.setVirtual()
        this.view.listAttrMain.itemRenderer = this.itemRendererForMain.bind(this)
        this.view.listAttrOther.itemRenderer = this.itemRendererForOther.bind(this)

    }

    protected itemRendererForMain(index: number, item: EquipAttrItem1): void {
        item.setData(this._mainAttrs[index])
    }

    protected itemRendererForOther(index: number, item: EquipAttrItem2): void {
        item.setData(this._otherAttrs[index])
    }

    private updateUI() {
        let allAttrMap: Map<Attribute, AttrConfigEffect> = new Map()
        let otherAttrCol: number = 2
        let otherAttrs = []
        this._mainAttrs.length = 0
        this._otherAttrs.length = 0
        let allAttrs = GIns.equipMgr.allEquipAttrs
        let curOtherAttrIdx: number = 0
        allAttrs?.forEach((value) => {
            //id修正
            let id = value.id
            if (id == Attribute.ATK_ADD) {
                id = Attribute.ATK
            } else if (id == Attribute.DEF_ADD) {
                id = Attribute.DEF
            } else if (id == Attribute.HP_ADD) {
                id = Attribute.HP
            }
            if (allAttrMap.has(id)) {
                //重复属性直接加上去
                allAttrMap.get(id).value += value.num
                return
            }
            let effect = AttrConfigEffect.create(id, value.num)
            if (id == Attribute.ATK || id == Attribute.DEF || id == Attribute.HP) {
                //面板属性
                this._mainAttrs.push(effect)
            } else {
                //二级属性
                otherAttrs.push(effect)
            }
            allAttrMap.set(effect.attrId, effect)
        })
        this._mainAttrs.sort((a, b) => {
            return a.config.tid - b.config.tid
        })
        otherAttrs.sort((a, b) => {
            return a.config.tid - b.config.tid
        })
        otherAttrs?.forEach((value, i) => {
            let arr = null
            if (i % otherAttrCol == 0) {
                arr = [value]
                this._otherAttrs.push(arr)
            } else {
                arr = this._otherAttrs[this._otherAttrs.length - 1]
                arr.push(value)
            }
        })
        this.view.listAttrMain.numItems = this._mainAttrs.length
        this.view.listAttrOther.numItems = this._otherAttrs.length
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        if (isReopen) {
            return
        }
        this.updateUI()
    }

    protected onClose(): void {

    }
}

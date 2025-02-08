import * as fgui from "fairygui-cc";
import { GListEffectType } from "../../../../core/prototypes/FguiGListEffect";
import { ChargeNormalItem } from "./ChargeNormalItem";


/** 普通充值一行item */
export class ChargeNormalRowItem extends fgui.GComponent {
    static pkgName: string = "charge";
    static viewName: string = "ChargeNormalRowItem";

    protected _rowDatas: table.order.ChargeGoodsConfig[] = null
    protected _parentIndex:number = 0

    private get view(): ui.charge.item.ChargeNormalRowItem {
        return this as any;
    }

    constructor() {
        super();
    }

    protected onInit() {
        this.view.list.setVirtual()
        this.view.list.itemRenderer = this.itemRendererForGood.bind(this)
    }

    protected itemRendererForGood(index: number, item: ChargeNormalItem): void {
        item.setData(this._rowDatas[index])
    }

    public setData(data: table.order.ChargeGoodsConfig[], parentIndex:number, parentList:fgui.GList): void {
        this._parentIndex = parentIndex
        if (parentList.isShowEffect) {
            this.view.list.resetRefreshTimes()
            this.view.list.effectType = GListEffectType.FADE_IN
            this.view.list.effectParams = {delay:this._parentIndex * 0.06, interval:0.06}
        } else {
            this.view.list.effectType = GListEffectType.None
        }
        this._rowDatas = data
        this.view.list.numItems = this._rowDatas.length
    }

}
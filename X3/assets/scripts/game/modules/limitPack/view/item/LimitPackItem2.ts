import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { FguiScriptUtils } from "../../../../../core/utils/FguiScriptUtils";
import { MallController } from "../../../mall/MallController";
import { MallData } from "../../../mall/model/MallModel";
import { LimitPackSmallItem2 } from "./LimitPackSmallItem2";


@bindFguiExtension('ui://limitPack/LimitPackItem2')
export class LimitPackItem2 extends fgui.GComponent {

    static pkgName: string = "limitPack";
    static viewName: string = "LimitPackItem2";

    protected _data: MallData = null
    protected _reward: { k: any, v: any }[] = []
    protected _isLock: boolean = false

    private get view(): ui.limitPack.item.LimitPackItem2 {
        return this as any;
    }

    protected onInit(): void {

    }

    protected onClickBuy(): void {
        if (this._isLock == false) {
            MallController.ins().buyMall(this._data.cfg)
        }
    }

    public setData(datas: MallData[], lastData: MallData, isReverse: boolean, isLast: boolean = false): void {
        if (isReverse == false) {
            //代表是左侧第一个数据 右侧第二个数据
            FguiScriptUtils.toMyScriptClass(this.view.item1, LimitPackSmallItem2).setData(datas[0], lastData, false)
            FguiScriptUtils.toMyScriptClass(this.view.item2, LimitPackSmallItem2).setData(datas[1], datas[0], true && isLast == false)
        } else {
            FguiScriptUtils.toMyScriptClass(this.view.item1, LimitPackSmallItem2).setData(datas[1], datas[0], true && isLast == false)
            FguiScriptUtils.toMyScriptClass(this.view.item2, LimitPackSmallItem2).setData(datas[0], lastData, false)
        }

        if (datas[1] != null) {
            this.view.arrow.visible = true
            this.view.arrow.flip = isReverse ? fgui.FlipType.None : fgui.FlipType.Vertical
        } else {
            this.view.arrow.visible = false
        }
    }
}
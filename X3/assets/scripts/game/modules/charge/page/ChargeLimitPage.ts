import G from "../../../../core/comm/G";
import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIView, ViewAdaptType } from "../../../../core/mvc/view/UIView";
import { GListEffectType } from "../../../../core/prototypes/FguiGListEffect";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import NotificationKey from "../../../event/NotificationKey";
import { EnumCurrencyItemId } from "../../backpack/vo/BackpackContext";
import { MallData, MallModel } from "../../mall/model/MallModel";
import { ChargeController } from "../ChargeController";
import { UIChargeConfig } from "../const/UIChargeConfig";
import { ChargeLimitPageItem } from "../item/ChargeLimitPageItem";


/** 限购页面 */
@bindScript(UIChargeConfig.CHARGE_LIMIT_PAGE)
export class ChargeLimitPage extends UIView {
    static pkgName: string = "charge";
    static viewName: string = "ChargeLimitPage";

    protected _layer: EnumUIViewLayer = EnumUIViewLayer.SUBVIEW;
    protected adaptType = ViewAdaptType.TOP;

    /**每行商品数量*/
    protected perRowCount: number = 3

    protected _mallDataMap: Map<number, MallData[]> = new Map()
    protected _showLimitBuyTypes:number[] = []

    protected _parentIndex:number = 0

    private get view(): ui.charge.page.ChargeLimitPage {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.MALL_DATA_CHANGE_BY_TYPE,
            NotificationKey.MALL_DATA_CHANGE_BY_ID
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.MALL_DATA_CHANGE_BY_TYPE:
                if (args == ServerEnums.MallGoodsType.LIMIT_BUY) {
                    this.resetUI()
                }
                break
            case NotificationKey.MALL_DATA_CHANGE_BY_ID:
                let mallData: MallData = args as MallData
                if (ServerEnums.MallGoodsType[mallData?.cfg?.type] == ServerEnums.MallGoodsType.LIMIT_BUY) {
                    this.updateUI()
                }
        }
    }

    protected onInit() {
        //@ts-ignore
        let headItem = this.view.headerItem as HeaderItem
        headItem.reset(EnumCurrencyItemId.DIAMOND, true)

        this.view.list.setVirtual()
        this.view.list.effectType = GListEffectType.Custom
        this.view.list.scrollItemToViewOnClick = false
        this.view.list.itemRenderer = this.itemRendererForGoods.bind(this)
    }

    protected itemRendererForGoods(index: number, item: ChargeLimitPageItem): void {
        let limitBuyType: number = this._showLimitBuyTypes[index]
        item.setData(this._mallDataMap.get(limitBuyType), limitBuyType, this._parentIndex, this.view.list)
        if (index > 0) {
            let lastBuyType: number = this._showLimitBuyTypes[index - 1]
            this._parentIndex += this._mallDataMap.get(lastBuyType)?.length
        }
    }

    public resetUI():void {
        let limitBuyTypes = ChargeController.ins().showLimitBuyTypes
        this._showLimitBuyTypes.length = 0
        let hasTypes:boolean[] = new Array(limitBuyTypes.length).fill(false)
        this._mallDataMap.clear()
        let allDatas = MallModel.ins().getMallListByType(ServerEnums.MallGoodsType.LIMIT_BUY)
        allDatas.forEach((value) => {
            let limitBuyType:number = 0
            if (value.cfg.limitBuyType) {
                limitBuyType = ServerEnums.MallGoodsLimitBuyType[value.cfg.limitBuyType]
            }
            let arr = this._mallDataMap.get(limitBuyType)
            if (arr == null) {
                arr = []
                this._mallDataMap.set(limitBuyType, arr)
                let index = limitBuyTypes.indexOf(limitBuyType)
                if (index != -1) {
                    hasTypes[index] = true
                }
            }
            arr.push(value)
        })
        //剔除没有商品的类型展示
        hasTypes.forEach((value, index) => {
            if (value) {
                this._showLimitBuyTypes.push(limitBuyTypes[index])
            }
        })
        this._mallDataMap?.forEach((arr) => {
            arr.sort((a, b) => {
                let isSellA = MallModel.ins().isSellOut(a)
                let isSellB = MallModel.ins().isSellOut(b)
                if (isSellA != isSellB) {
                    return isSellA ? 1 : -1
                } else {
                    return a.id - b.id
                }
            })
        })
        this.updateUI()
    }

    public updateUI(): void {
        this._parentIndex = 0
        this.view.list.numItems = this._showLimitBuyTypes.length
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this.view.list.resetRefreshTimes()
        this._parentIndex = 0
        if (this._showLimitBuyTypes.length <= 0) {
            this.resetUI()
        } else {
            this.view.list.scrollToView(0, false, true)
            this.updateUI()
        }
    }

    protected onClose(): void {

    }
}
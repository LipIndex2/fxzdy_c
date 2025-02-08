import * as fgui from "fairygui-cc";
import G from "../../../core/comm/G";
import { bindFguiExtension } from "../../../core/comm/UIScriptManager";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import GIns from "../../GIns";
import { NoOwnerItem } from "../backpack/vo/NoOwnerItem";
import { ChargeI18nKeys } from "../charge/const/ChargeI18nKeys";
import { ItemFrameBtn } from "../common/item/ItemFrameBtn";
import { DailySaleCfgData } from "../dailySale/model/DailySaleModel";
import { MallController } from "../mall/MallController";
import { MallData } from "../mall/model/MallModel";
import { GoodsVo } from "../shop/vo/goodsVo";

/**礼包数据*/
type ItemNotEnoughGiftData = MallData | DailySaleCfgData | table.order.ChargeGoodsConfig | GoodsVo

interface ItemNotEnoughPack {
    data: ItemNotEnoughGiftData
    cfg: table.item.ItemBuyPackConfig
}

/**礼包展示数据*/
interface ItemNotEnoughGiftShowData {
    name?: string
    price?: number
    discount?: number
    limitDes?: string
    costItems?: { k: any, v: any }[]
    rewards?: { k: any, v: any }[]
}
/**
 * 道具不足礼包
 */
@bindFguiExtension('ui://itemDetails/ItemNotEnoughGift')
export class ItemNotEnoughGift extends fgui.GComponent {
    static pkgName: string = "itemDetails";
    static viewName: string = "ItemNotEnoughGift";

    protected _itemId: number = 0;
    protected _curPackData: ItemNotEnoughPack = null;
    protected _curPackList: ItemNotEnoughPack[] = [];
    protected _showData: ItemNotEnoughGiftShowData = {};

    private get view(): ui.itemDetails.panel.ItemNotEnoughGift {
        return this as any;
    }

    public onInit(): void {
        this.view.listReward.setVirtual();
        this.view.listReward.itemRenderer = this.itemRendererForReward.bind(this);
        this.view.btnGoto.onClick(this.onClickGoto, this)
        this.view.btnBuy.onClick(this.onClickBuy, this)
    }

    protected itemRendererForReward(index: number, view: ItemFrameBtn) {
        view.reset(this._showData.rewards[index].k, this._showData.rewards[index].v)
    }

    protected onClickGoto(): void {
        GIns.jumpManager.jumpById(this._curPackData?.cfg?.jumpId)
    }

    protected onClickBuy(): void {
        let type = ServerEnums.SystemType[this._curPackData.cfg.systemType]
        switch (type) {
            case ServerEnums.SystemType.NORMAL_CHARGE:
                //基础充值
                let orderData = this._curPackData.data as table.order.ChargeGoodsConfig
                GIns.orderModel.sendCreateOrder(orderData.id)
                break;
            case ServerEnums.SystemType.MALL_LIMIT_BUY:
                //限购商城
                let mallData = this._curPackData.data as MallData
                MallController.ins().buyMall(mallData.cfg)
                break
            case ServerEnums.SystemType.DAILY_SALE:
                //每日特惠
                let daliySaleData = this._curPackData.data as DailySaleCfgData
                GIns.orderModel.sendCreateOrder(daliySaleData.orderCfg.id)
                break
            case ServerEnums.SystemType.SHOP:
                //商店
                let goodsVo = this._curPackData.data as GoodsVo
                GIns.shopModel.buyGoods(goodsVo.shopId, goodsVo.goodsId, 1);
                break

        }
    }

    /**获取单个礼包数据*/
    protected getGiftData(cfg: table.item.ItemBuyPackConfig, id: number): ItemNotEnoughPack {
        let packData: ItemNotEnoughPack = null;
        let type = ServerEnums.SystemType[cfg.systemType]
        switch (type) {
            case ServerEnums.SystemType.NORMAL_CHARGE:
                //基础充值
                let orderData = G.TableManager.getDataById(table.order.ChargeGoodsConfig, id);
                if (orderData) {
                    packData = { data: orderData, cfg: cfg }
                }
                break;
            case ServerEnums.SystemType.MALL_LIMIT_BUY:
                //限购商城
                let mallData = GIns.mallModel.getMallData(id)
                if (mallData) {
                    packData = { data: mallData, cfg: cfg }
                }
                break
            case ServerEnums.SystemType.DAILY_SALE:
                //每日特惠
                let daliySaleData = GIns.dailySaleModel.getCfgData(id)
                if (daliySaleData) {
                    packData = { data: daliySaleData, cfg: cfg }
                }
                break
            case ServerEnums.SystemType.SHOP:
                //商店
                let shopData = GIns.shopMgr.getGoodsById(id)
                if (shopData) {
                    packData = { data: shopData, cfg: cfg }
                }
                break
        }
        return packData
    }

    //是否已售罄
    protected isSellOut(data: ItemNotEnoughPack): boolean {
        let isSellOut: boolean = false
        let type = ServerEnums.SystemType[data.cfg.systemType]
        switch (type) {
            case ServerEnums.SystemType.NORMAL_CHARGE:
                //基础充值
                break;
            case ServerEnums.SystemType.MALL_LIMIT_BUY:
                //限购商城
                isSellOut = GIns.mallModel.isSellOut(data.data as MallData)
                break
            case ServerEnums.SystemType.DAILY_SALE:
                //每日特惠
                let daliySaleData = data.data as DailySaleCfgData;
                let daliySaleType = ServerEnums.DailySaleType[daliySaleData.cfg.type];
                if (daliySaleType == ServerEnums.DailySaleType.PACK_GOODS) {
                    isSellOut = GIns.dailySaleModel.hasBuyPackGift(daliySaleData.cfg.groupId) || GIns.dailySaleModel.hasBuyNormal(daliySaleData.cfg.groupId);
                } else {
                    isSellOut = GIns.dailySaleModel.hasBuyPackGift(daliySaleData.cfg.groupId) || GIns.dailySaleModel.hasBuyGift(daliySaleData.cfg.id);
                }
                break
            case ServerEnums.SystemType.SHOP:
                //商店
                let goodsVo = data.data as GoodsVo
                if (goodsVo._config.buyTimesLimit > 0 && goodsVo.buyTimes >= goodsVo._config.buyTimesLimit) {
                    isSellOut = true
                } else if (GIns.conditionMgr.checkCondition(goodsVo._config.displayVerify) == false) {
                    isSellOut = true
                }
                break

        }
        return isSellOut
    }

    /**充值展示数据*/
    protected resetShowData(): void {
        this._showData.name = ''
        this._showData.price = 0
        this._showData.discount = 0
        this._showData.limitDes = ''
        this._showData.costItems = null
        this._showData.rewards = null
    }

    /**更新需要展示的数据*/
    protected updateShowData(data: ItemNotEnoughPack): void {
        this.resetShowData();
        let type = ServerEnums.SystemType[data.cfg.systemType]
        switch (type) {
            case ServerEnums.SystemType.NORMAL_CHARGE:
                //基础充值
                let orderData = data.data as table.order.ChargeGoodsConfig
                this._showData.name = orderData.goodsName
                this._showData.price = orderData.price
                this._showData.rewards = orderData.rewards
                break;
            case ServerEnums.SystemType.MALL_LIMIT_BUY:
                //限购商城
                let mallData = data.data as MallData
                this._showData.name = mallData?.cfg?.name ? mallData.cfg.name : mallData?.orderCfg?.goodsName
                if (mallData.orderCfg) {
                    this._showData.price = mallData?.orderCfg.price
                } else if (mallData.costCfg) {
                    this._showData.costItems = mallData?.costCfg?.costItems
                }
                this._showData.discount = mallData.cfg.discountShow
                this._showData.limitDes = mallData.cfg.buyLimit > 0 ? `(${mallData.cfg.buyLimit - mallData.buyNum}/${mallData.cfg.buyLimit})` : ''
                this._showData.rewards = GIns.mallModel.getMallReward(mallData)
                break
            case ServerEnums.SystemType.DAILY_SALE:
                //每日特惠
                let daliySaleData = data.data as DailySaleCfgData
                this._showData.name = daliySaleData?.orderCfg?.goodsName
                if (daliySaleData.orderCfg) {
                    this._showData.price = daliySaleData?.orderCfg.price
                }
                if (daliySaleData.freeCfg) {
                    this._showData.rewards = daliySaleData.freeCfg.rewards
                } else {
                    this._showData.rewards = daliySaleData.orderCfg?.rewards
                }
                break
            case ServerEnums.SystemType.SHOP:
                //商店
                let goodsVo = data.data as GoodsVo
                this._showData.name = goodsVo?._config?.name
                this._showData.costItems = goodsVo._config.costItems
                this._showData.discount = goodsVo._config.discount && goodsVo._config.discount < 1 ? 100 / goodsVo._config.discount : 0
                this._showData.limitDes = goodsVo._config.buyTimesLimit > 0 ? `(${goodsVo._config.buyTimesLimit - goodsVo.buyTimes}/${goodsVo._config.buyTimesLimit})` : ''
                this._showData.rewards = goodsVo._config.rewards
                break
        }
    }

    /**设置道具id*/
    public setItemId(itemId: number, force:boolean = false): void {
        if (this._itemId != itemId || force) {
            this._itemId = itemId;
            //初始化礼包列表
            this._curPackList.length = 0;
            this._curPackData = null;
            let allCfgs = G.TableManager.getAllData(table.item.ItemBuyPackConfig);
            let needCfgs: table.item.ItemBuyPackConfig[] = allCfgs.filter((value) => {
                let systemType:number = ServerEnums.SystemType[value.systemType];
                if (value.systemType && GIns.moduleOpenMgr.isCanOpenModuleWithoutTips(systemType) == false) {
                    //功能未开启
                    return false
                }
                return value.itemId == itemId && GIns.conditionMgr.checkCondition(value.buyConditions)
            });
            needCfgs.sort((a, b) => {
                return a.sort - b.sort
            })
            needCfgs.forEach((cfg) => {
                cfg.packIds?.forEach((value) => {
                    let data = this.getGiftData(cfg, value)
                    if (data) {
                        this._curPackList.push(data)
                    }
                })
            })
        }
    }

    public updateUI(): boolean {
        if (this._curPackData == null || this.isSellOut(this._curPackData)) {
            this._curPackData = null
            for (let i = 0; i < this._curPackList.length; i++) {
                if (this.isSellOut(this._curPackList[i]) == false) {
                    this._curPackData = this._curPackList[i]
                    break
                }
            }
        }
        if (this._curPackData) {
            this.updateShowData(this._curPackData)
            this.view.lbName.text = this._showData.name
            this.view.lbLimit.text = this._showData.limitDes ? `限购 ${this._showData.limitDes}` : ''
            if (this._showData.discount) {
                this.view.pDiscount.visible = true
                this.view.lbDiscount.text = this._showData.discount + '%'
            } else {
                this.view.pDiscount.visible = false
            }
            if (this._showData.costItems?.length > 0) {
                //需要消耗道具
                this.view.btnBuy.getController('type').selectedIndex = 1;
                let item = NoOwnerItem.createByConfigKv(this._showData.costItems[0])
                this.view.btnBuy.iconCost.icon = item.getItemSmallIconPath();
                this.view.btnBuy.lbCost.text = item.count + ''
            } else {
                this.view.btnBuy.getController('type').selectedIndex = 0;
                if (this._showData.price) {
                    this.view.btnBuy.lbPrice.text = G.I18nManager.lang(ChargeI18nKeys.price, this._showData.price / 100)
                } else {
                    this.view.btnBuy.lbPrice.text = G.I18nManager.lang(ChargeI18nKeys.free)
                }
            }
            this.view.listReward.numItems = this._showData.rewards.length
            return true
        }
        return false
    }

}
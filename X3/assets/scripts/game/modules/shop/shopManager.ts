import BaseSingleton from "../../../core/base/BaseSingleton";
import G from "../../../core/comm/G";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import NotificationKey from "../../event/NotificationKey";
import { NoOwnerItem } from "../backpack/vo/NoOwnerItem";
import { ShopModel } from "./model/ShopModel";
import { GoodsVo } from "./vo/goodsVo";
import { ShopVo } from "./vo/ShopVo";

export class ShopManager extends BaseSingleton {

    public shopDatas: Map<number, ShopVo> = new Map<number, ShopVo>();
    public shopIds: number[] = [];  //商店id列表
    public curSpShopId:number = null;// 当前打开的特殊商店Id

    /**
     * 设置商店数据数组，并在设置完成后触发商店信息响应事件。
     * @param shopVos 商店数据对象数组
     */
    setShopDatas(shopVos: Vo.shop.ShopVo[]): void {
        for (let i = 0; i < shopVos.length; i++) {
            this.setShopData(shopVos[i]);
        }
        G.FacadeManager.emit(NotificationKey.EVENT_SHOP_INFO_RESP);
    }

    setShopData(shopVo: Vo.shop.ShopVo): void {
        let shopId = shopVo.shopId;
        let config = ShopModel.ins().getShopConfig(shopId);
        if (!config) return;

        let vo = this.shopDatas.get(shopId);
        if (!vo) {
            vo = new ShopVo();
            vo._config = config;
            vo._buyCosts = vo._config?.currency;
        }
        vo._data = shopVo;
        let cfgs = ShopModel.ins().getShopRefreshConfigs(shopId);
        vo._maxManualRefreshCount = cfgs.length;
        vo._refreshCfg = cfgs[vo._data.manualRefreshTimes];
        if (!vo._refreshCfg) {
            vo._refreshCfg = cfgs[cfgs.length - 1];
        }
        //初始化商品列表
        vo._goods = [];
        if (ServerEnums.ShopRefreshType[vo._config.refreshType] == ServerEnums.ShopRefreshType.NEVER_REFRESH) {
            //不刷新的商品类型 直接读取配置表
            let cfgs = G.TableManager.getAllData(table.shop.ShopGoodsConfig)
            cfgs.forEach((cfg) => {
                if (cfg.shopId == vo._config.id) {
                    let goodsVo = new GoodsVo();
                    goodsVo.goodsId = cfg.id;
                    goodsVo._config = cfg;
                    if (goodsVo._config) {
                        let buyTime: number = vo._data.goodsBuyTimesMap[cfg.id];
                        let adBuyTimes: number = vo._data.advertBuyTimesMap[cfg.id];
                        goodsVo.buyTimes = buyTime ? buyTime : 0;
                        goodsVo.adBuyTimes = adBuyTimes ? adBuyTimes : 0
                        goodsVo.shopId = shopId;
                        goodsVo.rewawrd = NoOwnerItem.create(goodsVo._config.rewards[0].k, goodsVo._config.rewards[0].v);
                        vo._goods.push(goodsVo);
                    }
                }
            })
        } else {
            for (let i = 0; i < shopVo.goodsList.length; i++) {
                let goodId = shopVo.goodsList[i];
                let goodsVo = new GoodsVo();
                goodsVo.goodsId = goodId;
                goodsVo._config = ShopModel.ins().getGoodsConfig(goodId);
                if (goodsVo._config) {
                    let buyTime: number = vo._data.goodsBuyTimesMap[goodId];
                    let adBuyTimes: number = vo._data.advertBuyTimesMap[goodId];
                    goodsVo.buyTimes = buyTime ? buyTime : 0;
                    goodsVo.adBuyTimes = adBuyTimes ? adBuyTimes : 0
                    goodsVo.shopId = shopId;
                    goodsVo.rewawrd = NoOwnerItem.create(goodsVo._config.rewards[0].k, goodsVo._config.rewards[0].v);

                    vo._goods.push(goodsVo);
                }
            }
        }

        this.shopDatas.set(shopId, vo);

        //按id排序
        vo._goods.sort((a, b) => {
            if (a._config.sort != b._config.sort) {
                return a._config.sort - b._config.sort
            } else {
                return a.goodsId - b.goodsId;
            }
        });
    }

    public getShopData(shopId: number): ShopVo {
        return this.shopDatas.get(shopId);
    }

    public getGoodsByShopAndId(shopId: number, goodsId: number): GoodsVo {
        let shop = this.shopDatas.get(shopId);
        if (shop) {
            for (let i = 0; i < shop._goods.length; i++) {
                let goodsVo = shop._goods[i];
                if (goodsVo.goodsId == goodsId) {
                    return goodsVo;
                }
            }
        }
        return null;
    }

    public getGoodsById(goodsId: number): GoodsVo {
        let cfg = G.TableManager.getDataById(table.shop.ShopGoodsConfig, goodsId)
        if (cfg) {
            return this.getGoodsByShopAndId(cfg.shopId, goodsId)
        }
        return null
    }
}
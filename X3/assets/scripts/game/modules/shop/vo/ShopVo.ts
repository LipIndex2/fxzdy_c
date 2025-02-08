import { ConditionManager } from "../../condition/ConditionManager";
import { GoodsVo } from "./goodsVo";

/**
 * 商店数据
 * @class ShopVo
 * @author feilu
 * 
 */
export class ShopVo {
        /**配置 */
        _config: table.shop.ShopConfig;
        /**服务端数据 */
        _data: Vo.shop.ShopVo;
        /**最大手动刷新次数 */
        _maxManualRefreshCount: number;
        /**当前手动刷新配置 */
        _refreshCfg: table.shop.ShopManualRefreshConfig;
        /**商品列表 */
        _goods: GoodsVo[];
        /**购买的货币id */
        _buyCosts: number[];

        /**获取展示商品列表*/
        public getShowGoods(): GoodsVo[] {
                let arr: GoodsVo[] = []
                this._goods.forEach((value) => {
                        if (ConditionManager.ins().checkCondition(value._config.displayVerify)) {
                                arr.push(value)
                        }
                })
                return arr
        }
}
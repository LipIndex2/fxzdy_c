/**
 * 商品数据和配置
 * @param _config 商品配置
 * @param buyTimes 购买次数
 * @class GoodsVo
 * 
 */

import { NoOwnerItem } from "../../backpack/vo/NoOwnerItem";

export class GoodsVo
{
    public goodsId:number;
    /**配置 */
    public _config:table.shop.ShopGoodsConfig;
    /**购买次数 */
    public buyTimes:number;
    /**广告购买次数 */
    public adBuyTimes:number;
    /**商品的形象 */
    public rewawrd:NoOwnerItem;

    /**所在的商店id */
    public shopId:number;
   
}
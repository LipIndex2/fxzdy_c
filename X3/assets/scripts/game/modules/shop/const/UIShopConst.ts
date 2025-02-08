import UIScriptManager from "../../../../core/comm/UIScriptManager";
import { DailyShopPage } from "../page/DailyShopPage";
import { ShopBuyView } from "../view/ShopBuyWin";
import { ShopMainView } from "../view/ShopMainView";
import { SpecialShopView } from "../view/SpecialShopView"

export enum UIShopKey {
    // 商店主页
    SHOP_MAIN_VIEW = "SHOP_MAIN_VIEW",
    // 商店购买弹窗
    SHOP_BUY_WIN = "SHOP_BUY_WIN",
    // 日常商店
    DAILY_SHOP = "DAILY_SHOP",
    // 单独入口的商店界面
    SPECIAL_SHOP = "SPECIAL_SHOP",
}


export enum I18ShopKey {
    i18n_shop_shopUpdate = "i18n:shop:shopUpdate",
    i18n_shop_goodsDiscount = "i18n:shop:goodsDiscount",
    i18n_shop_goodsBuyLock = "i18n:shop:goodsBuyLock",
    i18n_shop_errTips1 = "i18n:shop:errTips1",
    i18n_shop_errTips2 = "i18n:shop:errTips2",
    i18n_shop_errTips3 = "i18n:shop:errTips3",
    i18n_shop_errTips4 = "i18n:shop:errTips4",

}

/**商店类型*/
export enum ShopType {
    /**钻石商店 */
    DIAMOND = 101,
    /**竞技商店 */
    ARENA,
    /**虫王商店 */
    DAILY_BOSS,
    /**联盟商店 */
    LEAGUE,
    /**超武商店 */
    WEAPON,
    /**秘境商店 */
    SECRET_AREA,
    /**资源勘探 */
    LEAGUE_EXPLORE,
    /**星塔商店 */
    SPECIAL = 108,
    /**宠物副本 */
    PET_DUNGEON = 109,
    /**收藏品副本呢*/
    COLLECTIBLES_DUNGEON = 110,
}

UIScriptManager.bindScript(UIShopKey.SHOP_MAIN_VIEW, ShopMainView);
UIScriptManager.bindScript(UIShopKey.SHOP_BUY_WIN, ShopBuyView);
UIScriptManager.bindScript(UIShopKey.DAILY_SHOP, DailyShopPage);
UIScriptManager.bindScript(UIShopKey.SPECIAL_SHOP,SpecialShopView);
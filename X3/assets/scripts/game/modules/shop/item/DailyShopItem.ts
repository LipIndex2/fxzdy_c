import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { StringUtils } from "../../../../core/utils/StringUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import GIns from "../../../GIns";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { ConditionManager } from "../../condition/ConditionManager";
import { EnumConditionType } from "../../condition/enum/EnumConditionType";
import { HeroManager } from "../../hero/HeroManager";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { I18ShopKey, ShopType } from "../const/UIShopConst";
import { ShopModel } from "../model/ShopModel";
import { GoodsVo } from "../vo/goodsVo";

@bindFguiExtension("ui://shop/DailyShopItem")
export class DailyShopItem extends fgui.GButton {
    static pkgName: string = "shop";

    static viewName: string = "DailyShopItem";

    protected _goodsVo: GoodsVo = null;
    protected _isAdBuy: boolean = false
    private get view(): ui.shop.item.DailyShopItem {
        return this as any;
    }

    protected onInit(): void {
        this.onClick(this.onBuyBtnClick, this)
    }

    protected onBuyBtnClick() {
        if (this._goodsVo) {
            ShopModel.ins().openShop(this._goodsVo, this._isAdBuy);
        }
    }

    /**商品列表子项 */
    public setData(goodsVo: GoodsVo) {
        this._goodsVo = goodsVo
        if (goodsVo) {
            let goodsCfg = ShopModel.ins().getGoodsCfg(goodsVo.goodsId)
            if (ServerEnums.ItemType[goodsCfg.itemType] == ServerEnums.ItemType.HERO_CARD) {
                //英雄卡片就展示卡片
                this.view.heroItem.visible = true
                this.view.goodsIcon.visible = false

                let heroVo = HeroManager.ins().getHeroVoByID(goodsCfg.id);
                // @ts-ignore
                let heroItem = this.view.heroItem as HeroItem;
                heroItem.setHeroVo(heroVo, true);
                heroItem.isShowName(false);
                heroItem.isShowLevel(false);
                heroItem.isShowCareer(false);
            } else {
                this.view.heroItem.visible = false
                this.view.goodsIcon.visible = true
                this.view.goodsIcon.icon = ShopModel.ins().getGoodsIcon(goodsVo.goodsId, this._goodsVo.shopId == ShopType.WEAPON);
            }

            this.view.goodsNum.text = `x${StringUtils.numShortToKM(goodsVo._config.rewards[0].v)}`;

            this.view.goodsLv.text = ''
            if (ServerEnums.ItemType[goodsCfg.type] == ServerEnums.ItemType.EQUIP) {
                //如果是装备需要展示装备等级
                let equipCfg = G.TableManager.getDataById(table.equip.EquipConfig, goodsCfg.id)
                if (equipCfg) {
                    this.view.goodsLv.text = equipCfg.equipLevel + ''
                }
            }

            //品质框,根据配置的奖励品质显示
            let qualityCtrl = this.view.getController("quality")
            let quality = goodsVo.rewawrd.getItemConfig().quality;
            if (quality <= 0) {
                quality = 0
            } else if (quality >= qualityCtrl?.pageCount) {
                quality = qualityCtrl.pageCount - 1
            }
            qualityCtrl.selectedIndex = quality;

            //是否打折 1不打折，小于1打折
            if (goodsVo._config.discount && goodsVo._config.discount < 1) {
                this.view.discount.visible = true;
                this.view.discount.discount.text = G.I18nManager.lang(I18ShopKey.i18n_shop_goodsDiscount, goodsVo._config.discount * 10);
            } else {
                this.view.discount.visible = false;
            }
            this.view.lockMask.visible = false;
            //是否热门 /推荐
            this.view.hot.visible = goodsVo._config.label == 1;
            this.view.sell.visible = goodsVo._config.label == 2;

            let costTypeCtrl = this.view.getController("costType");
            this._isAdBuy = GIns.adModel.getRemainAdTimes(goodsVo.adBuyTimes, ServerEnums.AdvertType.SHOP, goodsVo.goodsId.toString()) > 0
            if (this._isAdBuy) {
                costTypeCtrl.selectedIndex = 2
            } else if (goodsVo._config.costItems && goodsVo._config.costItems.length) {
                this.view.costIcon.icon = ItemUtils.getItemConfigByItemId(goodsVo._config.costItems[0].k).smallIconPath;
                this.view.costLabel.text = StringUtils.numShortToKM(goodsVo._config.costItems[0].v);
                costTypeCtrl.selectedIndex = 0;

            } else {
                costTypeCtrl.selectedIndex = 1;
            }

            ///不限购/限购/永远限购
            let limitcfg = ShopModel.ins().getLimitConfig(goodsVo._config.limitBuyType);
            let limitStr = G.I18nManager.lang(limitcfg.refreshStr);
            let ctr = this.view.limit.getController("state");
            //是否未达到购买条件
            if (!ConditionManager.ins().checkCondition(goodsVo._config.buyConditions)) {
                // limitStr = ConditionManager.ins().getOpenConditionTips(goodsVo._config.buyConditions)
                let leaguLv = ConditionManager.ins().getConditionValue(goodsVo._config.buyConditions, EnumConditionType.LEAGUE_LEVEL_GE)
                if (leaguLv > 0) {
                    limitStr = G.I18nManager.lang(I18ShopKey.i18n_shop_goodsBuyLock, leaguLv);
                } else {
                    limitStr = ''
                }
                ctr.selectedIndex = 2;
                this.view.lockMask.visible = true;
                this.view.limit.lbTip.text = limitStr
            } else if (goodsVo._config.buyTimesLimit) {
                //切换文本状态控制器 
                ctr.selectedIndex = 0;
                //是否已经达到购买上限
                let isLimit = goodsVo.buyTimes >= goodsVo._config.buyTimesLimit;
                this.view.lockMask.visible = isLimit;
                let remainTimes = Math.max(0, goodsVo._config.buyTimesLimit - goodsVo.buyTimes)
                if (isLimit) {
                    this.view.limit.lbLimit.text = `${limitStr}<color=#FF5454>${remainTimes}/${goodsVo._config.buyTimesLimit}</color>`;
                } else {
                    this.view.limit.lbLimit.text = `${limitStr}<color=#56FE9D>${remainTimes}/${goodsVo._config.buyTimesLimit}</color>`;
                }
                let maxWidth: number = this.view.width
                if (this.view.limit.lbLimit.width > maxWidth) {
                    let scale = maxWidth / this.view.limit.lbLimit.width
                    this.view.limit.lbLimit.setScale(scale, scale)
                } else {
                    this.view.limit.lbLimit.setScale(1, 1)
                }
            } else {
                this.view.limit.lbTip.text = limitStr
                ctr.selectedIndex = 1;
            }
            if (this.view.lockMask.visible) {
                //隐藏打折/热门/推荐
                this.view.discount.visible = false;
                this.view.hot.visible = false;
                this.view.sell.visible = false;
            }
            this.view.cellContainer.visible = true;
            FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom).reset(RedDotKeys.Shop_item, [goodsVo._config.shopId, goodsVo.goodsId])
        } else {
            this.view.cellContainer.visible = false;
            FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom).reset(RedDotKeys.Null)
        }
    }
}

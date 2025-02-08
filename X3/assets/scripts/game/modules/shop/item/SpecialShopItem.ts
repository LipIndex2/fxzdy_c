/**@format */
import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import { StringUtils } from "../../../../core/utils/StringUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { ConditionManager } from "../../condition/ConditionManager";
import { EnumConditionType } from "../../condition/enum/EnumConditionType";
import { HeroManager } from "../../hero/HeroManager";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { I18ShopKey, ShopType } from "../const/UIShopConst";
import { ShopModel } from "../model/ShopModel";
import { GoodsVo } from "../vo/goodsVo";

@bindFguiExtension("ui://shop/SpecialShopItem")
export class SpecialShopItem extends fgui.GComponent {
    static pkgName: string = "shop";
    static viewName: string = "SpecialShopItem";

    protected _goodsVo: GoodsVo = null;
    protected _firstRewardId: number = 0;
    protected _isSoldOut = 0;
    protected _haveDiscount = 0;
    protected _rewards: { k: any; v: any }[] = [];

    private get view(): ui.shop.item.SpecialShopItem {
        return this as any;
    }

    constructor() {
        super();
    }

    protected onConstruct(): void {
        this.onInit();
    }

    protected onInit() {
        this.view.buyBtn.onClick(this.onClickShow, this);
    }

    onClickShow() {
        if (this._goodsVo) {
            ShopModel.ins().openShop(this._goodsVo);
        }
    }

    public setData(goodsVo: GoodsVo): void {
        this._goodsVo = goodsVo;
        if (goodsVo) {
            let goodsCfg = ShopModel.ins().getGoodsCfg(goodsVo.goodsId);
            if (
                ServerEnums.ItemType[goodsCfg.itemType] ==
                ServerEnums.ItemType.HERO_CARD
            ) {
                //英雄卡片就展示卡片
                this.view.heroItem.visible = true;
                this.view.itemFrame.visible = false;
                let heroVo = HeroManager.ins().getHeroVoByID(goodsCfg.id);
                // @ts-ignore
                let heroItem = this.view.heroItem as HeroItem;
                heroItem.setHeroVo(heroVo, true);
                heroItem.isShowName(false);
                heroItem.isShowLevel(false);
                heroItem.isShowCareer(false);
            } else {
                this.view.heroItem.visible = false;
                this.view.itemFrame.visible = true;
                //@ts-ignore
                this.view.itemFrame.reset(
                    goodsVo.rewawrd.itemId,
                    goodsVo.rewawrd.count
                );
            }

            //是否打折 1不打折，小于1打折
            if (goodsVo._config.discount && goodsVo._config.discount < 1) {
                this.view.buyBtn.getController("c1").selectedIndex = 1;
                this.view.buyBtn.countPrice.text = StringUtils.numShortToKM(
                    goodsVo._config.costItems[0].v
                ); //现价
                this.view.buyBtn.price.text =
                    Math.ceil(
                        goodsVo._config.costItems[0].v /
                            goodsVo._config.discount
                    ) + ""; // 原价
            } else {
                this.view.buyBtn.getController("c1").selectedIndex = 0;
                this.view.buyBtn.soldPrice.text = StringUtils.numShortToKM(
                    goodsVo._config.costItems[0].v
                );
            }
            this.view.buyBtn.icon = ItemUtils.getItemConfigByItemId(
                goodsVo._config.costItems[0].k
            ).smallIconPath;

            // 商品右上角标识
            if (goodsVo._config.label) {
                this.view.getController("c1").selectedIndex =
                    goodsVo._config.label;
            } else {
                this.view.getController("c1").selectedIndex = 0;
            }

            ///不限购/限购/永远限购
            let limitcfg = ShopModel.ins().getLimitConfig(
                goodsVo._config.limitBuyType
            );
            let limitStr = G.I18nManager.lang(limitcfg.refreshStr);
            this.view.getController("c2").selectedIndex = 0;
            //是否未达到购买条件
            if (
                !ConditionManager.ins().checkCondition(
                    goodsVo._config.buyConditions
                )
            ) {
                let leaguLv = ConditionManager.ins().getConditionValue(
                    goodsVo._config.buyConditions,
                    EnumConditionType.LEAGUE_LEVEL_GE
                );
                if (leaguLv > 0) {
                    limitStr = G.I18nManager.lang(
                        I18ShopKey.i18n_shop_goodsBuyLock,
                        leaguLv
                    );
                } else {
                    limitStr = "";
                }
                this.view.limitLabel.visible = true;
                this.view.limitLabel.text = limitStr;
            }
            if (goodsVo._config.buyTimesLimit > 0) {
                //切换文本
                //是否已经达到购买上限
                let isLimit = goodsVo.buyTimes >= goodsVo._config.buyTimesLimit;
                let remainTimes = Math.max(
                    0,
                    goodsVo._config.buyTimesLimit - goodsVo.buyTimes
                );
                if (isLimit) {
                    this.view.getController("c2").selectedIndex = 1;
                    this.view.getController("c1").selectedIndex = 0; // 售罄的话不显示其它角标
                    this.view.limitLabel.text = `${limitStr}<color=#FF5454>${remainTimes}/${goodsVo._config.buyTimesLimit}</color>`;
                } else {
                    this.view.getController("c2").selectedIndex = 0;
                    this.view.limitLabel.text = `${limitStr}<color=#56FE9D>${remainTimes}/${goodsVo._config.buyTimesLimit}</color>`;
                }
            } else {
                this.view.limitLabel.text = "";
            }
        }
    }
}

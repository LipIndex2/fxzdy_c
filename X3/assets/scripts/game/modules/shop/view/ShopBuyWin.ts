import G from "../../../../core/comm/G";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { UIView } from "../../../../core/mvc/view/UIView";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import { StringUtils } from "../../../../core/utils/StringUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { ItemModel } from "../../item/model/ItemModel";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { ShopModel } from "../model/ShopModel";
import { GoodsVo } from "../vo/goodsVo";
import * as fgui from "fairygui-cc";
/**
 * 商店购买窗口
 * 
 */
export class ShopBuyView extends UICommWin {

    static pkgName: string = "shop";
    static viewName: string = "buyView";

    private get view(): ui.shop.buyView {
        return this._view as any;
    }

    public onInit(): void {
        this.view.jia_btn.onClick(() => { this.addOr(1) }, this);
        this.view.jian_btn.onClick(() => { this.addOr(-1) }, this);

        this.view.numSlider.on(fgui.Event.STATUS_CHANGED, () => {
            this.setBuyNum(this.view.numSlider.value);
        }
        );
        this.view.buyBtn.onClick(this.onBuyClick, this);

        this.view.maxBtn.onClick(() => {
            this.setBuyNum(this.view.numSlider.max);
        }, this);

        this.view.goodsCell.onClick(this.showItemDetail,this);

    }
    private mGoodsVo: GoodsVo;
    private maxBuyNum: number = 0;
    public onOpen(args: GoodsVo): void {
        this.mGoodsVo = args;

        //限制购买次数，如果配置0就计算货币能购买的数量  
        let limit = args._config.buyTimesLimit;
        if (args._config.limitBuyType == "NEVER"||args._config.buyTimesLimit <1) {
            //不限购
            let costItem = args._config.costItems[0];
            let costItemIngBag = ItemModel.ins().getItemById(costItem.k);
            let costNum = costItemIngBag ? costItemIngBag.count : 0;
            limit = Math.floor(costNum / costItem.v);
            this.maxBuyNum = limit;
        }
        else
        {
            this.maxBuyNum = limit - this.mGoodsVo.buyTimes;
        }
        
        let minBuyNum = 0.8;
        if (this.maxBuyNum <= 0) {
            minBuyNum = 0.8;
            this.maxBuyNum = 1;
        }
        this.view.numSlider.min = minBuyNum;
        this.view.numSlider.max = this.maxBuyNum;

        this.setBuyNum(minBuyNum);
        const item = args.rewawrd;
        this.view.goodsCell.img_item.icon = item.getIconPath();
        this.view.goodsCell.img_frame.icon = item.getQualityIconPath();
        this.view.goodsCell.T_num.text =`X${item.count?.toString() || "0"}` ;
        if (item.getItemType() == ServerEnums.ItemType.EQUIP) {
            //装备需要展示等级
            let equipCfg = G.TableManager.getDataById(table.equip.EquipConfig, item.itemId)
            if (equipCfg) {
                this.view.goodsCell.T_topNum2.visible = true
                this.view.goodsCell.T_topNum2.text = equipCfg.equipLevel + ''
            }
        }
        this.view.goodsCell.visible = true;
        if(args._config.costItems)
        {
        this.view.getController("free").selectedIndex = 0;
        this.view.buyCost.costIcon.icon = ItemUtils.getItemConfigByItemId(args._config.costItems[0].k).smallIconPath;
        }
        else
        {
            this.view.getController("free").selectedIndex = 1;
        }

    }

    private buyNum = 1;

    private setBuyNum(num: number) {

        this.buyNum = Math.round(num);
        this.view.buyNum.text = StringUtils.numShortToKM(this.buyNum);
        this.view.numSlider.value = this.buyNum;
        //判断是否免费
        if (this.mGoodsVo._config.costItems)
            this.view.buyCost.costNum.text = StringUtils.numShortToKM(this.mGoodsVo._config.costItems[0].v * this.buyNum);
    }


    private addOr(num: number) {
        if (this.view.numSlider.min <= (this.buyNum + num) && (this.buyNum + num) <= this.view.numSlider.max)
            this.setBuyNum(this.buyNum + num);
    }

    private onBuyClick() {
        if (this.buyNum) {
            ShopModel.ins().buyGoods(this.mGoodsVo.shopId, this.mGoodsVo.goodsId, this.buyNum);
        }
        this.closeSelf();
    }

    private showItemDetail(e:fgui.Event)
    {
       ShopModel.ins().showItemDetail(this.view.goodsCell.node,this.mGoodsVo.rewawrd.itemId,e);
    }

}
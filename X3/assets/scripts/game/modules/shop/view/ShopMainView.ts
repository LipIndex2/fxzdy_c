import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { UIPage } from "../../../../core/mvc/view/UIPage";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import { IContainer } from "../../../../core/mvc/viewContainer/IContainer";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { UIMainKey } from "../../../ui/main/const/UIMainConfig";
import { CommonFooterView, EnumFooterLeftSideType } from "../../common/footer/CommonFooterView";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { ConditionManager } from "../../condition/ConditionManager";
import { DrawCardUIKeys } from "../../drawcard/DrawCardUIKeys";
import { FloatingTextManager } from "../../floatingText/FloatingTextManager";
import { UIGameModeKeys } from "../../gameMode/UIGameModeKeys";
import { UIHeroKey } from "../../hero/const/UIHeroConfig";
import { I18ShopKey, UIShopKey } from "../const/UIShopConst";
import { ShopModel } from "../model/ShopModel";
import { ShopManager } from "../shopManager";



/**
 * 商店主页
 * 
 */
export class ShopMainView extends UIPage implements IContainer {

    static pkgName: string = "shop";

    static viewName: string = "shop";

    private _uiKeys = [UIShopKey.DAILY_SHOP];

    //  private _footerComp: CommonFooterView;
    private shopTabids: number[];

    private get view(): ui.shop.shop {
        return this._view as any;
    }


    public onInit(): void {
        this.view.closeBtn.onClick(this.closeSelf, this);
        this.view.btnList.itemRenderer = this.itemRendererForBtn.bind(this);
        this.shopTabids = ShopManager.ins().shopIds;
        if ( this.shopTabids.length > this._uiKeys.length) {
            // this._uiKeys.push(UIShopKey.DAILY_SHOP);
            //this._uiKeys 添加到够为止
            let arr = new Array(this.shopTabids.length - this._uiKeys.length).fill(UIShopKey.DAILY_SHOP);
            this._uiKeys = this._uiKeys.concat(arr);

        }


        this.view.btnList.numItems = this.shopTabids.length;
        this.view.btnList.scrollPane.scrollRight();
        this.viewContainer.bindByGList(this._uiKeys, this.view.btnList);
        
        

    }

    public onOpen(pageIndex: number): void {
        this.viewContainer.selectIndex = pageIndex;
        this.onChangedView(pageIndex);
        
    }

    public onClose(): void {
    }

    private itemRendererForBtn(index: number, item: ui.shop.component.shopPageBtn) {
        let cfg = ShopModel.ins().getShopConfig(this.shopTabids[index]);

        item.title = cfg.shopName;
        item.iconLoader.icon = cfg.icon
        item.iconSelectLoader.icon = cfg.iconSelect
        FguiScriptUtils.toMyScriptClass(item.redDot, RedDotCom).reset(RedDotKeys.Shop_type, [cfg.id])
    }

    onPreChangeView(index: number) {

        //返回商店id
        return this.shopTabids[index];
    }

    public onChangedView(index) {
        if (this.shopTabids.length > 1) {
            this.view.btnList.scrollPane.setPercX(index/(this.shopTabids.length-1));
        }
        
    }

    /**点击页签判断
     * @returns 返回是否可以打开界面
    */
    onClickTabAndCheck(index): boolean {

        let shopId = this.shopTabids[index];
        let cfg = ShopModel.ins().getShopConfig(shopId);
        if (!ConditionManager.ins().checkCondition(cfg.openVerify)) {
            GIns.floatingTextMgr.showTips(I18ShopKey.i18n_shop_errTips4);
            return false;
        }
        return true;
    }












}
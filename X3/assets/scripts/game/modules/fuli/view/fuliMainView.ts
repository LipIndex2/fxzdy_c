import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { UIPage } from "../../../../core/mvc/view/UIPage";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import { IContainer } from "../../../../core/mvc/viewContainer/IContainer";
import NotificationKey from "../../../event/NotificationKey";
import { UIMainKey } from "../../../ui/main/const/UIMainConfig";
import { CommonFooterView, EnumFooterLeftSideType } from "../../common/footer/CommonFooterView";
import { ConditionManager } from "../../condition/ConditionManager";
import { DrawCardUIKeys } from "../../drawcard/DrawCardUIKeys";
import { FloatingTextManager } from "../../floatingText/FloatingTextManager";
import { UIGameModeKeys } from "../../gameMode/UIGameModeKeys";
import { UIHeroKey } from "../../hero/const/UIHeroConfig";
import { UIFuilKey } from "../const/fuliConst";
import { FuliModel } from "../fuliModel";




/**
 * 福利主页
 * 
 */
export class fuliMainView extends UIPage implements IContainer {

    static pkgName: string = "fuli";

    static viewName: string = "fuliMain";

    private _uiKeys = [];

    //  private _footerComp: CommonFooterView;



    listenNotifications(): string[] {
        return [NotificationKey.ACTIVITY_END_REFRESH];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {



            case NotificationKey.ACTIVITY_END_REFRESH:

                //活动变更
                this.onInit()
            
                break;
        }
    }




    private cfgs: table.activity.ActivityConstant.ActivityClientConfig[];
    private get view(): ui.fuli.fuliMain {
        return this._view as any;
    }


    public onInit(): void {
        this.cfgs = FuliModel.ins().getFuliConfigList();
        this.view.bgFooter.btnBack.onClick(this.closeSelf, this);
        this.view.tabList.itemRenderer = this.itemRendererForBtn.bind(this);

        this.cfgs.forEach(cfg => {
            this._uiKeys.push(cfg.UIView);
        });


        this.view.tabList.numItems = this.cfgs.length;
        this.view.tabList.scrollPane.scrollRight();
        this.viewContainer.bindByGList(this._uiKeys, this.view.tabList);
    }

    public onOpen(pageIndex: number = 0): void {

        this.viewContainer.selectIndex = pageIndex;
        this.onChangedView(pageIndex);

    }

    public onClose(): void {
    }

    private itemRendererForBtn(index: number, item: ui.fuli.components.tabCom) {
        let cfg = this.cfgs[index];
        item.iconUp.icon = cfg.upIcon;
        item.iconDown.icon = cfg.downIcon;
        item.title = cfg.name;

    }

    onPreChangeView(index: number) {

        //返回配置
        return this.cfgs[index];
    }

    public onChangedView(index) {
    }

    /**点击页签判断
     * @returns 返回是否可以打开界面
    */
    onClickTabAndCheck(index): boolean {

        // let cfg = this.cfgs[index];
        // let cfg = ShopModel.ins().getShopConfig(shopId);
        // if (!ConditionManager.ins().checkCondition(cfg.openVerify)) {
        //     GIns.floatingTextMgr.showTips(I18ShopKey.i18n_shop_errTips4);
        //     return false;
        // }
        return true;
    }












}
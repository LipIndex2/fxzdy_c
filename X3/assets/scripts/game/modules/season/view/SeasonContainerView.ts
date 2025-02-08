import G from "../../../../core/comm/G";
import UIScriptManager, { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIPage } from "../../../../core/mvc/view/UIPage";
import { IContainer } from "../../../../core/mvc/viewContainer/IContainer";
import ObjectUtils from "../../../../core/utils/ObjectUtils";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { ModuleOpenManager } from "../../moduleopen/ModuleOpenManager";
import { SeasonManager, SeasonPageData } from "../SeasonManager";
import { SeasonUIKeys } from "../SeasonUIKeys";

 
export class SeasonContainerView extends UIPage implements IContainer {

    static pkgName: string = "season";
    static viewName: string = "SeasonContainerView";

    protected _showPages: SeasonPageData[] = []
    protected _defaultIndex: number = -1

    private get view(): ui.season.SeasonContainerView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.SEASON_MENU_VIEW_CLOSE,
            NotificationKey.SEASON_ACTIVITY_NEWSTATE,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
          case NotificationKey.SEASON_MENU_VIEW_CLOSE:
            this.closeSelf();
            break;
          case NotificationKey.SEASON_ACTIVITY_NEWSTATE:
            this.updateState();
            break;
        }
    }


    updateState(){
        const id = SeasonManager.ins().curSeasonActId;
        if(!id){
            this.closeSelf();
            GIns.floatingTextMgr.showTips(`活动已经关闭`);
        }
    }

    /***组件初始化 */
    protected onInit(): void {
        const t = this;

        t.view.footer.btnBack.onClick(t.onClickBack, t);
        t.view.listTab.itemRenderer = t.itemRenderForTab.bind(t);
    }

    protected itemRenderForTab(index: number, item: ui.charge.component.ChargeTabBtn): void {
        item.icon = this._showPages[index].icon
        item.selectedIcon = this._showPages[index].iconSelect
        item.title = this._showPages[index].name
        item.titleSelect.text = this._showPages[index].name
 
    }

    protected onClickBack(): void {
        this.closeSelf()
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this._showPages.length = 0
        
        //处理显示的页签
        this._showPages = ObjectUtils.deepCopy(args);

        if (this._showPages.length <= 0) {
            this.closeSelf()
            return
        }
        this._defaultIndex = 0;
        this.view.listTab.numItems = this._showPages.length
        let uiKeys: string[] = this._showPages.map((value) => value.uiName)
        this.viewContainer.bindByGList(uiKeys, this.view.listTab)
        if (this._defaultIndex >= 0 && this._defaultIndex < this._showPages.length) {
            this.viewContainer.selectIndex = this._defaultIndex
        }
    }

    protected onClose(): void {

    }

    /**点击页签判断
     * @returns 返回是否可以打开界面
     */
    public onClickTabAndCheck?(index): boolean {
        return true
    }

    /**页签切换前
     * @returns 将打开界面的参数
     */
    public onPreChangeView?(index): Object {
        return this._showPages[index];
    }

    /**页签切换完成
     */
    public onChangedView?(index): void {

    }
}

UIScriptManager.bindScript(SeasonUIKeys.SeasonContainerView, SeasonContainerView);
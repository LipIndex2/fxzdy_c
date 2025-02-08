import G from "../../../../core/comm/G";
import UIScriptManager, { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIManager } from "../../../../core/mvc/UIManager";
import { UIPage } from "../../../../core/mvc/view/UIPage";
import { IContainer } from "../../../../core/mvc/viewContainer/IContainer";
import ObjectUtils from "../../../../core/utils/ObjectUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import NotificationKey from "../../../event/NotificationKey";
import { ModuleOpenManager } from "../../moduleopen/ModuleOpenManager";
import { SeasonConfigManager } from "../SeasonConfigManager";
import { SeasonManager, SeasonPageData } from "../SeasonManager";
import { SeasonUIKeys } from "../SeasonUIKeys";

 
export class SeasonSubContainerView extends UIPage implements IContainer {

    static pkgName: string = "season";
    static viewName: string = "SeasonContainerView";

    protected _showPages: SeasonPageData[] = []
    protected _defaultIndex: number = -1

    private get view(): ui.season.SeasonContainerView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.SEASON_ACTIVITY_NEWSTATE
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.SEASON_ACTIVITY_NEWSTATE:
              this.updateState();
              break;
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
        for(let i = this._showPages.length - 1; i>=0; i--){
            const page = this._showPages[i];
            if(page.uiName != SeasonUIKeys.SeasonSubRankView){
                //不是排行榜才处理；
                const vo = SeasonManager.ins().getSubActityVo(page.subActId);
                if(vo?.state != ServerEnums.SubSeasonActivityState.START){
                    this.closeSelf();
                    // this._showPages.splice(i, 1);
                    // UIManager.ins().close(page.uiName);
                }
            }
        }

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

    updateState(){
        if(this._showPages){
            for(const page of this._showPages){
                if(page.uiName != SeasonUIKeys.SeasonSubRankView){
                    //不是排行榜的结束了，关闭界面
                    const aid = page.subActId;
                    const vo = SeasonManager.ins().getSubActityVo(aid);
                    if(!vo || vo?.state != ServerEnums.SubSeasonActivityState.START){
                        this.closeSelf();
                    }
                }
            }
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

UIScriptManager.bindScript(SeasonUIKeys.SeasonSubContainerView, SeasonSubContainerView);
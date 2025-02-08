import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIPage } from "../../../../core/mvc/view/UIPage";
import { IContainer } from "../../../../core/mvc/viewContainer/IContainer";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import NotificationKey from "../../../event/NotificationKey";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { RedDotPath } from "../../common/redDot/structs/RedDotPath";
import { ModuleOpenManager } from "../../moduleopen/ModuleOpenManager";
import { ChargeI18nKeys } from "../const/ChargeI18nKeys";
import { UIChargeConfig } from "../const/UIChargeConfig";

interface ChargePageData {
    page: number
    uiName: string
    icon: string
    iconSelect: string
    name: string
    systemType?: number
    redDotKey?: RedDotPath
}

/**
 * 充值界面
 */
@bindScript(UIChargeConfig.CHARGE_MAIN_VIEW)
export class ChargeMainWin extends UIPage implements IContainer {

    static pkgName: string = "charge";
    static viewName: string = "ChargeMainWin";

    protected _pageDatas: ChargePageData[] = []
    protected _showPages: ChargePageData[] = []
    protected _defaultIndex: number = -1

    private get view(): ui.charge.view.ChargeMainWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.GOTO_VIP_PAGE
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.GOTO_VIP_PAGE:
                let index = this._showPages.findIndex((value) => value.uiName == UIChargeConfig.CHARGE_VIP_PAGE)
                if (index != -1) {
                    this.viewContainer.selectIndex = index
                }
                break
        }
    }

    /***组件初始化 */
    protected onInit(): void {
        this._pageDatas = [
            {
                page: 0,
                uiName: UIChargeConfig.CHARGE_NORMAL_PAGE,
                icon: 'ui://charge/cz002',
                iconSelect: 'ui://charge/cz001',
                name: G.I18nManager.lang(ChargeI18nKeys.tab0),
                systemType: ServerEnums.SystemType.NORMAL_CHARGE
            },
            {
                page: 1,
                uiName: UIChargeConfig.CHARGE_VIP_PAGE,
                icon: 'ui://charge/vip002',
                iconSelect: 'ui://charge/vip001',
                name: G.I18nManager.lang(ChargeI18nKeys.tab1),
                systemType: ServerEnums.SystemType.MALL_VIP,
                redDotKey: RedDotKeys.Charge_vip
            },
            {
                page: 2,
                uiName: UIChargeConfig.CHARGE_LIMIT_PAGE,
                icon: 'ui://charge/xgsc002',
                iconSelect: 'ui://charge/xgsc001',
                name: G.I18nManager.lang(ChargeI18nKeys.tab2),
                systemType: ServerEnums.SystemType.MALL_LIMIT_BUY,
                redDotKey: RedDotKeys.Charge_limit
            },
            // {
            //     page: 3,
            //     uiName: UIChargeConfig.CHARGE_DAILY_PAGE,
            //     icon: 'ui://charge/mrth002',
            //     iconSelect: 'ui://charge/mrth001',
            //     name: G.I18nManager.lang(ChargeI18nKeys.tab3),
            //     systemType: ServerEnums.SystemType.DAILY_SALE,
            //     redDotKey: RedDotKeys.Charge_dailySale
            // }
        ]

        this.view.footer.btnBack.onClick(this.onClickBack, this)
        this.view.listTab.itemRenderer = this.itemRenderForTab.bind(this)
    }

    protected itemRenderForTab(index: number, item: ui.charge.component.ChargeTabBtn): void {
        item.icon = this._showPages[index].icon
        item.selectedIcon = this._showPages[index].iconSelect
        item.title = this._showPages[index].name
        item.titleSelect.text = this._showPages[index].name

        //@ts-ignore
        let redDotCom = item.redDot as RedDotCom
        if (this._showPages[index].redDotKey) {
            redDotCom.reset(this._showPages[index].redDotKey)
        } else {
            redDotCom.reset(RedDotKeys.Null)
        }
    }

    protected onClickBack(): void {
        this.closeSelf()
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this._showPages.length = 0

        this._pageDatas.forEach((value, index) => {
            let isOpen: boolean = true
            if (value.systemType) {
                isOpen = ModuleOpenManager.ins().isCanOpenModule(value.systemType, false)
            }
            if (isOpen) {
                this._showPages.unshift(this._pageDatas[index])
            }
        })
        if (this._showPages.length <= 0) {
            this.closeSelf()
            return
        }
        let defaultPage = args?.page >= 0 ? args?.page : 3
        this._defaultIndex = this._showPages.findIndex((value) => value.page == defaultPage)
        if (this._defaultIndex == -1) {
            this._defaultIndex = this._showPages.length - 1
        }
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
        return null
    }

    /**页签切换完成
     */
    public onChangedView?(index): void {

    }
}
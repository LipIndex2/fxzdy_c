import * as fgui from "fairygui-cc";
import G from "../../../../../core/comm/G";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import NotificationKey from "../../../../event/NotificationKey";
import { NoOwnerItem } from "../../../backpack/vo/NoOwnerItem";

@bindFguiExtension('ui://guardShip/GuardShipRefreshBuffBtn')
export class GuardShipRefreshBuffBtn extends fgui.GButton {

    static pkgName: string = "guardShip";
    static viewName: string = "GuardShipRefreshBuffBtn";

    protected _itemId: number
    protected _needCnt: number
    protected _remianTimes: number
    protected _totalTimes: number
    protected _noOwerItem: NoOwnerItem = null

    private get view(): ui.guardShip.component.GuardShipRefreshBuffBtn {
        return this as any;
    }

    listenNotifications(): string[] | null {
        return [
            NotificationKey.EVENT_CHANGE_ITEMS
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_CHANGE_ITEMS:
                this.refreshUI();
                break;
        }
    }

    protected onInit(): void {
        G.FacadeManager.registerNotification(this)
        this.view.gLabel.layout = fgui.GroupLayoutType.Horizontal
    }

    protected onPreDispose(): void {
        G.FacadeManager.removeNotification(this)
    }

    protected refreshUI(): void {
        if (this._itemId > 0) {
            this.updateUI(this._itemId, this._needCnt, this._remianTimes, this._totalTimes)
        }
    }

    public isCanPay(showComeFromFlag: boolean = false): boolean {
        return this._itemId <= 0 || this._noOwerItem.isCanPay(showComeFromFlag)
    }

    public updateUI(itemId: number, needCnt: number, remianTimes: number, totalTimes: number): void {
        this._itemId = itemId
        this._needCnt = needCnt
        this._remianTimes = remianTimes
        this._totalTimes = totalTimes
        let isCanPay: boolean = true
        if (itemId <= 0) {
            this.view.lbNeed.text = '免费'
            this.view.imageItem.visible = false
            this.view.getController('canPayFlag').selectedIndex = 1
            this.view.labelCount.stroke = 3;
        } else {
            this.view.imageItem.visible = true
            if (this._noOwerItem == null) {
                this._noOwerItem = NoOwnerItem.create(itemId, needCnt)
            } else {
                this._noOwerItem.itemId = itemId
                this._noOwerItem.count = needCnt
            }
            isCanPay = this._noOwerItem.isCanPay()

            this.view.lbNeed.text = needCnt + '';
            this.view.imageItem.icon = this._noOwerItem.getIconPath()
        }
        this.view.labelCount.text = ` (${remianTimes}/${totalTimes})`
        this.view.getController('canPayFlag').selectedIndex = isCanPay ? 1 : 0
        this.view.labelCount.stroke = isCanPay ? 3 : 0;
        this.view.labelCount.ensureSizeCorrect()
        this.view.lbNeed.ensureSizeCorrect()
        this.view.gLabel.ensureBoundsCorrect()
    }
}
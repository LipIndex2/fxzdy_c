import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import * as fgui from "fairygui-cc";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { MallModel, MallPopupData } from "../../mall/model/MallModel";
import { UILimitPackConfig } from "../const/UILimitPackConfig";
import { LimitPackPage1 } from "./page/LimitPackPage1";
import { LimitPackPage2 } from "./page/LimitPackPage2";
import { LimitPackPage3 } from "./page/LimitPackPage3";
import { LimitPackPage4 } from "./page/LimitPackPage4";


@bindScript(UILimitPackConfig.LIMITPACK_MAIN_WIN)
export class LimitPackMainWin extends UICommWin {

    static pkgName: string = "limitPack";
    static viewName: string = "LimitPackMainWin";

    protected _defaultId: number = -1
    protected _curIndex: number = -1
    protected _datas: MallPopupData[] = []

    private get view(): ui.limitPack.view.LimitPackMainWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.MALL_POPUP_CHANGE,
            NotificationKey.MALL_DATA_CHANGE_BY_TYPE,
            NotificationKey.MALL_DATA_CHANGE_BY_ID,
        ]
    }


    notificationHandler(event: string, args?: any) {
        switch (event) {
            case NotificationKey.MALL_POPUP_CHANGE:
                this.resetUI()
            case NotificationKey.MALL_DATA_CHANGE_BY_TYPE:
            case NotificationKey.MALL_DATA_CHANGE_BY_ID:
                this.updateUI()
        }
    }

    protected onInit(): void {
        this.view.listTab.itemRenderer = this.itemRendererForTab.bind(this)
        this.view.listTab.on(fgui.Event.CLICK_ITEM, this.onClickTab, this)
        this.view.btnPrev.onClick(this.onClickPrev, this)
        this.view.btnNext.onClick(this.onClickNext, this)
    }

    protected itemRendererForTab(): void {

    }

    protected onClickPrev(): void {
        let lastIndex = this._curIndex - 1
        if (lastIndex < 0) {
            lastIndex = this._datas.length - 1
        }
        this.view.listTab.selectedIndex = lastIndex
        this.setIndex(lastIndex)
    }

    protected onClickNext(): void {
        let nextIndex = this._curIndex + 1
        if (nextIndex >= this._datas.length) {
            nextIndex = 0
        }
        this.view.listTab.selectedIndex = nextIndex
        this.setIndex(nextIndex)
    }

    protected onClickTab(item: ui.limitPack.component.LimitPackPageBtn2): void {
        let selectIndex = this.view.listTab.selectedIndex
        this.setIndex(selectIndex)
    }

    protected setIndex(index: number): void {
        if (this._curIndex != index && index >= 0 && index < this._datas.length) {
            this._curIndex = index
            this.updateUI()
        }
    }

    protected hideAllPages():void {
        this.view.page1.visible = false
        this.view.page2.visible = false
        this.view.page3.visible = false
        this.view.page4.visible = false
    }

    protected updateUI(): void {
        let curData = this._datas[this._curIndex]
        let curCfg = curData?.cfg
        if (curCfg == null) {
            this.closeSelf()
            return
        }
        this.hideAllPages()
        if (curCfg.type == 1) {
            this.view.page1.visible = true
            FguiScriptUtils.toMyScriptClass(this.view.page1, LimitPackPage1).updateUI(curData)
        } else if (curCfg.type == 2) {
            this.view.page2.visible = true
            FguiScriptUtils.toMyScriptClass(this.view.page2, LimitPackPage2).updateUI(curData)
        } else if (curCfg.type == 3) {
            this.view.page3.visible = true
            FguiScriptUtils.toMyScriptClass(this.view.page3, LimitPackPage3).updateUI(curData)
        }else if (curCfg.type == 4) {
            this.view.page4.visible = true
            FguiScriptUtils.toMyScriptClass(this.view.page4, LimitPackPage4).updateUI(curData)
        }
    }

    protected resetUI(): void {
        this._datas = Array.from(MallModel.ins().popupDataMap.values()).sort((a, b) => {
            return a.endTime - b.endTime
        })
        if (this._datas.length <= 0) {
            this.closeSelf()
            return
        }
        this.view.listTab.numItems = this._datas.length
        let defaultIndex = this._curIndex != -1 ? this._curIndex : 0
        this._curIndex = -1
        if (this._defaultId > 0) {
            let index = this._datas.findIndex((value) => value.id == this._defaultId)
            if (index != -1) {
                defaultIndex = index
            }
        }

        if (defaultIndex >= this._datas.length) {
            defaultIndex = this._datas.length - 1
        }
        this.view.listTab.selectedIndex = defaultIndex
        this.setIndex(defaultIndex)
        this._defaultId = -1

        this.view.btnNext.visible = this.view.btnPrev.visible = this._datas.length > 1
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        if (!isNaN(Number(args))) {
            this._defaultId = Number(args)
        }
        this.resetUI()
    }

    protected onClose(): void {

    }

}
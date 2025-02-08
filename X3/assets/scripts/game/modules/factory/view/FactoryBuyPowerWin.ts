import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { NoOwnerItem } from "../../backpack/vo/NoOwnerItem";
import { BtnChangGui1WithItem } from "../../common/btn/BtnChangGui1WithItem";
import { UIFactoryConfig } from "../const/UIFactoryConfig";

/**
 * 星际工厂购买体力
 */
@bindScript(UIFactoryConfig.FactoryBuyPowerWin)
export class FactoryBuyPowerWin extends UICommWin {

    static pkgName: string = "factory";
    static viewName: string = "FactoryBuyPowerWin";

    protected _timerKey: string = null
    /**需要恢复的体力*/
    protected _needRecoverPower: number = 0
    protected _curBuyCnt: number = -1
    protected _costItem: NoOwnerItem = new NoOwnerItem()
    protected _numReg: RegExp = /\d+/g
    protected _minBuyCnt: number = 1
    protected _maxBuyCnt: number = 999

    private get view(): ui.factory.view.FactoryBuyPowerWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.FACTORY_POWER_UPDATE,
            NotificationKey.FACTORY_BUY_POWER_COMPLETE
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.FACTORY_POWER_UPDATE:
                this.updateUI()
                break
            case NotificationKey.FACTORY_BUY_POWER_COMPLETE:
                GIns.floatingTextMgr.showTips('购买体力成功')
                this.closeSelf()
                break
        }
    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.inputCurCnt.maxLength = 3
        this.view.inputCurCnt.on(fgui.Event.TEXT_CHANGE, this.onTextChange, this)
        this.view.btnAdd.onClick(this.onClickAdd, this)
        this.view.btnSub.onClick(this.onClickSub, this)
        this.view.btnBuy.onClick(this.onClickBuy, this)
    }

    protected onPreDispose(): void {

    }

    protected onTextChange(): void {
        let arr = this.view.inputCurCnt.text.match(this._numReg)
        let numCnt: number = 1
        if (arr?.length > 0) {
            numCnt = Number(arr.join(''))
            if (isNaN(numCnt) || numCnt < this._minBuyCnt) {
                numCnt = this._minBuyCnt
            } else if (numCnt > this._maxBuyCnt) {
                numCnt = this._maxBuyCnt
            }
        }
        this.view.inputCurCnt.text = numCnt + ''
        this.setBuyCnt(numCnt)
    }

    protected onClickAdd(): void {
        if (this._curBuyCnt < this._maxBuyCnt) {
            this.setBuyCnt(this._curBuyCnt + 1)
        }
    }

    protected onClickSub(): void {
        if (this._curBuyCnt > this._minBuyCnt) {
            this.setBuyCnt(this._curBuyCnt - 1)
        }
    }

    protected onClickBuy(): void {
        if (!this.btnBuy.isCanPay(true)) {
            GIns.floatingTextMgr.showTips(this.btnBuy.getNoPayTip())
            return
        }
        GIns.factoryModel.sendBuyPower({ count: this._curBuyCnt })
    }

    protected get btnBuy(): BtnChangGui1WithItem {
        return FguiScriptUtils.toMyScriptClass(this.view.btnBuy, BtnChangGui1WithItem)
    }

    protected addTimer(): void {
        if (!this._timerKey) {
            this._timerKey = G.GameTimer.loop(500, this, this.onTimer)
        }
        this.onTimer()
    }

    protected removeTimer(): void {
        if (this._timerKey) {
            G.GameTimer.clearByKey(this._timerKey)
            this._timerKey = null
        }
    }

    protected onTimer(): void {
        let nowTime: number = G.TimeManager.serverNow
        let lastRecoverTime: number = GIns.factoryModel.myVo.powerVo.lastRecoverTime
        let recoverInterval: number = GIns.factoryModel.constCfg.powerRecoverInterval * 1000
        let nextReoverTime: number = Math.max(0, lastRecoverTime + recoverInterval - nowTime)
        let allReoverTime: number = nextReoverTime + recoverInterval * (this._needRecoverPower - 1)
        this.view.lbNextTime.text = TimeUtils.formatTimeMsToPositiveTimeText(nextReoverTime)
        this.view.lbFullTime.text = TimeUtils.formatTimeMsToPositiveTimeText(allReoverTime)
    }

    protected updateUI(): void {
        let curPower: number = GIns.factoryModel.myVo.powerVo.power
        let maxPower: number = GIns.factoryModel.constCfg.maxPower
        this._needRecoverPower = Math.max(0, maxPower - curPower)
        this.view.lbCurPower.text = curPower + '/' + maxPower
        if (curPower >= maxPower) {
            //体力已满
            this.removeTimer()
            this.view.lbFullTime.text = '--:--:--'
            this.view.lbNextTime.text = '--:--:--'
            return
        }
        this.addTimer()
    }

    protected setBuyCnt(cnt: number): void {
        if (this._curBuyCnt != cnt) {
            this._curBuyCnt = cnt
            this.view.lbCount.text = cnt + ''
            this.view.inputCurCnt.text = cnt + ''

            if (GIns.factoryModel.constCfg.buyOnePowerCosts?.length > 0) {
                this._costItem.itemId = GIns.factoryModel.constCfg.buyOnePowerCosts[0].k
                this._costItem.count = GIns.factoryModel.constCfg.buyOnePowerCosts[0].v * cnt
            }
            this.btnBuy.reset(`购买x${cnt}`, this._costItem)

            this.view.btnSub.enabled = this._curBuyCnt > this._minBuyCnt
            this.view.btnAdd.enabled = this._curBuyCnt < this._maxBuyCnt
        }
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this.view.iconLoader.icon = GIns.factoryModel.constCfg.powerIcon
        this.view.iconLoader2.icon = GIns.factoryModel.constCfg.powerIcon
        this.updateUI()
        this.setBuyCnt(1)
    }

    protected onClose(dontDispose?: boolean): void {
        this.removeTimer()
    }
}
import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIPage } from "../../../../core/mvc/view/UIPage";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { EnumRuleKeys } from "../../rule/enums/EnumRuleKeys";
import { RuleController } from "../../rule/RuleController";
import { UIFactoryConfig } from "../const/UIFactoryConfig";
import { FactoryMainPanel } from "./component/FactoryMainPanel";

/**
 * 星际工厂主界面
 */
@bindScript(UIFactoryConfig.FactoryMainView)
export class FactoryMainView extends UIPage {

    static pkgName: string = "factory";
    static viewName: string = "FactoryMainView";

    protected _curPlayerId: number = 0
    protected _curVisitVo: Vo.factory.PlayerFactoryVisitVo = null
    protected _lastRequestTimeMap: Map<number, number> = new Map()
    /**刷新间隔*/
    protected _requestInterval: number = 600000
    private get view(): ui.factory.view.FactoryMainView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.FACTORY_OCCUPY_PUSH,
            NotificationKey.FACTORY_UPDATE_INFO,
            NotificationKey.FACTORY_VISIT_UPDATE,
            NotificationKey.FACTORY_PRODUCT_LINE_UPDATE,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.FACTORY_OCCUPY_PUSH:
                this.tryToRequestData(true)
                break
            case NotificationKey.FACTORY_UPDATE_INFO:
                this.updateUI()
                break
            case NotificationKey.FACTORY_VISIT_UPDATE:
                if (args == this._curPlayerId) {
                    this._curVisitVo = GIns.factoryModel.getVisitInfo(this._curPlayerId)
                    this.updateUI()
                }
                break
            case NotificationKey.FACTORY_PRODUCT_LINE_UPDATE:
                let selfProductLineVo = GIns.factoryModel.myVo?.selfProductLineVo
                if (selfProductLineVo == null || args == selfProductLineVo?.productLineId || this._curVisitVo?.productLineVo == null) {
                    this.updateUI()
                }
                break
        }
    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.btnRecord.onClick(this.onClickRecord, this)
        this.view.btnNear.onClick(this.onClickNear, this)
        this.view.btnBack.onClick(this.closeSelf, this)
        this.view.btnRule.onClick(this.onClickRule, this)
        FguiScriptUtils.toMyScriptClass(this.view.btnRecord.redDot, RedDotCom).reset(RedDotKeys.Factory_record)
    }

    protected onPreDispose(): void {

    }

    protected get mainPanel(): FactoryMainPanel {
        return FguiScriptUtils.toMyScriptClass(this.view.pMain, FactoryMainPanel)
    }

    protected onClickRecord(): void {
        G.UIManager.open(UIFactoryConfig.FactoryRecordWin)
    }

    protected onClickNear(): void {
        G.UIManager.open(UIFactoryConfig.FactoryOthersWin)
    }

    protected onClickRule(): void {
        RuleController.ins().openRule(EnumRuleKeys.FACTORY, this.view.btnRule)
    }

    /**尝试刷新数据 返回是否是第一次请求*/
    protected tryToRequestData(force: boolean = false): boolean {
        let nowTime: number = Date.now()
        let lastRequestTime: number = 0
        if (this._lastRequestTimeMap.has(this._curPlayerId)) {
            lastRequestTime = this._lastRequestTimeMap.get(this._curPlayerId)
        }

        if (force || nowTime - lastRequestTime > this._requestInterval) {
            this._lastRequestTimeMap.set(this._curPlayerId, nowTime)
            GIns.factoryModel.sendVisitFactoryInfo({ targetId: this._curPlayerId })
            this.mainPanel.clearProductLine()
            return lastRequestTime == 0
        }
        return false
    }

    protected updateUI(): void {
        if (this.tryToRequestData()) {
            return
        }
        if (this._curVisitVo) {
            this.mainPanel.updateProductLineByVisit(this._curVisitVo)
        } else {
            this.mainPanel.clearProductLine()
        }
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this._curPlayerId = GIns.playerModel.playerId
        if (GIns.factoryModel.myVo) {
            this.mainPanel.updateMyOccupyList()
            this.mainPanel.updatePower()
            this.updateUI()
        } else {
            GIns.factoryModel.sendLoadFactoryInfo()
        }
    }

    protected onClose(dontDispose?: boolean): void {

    }
}
import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { NoOwnerItem } from "../../backpack/vo/NoOwnerItem";
import { BtnChangGui1WithItem } from "../../common/btn/BtnChangGui1WithItem";
import { FactoryProductLineState } from "../const/FactoryEnum";
import { UIFactoryConfig } from "../const/UIFactoryConfig";
import { FactoryUtils } from "../FactoryUtils";
import { IFactoryConstCfg } from "../model/vo/IFactoryConstCfg";
import { FactoryProductLineOwerPanel } from "./component/FactoryProductLineOwerPanel";
import { FactoryProductLineRewardPanel } from "./component/FactoryProductLineRewardPanel";

/**
 * 星际工厂生产线信息
 */
@bindScript(UIFactoryConfig.FactoryProductLineWin)
export class FactoryProductLineWin extends UICommWin {

    static pkgName: string = "factory";
    static viewName: string = "FactoryProductLineWin";

    protected _productLineId: number = null
    protected _state: FactoryProductLineState = FactoryProductLineState.None
    protected _productLineVo: Vo.factory.ProductLineVo = null
    protected _cfg: table.factory.FactoryProductLineConfig = null
    protected _timerKey: string = null
    protected _remainTime: number = 0
    protected _remainMinTime: number = 0
    private get view(): ui.factory.view.FactoryProductLineWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.FACTORY_UPDATE_INFO,
            NotificationKey.FACTORY_VISIT_UPDATE,
            NotificationKey.FACTORY_PRODUCT_LINE_UPDATE,
            NotificationKey.FACTORY_POWER_UPDATE,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.FACTORY_UPDATE_INFO:
                this.updateUI()
                break
            case NotificationKey.FACTORY_PRODUCT_LINE_UPDATE:
                if (args == this._productLineId) {
                    let lastProductVo = this._productLineVo
                    this._productLineVo = GIns.factoryModel.getProductLineVo(this._productLineId)
                    this.updateUI()
                    if (lastProductVo == null && this._productLineVo == null) {
                        //代表首次刷新就是空 直接提示
                        GIns.floatingTextMgr.showTips('生产线不存在')
                    }
                }
                break
            case NotificationKey.FACTORY_POWER_UPDATE:
                if (this._state == FactoryProductLineState.NotOccupied) {
                    this.updateBtns()
                }
                break
        }
    }

    /***组件初始化 */
    protected onInit(): void {
        this.owerPanel.setStyle(0)
        this.view.getController('state').selectedIndex = 0
        this.view.btnAttack.onClick(this.onClickAttack, this)
        this.view.btnDef.onClick(this.onClickAttack, this)
        this.view.btnDraw.onClick(this.onClickDraw, this)
        this.view.btnDraw2.onClick(this.onClickDraw2, this)
        this.view.btnGiveUp.onClick(this.onClickGiveUp, this)
    }

    protected onPreDispose(): void {

    }

    protected onClickAttack(): void {
        GIns.factoryMgr.occupyProductLine(this._productLineVo)
    }

    protected onClickDraw(): void {
        if (!this.btnDraw.isCanPay(true)) {
            GIns.floatingTextMgr.showTips(this.btnDraw.getNoPayTip())
            return
        }
        GIns.factoryModel.sendDrawProductLine({ productLineId: this._productLineVo.productLineId, skip: true })
    }

    protected onClickDraw2(): void {
        GIns.factoryModel.sendDrawProductLine({ productLineId: this._productLineVo.productLineId, skip: false })
    }

    protected onClickGiveUp(): void {
        GIns.factoryModel.sendCancelOccupy({ productLineId: this._productLineVo.productLineId })
    }

    protected get owerPanel(): FactoryProductLineOwerPanel {
        return FguiScriptUtils.toMyScriptClass(this.view.pContent.pOwer, FactoryProductLineOwerPanel)
    }

    protected get rewardPanel(): FactoryProductLineRewardPanel {
        return FguiScriptUtils.toMyScriptClass(this.view.pContent.pReward, FactoryProductLineRewardPanel)
    }

    protected get btnAttack(): BtnChangGui1WithItem {
        return FguiScriptUtils.toMyScriptClass(this.view.btnAttack, BtnChangGui1WithItem)
    }

    protected get btnDef(): BtnChangGui1WithItem {
        return FguiScriptUtils.toMyScriptClass(this.view.btnDef, BtnChangGui1WithItem)
    }


    protected get btnDraw(): BtnChangGui1WithItem {
        return FguiScriptUtils.toMyScriptClass(this.view.btnDraw, BtnChangGui1WithItem)
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
        if (this._productLineVo) {
            let nowTime: number = G.TimeManager.serverNow
            this._remainTime = this._productLineVo.endTime - nowTime
            if (this._remainTime <= 0) {
                this._remainTime = 0
                this.updateUI()
            }

            this.view.lbTime.text = TimeUtils.formatTimeMsToPositiveTimeText(this._remainTime)
            let remainMinTime: number = Math.ceil(this._remainTime / 60000)
            if (this._remainMinTime != remainMinTime) {
                this._remainMinTime = remainMinTime
                this.updateBtns()
            }
        }
    }

    protected updateUI(): void {
        this._state = GIns.factoryModel.getProductLineState(this._productLineVo, true)
        if (this._state <= FactoryProductLineState.Idle) {
            //无效生产线
            this.closeSelf()
            return
        }
        if (this._productLineVo) {
            if (this._cfg == null || this._cfg.id != this._productLineVo.productLineConfigId) {
                this._cfg = G.TableManager.getDataById(table.factory.FactoryProductLineConfig, this._productLineVo.productLineConfigId)
                if (this._cfg) {
                    this.view.lbTitle.text = this._cfg.name
                }
            }
            if (this._state == FactoryProductLineState.NotOccupied) {
                this.owerPanel.setShowState(2)
                this.view.lbTime.text = `${GIns.factoryModel.getProdectLineOccupyTime(this._cfg?.quality)}分钟`
                this.removeTimer()
                this.view.lbTimeTitle.text = ''
                this.view.lbTime.text = ''
            } else {
                this.owerPanel.setShowState(1)
                this.owerPanel.updatePlayerInfo(this._productLineVo.occupyPlayerBaseVo)
                this.owerPanel.updateHeros(this._productLineVo.occupyFormationVisitVo?.positionVisitVos)
                this.owerPanel.updateCollections(this._productLineVo.occupyFormationVisitVo?.collectiblesVisitVo)
                this.owerPanel.updatePet(this._productLineVo.occupyFormationVisitVo?.petVisitVo)
                if (this._state == FactoryProductLineState.OccupiedComplete) {
                    this.removeTimer()
                    this.view.lbTimeTitle.text = '收获奖励需要消耗'
                    this.view.lbTime.color = FactoryUtils.myTimeColor
                    this.view.lbTime.text = `可领取`
                } else {
                    let isMine: boolean = this._productLineVo.occupyPlayerBaseVo.id == GIns.playerModel.playerId
                    if (isMine) {
                        this.view.lbTime.color = FactoryUtils.myTimeColor
                        this.view.lbTimeTitle.text = '收获奖励需要消耗'
                    } else {
                        this.view.lbTime.color = FactoryUtils.otherTimeColor
                        this.view.lbTimeTitle.text = '距离生产线消失还有'
                    }
                    this.addTimer()
                }
            }

            this.rewardPanel.updateRewards(GIns.factoryModel.getProdectLineRewards(this._productLineVo.productLineConfigId))
        }
        this.updateBtns()
    }

    protected updateBtns(): void {
        let constCfg: IFactoryConstCfg = GIns.factoryModel.constCfg
        if (this._state == FactoryProductLineState.NotOccupied) {
            //未被占领
            this.view.getController('state').selectedIndex = 3
            this.btnDef.resetForNoItem('防守布阵', constCfg.powerIcon, constCfg.occupyCostPower, GIns.factoryModel.myVo.powerVo.power)
        } else if (this._state == FactoryProductLineState.Occupied) {
            //被占领
            if (this._productLineVo.occupyPlayerBaseVo.id == GIns.playerModel.playerId) {
                //是我占领的
                this.view.getController('state').selectedIndex = 1
                let cost = constCfg?.occupySkipOneMinutesCosts[0]
                let costCount = this._remainMinTime * cost.v
                let item = NoOwnerItem.create(cost.k, costCount)
                this.btnDraw.reset('立即领取', item)
            } else {
                //其他人占领
                this.view.getController('state').selectedIndex = 2
                this.btnAttack.resetForNoItem('布阵进攻', constCfg.powerIcon, constCfg.occupyCostPower, GIns.factoryModel.myVo.powerVo.power)
            }
        } else if (this._state == FactoryProductLineState.OccupiedComplete) {
            //我占领 完成
            this.view.getController('state').selectedIndex = 4
        } else {
            this.view.getController('state').selectedIndex = 0
        }
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this._productLineId = args
        if (this._productLineId > 0) {
            GIns.factoryModel.sendVisitProductLineInfo({ productLineId: this._productLineId })
        } else {
            this.closeSelf()
        }
    }

    protected onClose(dontDispose?: boolean): void {
        this.removeTimer()
    }
}
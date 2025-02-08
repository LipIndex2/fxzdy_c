import { Color } from "cc";
import * as fgui from "fairygui-cc";
import G from "../../../../../core/comm/G";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { INotification } from "../../../../../core/mvc/interface/INotification";
import { FguiScriptUtils } from "../../../../../core/utils/FguiScriptUtils";
import { TimeUtils } from "../../../../comm/utils/TimeUtils";
import NotificationKey from "../../../../event/NotificationKey";
import GIns from "../../../../GIns";
import { BtnChangGui1WithItem } from "../../../common/btn/BtnChangGui1WithItem";
import { HeaderItem } from "../../../common/header/HeaderItem";
import { ModelNode } from "../../../common/node/ModelNode";
import { FactoryProductLineState } from "../../const/FactoryEnum";
import { UIFactoryConfig } from "../../const/UIFactoryConfig";
import { FactoryUtils } from "../../FactoryUtils";
import { FactoryOccupyItem } from "../item/FactoryOccupyItem";
import { FactoryBoxBtn } from "./FactoryBoxBtn";
import { FactoryOtherBubble } from "./FactoryOtherBubble";
import { FactoryTransPanel } from "./FactoryTransPanel";

interface ProductLineSimpleVo {
    id?: number
    configId?: number
    occupyId?: number
}

/**
 * 星际工厂主界面逻辑展示
 */
@bindFguiExtension('ui://factory/FactoryMainPanel')
export class FactoryMainPanel extends fgui.GComponent implements INotification {

    static pkgName: string = "factory";
    static viewName: string = "FactoryMainPanel";

    /**生产线所属玩家id*/
    protected _belongPlayerId: number = 0
    protected _state: FactoryProductLineState = FactoryProductLineState.None
    protected _productLineVo: Vo.factory.ProductLineVo = null
    protected _timerKey: string = null
    protected _heroModels: ModelNode[] = []
    protected _heroShadows: fgui.GObject[] = []
    protected _productLineCfg: table.factory.FactoryProductLineConfig = null
    protected _occupys: Vo.factory.ProductLineBriefVo[] = []
    protected _myTimeColor: Color = new Color('#50ff50')
    protected _otherTimeColor: Color = new Color('#FF5050')
    protected _isLoadedSpineTrans: boolean = false
    protected _tranAniNames: string[] = ['idle2', 'idle2', 'idle', 'idle3']
    protected _quality: number = -1
    protected _nextRefreshTime: number = 0
    protected _nextRefreshTimeSuffix: string = ''
    protected _lastSimpleVo: ProductLineSimpleVo = {}

    private get view(): ui.factory.component.FactoryMainPanel {
        return this as any;
    }

    listenNotifications(): string[] | null {
        return [
            NotificationKey.FACTORY_UPDATE_INFO,
            NotificationKey.FACTORY_POWER_UPDATE,
            NotificationKey.FACTORY_PRODUCT_LINE_UPDATE,
            NotificationKey.FACTORY_MAX_OCCUPY_COUNT_CHANGE,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.FACTORY_UPDATE_INFO:
                this.updateMyOccupyList()
                this.updatePower()
                break;
            case NotificationKey.FACTORY_POWER_UPDATE:
                this.updatePower();
                this.updateAttackBtn();
                break
            case NotificationKey.FACTORY_PRODUCT_LINE_UPDATE:
                this.updateMyOccupyList()
                break
            case NotificationKey.FACTORY_MAX_OCCUPY_COUNT_CHANGE:
                this.updateMyOccupyList()
                break
        }
    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.getController('state').selectedIndex = 0
        G.FacadeManager.registerNotification(this)
        this._heroModels = [
            this.view.hero1 as ModelNode,
            this.view.hero2 as ModelNode,
            this.view.hero3 as ModelNode,
            this.view.hero4 as ModelNode,
            this.view.hero5 as ModelNode,
            this.view.hero6 as ModelNode,
        ]
        this._heroShadows = [
            this.view.shadow1,
            this.view.shadow2,
            this.view.shadow3,
            this.view.shadow4,
            this.view.shadow5,
            this.view.shadow6,
        ]
        this.view.listOccupy.setVirtual()
        this.view.listOccupy.itemRenderer = this.itemRendererForOccupy.bind(this)
        this.view.headerItem.onClick(this.onClickPower, this)
        this.view.btnBox.onClick(this.onClickBox, this)
        this.view.btnAttack.onClick(this.onClickAttack, this);

        let spineTrans = this.view.spineTrans as ModelNode
        spineTrans.loadByPath('spine/materials/chuansongdai/chuansongdai')
        spineTrans.setLoadCompleteListener(() => {
            this._isLoadedSpineTrans = true
            this.updateQuality(true)
        })
    }

    protected onPreDispose(): void {
        this.removeTimer()
        G.FacadeManager.removeNotification(this)
    }

    protected get powerItem(): HeaderItem {
        return FguiScriptUtils.toMyScriptClass(this.view.headerItem, HeaderItem)
    }

    protected get transPanel(): FactoryTransPanel {
        return FguiScriptUtils.toMyScriptClass(this.view.pTrans, FactoryTransPanel)
    }

    protected get boxBtn(): FactoryBoxBtn {
        return FguiScriptUtils.toMyScriptClass(this.view.btnBox, FactoryBoxBtn)
    }

    protected itemRendererForOccupy(index: number, item: FactoryOccupyItem): void {
        item.setData(this._occupys[index], index)
    }

    protected onClickPower(): void {
        G.UIManager.open(UIFactoryConfig.FactoryBuyPowerWin)
    }

    protected onClickBox(): void {
        G.UIManager.open(UIFactoryConfig.FactoryProductLineWin, this._productLineVo.productLineId)
    }

    protected onClickAttack(): void {
        if (this._state == FactoryProductLineState.NotOccupied) {
            //未占领直接占领
            GIns.factoryMgr.occupyProductLine(this._productLineVo);
        } else {
            //其他情况打开生产线弹框
            G.UIManager.open(UIFactoryConfig.FactoryProductLineWin, this._productLineVo.productLineId);
        }
    }

    /**设置当前状态*/
    protected setState(state: FactoryProductLineState, force: boolean = false): void {
        if (this._state != state || force) {
            this._state = state
            this.view.getController('state').selectedIndex = state
            this.updateBox()
            this.updateQuality(true)
            if (state == FactoryProductLineState.Occupied) {
                this.updateHeros()
                this.transPanel.start(this._productLineVo, this._productLineCfg)
            } else {
                this.clearHeros()
                this.transPanel.stop()
            }
            this.updateBoxLb()
        } else {
            this.updateQuality()
            if (this._state == FactoryProductLineState.NotOccupied) {
                //未占领时需要刷新是否显示可占领
                this.updateBoxLb()
            }
        }
        this.updateAttackBtn();
        this.updateBubble();
    }

    protected updateBoxLb(): void {
        let endTime: number = 0
        switch (this._state) {
            case FactoryProductLineState.Idle:
                let visitVo = GIns.factoryModel.getVisitInfo(this._belongPlayerId)
                if (visitVo && visitVo.lastProductLineEndTime) {
                    endTime = visitVo.lastProductLineEndTime + GIns.factoryModel.constCfg.productLineRefreshInterval * 1000
                }
                this.view.lbBoxTime.text = ''
                this.view.lbBoxTime.color = FactoryUtils.refreshColor
                this._nextRefreshTimeSuffix = ' 后刷新'
                break
            case FactoryProductLineState.NotOccupied:
                // this.view.lbCanOccupy.text = GIns.factoryModel.isMyOccupyListFull() ? '' : '可占领'
                break
            case FactoryProductLineState.Occupied:
                endTime = this._productLineVo.endTime
                this.view.lbBoxTime.text = ''
                if (this._productLineVo.occupyPlayerBaseVo.id == GIns.playerModel.playerId) {
                    //是我占领的
                    this.view.lbBoxTime.color = FactoryUtils.myTimeColor
                    this._nextRefreshTimeSuffix = ' 后领奖'
                } else {
                    this.view.lbBoxTime.color = FactoryUtils.otherTimeColor
                    this._nextRefreshTimeSuffix = ' 后消失'
                }
                break
        }
        this.removeTimer()
        if (endTime > 0) {
            this._nextRefreshTime = endTime
            this.addTimer()
        }
    }

    protected updateAttackBtn(): void {
        let isMyOccupyListFull = GIns.factoryModel.isMyOccupyListFull();
        if (isMyOccupyListFull == false) {
            //我可占领时
            let btnAttack = FguiScriptUtils.toMyScriptClass(this.view.btnAttack, BtnChangGui1WithItem);
            if (this._state == FactoryProductLineState.NotOccupied) {
                btnAttack.visible = true;
                btnAttack.resetForNoItem('驻守', GIns.factoryModel.constCfg.powerIcon, GIns.factoryModel.constCfg.occupyCostPower, GIns.factoryModel.myVo.powerVo.power);
                return
            } else if (this._state == FactoryProductLineState.Occupied) {
                if (this._productLineVo.occupyPlayerBaseVo.id != GIns.playerModel.playerId) {
                    //不是我占领的
                    if (this._productLineVo.occupied) {
                        //我曾占领过
                        btnAttack.visible = true;
                        btnAttack.resetForNoItem('夺回', GIns.factoryModel.constCfg.powerIcon, GIns.factoryModel.constCfg.occupyCostPower, GIns.factoryModel.myVo.powerVo.power);
                        return;
                    } else {
                        btnAttack.visible = true;
                        btnAttack.resetForNoItem('抢夺', GIns.factoryModel.constCfg.powerIcon, GIns.factoryModel.constCfg.occupyCostPower, GIns.factoryModel.myVo.powerVo.power);
                        return;
                    }
                }
            }
        }
        this.view.btnAttack.visible = false;
    }

    protected updateBubble(): void {
        let bubbleComp = FguiScriptUtils.toMyScriptClass(this.view.bubbleComp, FactoryOtherBubble);
        if (this._state == FactoryProductLineState.Occupied && this._productLineVo.occupyPlayerBaseVo.id != GIns.playerModel.playerId) {
            //其他人占领时
            bubbleComp.showUI(this._productLineVo.occupyPlayerBaseVo);
        } else {
            bubbleComp.hideUI();
        }
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
        let remainTime: number = this._nextRefreshTime - nowTime
        if (remainTime < 0) {
            //倒计时结束 刷新生产线信息
            this.removeTimer()
            GIns.factoryModel.sendVisitFactoryInfo({ targetId: this._belongPlayerId })
            return
        }
        if (this._state == FactoryProductLineState.Idle && this._belongPlayerId != GIns.playerModel.playerId) {
            //不是 自己的工厂 那么不显示刷新倒计时
            return
        }
        this.view.lbBoxTime.text = TimeUtils.formatTimeMsToPositiveTimeText(remainTime) + this._nextRefreshTimeSuffix
        this.view.boxProgress.value = remainTime
    }

    protected updateQuality(force: boolean = false): void {
        let quality = 0
        if (this._productLineCfg && this._state > FactoryProductLineState.Idle) {
            quality = this._productLineCfg.quality
        }
        if (this._quality != quality || force) {
            this._quality = quality
            if (this._isLoadedSpineTrans) {
                let spineTrans = this.view.spineTrans as ModelNode
                let aniName: string = this._tranAniNames[quality]
                if (this._state == FactoryProductLineState.Occupied) {
                    //播放
                    spineTrans.playOrders([{
                        name: aniName,
                        isLoop: true
                    }])
                } else {
                    //暂停
                    spineTrans.playOrders([{
                        name: aniName,
                        isLoop: false
                    }])
                    spineTrans.gotoAndStop(1)
                }
            }
            this.view.getController('quality').selectedIndex = quality
        }
    }

    protected updateBox(): void {
        if (this._state == FactoryProductLineState.Occupied) {
            this.view.boxProgress.min = 0
            this.view.boxProgress.max = this._productLineVo.endTime - this._productLineVo.startTime
            this.boxBtn.isOpen(true)
        } else {
            this.boxBtn.isOpen(false)
        }
        this.boxBtn.setQuaiity(this._productLineCfg ? this._productLineCfg.quality : 0)
    }

    protected updateHeros(): void {
        let positionVisitVos = this._productLineVo?.occupyFormationVisitVo?.positionVisitVos
        this._heroModels?.forEach((model, index) => {
            if (positionVisitVos && index < positionVisitVos.length) {
                model.visible = true
                this._heroShadows[index].visible = true
                let heroCfg = G.TableManager.getDataById(table.hero.HeroConfig, positionVisitVos[index].heroBaseId)
                if (heroCfg) {
                    model.loadByModelId(heroCfg?.showModelId)
                    model.playOrders([{
                        name: 'idle',
                        isLoop: true
                    }])
                    return
                }
            }
            model.visible = false
            this._heroShadows[index].visible = false
        })
    }

    protected clearHeros(): void {
        this._heroModels?.forEach((model) => {
            model.visible = false
        })
        this._heroShadows?.forEach((shadow) => {
            shadow.visible = false
        })
    }

    /**更新体力*/
    public updatePower(): void {
        this.powerItem.resetByNoItem(GIns.factoryModel.constCfg.powerIcon, GIns.factoryModel.myVo.powerVo.power, true, GIns.factoryModel.constCfg.maxPower)
    }

    /**生产线是否改变 改变了 就要强刷*/
    protected isProductLineChange(oldVo: ProductLineSimpleVo, newVo: Vo.factory.ProductLineVo): boolean {
        if (oldVo == null || newVo == null) {
            return true
        }
        if (oldVo.id != newVo.productLineId) {
            return true
        }
        if (oldVo.configId != newVo.productLineConfigId) {
            return true
        }
        if (oldVo.occupyId != newVo?.occupyPlayerBaseVo?.id) {
            return true
        }
        return false
    }

    protected updateSimpleVo(): void {
        if (this._productLineVo) {
            this._lastSimpleVo.id = this._productLineVo.productLineId
            this._lastSimpleVo.configId = this._productLineVo.productLineConfigId
            this._lastSimpleVo.occupyId = this._productLineVo.occupyPlayerBaseVo ? this._productLineVo.occupyPlayerBaseVo.id : 0
        } else {
            this._lastSimpleVo.id = 0
            this._lastSimpleVo.configId = 0
            this._lastSimpleVo.occupyId = 0
        }
    }

    /**更新生产线信息*/
    public updateProductLineByVisit(data: Vo.factory.PlayerFactoryVisitVo): void {
        let forceUpdate: boolean = false
        let state = FactoryProductLineState.None
        if (data) {
            if (this.isProductLineChange(this._lastSimpleVo, data.productLineVo)) {
                forceUpdate = true
            }
            this._belongPlayerId = data.playerBaseVo.id
            this._productLineVo = data.productLineVo
            state = GIns.factoryModel.getProductLineState(this._productLineVo)
            if (this._productLineVo && (this._productLineCfg == null || this._productLineCfg?.id != this._productLineVo.productLineConfigId)) {
                this._productLineCfg = G.TableManager.getDataById(table.factory.FactoryProductLineConfig, this._productLineVo.productLineConfigId)
            }
        } else {
            this._productLineVo = null
            this._productLineCfg = null
        }
        this.updateSimpleVo()
        this.setState(state, forceUpdate)
    }

    /**清理生产线*/
    public clearProductLine(): void {
        this.updateProductLineByVisit(null)
    }

    /**更新我的占领列表*/
    public updateMyOccupyList(): void {
        this._occupys = GIns.factoryModel.myVo.occupyProductLineVos.concat().reverse()
        while (this._occupys.length < GIns.factoryModel.constCfg.occupyProductLineMaxCount) {
            this._occupys.unshift(null)
        }
        if (this.view.listOccupy.numItems != this._occupys.length) {
            this.view.listOccupy.numItems = this._occupys.length
            this.view.listOccupy.resizeToFit()
        } else {
            this.view.listOccupy.refreshVirtualList()
        }
        this.view.lbOccupyCnt.text = `占领队列：${GIns.factoryModel.myVo.occupyProductLineVos?.length}/${GIns.factoryModel.maxSameTimeOccupyCount}`

    }
}
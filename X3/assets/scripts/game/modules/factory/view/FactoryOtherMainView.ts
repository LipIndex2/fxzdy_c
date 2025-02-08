import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIPage } from "../../../../core/mvc/view/UIPage";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { StringUtils } from "../../../../core/utils/StringUtils";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { PlayerCom } from "../../../ui/main/item/PlayerCom";
import { PlayerAvatar } from "../../common/playerInfo/PlayerAvatar";
import { FactoryOtherMainType } from "../const/FactoryEnum";
import { FactoryOtherMainViewOpenArgs, UIFactoryConfig } from "../const/UIFactoryConfig";
import { FactoryMainPanel } from "./component/FactoryMainPanel";

/**
 * 星际工厂其他工厂主界面
 */
@bindScript(UIFactoryConfig.FactoryOtherMainView)
export class FactoryOtherMainView extends UIPage {

    static pkgName: string = "factory";
    static viewName: string = "FactoryOtherMainView";

    protected _args: FactoryOtherMainViewOpenArgs = null
    protected _prevIndex: number = -1
    protected _nextIndex: number = -1
    protected _curIndex: number = -1
    protected _curPlayerId: number = 0
    protected _curVisitVo: Vo.factory.PlayerFactoryVisitVo = null
    protected _lastRequestTimeMap: Map<number, number> = new Map()
    /**刷新间隔*/
    protected _requestInterval: number = 600000
    /**检测空数据范围 因为是*/
    protected _checkNullDataOffset: number = 4
    private get view(): ui.factory.view.FactoryOtherMainView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.FACTORY_OCCUPY_PUSH,
            NotificationKey.FACTORY_VISIT_UPDATE,
            NotificationKey.FACTORY_PRODUCT_LINE_UPDATE,
            NotificationKey.FACTORY_RANK_UPDATE
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.FACTORY_OCCUPY_PUSH:
                this.tryToRequestData(true)
                break
            case NotificationKey.FACTORY_VISIT_UPDATE:
                if (args == this._curPlayerId) {
                    this._curVisitVo = GIns.factoryModel.getVisitInfo(this._curPlayerId)
                    this.updateUI()
                }
                break
            case NotificationKey.FACTORY_PRODUCT_LINE_UPDATE:
                if (this._curVisitVo
                    && (this._curVisitVo.productLineVo == null
                        || this._curVisitVo?.productLineVo?.productLineId == args)) {
                    this.updateUI()
                }
                break
            case NotificationKey.FACTORY_RANK_UPDATE:
                if (this._args.type == FactoryOtherMainType.Rank) {
                    this.updateUI()
                    this.updatePageUI()
                }
                break
        }
    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.btnPrev.onClick(this.onClickPrev, this)
        this.view.btnNext.onClick(this.onClickNext, this)
        this.avatarPrev.customClickFunc = this.onClickPrev.bind(this)
        this.avatarNext.customClickFunc = this.onClickNext.bind(this)
        this.view.btnBack.onClick(this.closeSelf, this)
    }

    protected onPreDispose(): void {

    }

    protected onClickPrev(): void {
        this.setIndex(this._prevIndex)
    }

    protected onClickNext(): void {
        this.setIndex(this._nextIndex)
    }

    public get mainPanel(): FactoryMainPanel {
        return FguiScriptUtils.toMyScriptClass(this.view.pMain, FactoryMainPanel)
    }

    public get avatar(): PlayerAvatar {
        return FguiScriptUtils.toMyScriptClass(this.view.playerHead.avatar, PlayerAvatar)
    }

    public get avatarPrev(): PlayerAvatar {
        return FguiScriptUtils.toMyScriptClass(this.view.avatarPrev, PlayerAvatar)
    }

    public get avatarNext(): PlayerAvatar {
        return FguiScriptUtils.toMyScriptClass(this.view.avatarNext, PlayerAvatar)
    }

    protected setIndex(index: number): void {
        if (this._curIndex != index && index >= 0 && index < this._args?.allDatas?.length) {
            this._curIndex = index
            this._curPlayerId = this._args.allDatas[index].baseVo.id
            this._curVisitVo = GIns.factoryModel.getVisitInfo(this._curPlayerId)
            this.updateUI()
            this.updatePageUI()
        }
    }

    /**更新个人信息*/
    protected updatePlayer(data: Vo.player.PlayerBaseVo): void {
        let pleyrComp = FguiScriptUtils.toMyScriptClass(this.view.playerHead, PlayerCom);
        pleyrComp.isShowName(true);
        pleyrComp.resetByPlayerInfo(data);
    }

    protected updatePageUI(): void {
        let myPlayerId: number = GIns.playerModel.playerId
        this._prevIndex = -1
        let prevIndex: number = this._curIndex - 1
        while (prevIndex >= 0) {
            let lastData = this._args.allDatas[prevIndex]
            if (lastData && lastData.baseVo.id != myPlayerId) {
                this._prevIndex = prevIndex
                break
            }
            prevIndex--
        }

        this._nextIndex = -1
        let nextIndex: number = this._curIndex + 1
        while (nextIndex < this._args.allDatas.length) {
            let nextData = this._args.allDatas[nextIndex]
            if (nextData && nextData.baseVo.id != myPlayerId) {
                this._nextIndex = nextIndex
                break
            }
            nextIndex++
        }

        this.view.gPrev.visible = this._prevIndex != -1
        if (this._prevIndex != -1) {
            this.avatarPrev.resetByPlayerInfo(this._args.allDatas[this._prevIndex].baseVo)
        }

        this.view.gNext.visible = this._nextIndex != -1
        if (this._nextIndex != -1) {
            this.avatarNext.resetByPlayerInfo(this._args.allDatas[this._nextIndex].baseVo)
        }


        let checkNullIndex: number = Math.min(this._args.allDatas.length - 1, this._curIndex + this._checkNullDataOffset)
        let checkNullData: Vo.factory.PlayerFactoryBaseVo = this._args.allDatas[checkNullIndex]
        if (this._args.type == FactoryOtherMainType.Rank && checkNullData == undefined) {
            GIns.factoryModel.RequestRankByIndex(checkNullIndex)
        }
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
        if (this._curVisitVo) {
            this.updatePlayer(this._curVisitVo.playerBaseVo)
        }
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
        if (!isReopen || (isReopen && this._args != args)) {
            this._args = args
            this._curIndex = -1
            this.mainPanel.updatePower()
            this.mainPanel.updateMyOccupyList()
            this.setIndex(this._args.index)
            return
        }
        this.mainPanel.updatePower()
        this.mainPanel.updateMyOccupyList()
        this.updateUI()
    }

    protected onClose(dontDispose?: boolean): void {

    }
}
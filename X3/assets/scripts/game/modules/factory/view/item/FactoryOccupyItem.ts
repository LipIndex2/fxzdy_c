import * as fgui from "fairygui-cc";
import G from "../../../../../core/comm/G";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { FguiScriptUtils } from "../../../../../core/utils/FguiScriptUtils";
import { TimeUtils } from "../../../../comm/utils/TimeUtils";
import GIns from "../../../../GIns";
import { RedDotCom } from "../../../common/redDot/redDotCom";
import { RedDotKeys } from "../../../common/redDot/RedDotKeys";
import { FactoryOtherMainType } from "../../const/FactoryEnum";
import { FactoryOtherMainViewOpenArgs, UIFactoryConfig } from "../../const/UIFactoryConfig";
import { FactoryBoxBtn } from "../component/FactoryBoxBtn";

/**
 * 星际工厂占领信息item
 */
@bindFguiExtension('ui://factory/FactoryOccupyItem')
export class FactoryOccupyItem extends fgui.GButton {

    static pkgName: string = "factory";
    static viewName: string = "FactoryOccupyItem";

    protected _vo: Vo.factory.ProductLineBriefVo = null
    protected _timerKey: string = null

    private get view(): ui.factory.item.FactoryOccupyItem {
        return this as any;
    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.onClick(this.onClickItem, this)
    }

    protected onPreDispose(): void {
        this.removeTimer()
    }

    protected onClickItem(): void {
        if (this._vo == null) {
            return
        }
        if (this.view.getController('state').selectedIndex == 1) {
            //可领取状态
            GIns.factoryModel.sendDrawProductLine({ productLineId: this._vo.productLineId, skip: false })
        } else {
            if (this._vo.belongPlayerId == GIns.playerModel.playerId) {
                //是我的工厂
                if (G.UIManager.isActive(UIFactoryConfig.FactoryOtherMainView)) {
                    G.UIManager.close(UIFactoryConfig.FactoryOtherMainView)
                }
                G.UIManager.open(UIFactoryConfig.FactoryProductLineWin, this._vo.productLineId)
            } else {
                let baseVo = {
                    id: this._vo.belongPlayerId
                } as Vo.player.PlayerBaseVo
                let vo: Vo.factory.PlayerFactoryBaseVo = {
                    baseVo: baseVo,
                    productLineConfigId: this._vo.productLineConfigId,
                    occupyEndTime: this._vo.endTime
                }
                G.UIManager.open(UIFactoryConfig.FactoryOtherMainView, FactoryOtherMainViewOpenArgs.create([vo], 0, FactoryOtherMainType.Other), () => {
                    G.UIManager.open(UIFactoryConfig.FactoryProductLineWin, this._vo.productLineId)
                })
            }
        }
    }

    protected get boxBtn(): FactoryBoxBtn {
        return FguiScriptUtils.toMyScriptClass(this.view.btnBox, FactoryBoxBtn)
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
        if (this._vo) {
            let nowTime: number = G.TimeManager.serverNow
            let remainTime: number = this._vo.endTime - nowTime
            if (remainTime < 0) {
                this.removeTimer()
                this.view.getController('state').selectedIndex = 1
                this.boxBtn.isOpen(false)
                return
            }
            this.view.getController('state').selectedIndex = 0
            this.view.lbTime.text = TimeUtils.formatTimeMsToPositiveTimeText(remainTime)
        }
    }

    public setData(data: Vo.factory.ProductLineBriefVo, index: number): void {
        this._vo = data
        if (data) {
            let cfg = G.TableManager.getDataById(table.factory.FactoryProductLineConfig, data?.productLineConfigId)
            this.boxBtn.setQuaiity(cfg ? cfg.quality : 0)
            this.boxBtn.isOpen(true)
            this.boxBtn.setBoxState(0)
            this.addTimer()
            FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom).reset(RedDotKeys.Factory_occupyReward_item, [data.productLineId])
        } else {
            this.removeTimer()
            this.view.getController('state').selectedIndex = 2
            let realIndex = GIns.factoryModel.constCfg.occupyProductLineMaxCount - index - 1
            if (realIndex < GIns.factoryModel.maxSameTimeOccupyCount) {
                //空闲
                this.view.lbLock.text = '未占领'
                this.boxBtn.setBoxState(1)
                this.boxBtn.setQuaiity(1)
            } else {
                //未解锁
                let needLv: number = GIns.factoryModel.getUnlockOccupyCountLv(realIndex)
                this.view.lbLock.text = `${needLv}级解锁`
                this.boxBtn.setBoxState(2)
                this.boxBtn.setQuaiity(1)
            }
        }
        this.view.touchable = data != null
    }
}
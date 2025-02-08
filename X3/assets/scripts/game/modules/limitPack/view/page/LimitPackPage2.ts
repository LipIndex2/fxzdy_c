import * as fgui from "fairygui-cc";
import G from "../../../../../core/comm/G";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { TimeUtils } from "../../../../comm/utils/TimeUtils";
import { MallData, MallModel, MallPopupData } from "../../../mall/model/MallModel";
import { LimitPackItem2 } from "../item/LimitPackItem2";
import { FguiScriptUtils } from "../../../../../core/utils/FguiScriptUtils";
import { ModelNode } from "../../../common/node/ModelNode";


@bindFguiExtension('ui://limitPack/LimitPackPage2')
export class LimitPackPage2 extends fgui.GComponent {

    static pkgName: string = "limitPack";
    static viewName: string = "LimitPackPage2";

    protected _preCount: number = 2
    protected _endTime: number = 0
    protected _mallDatas: MallData[] = []
    protected _initModelX: number = 0
    protected _initModelY: number = 0

    private get view(): ui.limitPack.page.LimitPackPage2 {
        return this as any;
    }

    protected onInit(): void {
        this.view.list.setVirtual()
        this.view.list.itemRenderer = this.itemRendererForItem.bind(this)
        G.GameTimer.loop(500, this, this.onTimer)
    }

    protected onTimer(): void {
        let diffTime = Math.max(0, this._endTime - G.TimeManager.serverNow)
        this.view.lbTime.text = TimeUtils.formatTimeMsToPositiveTimeText(diffTime) + '后礼包消失'
    }

    protected itemRendererForItem(index: number, item: LimitPackItem2): void {
        let startIndex = index * this._preCount
        let startData = this._mallDatas[startIndex]
        let endData = null
        if (startIndex + 1 < this._mallDatas.length) {
            endData = this._mallDatas[startIndex + 1]
        }
        let lastData = null
        if (startIndex > 0) {
            lastData = this._mallDatas[startIndex - 1]
        }
        let isLast = endData == null || startIndex + 1 == this._mallDatas.length - 1
        item.setData([startData, endData], lastData, index % this._preCount != 0, isLast)
    }

    public updateUI(data: MallPopupData): void {
        if (this._initModelX == 0) {
            this._initModelX = this.view.modelNode.x
            this._initModelY = this.view.modelNode.y
        }
        this._endTime = data.endTime
        this._mallDatas.length = 0
        data.cfg.goodsIds?.forEach((id: number) => {
            let mallData = MallModel.ins().getMallData(id)
            if (mallData) {
                this._mallDatas.push(mallData)
            }
        })
        this.view.list.numItems = Math.ceil(this._mallDatas.length / this._preCount)
        this.onTimer()

        let firstUnSelloutIndex = this._mallDatas.findIndex((value) => MallModel.ins().isSellOut(value) == false)
        if (firstUnSelloutIndex != -1) {
            let scrollIndex = Math.floor(firstUnSelloutIndex / this._preCount)
            this.view.list.scrollToView(scrollIndex, false, true)
        }

        if (data.cfg.tips) {
            this.view.panelTip.visible = true
            this.view.bgTip.visible = false
            this.view.lbTip.text = data.cfg.tips
            G.GameTimer.callLater(this, ()=> {
                if (this.view?.node?.isValid) {
                    this.view.bgTip.visible = true
                }
            })
        } else {
            this.view.panelTip.visible = false
        }

        let iconPath = data.cfg.iconPath
        if (iconPath) {
            this.view.modelNode.visible = true
            let modelNode = FguiScriptUtils.toMyScriptClass(this.view.modelNode, ModelNode)
            modelNode.setScale(4, 4)
            modelNode.loadByPath(iconPath)
            if (iconPath.indexOf('zm_npc') != -1) {
                modelNode.playOrders([
                    {
                        name: 'activing',
                        isLoop: true
                    }
                ])
            } else {
                modelNode.playOrders([
                    {
                        name: 'idle',
                        isLoop: true
                    }
                ])
            }
            let allModelCfgs = G.TableManager.getAllData(table.model.ModelConfig)
            let modelCfg = allModelCfgs.find((value) => value.modelPath == iconPath)
            if (modelCfg && modelCfg.showOffsetPos) {
                modelNode.x = this._initModelX + modelCfg.showOffsetPos.x
                modelNode.y = this._initModelY + modelCfg.showOffsetPos.y
            } else {
                modelNode.x = this._initModelX
                modelNode.y = this._initModelY
            }
        } else {
            this.view.modelNode.visible = false
        }

        let mallCfg = G.TableManager.getDataById(table.mall.MallPopupConfig, data.id)
        this.view.picTitle.icon = mallCfg.titlePath
    }

    public onPreDispose(): void {
        G.GameTimer.clearAll(this)
    }
}
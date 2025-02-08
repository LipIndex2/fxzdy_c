import * as fgui from "fairygui-cc";
import G from "../../../../../core/comm/G";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { FguiScriptUtils } from "../../../../../core/utils/FguiScriptUtils";
import { TimeUtils } from "../../../../comm/utils/TimeUtils";
import { ServerEnums } from "../../../../../libs/extras/ServerEnums";
import { ChargeI18nKeys } from "../../../charge/const/ChargeI18nKeys";
import { ItemFrameBtn } from "../../../common/item/ItemFrameBtn";
import { ItemListComp } from "../../../common/item/ItemListComp";
import { ModelNode } from "../../../common/node/ModelNode";
import { ItemUtils } from "../../../item/utils/ItemUtils";
import { MallController } from "../../../mall/MallController";
import { MallData, MallModel, MallPopupData } from "../../../mall/model/MallModel";

@bindFguiExtension('ui://limitPack/LimitPackPage4')
export class LimitPackPage4 extends fgui.GComponent {

    static pkgName: string = "limitPack";
    static viewName: string = "LimitPackPage4";

    protected _initModelX: number = 0
    protected _initModelY: number = 0

    protected _preCount: number = 2
    protected _endTime: number = 0
    protected _mallDatas: MallData[] = []
    protected _firstMallData: MallData = null
    protected _rewards: { k: any, v: any }[] = []

    private get view(): ui.limitPack.page.LimitPackPage4 {
        return this as any;
    }

    protected onInit(): void {
        G.GameTimer.loop(500, this, this.onTimer)
        this.view.buyBtn.onClick(this.onClickBuy, this)
    }

    protected onClickBuy():void {
        MallController.ins().buyMall(this._firstMallData.cfg)
    }

    protected onTimer(): void {
        let diffTime = Math.max(0, this._endTime - G.TimeManager.serverNow)
        this.view.cdLb.text =  `${TimeUtils.formatTimeMsToPositiveTimeText(diffTime)}后礼包消失`
    }

    protected itemRendererForReward(index: number, item: ItemFrameBtn): void {
        item.resetByConfigKv(this._rewards[index])
    }

    public updateUI(data: MallPopupData): void {
        this._endTime = data.endTime
        this._mallDatas.length = 0

        if (this._initModelX == 0) {
            this._initModelX = this.view.modelNode.x
            this._initModelY = this.view.modelNode.y
        }

        data.cfg.goodsIds?.forEach((id: number) => {
            let mallData = MallModel.ins().getMallData(id)
            if (mallData) {
                this._mallDatas.push(mallData)
            }
        })
        this.onTimer()
        this._firstMallData = this._mallDatas.length > 0 ? this._mallDatas[0] : null
        if (this._firstMallData == null) {
            //没有数据
            return
        }
        this._rewards = []
        if (this._firstMallData.orderCfg) {
            this._rewards = this._firstMallData.orderCfg.rewards?.concat()
            this.view.buyBtn.title = G.I18nManager.lang(ChargeI18nKeys.price, this._firstMallData.orderCfg.price / 100)
        } else if (this._firstMallData.costCfg) {
            this._rewards = this._firstMallData.costCfg.rewards?.concat()
            this.view.buyBtn.title = G.I18nManager.lang(ChargeI18nKeys.free)
        }

        const noOwnerItems = ItemUtils.parseKvArrayToItemArray(this._rewards);
        const itemListComp = FguiScriptUtils.toMyScriptClass(this.view.itemList, ItemListComp);
        itemListComp.reset(noOwnerItems);

 
        let iconPath = data.cfg.iconPath;
        if (iconPath) {
            this.view.modelNode.visible = true;
            let modelNode = FguiScriptUtils.toMyScriptClass(this.view.modelNode, ModelNode);
            modelNode.loadByPath(iconPath);
            if (iconPath.indexOf('zm_npc') != -1) {
                modelNode.playOrders([
                    {
                        name: 'activing',
                        isLoop: true
                    }
                ])
                modelNode.setScale(4, 4)
            } else {
                modelNode.playOrders([
                    {
                        name: 'idle',
                        isLoop: true
                    }
                ])
                modelNode.setScale(1, 1)
            }
            let allModelCfgs = G.TableManager.getAllData(table.model.ModelConfig);
          
            let modelCfg = allModelCfgs.find((value) => value.modelPath == iconPath);
            if (modelCfg && modelCfg.showOffsetPos) {
                modelNode.x = this._initModelX + modelCfg.showOffsetPos.x;
                modelNode.y = this._initModelY + modelCfg.showOffsetPos.y;
            } else {
                modelNode.x = this._initModelX;
                modelNode.y = this._initModelY;
            }
        } else {
            this.view.modelNode.visible = false;
        }
    }

    protected onPreDispose(): void {
        G.GameTimer.clearAll(this);
    }
}
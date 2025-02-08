import * as fgui from "fairygui-cc";
import G from "../../../../../core/comm/G";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { TimeUtils } from "../../../../comm/utils/TimeUtils";
import { ServerEnums } from "../../../../../libs/extras/ServerEnums";
import { ChargeI18nKeys } from "../../../charge/const/ChargeI18nKeys";
import { ItemFrameBtn } from "../../../common/item/ItemFrameBtn";
import { MallData, MallModel, MallPopupData } from "../../../mall/model/MallModel";
import { MallController } from "../../../mall/MallController";


@bindFguiExtension('ui://limitPack/LimitPackPage3')
export class LimitPackPage3 extends fgui.GComponent {

    static pkgName: string = "limitPack";
    static viewName: string = "LimitPackPage3";

    protected _preCount: number = 2
    protected _endTime: number = 0
    protected _mallDatas: MallData[] = []
    protected _firstMallData: MallData = null
    protected _rewards: { k: any, v: any }[] = []
    protected _rewardEffect: any;

    private get view(): ui.limitPack.page.LimitPackPage3 {
        return this as any;
    }

    protected onInit(): void {
        this.view.listReward.setVirtual()
        this.view.listReward.itemRenderer = this.itemRendererForReward.bind(this)
        G.GameTimer.loop(500, this, this.onTimer)
        this.view.btnBuy.onClick(this.onClickBuy, this)
    }

    protected onClickBuy(): void {
        MallController.ins().buyMall(this._firstMallData.cfg)
    }

    protected onTimer(): void {
        let diffTime = Math.max(0, this._endTime - G.TimeManager.serverNow)
        this.view.lbTime.text = TimeUtils.formatTimeMsToPositiveTimeText(diffTime)
    }

    protected itemRendererForReward(index: number, item: ItemFrameBtn): void {
        item.resetByConfigKv(this._rewards[index])
        if (this._rewardEffect) {
            item.playOtherEffect(this._rewardEffect[index])
        }
        else {
            item.clearAnim()
        }
    }

    public updateUI(data: MallPopupData): void {
        this._endTime = data.endTime
        this._mallDatas.length = 0
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
            this._rewardEffect = this._firstMallData.orderCfg.effects;
            this.view.btnBuy.title = G.I18nManager.lang(ChargeI18nKeys.price, this._firstMallData.orderCfg.price / 100)
        } else if (this._firstMallData.costCfg) {
            this._rewards = this._firstMallData.costCfg.rewards?.concat()
            this.view.btnBuy.title = G.I18nManager.lang(ChargeI18nKeys.free)
        }
        this._rewards.sort((a, b) => {
            let cfgA = G.TableManager.getDataById(table.item.ItemConfig, a.k)
            let cfgB = G.TableManager.getDataById(table.item.ItemConfig, b.k)
            if (cfgA?.itemType != cfgB?.itemType) {
                if (ServerEnums.ItemType[cfgA?.itemType] == ServerEnums.ItemType.EQUIP) {
                    return -1
                } else {
                    return 1
                }
            } else {
                return cfgB?.id - cfgA?.id
            }
        })
        this.view.listReward.numItems = this._rewards.length

        if (this._rewards?.length > 0) {
            let firstReward = this._rewards[0]
            let cfg = G.TableManager.getDataById(table.item.ItemConfig, firstReward.k)
            if (cfg) {
                this.view.iconLoader.icon = cfg.bigIconPath
                this.view.lbName.text = cfg.name
            }
        }

        this.view.lbDes.text = data.cfg.adTip
        this.view.lbFight.text = data.cfg.adTip2
        if (data.cfg.tips) {
            this.view.panelTip.visible = true
            this.view.bgTip.visible = false
            this.view.lbTip.text = data.cfg.tips
            G.GameTimer.callLater(this, () => {
                if (this.view?.node?.isValid) {
                    this.view.bgTip.visible = true
                }
            })
        } else {
            this.view.panelTip.visible = false
        }
    }

    public onPreDispose(): void {
        G.GameTimer.clearAll(this)
    }
}
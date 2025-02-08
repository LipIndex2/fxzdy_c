import { Tween } from "cc";
import { EnumRedDotShowType } from "db://assets/scripts/game/modules/common/redDot/enums/EnumRedDotShowType";
import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import GIns from "../../../GIns";
import { ItemFrameBtn } from "../../common/item/ItemFrameBtn";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { CornerMark } from "../../common/view/CornerMark";
import { ConditionManager } from "../../condition/ConditionManager";
import { MallController } from "../../mall/MallController";
import { MallData, MallModel } from "../../mall/model/MallModel";
import { ChargeI18nKeys } from "../const/ChargeI18nKeys";


/** 限购商城item2 */
export class ChargeLimitItem2 extends fgui.GComponent {
    static pkgName: string = "charge";
    static viewName: string = "ChargeLimitItem2";

    protected _mallData: MallData = null
    protected _firstRewardId: number = 0
    protected _rewards: { k: any, v: any }[] = []

    private get view(): ui.charge.item.ChargeLimitItem2 {
        return this as any;
    }

    constructor() {
        super();
    }

    protected onInit() {
        this.view.btnBuy.onClick(this.onClickBuy, this)
        this.view.listReward.itemRenderer = this.itemRendererForReward.bind(this)
    }

    protected itemRendererForReward(index: number, item: ItemFrameBtn): void {
        item?.reset(this._rewards[index].k, this._rewards[index].v)
    }

    protected onClickBuy(): void {
        if (this._mallData.cfg.buyConditions && !ConditionManager.ins().checkCondition(this._mallData.cfg.buyConditions)) {
            let openTip = ConditionManager.ins().getOpenConditionTips(this._mallData.cfg.buyConditions)
            GIns.floatingTextMgr.showTips(openTip);
            return;

        }
        MallController.ins().buyMall(this._mallData.cfg)
    }

    protected onPreDispose(): void {
        Tween.stopAllByTarget(this.view)
    }

    public setData(data: MallData): void {
        this._mallData = data
        this.view.lbName.text = data.orderCfg ? data.orderCfg?.goodsName : data?.cfg.name
        if (data.cfg.buyLimit > 0) {
            //存在限购
            let remainCount = Math.max(0, data.cfg.buyLimit - data.buyNum)
            this.view.lbLimit.text = G.I18nManager.lang(ChargeI18nKeys.limitBuyCount, remainCount, data.cfg.buyLimit)
        } else {
            this.view.lbLimit.text = ''
        }
        let isSellOut: boolean = MallModel.ins().isSellOut(data)
        this.view.pSellOut.visible = isSellOut
        let price: number = 0

        if (data.orderCfg) {
            price = data.orderCfg.price / 100
        }
        if (isSellOut) {
            this.view.btnBuy.enabled = false
            this.view.btnBuy.title = G.I18nManager.lang(ChargeI18nKeys.sellOut)
        } else {
            this.view.btnBuy.enabled = true
            if (price > 0) {
                this.view.btnBuy.title = G.I18nManager.lang(ChargeI18nKeys.price, price)
            } else {
                this.view.btnBuy.title = G.I18nManager.lang(ChargeI18nKeys.free)
            }
        }

        this._rewards = MallModel.ins().getMallReward(data)
        this.view.listReward.numItems = this._rewards.length

        //@ts-ignore
        let redDotCom = this.view.redDot as RedDotCom
        redDotCom?.showByType(price == 0 && this.view.pSellOut.visible == false ? EnumRedDotShowType.REWARD : EnumRedDotShowType.NULL)

        let cornerMark = FguiScriptUtils.toMyScriptClass(this.view.cornerMark, CornerMark)
        if (data.cfg.markTip && !isSellOut) {
            cornerMark.showTip(data.cfg.markTip)
        } else {
            cornerMark.clearTip()
        }
    }
}
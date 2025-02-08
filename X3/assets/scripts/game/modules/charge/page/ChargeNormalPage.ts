import { math } from "cc";
import { GRoot } from "fairygui-cc";
import G from "../../../../core/comm/G";
import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UIView, ViewAdaptType } from "../../../../core/mvc/view/UIView";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import NotificationKey from "../../../event/NotificationKey";
import { EnumCurrencyItemId } from "../../backpack/vo/BackpackContext";
import { VipI18nKeys } from "../../vip/const/VipI18nKeys";
import { VipModel } from "../../vip/model/VipModel";
import { UIChargeConfig } from "../const/UIChargeConfig";
import { ChargeNormalRowItem } from "../item/ChargeNormalRowItem";
import { GListEffectType } from "../../../../core/prototypes/FguiGListEffect";


/** 基础充值页面 */
@bindScript(UIChargeConfig.CHARGE_NORMAL_PAGE)
export class ChargeNormalPage extends UIView {
    static pkgName: string = "charge";
    static viewName: string = "ChargeNormalPage";

    protected _layer: EnumUIViewLayer = EnumUIViewLayer.SUBVIEW;
    protected adaptType = ViewAdaptType.TOP;

    /**每行商品数量*/
    protected perRowCount: number = 3

    protected _goodDatas: table.order.ChargeGoodsConfig[][] = []

    private get view(): ui.charge.page.ChargeNormalPage {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.CHARGE_COMPLETE,
            NotificationKey.VIP_EXP_CHANGE,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.CHARGE_COMPLETE:
                this.updateUI()
                break
            case NotificationKey.VIP_EXP_CHANGE:
                this.updateVip()
                break
        }
    }

    protected onInit() {
        //@ts-ignore
        let headItem = this.view.headerItem as HeaderItem
        headItem.reset(EnumCurrencyItemId.DIAMOND, false, false)

        this.view.btnPrivilege.title = G.I18nManager.lang(VipI18nKeys.privilege)
        this.view.btnPrivilege.onClick(this.onClickPrivilege, this)
        this.view.list.setVirtual()
        this.view.list.effectType = GListEffectType.Custom
        this.view.list.itemRenderer = this.itemRendererForGoods.bind(this)

        if (GRoot.inst.height > 1334) {
            let maxOffsetH = 1626 - 1334
            let minOffsetH = GRoot.inst.height - 1334
            if (minOffsetH > maxOffsetH) {
                minOffsetH = maxOffsetH
            }
            //超过设计尺寸
            let offsetY = math.lerp(16, 80, minOffsetH / maxOffsetH)
            this.view.headerItem.y = offsetY
        }
    }

    protected onClickPrivilege(): void {
        this.emitNow(NotificationKey.GOTO_VIP_PAGE)
    }

    protected itemRendererForGoods(index: number, item: ChargeNormalRowItem): void {
        item.setData(this._goodDatas[index], index * this.perRowCount, this.view.list)
    }

    public updateUI(): void {
        if (this._goodDatas.length == 0) {
            let datas: table.order.ChargeGoodsConfig[][] = []
            let preRowDatas: table.order.ChargeGoodsConfig[] = []
            let cfgs: table.order.ChargeGoodsConfig[] = G.TableManager.getAllData(table.order.ChargeGoodsConfig)
            let count: number = 0
            cfgs.forEach((value) => {
                if (ServerEnums.ChargeGoodsType[value.goodsType] == ServerEnums.ChargeGoodsType.NORMAL) {
                    //过滤普通商品
                    preRowDatas.push(value)
                    count++
                    if (count >= this.perRowCount) {
                        datas.push(preRowDatas)
                        preRowDatas = []
                        count = 0
                    }
                }
            })
            if (preRowDatas.length > 0) {
                //还有多余数据没保存
                datas.push(preRowDatas)
            }
            this._goodDatas = datas
            this.updateVip()
        }

        this.view.list.numItems = this._goodDatas.length
    }

    public updateVip(): void {
        this.view.lbVip.text = 'VIP ' + VipModel.ins().vipLv

        if (VipModel.ins().isMaxVip || VipModel.ins().nextCfg == null) {
            //已满级
            this.view.lbVipDes.text = G.I18nManager.lang(VipI18nKeys.maxLvTip)
            this.view.progressVip.min = 0
            this.view.progressVip.max = VipModel.ins().vipExp
            this.view.progressVip.value = VipModel.ins().vipExp
            return
        }

        let needVipValue = VipModel.ins().nextCfg.minExp - VipModel.ins().vipExp
        let ratio = VipModel.ins().getVipExpRatioFromOrder()
        let needPrice = Math.ceil(needVipValue / ratio)
        this.view.lbVipDes.text = G.I18nManager.lang(VipI18nKeys.nextLvTip, needPrice, VipModel.ins().nextLv)
        this.view.progressVip.min = 0
        this.view.progressVip.max = VipModel.ins().nextCfg.minExp
        this.view.progressVip.value = VipModel.ins().vipExp
    }


    protected onOpen(args: any, isReopen?: boolean): void {
        //每次打开都需要播放特效
        this.view.list.resetRefreshTimes();
        this.updateUI()
    }

    protected onClose(): void {

    }
}
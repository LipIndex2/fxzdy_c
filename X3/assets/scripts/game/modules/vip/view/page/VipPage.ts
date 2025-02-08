import G from "../../../../../core/comm/G";
import { EnumUIViewLayer } from "../../../../../core/comm/LayerManager";
import { bindScript } from "../../../../../core/comm/UIScriptManager";
import { UIView, ViewAdaptType } from "../../../../../core/mvc/view/UIView";
import { GListEffectType } from "../../../../../core/prototypes/FguiGListEffect";
import { FguiScriptUtils } from "../../../../../core/utils/FguiScriptUtils";
import { UiTweenMgr } from "../../../../../core/comm/UiTweenMgr";
import NotificationKey from "../../../../event/NotificationKey";
import { EnumCurrencyItemId } from "../../../backpack/vo/BackpackContext";
import { UIChargeConfig } from "../../../charge/const/UIChargeConfig";
import { EnumRedDotShowType } from "../../../common/redDot/enums/EnumRedDotShowType";
import { RedDotCom } from "../../../common/redDot/redDotCom";
import { MallData, MallModel } from "../../../mall/model/MallModel";
import { EnumRuleKeys } from "../../../rule/enums/EnumRuleKeys";
import { RuleController } from "../../../rule/RuleController";
import { VipI18nKeys } from "../../const/VipI18nKeys";
import { VipAdditionDesc, VipModel } from "../../model/VipModel";
import { VipAdditionItem } from "./VipAdditionItem";
import { VipGoodsItem } from "./VipGoodsItem";

/** VIP页面 */
@bindScript(UIChargeConfig.CHARGE_VIP_PAGE)
export class VipPage extends UIView {
    static pkgName: string = "vip";
    static viewName: string = "VipPage";

    protected _layer: EnumUIViewLayer = EnumUIViewLayer.SUBVIEW;
    protected adaptType = ViewAdaptType.TOP;

    protected _curLv: number = 0
    protected _additionDesList: VipAdditionDesc[] = []
    protected _goodsList: MallData[] = []
    protected _maxShowLv: number = 0

    protected _initOffsetAdditionY:number = 0

    private get view(): ui.vip.page.VipPage {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.MALL_DATA_CHANGE_BY_ID,
            NotificationKey.MALL_DATA_CHANGE_BY_TYPE,
            NotificationKey.VIP_EXP_CHANGE,
            NotificationKey.VIP_LV_CHANGE,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.MALL_DATA_CHANGE_BY_ID:
            case NotificationKey.MALL_DATA_CHANGE_BY_TYPE:
                this.updateGoodsUI()
                break
            case NotificationKey.VIP_EXP_CHANGE:
                this.updateExpUI()
                break
            case NotificationKey.VIP_LV_CHANGE:
                this.updateGoodsUI()
                this.updateMaxShowLv()
                this.updatePageBtns()
        }
    }

    protected onInit() {
        //@ts-ignore
        let headItem = this.view.headerItem as HeaderItem
        headItem.reset(EnumCurrencyItemId.DIAMOND, true)

        this.view.btnPrev.onClick(this.onClickPrev, this)
        this.view.btnNext.onClick(this.onClickNext, this)
        this.view.panelContent.listAddition.setVirtual()
        this.view.panelContent.listGoods.setVirtual()
        this.view.panelContent.listAddition.itemRenderer = this.itemRendererForAddition.bind(this)
        this.view.panelContent.listGoods.itemRenderer = this.itemRendererForGoods.bind(this)
        this.view.panelContent.listAddition.effectType = GListEffectType.FADE_IN
        this.view.panelContent.listGoods.effectType = GListEffectType.FADE_IN
        this.view.panelContent.listAddition.effectParams = { delay: 0.4, interval: 0.06 }
        this.view.panelContent.listGoods.effectParams = { delay: 0.4, interval: 0.06 }

        this.view.btnRule.onClick(this.onClickRule, this)

        this._initOffsetAdditionY = this.view.panelContent.listAddition.y - (this.view.panelContent.listGoods.y + this.view.panelContent.listGoods.height)
    }

    protected onClickRule(): void {
        RuleController.ins().openRule(EnumRuleKeys.VIP, this.view.btnRule)
    }

    protected onClickPrev(): void {
        this.setCurLv(this._curLv - 1)
    }

    protected onClickNext(): void {
        this.setCurLv(this._curLv + 1)
    }

    protected itemRendererForAddition(index: number, item: VipAdditionItem): void {
        item.setData(this._additionDesList[index])
    }

    protected itemRendererForGoods(index: number, item: VipGoodsItem): void {
        item.setData(this._goodsList[index])
    }

    protected updateExpUI(): void {
        this.view.lbVipLv.text = VipModel.ins().vipLv + ''

        if (VipModel.ins().isMaxVip || VipModel.ins().nextCfg == null) {
            //已满级
            this.view.lbDes.text = G.I18nManager.lang(VipI18nKeys.maxLvTip)
            this.view.expProgress.min = 0
            this.view.expProgress.max = VipModel.ins().vipExp
            this.view.expProgress.value = VipModel.ins().vipExp
            return
        }
        let needVipValue = VipModel.ins().nextCfg.minExp - VipModel.ins().vipExp
        let ratio = VipModel.ins().getVipExpRatioFromOrder()
        let needPrice = Math.ceil(needVipValue / ratio)
        this.view.lbDes.text = G.I18nManager.lang(VipI18nKeys.nextLvTip, needPrice, VipModel.ins().nextLv)
        this.view.expProgress.min = 0
        this.view.expProgress.max = VipModel.ins().nextCfg.minExp
        this.view.expProgress.value = VipModel.ins().vipExp
    }

    /**更新商品列表*/
    protected updateGoodsUI(): void {
        let allGoods = MallModel.ins().getMallListForVip(this._curLv)
        this._goodsList.length = 0
        allGoods?.forEach((value) => {
            if (MallModel.ins().isSellOut(value) == false) {
                this._goodsList.push(value)
            }
        })
        this.view.panelContent.listGoods.numItems = this._goodsList.length
        this.view.panelContent.listGoods.resizeToFit()
        if (this._goodsList.length <= 0) {
            //空了 就当刷新了一次
            this.view.panelContent.listGoods.refreshTimes++
        }

        if (this._goodsList.length <= 0) {
            this.view.panelContent.listAddition.y = 0
        } else {
            this.view.panelContent.listAddition.y = this._initOffsetAdditionY + (this.view.panelContent.listGoods.y + this.view.panelContent.listGoods.height)
        }
    }

    /**更新特权列表*/
    protected updateAdditionUI(): void {
        this._additionDesList = VipModel.ins().getAdditionDescList(this._curLv)
        //根据商品数量动态调整动效延时
        this.view.panelContent.listAddition.effectParams.delay = 0.4 + this._goodsList.length * 0.06
        this.view.panelContent.listAddition.numItems = this._additionDesList.length
        this.view.panelContent.listAddition.resizeToFit()
    }

    protected updatePageBtns(): void {
        if (this._maxShowLv == 1) {
            //只有一页 就不展示翻页
            this.view.btnPrev.visible = this.view.btnNext.visible = false
        } else {
            this.view.btnPrev.visible = this.view.btnNext.visible = true
            this.view.btnPrev.enabled = this._curLv > 1
            this.view.btnNext.enabled = this._curLv < this._maxShowLv
        }
        let prevRedDot = FguiScriptUtils.toMyScriptClass(this.view.btnPrev.redDot, RedDotCom)
        let nextRedDot = FguiScriptUtils.toMyScriptClass(this.view.btnNext.redDot, RedDotCom)
        if (this.view.btnPrev.visible && this.view.btnPrev.enabled) {
            //上一页可用时 判断是否显示红点
            this.updateBtnPageRedDot(1, this._curLv - 1, prevRedDot)
        } else {
            prevRedDot.showByType(EnumRedDotShowType.NULL)
        }
        if (this.view.btnPrev.visible && this.view.btnPrev.enabled) {
            //下一页可用时 判断是否显示红点
            this.updateBtnPageRedDot(this._curLv + 1, VipModel.ins().vipLv, nextRedDot)
        } else {
            nextRedDot.showByType(EnumRedDotShowType.NULL)
        }
    }

    protected updateBtnPageRedDot(minLv: number, maxLv: number, redDot: RedDotCom): void {
        let showType: EnumRedDotShowType = EnumRedDotShowType.NULL
        if (VipModel.ins().vipLv >= minLv) {
            for (let i = minLv; i <= maxLv; i++) {
                let allGoods = MallModel.ins().getMallListForVip(i)
                for (let i = 0; i < allGoods.length; i++) {
                    let mallData = allGoods[i]
                    if (MallModel.ins().isSellOut(mallData) == false && mallData.costCfg) {
                        if (mallData.costCfg.costItems?.length > 0) {
                            if (showType == EnumRedDotShowType.NULL) {
                                showType = EnumRedDotShowType.NORMAL
                            }
                        } else {
                            //免费商品
                            showType = EnumRedDotShowType.REWARD
                            break
                        }
                    }
                    if (showType == EnumRedDotShowType.REWARD) {
                        break
                    }
                }
            }
        }
        redDot.showByType(showType)
    }

    protected updateMaxShowLv(): void {
        this._maxShowLv = VipModel.ins().getMaxShowLv(VipModel.ins().vipLv)
    }

    public setCurLv(lv: number): void {
        if (lv > 0 && lv <= VipModel.ins().maxVipLv) {
            if (this._curLv != lv) {
                this._curLv = lv
                this.view.panelContent.scrollPane.scrollTop(false)
                this.updateUI()
            }
        }
    }

    public updateUI(): void {
        let showEffect: boolean = this.view.panelContent.listGoods.isShowEffect
        this.view.panelContent.listGoods.setPivot(0, 0)
        this.view.panelContent.listAddition.setPivot(0, 0)
        this.view.lbTitle.text = `VIP${this._curLv}` + G.I18nManager.lang(VipI18nKeys.privilege)
        this.updateGoodsUI()
        this.updateAdditionUI()
        this.updateExpUI()
        this.updatePageBtns()
        if (showEffect) {
            UiTweenMgr.ins().listShowEffect(this.view.panelContent.listGoods, this.view.bgCenter)
            UiTweenMgr.ins().listShowEffect(this.view.panelContent.listAddition)
        }
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this.view.panelContent.listGoods.resetRefreshTimes()
        this.view.panelContent.listAddition.resetRefreshTimes()
        if (this._curLv == 0) {
            //设置展示默认等级
            let defaultLv = VipModel.ins().vipLv
            if (defaultLv < 1) {
                defaultLv = 1
            }
            this.updateMaxShowLv()
            this.setCurLv(defaultLv)
            return
        }
        this.updateMaxShowLv()
        this.updateUI()
    }

    protected onClose(): void {
        UiTweenMgr.ins().removeTweenEffect(this.view.panelContent.listGoods, this.view.panelContent.listAddition, this.view.bgCenter)
    }
}
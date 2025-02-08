/**@format */
import G from "../../../../core/comm/G";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { UIHeroKey } from "../const/UIHeroConfig";
import { HeroModel } from "../model/HeroModule";
import { HeroManager } from "../HeroManager";
import { AttrConfigManager } from "db://assets/scripts/game/modules/attr/config/AttrConfigManager";
import { AttrEnum } from "../../../comm/battle/attribute/AttrEnum";
import { HeroConfigManager } from "../config/HeroConfigManager";
import { DNABtnClickType, dnaAwakenInfo, HeroPotentialPage } from "../page/HeroPotentialPage";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { DebugUtils } from "db://assets/scripts/core/utils/DebugUtils";

/**
 * 英雄潜能/DNA刷新词条弹窗界面
 */
@bindScript(UIHeroKey.HERO_DNA_TIP_WIN)
export class HeroDnaTipWin extends UICommWin {
    static pkgName: string = "hero";
    static viewName: string = "HeroDnaTipWin";

    /** 展示物品消耗确认弹窗 */
    private _showTip: boolean = true;

    private _baseId;
    private _stage;
    private _heroVo;
    private _DNAInfo;
    private _othersInfo;

    private get view(): ui.hero.view.HeroDnaTipWin {
        return this._view as any;
    }

    /***组件初始化 */
    protected onInit(): void {
        // 更新显示的状态
        // this._showTip = this.checkShowTip();
        // 界面初始化
        this.view.tipBtn.onClick(this.onCheckShow, this);
        this.view.btnNoUse.onClick(() => {
            this.closeSelf();
        }, this);
        this.view.btnUse.onClick(this.onUseItem, this);
        this.view.btnClose.onClick(() => {
            this.closeSelf();
        }, this);
        this.view.btnNo.onClick(this.onCancelChange, this);
        this.view.btnYes.onClick(this.onChangeAttr, this);
    }

    public onOpen(args: dnaAwakenInfo): void {
        this._baseId = args?.baseId;
        this._stage = args?.stage;
        this.view.getController("c1").selectedIndex = args.type;
        this._heroVo = HeroManager.ins().getHeroVoByID(this._baseId);
        this._DNAInfo = this._heroVo.getDNAInfo();
        this._othersInfo = args.others;
        this.updateUI();
    }

    private updateUI() {
        const awakenInfo = this._DNAInfo.awaken[this._stage];
        const awakenTempInfo = this._DNAInfo.awakenTemp[this._stage];

        const spAttr = awakenInfo?.attrs?.[0];
        const spAttrTemp = awakenTempInfo?.attrs?.[0];

        // 属性ID
        const id = spAttr ? AttrEnum[spAttr.k] : null;
        const idTemp = spAttrTemp ? AttrEnum[spAttrTemp.k] : null;

        // 配置
        const showAttr = id ? AttrConfigManager.getConfigById(id) : null;
        const showTempAttr = idTemp ? AttrConfigManager.getConfigById(idTemp) : null;

        if (id) {
            DebugUtils.isDebugMode() && console.log("当前阶段 " + this._stage + "--当前属性id " + spAttr.k + " " + id);
        }
        if (idTemp) {
            DebugUtils.isDebugMode() &&  console.log("当前阶段 " + this._stage + "--替换属性id " + spAttrTemp.k + " " + idTemp);
        }

        // 当前属性
        if (showAttr && spAttr) {
            const showAttrNum = this.formatAttrValue(showAttr.isPermyriad, spAttr.v);
            this.view.AttrLabel.text = `${showAttr.attrDesc}${showAttrNum}`;
            this.view.curAttrLabel.text = `${showAttr.attrDesc}${showAttrNum}`;
        }

        // 临时属性
        if (showTempAttr && spAttrTemp) {
            const showAttrTempNum = this.formatAttrValue(showTempAttr.isPermyriad, spAttrTemp.v);
            this.view.newAttrLabel.text = `${showTempAttr.attrDesc}${showAttrTempNum}`;
        }

        this.view.stageLabel.text = `阶段${this._stage}已觉醒`;
        const DNACfg = HeroConfigManager.getAwakenConfig(this._baseId, this._stage);
        if (!DNACfg) return;
        if (this._othersInfo && this._othersInfo.operaType) {
            let cost = DNACfg.costItems[0];
            let costName = ItemUtils.getItemConfigByItemId(cost.k)?.name;
            let showName = costName ? G.I18nManager.translateToChinese(costName) : "";
            let refreshCost = DNACfg.refreshCostItems[0];
            let refreshCostName = ItemUtils.getItemConfigByItemId(refreshCost.k)?.name;
            let refreshItemName = refreshCostName ? G.I18nManager.translateToChinese(refreshCostName) : "";
            if (this._othersInfo.operaType == DNABtnClickType.DNA_AWAKEN) {
                this.view.tipLabel1.text = `觉醒属性消耗${cost.v}个${showName}，探险家可以选择是否保留刷新后得属性，是否使用？`;
            } else if (this._othersInfo.operaType == DNABtnClickType.DNA_AWAKEN_FRESH) {
                this.view.tipLabel1.text = `刷新觉醒属性消耗${refreshCost.v}个${refreshItemName}，探险家可以选择是否保留刷新后得属性，是否使用？`;
            }
        }
    }

    /**
     * 格式化属性值
     */
    private formatAttrValue(isPermyriad: number, value: number): string {
        return isPermyriad === 1 ? `${value / 100}%` : `${value}`;
    }

    onCheckShow() {
        this._showTip = !this.view.tipBtn.selected;
        this.saveShowTipState(this._showTip);
    }

    onUseItem() {
        HeroModel.ins().sendDNAAwakenOrRefresh(this._baseId, this._stage);
    }

    onCancelChange() {
        HeroModel.ins().sendDNAAwakenReplace(this._baseId, this._stage, 1);
    }

    onChangeAttr() {
        HeroModel.ins().sendDNAAwakenReplace(this._baseId, this._stage, 0);
    }

    private saveShowTipState(state: boolean): void {
        localStorage.setItem("showTip", state.toString());
    }

    /**
     * 检查今天是否已经弹出了提示
     */
    private checkShowTip() {
        // const lastShowDate = localStorage.getItem("lastShowTipDate");
        // const currentDate = new Date().toISOString().slice(0, 10);
        // if (lastShowDate !== currentDate) {
        //     localStorage.setItem("lastShowTipDate", currentDate);
        //     return true; // 允许弹出
        // }
        // return localStorage.getItem("showTip") !== "false";
    }

    public onClose(): void {}
}

import * as fgui from "fairygui-cc";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import { ViewEffectComp } from "../../../../core/mvc/view/comp/ViewEffectComp";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UISecretAreaKey } from "../const/UISecretAreaConfig";
import GIns from "../../../GIns";
import G from "../../../../core/comm/G";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { NoOwnerItem } from "../../backpack/vo/NoOwnerItem";
import { ItemFrameBtn } from "../../common/item/ItemFrameBtn";
import { BtnChangGui1WithItem } from "../../common/btn/BtnChangGui1WithItem";

declare global {
    namespace ISecretArea {
        interface ISecretAreaSweepWin_viewArgs {
            floor: number
        }
    }
}

/**
 * 扫荡弹窗
 */
@bindScript(UISecretAreaKey.SecretAreaSweepWin)
export class SecretAreaSweepWin extends UICommWin {
    static pkgName: string = "secretArea";
    static viewName: string = "SecretAreaSweepWin";

    private costItem: Readonly<NoOwnerItem>;
    private max: number;
    private cfg: table.secretinstance.SecretInstanceConfig

    private get view(): ui.secretArea.win.SecretAreaSweepWin {
        return this._view as any;
    }

    public onInit(): void {
        let view = this.view;
        let bar = view.bar;
        bar.sliderCount.on(fgui.Event.STATUS_CHANGED, this.reflashView, this);
        bar.sliderCount.wholeNumbers = true;
        bar.btnAdd.onClick(this.onAdd, this);
        bar.btnMinus.onClick(this.onMinus, this);
        view.dropLIst.itemRenderer = this.dropRender.bind(this);
        view.dropLIst.setVirtual();

        let btnSweep = this.view.btn_sweep as unknown as BtnChangGui1WithItem;
        btnSweep.onClick(this.onSweepBtn, this);
        btnSweep.setLbStyle(1);
    }

    public onOpen(data: ISecretArea.ISecretAreaSweepWin_viewArgs): void {
        let view = this.view, sliderCount = view.bar.sliderCount;
        let { floor } = data;
        this.cfg = G.TableManager.getDataById(table.secretinstance.SecretInstanceConfig, floor);
        view.dropLIst.numItems = this.cfg.rewardStr.length;

        let difficultyDesc = ServerEnums.SecretInstanceType.NORMAL ? `普通难度${floor}` : `地狱难度${floor}`;
        view.T_LVName.text = `秘境·${difficultyDesc}`;

        let { dailyCostItem, extraCostItem } = GIns.secretAreaMgr;

        if (dailyCostItem.isCanPay()) {
            this.costItem = dailyCostItem;
        } else {
            this.costItem = extraCostItem;
        }

        this.max = Math.floor(GIns.backpackMgr.getItemCountByItemId(this.costItem.itemId) / this.costItem.count);
        sliderCount.max = this.max
        sliderCount.value = this.max;

        this.reflashView();
    }

    private onAdd() {
        if (this.view.bar.sliderCount.value < this.max) {
            this.view.bar.sliderCount.value += 1;
            this.reflashView();
        }
    }
    private onMinus() {
        if (this.view.bar.sliderCount.value > 1) {
            this.view.bar.sliderCount.value -= 1;
            this.reflashView();
        }
    }
    private reflashView() {
        if (this.view.bar.sliderCount.value < 1) {
            this.view.bar.sliderCount.value = 1;
        }
        this.view.dropLIst.refreshVirtualList();
        let btnSweep = this.view.btn_sweep as unknown as BtnChangGui1WithItem;
        btnSweep.resetForNoItem(
            btnSweep.title,
            this.costItem.getItemSmallIconPath(),
            this.costItem.count * this.view.bar.sliderCount.value,
            GIns.backpackMgr.getItemCountByItemId(this.costItem.itemId)
        );
    }

    private dropRender(index: number, item: ItemFrameBtn) {
        let dropInfo = this.cfg.rewardStr[index];
        item.setTopCount(dropInfo.v);
        item.reset(dropInfo.k, 0);
    }

    private onSweepBtn() {
        let count = this.view.bar.sliderCount.value;
        if (this.costItem.isCanPay()) {
            GIns.secretAreaModule.sendSweep(this.cfg.id, count);
            this.closeSelf();
        } else {
            GIns.floatingTextMgr.showTips("门票不足");
        }
    }
}
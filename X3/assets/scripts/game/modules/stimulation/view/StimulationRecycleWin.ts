import * as fgui from "fairygui-cc";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { NoOwnerItem } from "../../backpack/vo/NoOwnerItem";
import { BtnChangGui1WithItem } from "../../common/btn/BtnChangGui1WithItem";
import { HeaderItem } from "../../common/header/HeaderItem";
import { ItemFrameBtn } from "../../common/item/ItemFrameBtn";
import { UIStimulationConfig } from "../const/UIStimulationConfig";
import G from "../../../../core/comm/G";

/**
 * 派遣界面
 */
@bindScript(UIStimulationConfig.StimulationRecycleWin)
export class StimulationRecycleWin extends UICommWin {

    static pkgName: string = "stimulation";
    static viewName: string = "StimulationRecycleWin";

    protected _recycleCfg: table.stimulation.StimulationRecycleConfig = null;
    /**当前购买数量*/
    protected _curRecycleCnt: number = -1;
    /**最小购买数量*/
    protected _minRecycleCnt: number = 1;
    /**最大购买数量*/
    protected _maxRecycleCnt: number = 9999;
    /**数字正则*/
    protected _numReg: RegExp = /\d+/g;

    protected _costItem: NoOwnerItem = new NoOwnerItem();

    private get view(): ui.stimulation.view.StimulationRecycleWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.STIMULATION_RECYCLE_COMPLETE,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.STIMULATION_RECYCLE_COMPLETE:
                // this.closeSelf();
                break;
        }
    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.inputCurCnt.maxLength = 4
        this.view.inputCurCnt.on(fgui.Event.TEXT_CHANGE, this.onTextChange, this);
        this.view.btnAdd.onClick(this.onClickAdd, this);
        this.view.btnSub.onClick(this.onClickSub, this);
        this.view.btnRecycle.onClick(this.onClickRecycle, this);
        this.view.btnMax.onClick(this.onClickMax, this);
    }

    protected onPreDispose(): void {

    }

    protected onTextChange(): void {
        let arr = this.view.inputCurCnt.text.match(this._numReg)
        let numCnt: number = 1
        if (arr?.length > 0) {
            numCnt = Number(arr.join(''))
            if (isNaN(numCnt) || numCnt < this._minRecycleCnt) {
                numCnt = this._minRecycleCnt
            } else if (numCnt > this._maxRecycleCnt) {
                numCnt = this._maxRecycleCnt
            }
        }
        this.view.inputCurCnt.text = numCnt + ''
        this.setRecycleCnt(numCnt)
    }

    protected onClickAdd(): void {
        if (this._curRecycleCnt < this._maxRecycleCnt) {
            this.setRecycleCnt(this._curRecycleCnt + 1);
        }
    }

    protected onClickSub(): void {
        if (this._curRecycleCnt > this._minRecycleCnt) {
            this.setRecycleCnt(this._curRecycleCnt - 1);
        }
    }

    protected onClickRecycle(): void {
        if (!this.btnRecycle.isCanPay(true)) {
            GIns.floatingTextMgr.showTips(this.btnRecycle.getNoPayTip());
            return
        }
        GIns.stimulationModel.sendRecycle({ recycleId: this._recycleCfg.id, recycleNum: this._curRecycleCnt });
    }

    protected onClickMax(): void {
        let totalCnt: number = GIns.itemModel.getItemCountById(this._recycleCfg.costs[0].k);
        let maxCnt = Math.floor(totalCnt / this._recycleCfg.costs[0].v);
        if (maxCnt < this._minRecycleCnt) {
            maxCnt = this._minRecycleCnt;
        } else if (maxCnt > this._maxRecycleCnt) {
            maxCnt = this._maxRecycleCnt;
        }
        this.setRecycleCnt(maxCnt);
    }

    protected get btnRecycle(): BtnChangGui1WithItem {
        return FguiScriptUtils.toMyScriptClass(this.view.btnRecycle, BtnChangGui1WithItem)
    }

    protected get itemCost(): ItemFrameBtn {
        return FguiScriptUtils.toMyScriptClass(this.view.itemCost, ItemFrameBtn)
    }

    protected get itemReward(): ItemFrameBtn {
        return FguiScriptUtils.toMyScriptClass(this.view.itemReward, ItemFrameBtn)
    }

    protected setRecycleCnt(cnt: number): void {
        if (this._curRecycleCnt != cnt) {
            this._curRecycleCnt = cnt;
            this.view.inputCurCnt.text = cnt + '';

            this._costItem.itemId = this._recycleCfg.costs[0].k;
            this._costItem.count = this._recycleCfg.costs[0].v * cnt;
            this.btnRecycle.reset(`转换x${cnt}`, this._costItem)

            this.view.btnSub.enabled = this._curRecycleCnt > this._minRecycleCnt;
            this.view.btnAdd.enabled = this._curRecycleCnt < this._maxRecycleCnt;

            this.itemCost.reset(this._costItem.itemId, this._costItem.count);
            this.itemReward.reset(this._recycleCfg.rewards[0].k, cnt * this._recycleCfg.rewards[0].v);
        }
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this._recycleCfg = GIns.stimulationModel.getRecycleCfg(args);
        if (this._recycleCfg == null) {
            this.closeSelf();
            return;
        }

        this.itemCost.resetByConfigKv(this._recycleCfg.costs[0]);
        this.itemReward.resetByConfigKv(this._recycleCfg.rewards[0]);

        let headerItemCost = FguiScriptUtils.toMyScriptClass(this.view.headerCost, HeaderItem);
        headerItemCost.reset(this._recycleCfg.costs[0].k, false);

        let headerItemReward = FguiScriptUtils.toMyScriptClass(this.view.headerReward, HeaderItem);
        headerItemReward.reset(this._recycleCfg.rewards[0].k, false);

        this.view.lbTip.text = G.I18nManager.lang(this._recycleCfg.desc, headerItemReward.itemCfg?.name)

        this.setRecycleCnt(this._minRecycleCnt);
    }

    protected onClose(dontDispose?: boolean): void {

    }
}
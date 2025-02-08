import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { FguiNotificationGComponent } from "../../../../../core/mvc/view/FguiNotificationGComponent";
import { FguiScriptUtils } from "../../../../../core/utils/FguiScriptUtils";
import NotificationKey from "../../../../event/NotificationKey";
import GIns from "../../../../GIns";
import { NoOwnerItem } from "../../../backpack/vo/NoOwnerItem";
import { BtnChangGui1WithItem } from "../../../common/btn/BtnChangGui1WithItem";
import { ItemFrameBtn } from "../../../common/item/ItemFrameBtn";
import { ILeagueExploreBuildingVo } from "../../model/vo/ILeagueExploreBuildingVo";
import { ILeagueExploreHangUpVo } from "../../model/vo/ILeagueExploreHangUpVo";

/**
 * 勘探快速挂机item
 */
@bindFguiExtension('ui://leagueExplore/LeagueExploreQuickItem')
export class LeagueExploreQuickItem extends FguiNotificationGComponent {

    static pkgName: string = "leagueExplore";
    static viewName: string = "LeagueExploreQuickItem";

    /**当前购买数量*/
    protected _curCnt: number = -1;
    /**最小购买数量*/
    protected _minCnt: number = 1;
    /**最大购买数量*/
    protected _maxCnt: number = 99999999;
    /**数字正则*/
    protected _numReg: RegExp = /\d+/g;

    protected _costItem: NoOwnerItem = new NoOwnerItem();

    protected _vo: ILeagueExploreHangUpVo = null;
    protected _buildingVo: ILeagueExploreBuildingVo = null;
    protected _fastRewardItems: NoOwnerItem[] = [];
    protected _rewards: { k: number, v: number }[] = [];

    listenNotifications(): string[] {
        return [
            NotificationKey.EVENT_CHANGE_ITEMS
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.EVENT_CHANGE_ITEMS:
                if (args?.has(this._vo?.costs[0]?.k)) {
                    let curCnt:number = this._curCnt;
                    this._curCnt = -1;
                    this.resetUI(curCnt);
                }
        }
    }

    private get view(): ui.leagueExplore.item.LeagueExploreQuickItem {
        return this as any;
    }

    /***组件初始化 */
    protected onInit(): void {
        super.onInit();
        this.btnDrawComp.setLbStyle(1);
        this.view.inputCurCnt.maxLength = 8;
        this.view.inputCurCnt.on(fgui.Event.TEXT_CHANGE, this.onTextChange, this);
        this.view.btnAdd.onClick(this.onClickAdd, this);
        this.view.btnSub.onClick(this.onClickSub, this);
        this.view.btnDraw.onClick(this.onClickDraw, this);

        this.view.listReward.setVirtual();
        this.view.listReward.itemRenderer = this.itemRendererForReward.bind(this);
    }

    protected onPreDispose(): void {
        super.onPreDispose();
    }

    protected get btnDrawComp(): BtnChangGui1WithItem {
        return FguiScriptUtils.toMyScriptClass(this.view.btnDraw, BtnChangGui1WithItem);
    }

    protected itemRendererForReward(index: number, item: ItemFrameBtn): void {
        item.resetByConfigKv(this._rewards[index]);
    }

    protected onTextChange(): void {
        let arr = this.view.inputCurCnt.text.match(this._numReg)
        let numCnt: number = 1
        if (arr?.length > 0) {
            numCnt = Number(arr.join(''))
            if (isNaN(numCnt) || numCnt < this._minCnt) {
                numCnt = this._minCnt
            } else if (numCnt > this._maxCnt) {
                numCnt = this._maxCnt
            }
        }
        this.view.inputCurCnt.text = numCnt + ''
        this.setCnt(numCnt)
    }

    protected onClickAdd(): void {
        if (this._curCnt < this._maxCnt) {
            this.setCnt(this._curCnt + 1);
        }
    }

    protected onClickSub(): void {
        if (this._curCnt > this._minCnt) {
            this.setCnt(this._curCnt - 1);
        }
    }

    protected onClickDraw(): void {
        if (!this.btnDrawComp.isCanPay(true)) {
            GIns.floatingTextMgr.showTips(this.btnDrawComp.getNoPayTip());
            return
        }
        GIns.leagueExploreModel.sendFastExplore({ advanced: this._vo.isAdvanced, count:this._curCnt });
    }

    protected setCnt(cnt: number): void {
        if (this._curCnt != cnt) {
            this._curCnt = cnt;
            this.view.inputCurCnt.text = cnt + '';

            this._costItem.itemId = this._vo.costs[0].k;
            this._costItem.count = this._vo.costs[0].v * cnt;
            this.btnDrawComp.reset(`使用`, this._costItem)

            this.view.btnSub.enabled = this._curCnt > this._minCnt;
            this.view.btnAdd.enabled = this._curCnt < this._maxCnt;

            this._rewards.length = 0;
            let time = cnt * this._vo.hangUpMinutes * 60000;
            this._fastRewardItems.forEach((value) => {
                let itemCnt = Math.floor(time * value.count / 3600000);
                if (itemCnt > 0) {
                    this._rewards.push({ k: value.itemId, v: itemCnt });
                }
            })
            this.view.listReward.numItems = this._rewards.length;
        }
    }

    protected resetUI(defaultCnt: number): void {
        this._maxCnt = Math.max(this._minCnt, Math.floor(GIns.itemModel.getItemCountById(this._vo.costs[0].k) / this._vo.costs[0].v));
        if (defaultCnt > this._maxCnt) {
            defaultCnt = this._maxCnt;
        }
        if (defaultCnt < this._minCnt) {
            defaultCnt = this._minCnt;
        }
        this.setCnt(defaultCnt);
    }

    public setData(data: ILeagueExploreHangUpVo, buildingVo: ILeagueExploreBuildingVo): void {
        this._vo = data;
        this._buildingVo = buildingVo;
        this._fastRewardItems.length = 0;
        if (buildingVo) {
            this._fastRewardItems.push(NoOwnerItem.create(buildingVo.cfg.item1Id, buildingVo.cfg.item1HourOutputCount));
            // this._fastRewardItems.push(NoOwnerItem.create(buildingVo.cfg.item2Id, buildingVo.cfg.item2HourOutputCount));
        }
        this.resetUI(this._minCnt);
    }
}
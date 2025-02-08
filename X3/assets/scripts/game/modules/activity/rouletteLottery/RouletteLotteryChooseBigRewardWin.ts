import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { ColorUtils } from "../../../../core/utils/ColorUtils";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { ActivitySyncData } from "../../../comm/activity/model/ActivityModel";
import GIns from "../../../GIns";
import { ItemFrameBtn } from "../../common/item/ItemFrameBtn";
import { QualityUtils } from "../../common/quality/QualityUtils";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { UIActivityKey } from "../const/UIActivityConfig";
import { ActivityRouletteLotteryVo } from "../model/ActivityRouletteLotteryVo";

@bindScript(UIActivityKey.RouletteLotteryChooseBigRewardWin)
export class RouletteLotteryChooseBigRewardWin extends UICommWin {
    static pkgName: string = "activityRouletteLottery";
    static viewName: string = "RouletteLotteryChooseBigRewardWin";

    private get view(): ui.activityRouletteLottery.RouletteLotteryChooseBigRewardWin {
        return this._view as any;
    }

    private _vo: ActivityRouletteLotteryVo;
    private _chooseIndex: number = -1;
    private _bigRewardArray = [];

    onInit(): void {
        this.view.itemList.setVirtual();
        this.view.itemList.itemRenderer = this.irItem.bind(this);
    }

    protected onOpen(args: ActivityRouletteLotteryVo, isReopen?: boolean) {
        this._vo = args;
        this._chooseIndex = this._vo.bigRewardIndex;

        this._bigRewardArray = this._vo.getBigRewards();
        this.view.itemList.numItems = this._bigRewardArray.length;
        this.view.T_round.text = `已抽出大奖轮数：[color=#3bda74]${this._vo.round - 1}[/color]`;

        this.updateBigReward();
    }

    private irItem(index: number, view: ui.activityFlipCard.item.ChooseAwardItem) {
        const itemKV = this._bigRewardArray[index];
        //@ts-ignore
        let item = view.item as ItemFrameBtn;
        item.reset(itemKV.k, itemKV.v);
        if (!this._vo.roundCfg.bigRewardArray[index]) {
            let count = this._vo.getBigRewardUnlockRound(itemKV);
            item.isShowName(true);
            item.isShowLockDesc(true, `${count}轮后解锁`);
            item.isShowNameGray();
        } else {
            item.isShowName(true);
            item.isShowLockDesc(false);
        }
        item.grayed = false;

        //可选次数
        let count = this._vo.getBigRewardLeftChooseCount(index);
        if (count > 0) {
            view.T_count.visible = true;
            view.T_Tips.visible = false;
        } else if (count == 0) {
            view.T_count.visible = true;
            view.T_Tips.visible = true;
            item.grayed = true;
        } else {
            view.T_count.visible = false;
            view.T_Tips.visible = false;
        }
        view.T_count.text = `剩余次数:${count}`;

        const isChoose = this._chooseIndex == index;
        item.setHaveGain(isChoose);
        item.isCanClick(false);
        item.isShowCount(false);

        view.clearClick();
        if (this._vo.roundCfg.bigRewardArray[index]) {
            view.onClick(() => {
                if (count == 0) {
                    GIns.floatingTextMgr.showTips("当前奖励次数已达上限");
                } else {
                    // this._vo.sendChooseBigReward(index);

                    this._chooseIndex = index;
                    this.view.itemList.refreshVirtualList();
                    this.updateBigReward();
                }
            }, this);
        }
    }

    private updateBigReward() {
        const myChooseBigReward = this._vo.roundCfg.bigRewardArray[this._chooseIndex];
        this.view.T_chooseTips.color = ColorUtils.createColor("#BDD8E5");
        if (myChooseBigReward) {
            FguiScriptUtils.toMyScriptClass(this.view.bigReward, ItemFrameBtn).reset(myChooseBigReward.k, myChooseBigReward.v);
            //@ts-ignore
            this.view.bigReward.isShowLockDesc(false);
            //@ts-ignore
            this.view.bigReward.isShowCount(false);

            let itemCfg = ItemUtils.getItemConfigByItemId(myChooseBigReward.k);
            this.view.T_chooseTips.text = itemCfg?.name;
            QualityUtils.setFGUIFontColorByQuality(this.view.T_chooseTips, itemCfg?.quality);
        }
    }

    onClose() {
        if (this._chooseIndex != this._vo.bigRewardIndex) {
            this._vo.bigRewardIndex = this._chooseIndex;
            let syncData = {
                activityId: this._vo.activityId,
                itemId: "JACKPOT",
                hidePopWin: 1,
                otherParams: this._chooseIndex.toString(),
            } as ActivitySyncData;
            GIns.activityModel.sendBuyGoods(syncData);
        }
    }
}

import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { ColorUtils } from "../../../../core/utils/ColorUtils";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { ActivitySyncData } from "../../../comm/activity/model/ActivityModel";
import GIns from "../../../GIns";
import { ItemFrameBtn } from "../../common/item/ItemFrameBtn";
import { QualityUtils } from "../../common/quality/QualityUtils";
import { FloatingTextManager } from "../../floatingText/FloatingTextManager";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { UIActivityKey } from "../const/UIActivityConfig";
import { ActivitySummonHeroVo } from "../model/ActivitySummonHeroVo";

@bindScript(UIActivityKey.SummonHeroChooseBigRewardWin)
export class SummonHeroChooseBigRewardWin extends UICommWin {
    static pkgName: string = "activitySummonHero";
    static viewName: string = "SummonHeroChooseBigRewardWin";

    private _vo: ActivitySummonHeroVo;
    private _chooseId: number = -1;

    private get view(): ui.activitySummonHero.SummonHeroChooseBigRewardWin {
        return this._view as any;
    }

    protected onInit() {
        super.onInit();

        this.view.T_title.text = "选择大奖";

        // this.view.btnChooseBig.onClick(this.onClickChoose, this);
        this.view.btnClose.onClick(() => {
            this.closeSelf();
        }, this);

        this.view.itemList.setVirtual();
        this.view.itemList.itemRenderer = this.irItem.bind(this);
    }

    // onClickChoose() {
    //     if (this._vo.bigRewardId) {
    //         this.view.bigReward.fireClick();
    //     }
    // }

    irItem(index: number, view: ui.activityFlipCard.item.ChooseAwardItem) {
        let itemId = this._vo.roundCfgs[this._vo.roundCfgs.length - 1].jackpots[index];

        //@ts-ignore
        let item = view.item as ItemFrameBtn;
        item.reset(itemId, 1);
        if (!this._vo.roundCfg.jackpots[index]) {
            let count = this._vo.getBigRewardUnlockRound(itemId);
            item.isShowLockDesc(true, `${count}轮后解锁`);
            item.isShowNameGray();
        } else {
            item.isShowLockDesc(false);
        }
        item.isShowName(true);
        item.grayed = false;

        //可选次数
        let count = this._vo.getBigRewardLeftChooseCount(itemId);
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

        const isChoose = this._chooseId == itemId;
        item.setHaveGain(isChoose);
        item.isCanClick(false);
        item.isShowCount(false);

        view.clearClick();
        if (this._vo.roundCfg.jackpots[index]) {
            view.onClick(() => {
                if (count == 0) {
                    GIns.floatingTextMgr.showTips("当前奖励次数已达上限");
                } else {
                    this._chooseId = itemId;
                    this.view.itemList.refreshVirtualList();
                    this.updateBigReward();
                }
            }, this);
        }
    }

    private updateBigReward() {
        let itemCfg = ItemUtils.getItemConfigByItemId(this._chooseId);
        FguiScriptUtils.toMyScriptClass(this.view.bigReward, ItemFrameBtn).reset(this._chooseId, 1);
        //@ts-ignore
        this.view.bigReward.isShowLockDesc(false);
        //@ts-ignore
        this.view.bigReward.isShowCount(false);

        this.view.T_chooseTips.text = itemCfg.name;
        QualityUtils.setFGUIFontColorByQuality(this.view.T_chooseTips, itemCfg?.quality);
    }

    protected onOpen(args: ActivitySummonHeroVo, isReopen?: boolean) {
        this._vo = args;

        this.view.T_desc.text = `${this._vo.miniCount}次${this._vo.title}必得心愿英雄`;
        this._chooseId = this._vo.bigRewardId;

        this.view.itemList.numItems = this._vo.roundCfgs[this._vo.roundCfgs.length - 1].jackpots.length;

        if (this._vo.isAllRoundFinish) {
            this.view.T_round.text = `已抽出大奖轮数：[color=#3bda74]${this._vo.round}[/color]`;
        } else {
            this.view.T_round.text = `已抽出大奖轮数：[color=#3bda74]${this._vo.round - 1}[/color]`;
        }

        this.updateBigReward();
    }

    onClose() {
        if (this._chooseId !== this._vo.bigRewardId) {
            this._vo.bigRewardId = this._chooseId;
            let syncData = {
                activityId: this._vo.activityId,
                itemId: "JACKPOT",
                hidePopWin: 1,
                otherParams: this._vo.bigRewardId.toString(),
            } as ActivitySyncData;
            GIns.activityModel.sendBuyGoods(syncData);
            GIns.activityModel.sendActivity(this._vo.activityId);
        }
    }
}

import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import { bindScript } from "db://assets/scripts/core/comm/UIScriptManager";
import { UIActivityKey } from "db://assets/scripts/game/modules/activity/const/UIActivityConfig";
import { ItemFrameBtn } from "db://assets/scripts/game/modules/common/item/ItemFrameBtn";
import { ActivityFlipCardModelVo } from "db://assets/scripts/game/modules/activity/model/ActivityFlipCardModelVo";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { FloatingTextManager } from "db://assets/scripts/game/modules/floatingText/FloatingTextManager";
import { ColorUtils } from "../../../../../core/utils/ColorUtils";
import { QualityUtils } from "../../../common/quality/QualityUtils";
import GIns from "../../../../GIns";

@bindScript(UIActivityKey.ActivityFlipCardChooseBigRewardWin)
export class ActivityFlipCardChooseBigRewardWin extends UICommWin {
    static pkgName: string = "activityFlipCard";
    static viewName: string = "ActivityFlipCardChooseBigRewardWin";

    private _vo: ActivityFlipCardModelVo;
    private _chooseIndex: number = -1;
    private _bigRewardArray = [];

    private get view(): ui.activityFlipCard.win.ActivityFlipCardChooseBigRewardWin {
        return this._view as any;
    }

    protected onInit() {
        super.onInit();

        this.view.T_title.text = "选择大奖";
        this.view.T_desc.text = "请选择本层大奖";

        this.view.btnChooseBig.onClick(this.onClickChoose, this);
        this.view.btnClose.onClick(() => {
            this.closeSelf();
        }, this);

        this.view.itemList.setVirtual();
        this.view.itemList.itemRenderer = this.irItem.bind(this);
    }

    onClickChoose() {
        if (this._vo.isChooseBigReward()) {
            this.view.bigReward.fireClick();
        }
    }

    irItem(index: number, view: ui.activityFlipCard.item.ChooseAwardItem) {
        const itemKV = this._bigRewardArray[index];
        //@ts-ignore
        let item = view.item as ItemFrameBtn;
        item.reset(itemKV.k, itemKV.v);
        if (!this._vo.getConfig().bigRewardArray[index]) {
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
        if (this._vo.getConfig().bigRewardArray[index]) {
            view.onClick(() => {
                if (count == 0) {
                    GIns.floatingTextMgr.showTips("当前奖励次数已达上限");
                } else {
                    // 已抽到大奖
                    const isFlipBigReward = this._vo.isHaveFlipBigReward();
                    if (isFlipBigReward) {
                        FloatingTextManager.ins().showTips("已抽到大奖, 不允许更换选择");
                        return;
                    }

                    this._vo.sendChooseBigReward(index);

                    this._chooseIndex = index;
                    this.view.itemList.refreshVirtualList();
                    this.updateBigReward();
                }
            }, this);
        }
    }

    private updateBigReward() {
        this.view.bigReward.visible = this._vo.isChooseBigReward();
        const myChooseBigReward = this._vo.getMyChooseBigReward();
        this.view.T_chooseTips.color = ColorUtils.createColor("#BDD8E5");
        if (myChooseBigReward) {
            FguiScriptUtils.toMyScriptClass(this.view.bigReward, ItemFrameBtn).resetByNoOwnerItem(myChooseBigReward);
            //@ts-ignore
            this.view.bigReward.isShowLockDesc(false);
            //@ts-ignore
            this.view.bigReward.isShowCount(false);

            this.view.T_chooseTips.text = myChooseBigReward.getItemName();
            QualityUtils.setFGUIFontColorByQuality(this.view.T_chooseTips, myChooseBigReward.getItemConfig()?.quality);
        }
    }

    protected onOpen(args: ActivityFlipCardModelVo, isReopen?: boolean) {
        this._vo = args;

        this._chooseIndex = this._vo.getMyChooseBigRewardIndex();

        this._bigRewardArray = this._vo.getBigRewards();
        this.view.itemList.numItems = this._bigRewardArray.length;

        this.view.T_round.text = `已抽出大奖轮数：[color=#3bda74]${this._vo.getCurrentRoundId() - 1}[/color]`;

        this.updateBigReward();
    }
}

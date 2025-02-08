import G from "db://assets/scripts/core/comm/G";
import { UICommWin } from "../../../../../core/mvc/view/UICommWin";
import { BackpackManager } from "db://assets/scripts/game/modules/backpack/BackpackManager";
import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { math } from "cc";
import { ItemModel } from "db://assets/scripts/game/modules/item/model/ItemModel";
import { ItemCompoundUtils } from "db://assets/scripts/game/modules/item/utils/ItemCompoundUtils";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { ItemFrameBtn } from "db://assets/scripts/game/modules/common/item/ItemFrameBtn";
import { RedDotUtils } from "db://assets/scripts/game/modules/common/redDot/utils/RedDotUtils";
import { EnumRedDotShowType } from "db://assets/scripts/game/modules/common/redDot/enums/EnumRedDotShowType";


export interface ItemSyntheticWinOpenArgs {
    itemId: number
}

/**
 * 道具碎片合成
 */
export class ItemSyntheticWin extends UICommWin {

    static pkgName: string = "item";
    static viewName: string = "ItemSyntheticWin";

    // 选中的物品配置
    private _itemConfig: table.item.ItemConfig;
    // 合并目标的数量
    private _composeCount: number = 0;
    private _maxComposeCount: number;


    private get view(): ui.item.win.ItemSyntheticWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return null;
    }

    notificationHandler(eventName: string, args?: any): void {
        // switch(eventName){
        // }

    }


    public onInit(): void {
        G.Logger.debug(" onInit ");

        this.view.slider.btnAdd.onClick(this.onClickAdd, this);
        this.view.slider.btnMinus.onClick(this.onClickMinus, this);
        this.view.slider.sliderCount.on(FGUI.Event.STATUS_CHANGED, this.onProgressChanged, this);
        this.view.btnOk.onClick(this.onClickUse, this);
    }

    onClickAdd() {
        this._composeCount = Math.min(this._composeCount + 1, this._maxComposeCount);
        this.refreshUseCount();
    }

    onClickMinus() {
        this._composeCount = Math.max(this._composeCount - 1, 0);
        this.refreshUseCount();
    }

    private onProgressChanged() {
        this._composeCount = Math.ceil(this.view.slider.sliderCount.value / 100 * this._maxComposeCount)

        this.refreshUseCount();
    }


    public onOpen(args: ItemSyntheticWinOpenArgs): void {
        G.Logger.debug(" onOpen ")

        // bg mask
        // FGUIMaskUtils.createBackgroundMask(this.view)


        // 初始化列表

        const itemConfig = ItemUtils.getItemConfigByItemId(args.itemId);

        this.reset(itemConfig)
    }

    private reset(itemConfig: table.item.ItemConfig) {
        this._itemConfig = itemConfig;
        const itemId = itemConfig.id;

        this.view.labelTitle.text = itemConfig.name;
        this.view.labelItemName.text = itemConfig.name;
        this.view.labelContent.text = itemConfig.desc;

        const haveCount = BackpackManager.ins().getItemCountByItemId(itemId);
        const maxComposeCount = ItemCompoundUtils.getMaxCompoundCount(itemId);

        this._maxComposeCount = maxComposeCount;
        this._composeCount = maxComposeCount;

        const redDotCom = RedDotUtils.castComp(this.view.redDot);
        if (this._maxComposeCount > 0) {
            redDotCom.showByType(EnumRedDotShowType.NORMAL);
        } else {
            redDotCom.showByType(EnumRedDotShowType.NULL);
        }

        this.view.slider.sliderCount.value = 100;

        // 持有数量/最大合成数量
        this.view.labelHoldCount.text = `[color=#33ff00]${haveCount}[/color]`;


        FguiScriptUtils.toMyScriptClass(this.view.itemBtn, ItemFrameBtn)
            .reset(itemId, maxComposeCount);
        this.view.itemBtn.item.T_num.visible = false;

        this.refreshUseCount();
    }

    onClickUse() {
        if (this._composeCount <= 0) {
            return;
        }

        const itemId = this._itemConfig.id;
        const compoundRewardId = ItemCompoundUtils.getCompoundRewardIdByItemId(itemId);
        if (compoundRewardId == 0) {
            console.error(`没有找到合成奖励的配置! itemId = ${itemId}`);
            this.closeSelf();
            return;
        }

        // net
        ItemModel.ins().sendCompound({
            rewardId: compoundRewardId,
            num: this._composeCount
        });


        this.closeSelf();
    }

    private refreshUseCount() {
        const isCan = this._composeCount > 0;
        this.view.btnOk.touchable = isCan;
        this.view.btnOk.grayed = !isCan;

        const itemId = this._itemConfig.id;
        const maxMergeCount = ItemCompoundUtils.getMaxCompoundCount(itemId)
        this.view.labelCount.text = `${this._composeCount}/${maxMergeCount}`;

        // 进度条
        const isCanUse = this._maxComposeCount > 0;
        if (isCanUse) {
            // [0, 100]
            let progressValue = 0;
            if (this._composeCount > 0) {
                progressValue = math.clamp(this._composeCount / this._maxComposeCount * 100, 0, 100);
            }
            if (this._maxComposeCount == 1) {
                if (progressValue > 50) {
                    this.view.slider.sliderCount.value = 100
                } else {
                    this.view.slider.sliderCount.value = 0
                }
            } else {
                this.view.slider.sliderCount.value = progressValue
            }
            this.view.slider.sliderCount.update();


        } else {
            this.view.slider.sliderCount.value = 0;

        }

        this.view.slider.btnAdd.grayed = !isCanUse;
        this.view.slider.btnMinus.grayed = !isCanUse;

        this.view.slider.btnAdd.touchable = isCanUse;
        this.view.slider.btnMinus.touchable = isCanUse;

    }
}
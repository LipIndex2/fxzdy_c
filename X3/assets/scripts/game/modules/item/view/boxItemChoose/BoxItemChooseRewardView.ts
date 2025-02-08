import G from "db://assets/scripts/core/comm/G";
import ArrayUtils from "db://assets/scripts/core/utils/ArrayUtils";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { ItemIconWithChooseCount } from "db://assets/scripts/game/modules/common/item/ItemIconWithChooseCount";
import { ItemI18nKeys } from "db://assets/scripts/game/modules/item/const/ItemI18nKeys";
import { ItemModel } from "db://assets/scripts/game/modules/item/model/ItemModel";
import { BoxFixedRewardItemConfigVo } from "db://assets/scripts/game/modules/item/structs/BoxFixedRewardItemConfigVo";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import * as fgui from "fairygui-cc";
import { UICommWin } from "../../../../../core/mvc/view/UICommWin";
import { ItemFrameBtn } from "../../../common/item/ItemFrameBtn";
import GIns from "../../../../GIns";
import { QualityUtils } from "../../../common/quality/QualityUtils";
import { DebugUtils } from "db://assets/scripts/core/utils/DebugUtils";

const { GObject } = fgui;

export interface BoxItemChooseRewardViewOpenArgs {
    itemConfig: table.item.ItemConfig;
}

/**
 * 自选奖励宝箱 UI
 */
export class BoxItemChooseRewardView extends UICommWin {
    static pkgName: string = "boxItem";
    static viewName: string = "BoxItemChooseRewardView";

    // 已使用数量
    private _useCount = 0;
    // 最大数量
    private _maxCount = 0;
    // 宝箱配置
    private _itemBoxConfig: table.item.ItemBoxConfig;

    // 箱子中的道具 index, 选择数量
    private _itemIndexToChooseCountMap = new Map<number, number>();

    // 宝箱的物品配置
    private _itemConfig: table.item.ItemConfig;
    // 奖励道具列表
    private _rewardArray: BoxFixedRewardItemConfigVo[] = [];

    private _rewardArrayIndexMap = new Map<number, number>();

    //选中的道具
    private _selItem;
    //选中的index
    private _selIndex = -1;

    private get view(): ui.boxItem.BoxItemChooseRewardView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [NotificationKey.EVENT_CHANGE_ITEMS];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_CHANGE_ITEMS: {
                const changeItemIdToCountMap = args as Map<number, number>;
                const allChangeItemIds = changeItemIdToCountMap
                    .toDataStream()
                    .map((it) => it.key)
                    .toArray();
                const isContains = ArrayUtils.contains(allChangeItemIds, this._itemConfig.id);
                if (!isContains) {
                    return;
                }
                // 重置面板
                this.reset(this._itemConfig);
                return;
            }
        }
    }

    public onInit(): void {
        G.Logger.debug(" onInit ");

        // 使用按钮
        this.view.buttonUse.onClick(this.onButtonUseClick, this);
        this.view.chooseItem.btn_add.on(fgui.Event.CLICK, this.onCountBtnClick, this);
        this.view.chooseItem.btn_add10.on(fgui.Event.CLICK, this.onCountBtnClick, this);
        this.view.chooseItem.btn_minus.on(fgui.Event.CLICK, this.onCountBtnClick, this);
        this.view.chooseItem.btn_minus10.on(fgui.Event.CLICK, this.onCountBtnClick, this);
        this.view.chooseItem.btn_max.on(fgui.Event.CLICK, this.onCountBtnClick, this);

        // 宝箱奖励列表
        this.view.rewardItemList.setVirtual();
        this.view.rewardItemList.itemRenderer = this.itemRendererForItem.bind(this);
    }

    public onOpen(args: BoxItemChooseRewardViewOpenArgs): void {
        G.Logger.debug(" onOpen ");

        // init
        this.resetChooseState();

        // 刷新选择的数量
        this.refreshChooseCount();

        this.reset(args.itemConfig);
    }

    public onClose(): void {
        G.Logger.debug(" onClose ");
    }

    // 重置状态
    private resetChooseState() {
        // 总使用
        this._useCount = 0;
        // 子道具
        this._itemIndexToChooseCountMap.clear();
    }

    // 打开界面后的回调
    public reset(itemConfig: table.item.ItemConfig): void {
        this._itemConfig = itemConfig;

        // 玩家持有的道具
        const itemById = ItemModel.ins().getItemById(itemConfig.id);
        if (!itemById) {
            const itemName = G.I18nManager.translateToChinese(itemConfig.name);
            G.Logger.error(`玩家道具不存在! itemId = ${itemConfig.id}, name=${itemName}`);
            return;
        }

        // 宝箱
        const itemBoxConfig = G.TableManager.getAllData(table.item.ItemBoxConfig)
            .toDataStream()
            .filter((it) => it.itemId == itemConfig.id)
            .first();
        if (!itemBoxConfig) {
            const itemName = G.I18nManager.translateToChinese(itemConfig.name);
            G.Logger.error(`宝箱配置不存在! itemId = ${itemConfig.id}, name=${itemName}`);
            return;
        }
        this._itemBoxConfig = itemBoxConfig;

        const haveCount = itemById.count;
        this._maxCount = itemById.count;

        // 状态
        this.resetChooseState();
        // 标题部分
        this.resetTitlePart(itemConfig, haveCount);

        // 刷新选择的数量
        this.refreshChooseCount();

        // 刷新奖励道具列表
        this.updateScrollViewForItem();
    }

    private refreshChooseCount() {
        // 宝箱详情
        this.view.labelDetailsTitle.setVar("title", ItemI18nKeys.TITLE_BOX_DETAIL).flushVars();

        // 当前数量
        this.view.chooseItem.count.text = this._useCount.toString();

        // if (this._useCount <= 0) {
        //     this.view.buttonUse._touchDisabled = true;
        // } else {
        //     this.view.buttonUse._touchDisabled = false;
        // }
    }

    /**
     * 重置显示文本
     * @param itemConfig
     * @param haveCount 拥有数量
     */
    public resetTitlePart(itemConfig: table.item.ItemConfig, haveCount: number) {
        // 修改标题部分
        this.view.labelTitle.color = ItemUtils.getTextColor(itemConfig.quality);
        this.view.labelTitle.text = G.I18nManager.translate(itemConfig.name);
        this.view.desc.labelContent.text = G.I18nManager.translate(itemConfig.desc);
        this.view.desc.labelContent.fontSize = 26;

        this.view.itemPreviewIconView.img_item.icon = itemConfig.iconPath;
        this.view.itemPreviewIconView.img_frame.icon = ItemUtils.getQualityIconResourcePath(itemConfig.quality);
        this.view.itemPreviewIconView.T_num.text = haveCount.toString();
    }

    /**
     * 渲染背包物品列表
     * @private
     */
    private updateScrollViewForItem() {
        // 固定奖励宝箱
        const boxFixedRewardConfig = G.TableManager.getAllData(table.item.ItemBoxConfig)
            .toDataStream()
            .filter((it) => it.itemId == this._itemConfig.id)
            .first();

        if (!boxFixedRewardConfig) {
            this.view.rewardItemList.numItems = 0;
            return;
        }

        if (!boxFixedRewardConfig.rewards) {
            G.Logger.warn(`道具id 的箱子奖励为空! itemId = ${this._itemConfig.id}`);
            this.view.rewardItemList.numItems = 0;
            return;
        }
        this._rewardArray = boxFixedRewardConfig.rewards
            .toDataStream()
            .map((it) => {
                const itemId = it.k as number;
                const amount = it.v as number;
                return BoxFixedRewardItemConfigVo.create(itemId, amount);
            })
            .toArray();

        this._rewardArray.forEach((v, index) => {
            this._rewardArrayIndexMap.set(v.itemId, index);
        });

        this._rewardArray.sort((a: BoxFixedRewardItemConfigVo, b: BoxFixedRewardItemConfigVo) => {
            let itemConfigA = ItemUtils.getItemConfigByItemId(a.itemId);
            let itemConfigB = ItemUtils.getItemConfigByItemId(b.itemId);
            if (itemConfigA.quality != itemConfigB.quality) {
                return itemConfigB.quality - itemConfigA.quality;
            }
            return b.itemId - a.itemId;
        });

        this.view.rewardItemList.numItems = this._rewardArray.length;
    }

    /**
     * 渲染奖励道具
     * @param index
     * @param view 每一个奖励道具
     * @private
     */
    private itemRendererForItem(index: number, item: ui.comm.item.ItemIconWithChooseCheck) {
        const rewardItemConfigVo = this._rewardArray[index];

        const config = G.TableManager.getDataById(table.item.ItemConfig, rewardItemConfigVo.itemId);

        let itemFrameBtn = item.itemIcon as any;
        itemFrameBtn.reset(rewardItemConfigVo.itemId, rewardItemConfigVo.amount);
        // itemFrameBtn.isCanClick(false);
        if (this._selIndex == this._rewardArrayIndexMap.get(rewardItemConfigVo.itemId)) {
            item.getController("c1").selectedIndex = 1;
            this._selItem = item;
        } else {
            item.getController("c1").selectedIndex = 0;
        }

        item.T_name.text = config.name;
        QualityUtils.setFGUIFontColorByQuality(item.T_name, config.quality);

        item.btn_sel.clearClick();
        item.btn_sel.onClick(() => {
            if (this._selItem) {
                this._selItem.getController("c1").selectedIndex = 0;
            }
            this._selIndex = this._rewardArrayIndexMap.get(rewardItemConfigVo.itemId);
            this._selItem = item;
            this._selItem.getController("c1").selectedIndex = 1;

            if (this._useCount <= 0) {
                this._useCount = 1;
                this.handleAddCallback();
                this.refreshChooseCount();
            }

            this.handleAddCallback();
        }, this);
    }

    //刷新选择道具
    protected handleAddCallback(): void {
        this._itemIndexToChooseCountMap.clear();
        this._itemIndexToChooseCountMap.merge(this._selIndex, this._useCount, (v1, v2) => v1 + v2);
        this.refreshChooseCount();
    }

    // 点击使用
    private onButtonUseClick() {
        if (this._useCount <= 0) {
            GIns.floatingTextMgr.showTips("请先选择道具！");
            return;
        }
        DebugUtils.isDebugMode() && console.log(`点击使用. use count = ${this._useCount}`);

        if (this._itemBoxConfig == null) {
            G.Logger.error("宝箱配置不存在!");
            return;
        }

        let itemArr: Vo.item.OptionBoxVo[] = [];
        this._itemIndexToChooseCountMap?.forEach((count: number, index: number) => {
            if (count > 0) {
                itemArr.push({ index: index, count: count });
            }
        });

        // network
        ItemModel.ins().sendSelectMultipleBoxReward({
            baseId: this._itemConfig.id,
            boxId: this._itemBoxConfig.id,
            optionBoxVos: itemArr,
        });

        this.resetChooseState();
        this.refreshChooseCount();

        this.closeSelf();
    }

    //添加按钮
    private onCountBtnClick(evt: any) {
        let btn = evt.currentTarget;
        if (!this._selItem) {
            GIns.floatingTextMgr.showTips("请先选择道具！");
            return;
        }
        switch (btn.name) {
            case "btn_add":
                this._useCount = Math.min(this._useCount + 1, this._maxCount);
                // this.handleAddCallback(1);
                break;
            case "btn_add10":
                this._useCount = Math.min(this._useCount + 10, this._maxCount);
                // this.handleAddCallback(10);
                break;
            case "btn_minus":
                this._useCount = Math.max(this._useCount - 1, 1);
                // this.handleMinusCallback(1);
                break;
            case "btn_minus10":
                this._useCount = Math.max(this._useCount - 10, 1);
                // this.handleMinusCallback(10);
                break;
            case "btn_max":
                let count = this._maxCount - this._useCount;
                this._useCount = this._maxCount;
                // this.handleAddCallback(count);
                break;
        }

        this.handleAddCallback();
        this.refreshChooseCount();
    }
}

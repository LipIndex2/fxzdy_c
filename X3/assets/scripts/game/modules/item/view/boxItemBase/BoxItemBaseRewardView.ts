import { math } from "cc";
import G from "db://assets/scripts/core/comm/G";
import { TableManager } from "db://assets/scripts/core/table/TableManager";
import ArrayUtils from "db://assets/scripts/core/utils/ArrayUtils";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { ItemFrameBtn } from "db://assets/scripts/game/modules/common/item/ItemFrameBtn";
import { ProgressBarCommonView } from "db://assets/scripts/game/modules/common/progressBar/ProgressBarCommonView";
import { ItemConfigManager } from "db://assets/scripts/game/modules/item/config/ItemConfigManager";
import { ItemI18nKeys } from "db://assets/scripts/game/modules/item/const/ItemI18nKeys";
import { ItemModel } from "db://assets/scripts/game/modules/item/model/ItemModel";
import { BoxFixedRewardItemConfigVo } from "db://assets/scripts/game/modules/item/structs/BoxFixedRewardItemConfigVo";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import * as fgui from "fairygui-cc";
import { UICommWin } from "../../../../../core/mvc/view/UICommWin";

const { GObject } = fgui;

export interface BoxItemBaseRewardViewOpenArgs {
    itemConfig: table.item.ItemConfig;
}

/**
 * 基本宝箱 + 随机掉落箱子
 * | 打开后必定能获取 xx 道具
 */
export class BoxItemBaseRewardView extends UICommWin {
    private _useCount = 0;
    private _maxCount = 0;

    // 宝箱的物品配置
    private _itemConfig: table.item.ItemConfig;
    // 奖励道具列表
    private _rewardArray: BoxFixedRewardItemConfigVo[] = [];

    static pkgName: string = "boxItem";
    static viewName: string = "BoxItemBaseRewardView";

    private get view(): ui.boxItem.BoxItemBaseRewardView {
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
        this.view.buttonUse.onClick(this.onButtonUseClick, this);

        this.view.chooseItem.btn_add.on(fgui.Event.CLICK, this.onCountBtnClick, this);
        this.view.chooseItem.btn_add10.on(fgui.Event.CLICK, this.onCountBtnClick, this);
        this.view.chooseItem.btn_minus.on(fgui.Event.CLICK, this.onCountBtnClick, this);
        this.view.chooseItem.btn_minus10.on(fgui.Event.CLICK, this.onCountBtnClick, this);
        this.view.chooseItem.btn_max.on(fgui.Event.CLICK, this.onCountBtnClick, this);
    }

    public onOpen(args: BoxItemBaseRewardViewOpenArgs): void {
        G.Logger.debug(" onOpen ");

        // 宝箱奖励列表
        this.view.rewardItemList.setVirtual();
        this.view.rewardItemList.itemRenderer = this.itemRendererForItem.bind(this);

        // init
        this.resetChooseState();

        this.reset(args.itemConfig);
    }

    public onClose(): void {
        G.Logger.debug(" onClose ");
    }

    // 打开界面后的回调
    public reset(itemConfig: table.item.ItemConfig): void {
        this._itemConfig = itemConfig;

        const myItem = ItemModel.ins().getItemById(itemConfig.id);
        if (!myItem) {
            return;
        }
        const haveCount = myItem.count;
        this._maxCount = myItem.count;
        this._useCount = myItem.count;

        // 标题部分
        this.resetTitlePart(itemConfig, haveCount);

        // 刷新选择的数量
        this.refreshChooseCount();

        this.updateScrollViewForItem();
    }

    private refreshChooseCount() {
        // 宝箱详情
        // this.view.labelDetailsTitle.setVar("title", ItemI18nKeys.TITLE_BOX_DETAIL).flushVars();

        // 选择数量
        this.view.chooseItem.count.text = this._useCount.toString();

        if (this._useCount <= 0) {
            this.view.buttonUse._touchDisabled = true;
        } else {
            this.view.buttonUse._touchDisabled = false;
        }
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
        const itemId = this._itemConfig.id;

        const itemSecondType = ItemConfigManager.getItemSecondType(itemId);

        // 随机箱子 | TODO 后端又说不区分了, 同意走 RewardDropConfig 的奖励
        // if (itemSecondType == ItemSecondsType.DROP_BOX
        //     || itemSecondType == ItemSecondsType.DROP_DISPLAY_RATES_BOX
        // ) {
        // }

        // 固定奖励宝箱
        const boxConfig = TableManager.getAllData(table.item.ItemBoxConfig)
            .toDataStream()
            .filter((it) => it.itemId == itemId)
            .first();

        // 显示奖励
        let items = boxConfig?.rewards || [];
        this._rewardArray = items
            .toDataStream()
            .map((it) => {
                const itemId = it.k as number;
                const amount = it.v as number;
                return BoxFixedRewardItemConfigVo.create(itemId, amount);
            })
            .toArray();

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
    private itemRendererForItem(index: number, view: ItemFrameBtn) {
        const rewardItemConfigVo = this._rewardArray[index];

        view.reset(rewardItemConfigVo.itemId, rewardItemConfigVo.amount);
    }

    private onButtonUseClick() {
        if (this._useCount <= 0) {
            return;
        }
        // net
        ItemModel.ins().sendUseItemByBaseId({
            itemBaseId: this._itemConfig.id,
            count: this._useCount,
        });

        this.resetChooseState();
        this.refreshChooseCount();

        this.closeSelf();
    }

    // 重置选择状态
    private resetChooseState() {
        this._useCount = 0;
    }

    //添加按钮
    private onCountBtnClick(evt: any) {
        let btn = evt.currentTarget;
        switch (btn.name) {
            case "btn_add":
                this._useCount = Math.min(this._useCount + 1, this._maxCount);
                break;
            case "btn_add10":
                this._useCount = Math.min(this._useCount + 10, this._maxCount);
                break;
            case "btn_minus":
                this._useCount = Math.max(this._useCount - 1, 1);
                break;
            case "btn_minus10":
                this._useCount = Math.max(this._useCount - 10, 1);
                break;
            case "btn_max":
                this._useCount = this._maxCount;
                break;
        }
        this.refreshChooseCount();
    }
}

import G from "db://assets/scripts/core/comm/G";
import ArrayUtils from "db://assets/scripts/core/utils/ArrayUtils";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { ItemFrameBtn } from "db://assets/scripts/game/modules/common/item/ItemFrameBtn";
import { ItemI18nKeys } from "db://assets/scripts/game/modules/item/const/ItemI18nKeys";
import { BoxFixedRewardItemConfigVo } from "db://assets/scripts/game/modules/item/structs/BoxFixedRewardItemConfigVo";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import * as fgui from "fairygui-cc";
import { UICommWin } from "../../../../../core/mvc/view/UICommWin";

const { GObject } = fgui;

export interface BoxItemPreviewRewardViewOpenArgs {
    itemConfig: table.item.ItemConfig,
    count: number
}

/**
 * 预览宝箱奖励
 */
export class BoxItemPreviewRewardView extends UICommWin {


    // 宝箱的物品配置
    private _itemConfig: table.item.ItemConfig;
    // 奖励道具列表
    private _rewardArray: BoxFixedRewardItemConfigVo[] = [];


    static pkgName: string = "boxItem";

    static viewName: string = "BoxItemPreviewRewardView";
    private _count: number = 0;

    private get view(): ui.boxItem.BoxItemPreviewRewardView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.EVENT_CHANGE_ITEMS
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_CHANGE_ITEMS: {
                const changeItemIdToCountMap = args as Map<number, number>
                const allChangeItemIds = changeItemIdToCountMap.toDataStream()
                    .map(it => it.key)
                    .toArray()
                const isContains = ArrayUtils.contains(allChangeItemIds, this._itemConfig.id);
                if (!isContains) {
                    return;
                }
                // 重置面板
                this.reset();
                return
            }
        }

    }


    public onInit(): void {
        G.Logger.debug(" onInit ")

        // 宝箱奖励列表
        this.view.rewardItemList.setVirtual();
        this.view.rewardItemList.itemRenderer = this.itemRendererForItem.bind(this);


    }

    public onOpen(args: BoxItemPreviewRewardViewOpenArgs): void {
        G.Logger.debug(" onOpen ")

        this._itemConfig = args.itemConfig;
        this._count = args.count

        if (args) {
            this.reset()
        }
    }

    public onClose(): void {
        G.Logger.debug(" onClose ")
    }


    // 打开界面后的回调
    public reset(): void {


        // 标题部分
        this.resetTitlePart(this._itemConfig, this._count);

        this.updateScrollViewForItem();
    }


    /**
     * 重置显示文本
     * @param itemConfig
     * @param haveCount 拥有数量
     */
    public resetTitlePart(itemConfig: table.item.ItemConfig, haveCount: number) {
        // 宝箱详情
        this.view.labelDetailsTitle.setVar("title", ItemI18nKeys.TITLE_BOX_DETAIL)
        this.view.labelDetailsTitle.flushVars()

        // 修改标题部分
        this.view.labelTitle.color = ItemUtils.getTextColor(itemConfig.quality)
        this.view.labelTitle.text = G.I18nManager.translate(itemConfig.name)
        this.view.desc.labelContent.text = G.I18nManager.translate(itemConfig.desc)

        this.view.itemPreviewIconView.img_item.icon = itemConfig.iconPath
        this.view.itemPreviewIconView.img_frame.icon = ItemUtils.getQualityIconResourcePath(itemConfig.quality)
        this.view.itemPreviewIconView.T_num.text = haveCount.toString()
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
            .first()

        if (!boxFixedRewardConfig) {
            this.view.rewardItemList.numItems = 0;
            return
        }

        if (!boxFixedRewardConfig.rewards) {
            G.Logger.warn(`道具id 的箱子奖励为空! itemId = ${this._itemConfig.id}`)
            this.view.rewardItemList.numItems = 0;
            return
        }
        this._rewardArray = boxFixedRewardConfig.rewards.toDataStream()
            .map((it) => {
                const itemId = it.k as number;
                const amount = it.v as number;
                return BoxFixedRewardItemConfigVo.create(itemId, amount)
            })
            .toArray()

        this.view.rewardItemList.numItems = this._rewardArray.length;
    }

    /**
     * 渲染奖励道具
     * @param index
     * @param view 每一个奖励道具
     * @private
     */
    private itemRendererForItem(index: number, view: ItemFrameBtn) {
        const rewardItemConfigVo = this._rewardArray[index]

        view.reset(rewardItemConfigVo.itemId, rewardItemConfigVo.amount)
    }


}
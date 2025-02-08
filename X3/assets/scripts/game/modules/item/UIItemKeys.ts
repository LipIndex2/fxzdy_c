import { ItemComeFromView } from "db://assets/scripts/game/modules/item/view/comeFrom/ItemComeFromView";
import { BoxItemBaseRewardView } from "db://assets/scripts/game/modules/item/view/boxItemBase/BoxItemBaseRewardView";
import {
    BoxItemChooseRewardView
} from "db://assets/scripts/game/modules/item/view/boxItemChoose/BoxItemChooseRewardView";
import {
    BoxItemPreviewRewardView
} from "db://assets/scripts/game/modules/item/view/boxItemPreview/BoxItemPreviewRewardView";
import { UIBindingKey } from "db://assets/scripts/core/mvc/ui/UIBindingKey";
import { ItemCostConfirmView } from "db://assets/scripts/game/modules/item/view/confirm/ItemCostConfirmView";
import { ItemExchangeConfirmView } from "db://assets/scripts/game/modules/item/view/confirm/ItemExchangeConfirmView";
import { ItemSyntheticWin } from "db://assets/scripts/game/modules/item/view/synthetic/ItemSyntheticWin";

/**
 * 道具点击弹框 UI key
 */
export class UIItemKeys {

    /**
     *  道具来源 args {@link ItemComeFromViewOpenArgs}
     */
    static readonly ItemComeFromView = UIBindingKey.create("ItemComeFromView", ItemComeFromView);
    // 固定奖励宝箱
    static readonly BoxItemBaseRewardView = UIBindingKey.create("BoxItemBaseRewardView", BoxItemBaseRewardView);
    // 选择奖励
    static readonly BoxItemChooseRewardView = UIBindingKey.create("BoxItemChooseRewardView", BoxItemChooseRewardView);
    // 预览包厢
    static readonly BoxItemPreviewRewardView = UIBindingKey.create("BoxItemPreviewRewardView", BoxItemPreviewRewardView);
    /**
     * 小提示弹窗
     * {@link ItemSmallTipsViewOpenArgs}
     */
    // static readonly ItemSmallTipsView = UIBindingKey.create("ItemSmallTipsView", ItemSmallTipsView)
    /**
     * 道具消耗确认
     * {@link ItemCostConfirmViewOpenArgs}
     */
    static readonly ItemCostConfirmView = UIBindingKey.create("ItemCostConfirmView", ItemCostConfirmView)
    /**
     * 道具兑换确认
     * {@link ItemExchangeConfirmViewOpenArgs}
     */
    static readonly ItemExchangeConfirmView = UIBindingKey.create("ItemExchangeConfirmView", ItemExchangeConfirmView)
    
    // 道具碎片合并
    static readonly ItemSyntheticWin = UIBindingKey.create("ItemSyntheticWin", ItemSyntheticWin)
}

export enum UIItemKeys2 {
    /**
     * 小提示弹窗
     * {@link ItemSmallTipsViewOpenArgs}
     */
    ItemSmallTipsView = "ItemSmallTipsView",
    ItemSmallTipsView2 = "ItemSmallTipsView2",
}

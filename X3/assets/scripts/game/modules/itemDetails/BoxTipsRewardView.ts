import G from "../../../core/comm/G";
import UIScriptManager from "../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../core/mvc/view/UICommWin";
import { TableManager } from "../../../core/table/TableManager";
import { TimeUnit } from "../../../core/utils/TimeUnit";
import { BackpackManager } from "../backpack/BackpackManager";
import { EnumClientItemType } from "../backpack/EnumClientItemType";
import { ItemFrameBtn } from "../common/item/ItemFrameBtn";
import { QualityUtils } from "../common/quality/QualityUtils";
import { HangUpModel } from "../hangup/model/HangUpModel";
import { HangUpUtils } from "../hangup/utils/HangUpUtils";
import { BoxFixedRewardItemConfigVo } from "../item/structs/BoxFixedRewardItemConfigVo";
import { PrivilegeAdditionController } from "../vip/PrivilegeAdditionController";
import { UIViewItemDetails18nKeys, UIViewItemDetailsKey } from "./UIViewItemDetailsKey";

export interface BoxTipsRewardViewOpenArgs {
    itemConfig: table.item.ItemConfig
}

/**
 * 道具详情
 */
export class BoxTipsRewardView extends UICommWin {
    static pkgName: string = "itemDetails";
    static viewName: string = "BoxTipsRewardView";

    private _rewardArray: BoxFixedRewardItemConfigVo[];
    private itemCfg: table.item.ItemConfig

    private get view(): ui.itemDetails.BoxTipsRewardView {
        return this._view as any;
    }

    public onInit(): void {
        // 道具获取方式
        this.view.rewardItemList.setVirtual();
        this.view.rewardItemList.itemRenderer = this.itemRendererForItem.bind(this);
    }

    public onClose(): void {
    }

    public onOpen(args: BoxTipsRewardViewOpenArgs, isReopen?: boolean): void {
        this.itemCfg = args.itemConfig;
        this.view.nameLab.text = args.itemConfig.name;
        QualityUtils.setFGUIFontColorByQuality(this.view.nameLab, this.itemCfg.quality);
        this.view.numLab.setVar("num", BackpackManager.ins().getItemCountByItemId(args.itemConfig.id).toString()).flushVars()
        this.view.desLab.text = args.itemConfig.desc;

        switch (this.itemCfg.itemType) {
            case EnumClientItemType.BOX:
            case EnumClientItemType.HANG_UP_AUTO_BOX:
                this.view.desNameLab.text = G.I18nManager.lang(UIViewItemDetails18nKeys.desc5)
                break
            case EnumClientItemType.RANDOM_BOX:
                this.view.desNameLab.text = G.I18nManager.lang(UIViewItemDetails18nKeys.desc4)
                break
            case EnumClientItemType.CHOOSE_BOX:
                this.view.desNameLab.text = G.I18nManager.lang(UIViewItemDetails18nKeys.desc3)
                break
        }

        this.view.numLab.ensureSizeCorrect()
        this.view.desLab.ensureSizeCorrect()
        this.updateScrollViewForItem();
    }

    /**
    * 渲染背包物品列表
    * @private
    */
    private updateScrollViewForItem() {
        // 固定奖励宝箱
        const boxFixedRewardConfig = TableManager.getAllData(table.item.ItemBoxConfig)
            .toDataStream()
            .filter((it) => it.itemId == this.itemCfg.id)
            .first()

        if (!boxFixedRewardConfig) {
            this.view.rewardItemList.numItems = 0;
            return
        }

        if (!boxFixedRewardConfig.rewards) {
            this.view.rewardItemList.numItems = 0;
            return
        }
        this._rewardArray = boxFixedRewardConfig.rewards.toDataStream()
            .map((it) => {
                let itemId = it.k as number;
                let amount = it.v as number;

                if (this.itemCfg.itemType == EnumClientItemType.HANG_UP_AUTO_BOX) {
                    //挂机宝箱把里面的奖励换算实际的奖励
                    const hour = TimeUnit.MINUTES.toHours(amount);
                    const type = HangUpUtils.getHangUpTypeByItemId(itemId);
                    const context = HangUpModel.ins().context;
                    const countPerHour = context.getCurrentHangUpCountWithHourByType(type, hour);
                    amount = countPerHour + PrivilegeAdditionController.ins().getHangUpReward(itemId, countPerHour);
                }
                return BoxFixedRewardItemConfigVo.create(itemId, amount)
            })
            .toArray()

        let num = this._rewardArray.length;
        this.view.rewardItemList.numItems = num

        let oneSize = this.view.rewardItemList.virtualItemSize.height
        this.view.rewardItemList.height = Math.min(Math.ceil(num / 4) * oneSize + (Math.ceil(num / 4) - 1) * this.view.rewardItemList.lineGap, 700)
        this.view.bg.height = this.view.rewardItemList.y - this.view.bg.y + this.view.rewardItemList.height * this.view.rewardItemList.scaleX + 20
        this.view.bg.ensureSizeCorrect()

        this.view.mc.x = (this.view.width - this.view.bg.width) * 0.5
        this.view.mc.y = (this.view.height - this.view.bg.height) * 0.5
    }

    private itemRendererForItem(index: number, view: ItemFrameBtn) {
        const rewardItemConfigVo = this._rewardArray[index]
        view.reset(rewardItemConfigVo.itemId, rewardItemConfigVo.amount)
    }
}
UIScriptManager.bindScript(UIViewItemDetailsKey.BoxTipsRewardView, BoxTipsRewardView);
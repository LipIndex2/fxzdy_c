import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import { ItemUtils } from "db://assets/scripts/game/modules/item/utils/ItemUtils";
import { TableManager } from "db://assets/scripts/core/table/TableManager";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { EnumClientItemType } from "db://assets/scripts/game/modules/backpack/EnumClientItemType";
import { HangUpUtils } from "db://assets/scripts/game/modules/hangup/utils/HangUpUtils";
import { Logger } from "db://assets/scripts/core/log/Logger";
import { HangUpModel } from "db://assets/scripts/game/modules/hangup/model/HangUpModel";
import { TimeUnit } from "db://assets/scripts/core/utils/TimeUnit";
import { PrivilegeAdditionController } from "../../vip/PrivilegeAdditionController";


/**
 * 道具图标 ItemFrame
 */
@bindFguiExtension("ui://comm/ItemFrame")
export class ItemFrame extends FGUI.GComponent {

    // 道具配置
    private _itemConfig: table.item.ItemConfig;


    get view(): ui.comm.item.ItemFrame {
        return this as any;
    }

    protected onConstruct() {
        super.onConstruct();


        this.view.getController("haveGain").selectedIndex = 0;
    }

    /**
     * 设置道具数据
     * @param itemId
     * @param count 数量
     */
    updateData(itemId: number,
        count: number
    ) {

        this._itemConfig = ItemUtils.getItemConfigByItemId(itemId);

        this.view.T_num.text = count.toString();
        this.view.img_item.icon = this._itemConfig.iconPath;
        // 品质
        const qualityConfig = TableManager.getDataById(table.quality.QualityConfig, this._itemConfig.quality);
        if (qualityConfig) {
            this.view.img_frame.icon = qualityConfig.itemQualityBgPath
        }


        // diy
        if (this._itemConfig.itemType == EnumClientItemType.HANG_UP_AUTO_BOX) {
            // 挂机奖励箱子

            // 固定奖励宝箱
            const boxFixedRewardConfig = TableManager.getAllData(table.item.ItemBoxConfig)
                .toDataStream()
                .filter((it) => it.itemId == this._itemConfig.id)
                .first();
            if (!boxFixedRewardConfig) {
                return;
            }

            if (!boxFixedRewardConfig.rewards) {
                return;
            }


            const reward = boxFixedRewardConfig.rewards[0];
            if (!reward) {
                Logger.error(`配置有问题. 箱子 id = ${boxFixedRewardConfig.id}`);
                return;
            }

            const itemId = reward.k;
            const minute = reward.v;

            if (minute <= 0) {
                return;
            }
            const hour = TimeUnit.MINUTES.toHours(minute);

            const type = HangUpUtils.getHangUpTypeByItemId(itemId);

            const context = HangUpModel.ins().context;
            let finalCount = context.getCurrentHangUpCountWithHourByType(type, hour)
            finalCount += PrivilegeAdditionController.ins().getHangUpReward(itemId, finalCount);

            this.view.T_num.text = finalCount.toString();
        }
    }

    resetByNoOwnerItem(noOwnerItem: NoOwnerItem) {
        if (!noOwnerItem) {
            return;
        }
        this.updateData(
            noOwnerItem.itemId,
            noOwnerItem.count
        );
    }
}
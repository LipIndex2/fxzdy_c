import { TableManager } from "db://assets/scripts/core/table/TableManager";
import { Logger } from "db://assets/scripts/core/log/Logger";
import { TimeUnit } from "db://assets/scripts/core/utils/TimeUnit";
import { HangUpUtils } from "db://assets/scripts/game/modules/hangup/utils/HangUpUtils";
import { HangUpModel } from "db://assets/scripts/game/modules/hangup/model/HangUpModel";
import { PrivilegeAdditionController } from "db://assets/scripts/game/modules/vip/PrivilegeAdditionController";

export class BoxUtils {

    /**
     * 获取挂机箱子里面的道具数量
     * @param itemId
     */
    static getHangUpBoxInnerItemCount(itemId: number): number {


        // 固定奖励宝箱
        const boxFixedRewardConfig = TableManager.getAllData(table.item.ItemBoxConfig)
            .toDataStream()
            .filter((it) => it.itemId == itemId)
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

        const gainItemId = reward.k;
        const minute = reward.v;

        if (minute <= 0) {
            return;
        }
        const hour = TimeUnit.MINUTES.toHours(minute);

        const type = HangUpUtils.getHangUpTypeByItemId(gainItemId);

        const context = HangUpModel.ins().context;
        const finalCount = context.getCurrentHangUpCountWithHourByType(type, hour);

        // vip
        return PrivilegeAdditionController.ins().getHangUpReward(gainItemId, finalCount);
    }

}
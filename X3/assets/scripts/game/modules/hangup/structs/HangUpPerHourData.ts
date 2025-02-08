import { EnumHangUpType } from "db://assets/scripts/game/modules/hangup/context/HangUpContext";
import { HangUpUtils } from "db://assets/scripts/game/modules/hangup/utils/HangUpUtils";
import { HangUpModel } from "db://assets/scripts/game/modules/hangup/model/HangUpModel";
import { TableManager } from "db://assets/scripts/core/table/TableManager";
import { HangUpConfigManager } from "db://assets/scripts/game/modules/hangup/config/HangUpConfigManager";

/**
 * 每小时挂机道具收益
 */
export class HangUpPerHourData {
    // 关卡id
    levelId: number = 0;
    // 奖励类型
    type: EnumHangUpType;
    // 道具id
    itemId: number = 0;
    // 每小时多少个, 向下取整
    countPerHour: number = 0;

    static create(type: EnumHangUpType, config: table.trunkinstance.TrunkInstanceConfig) {
        const data = new HangUpPerHourData();
        data.levelId = config?.id;


        data.type = type;

        // itemId
        data.itemId = HangUpUtils.getGainItemIdByHangUpType(config, type);

        // count
        let countPerHour: number = HangUpUtils.getItemCountPerHourByHangUpType(config, type);
        data.countPerHour = Math.floor(countPerHour);
        return data;
    }

    getItemConfig(): table.item.ItemConfig {
        return TableManager.getDataById(table.item.ItemConfig, this.itemId)
    }

    /**
     * 挂机收益 text
     * ps: 1000+20/h
     */
    getShowLevelAddHangUpCountPerHourText(): string {
        let curConfig = HangUpModel.ins().getCurrentLevelConfig();

        // 没有当前挂机
        let newCountPerHour = this.countPerHour;
        if (!curConfig) {
            return `0/h`
        }

        // 当前关卡配置
        const curCountPerHour = HangUpUtils.getItemCountPerHourByHangUpType(curConfig, this.type);
        const timeUnitStr = HangUpUtils.getTimeUnitStrByHangUpType(this.type);

        let diffCount = Math.floor(newCountPerHour - curCountPerHour);
        // 小智说不特殊处理
        // if (diffCount < 0) {
        //     return newCountPerHour + `[color=#CC0000]-${diffCount}[/color]/h`
        // }

        // 部分单位为天
        let finalCount = curCountPerHour
        if (timeUnitStr === '/d') {
            diffCount = diffCount * 24;
            finalCount = curCountPerHour * 24;
        }

        if (diffCount <= 0) {
            return `${finalCount}${timeUnitStr}`
        }


        // 增长部分为绿色字体
        return finalCount + `[color=#33CC00]+${diffCount}[/color]${timeUnitStr}`
    }

    /**
     * 每一小时显示的文本
     */
    getShowTextForPerHour(): string {
        let config = HangUpConfigManager.getConfigById(this.levelId);

        // 没有当前挂机
        if (!config) {
            return `0/h`
        }

        // 当前关卡配置
        const curCountPerHour = HangUpUtils.getItemCountPerHourByHangUpType(config, this.type);
        const timeUnitStr = HangUpUtils.getTimeUnitStrByHangUpType(this.type);

        // 部分单位为天
        let finalCount = curCountPerHour
        if (timeUnitStr === '/d') {
            finalCount = curCountPerHour * 24;
        }

        return `${finalCount}${timeUnitStr}`
    }

    /**
     * 是否比上一级挂机收益高
     */
    isBonusGreaterThanPreLevel(): boolean {
        const levelId = this.levelId;
        const config = HangUpConfigManager.getConfigById(levelId);
        if (config.showLevelId <= 0) {
            return false
        }
        const preConfig = HangUpConfigManager.getConfigByShowId(config.showLevelId - 1);


        let preCountPerHour: number = HangUpUtils.getItemCountPerHourByHangUpType(preConfig, this.type);
        let countPerHour1: number = HangUpUtils.getItemCountPerHourByHangUpType(config, this.type);

        const isGreater = (countPerHour1 - preCountPerHour) > 0;
        return isGreater;
    }

    // 挂机
    getHangUpTypeText() {
        return HangUpUtils.getHangUpTypeText(this.type);
    }
}
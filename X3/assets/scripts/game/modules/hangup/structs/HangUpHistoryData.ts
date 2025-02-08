import { EnumHangUpType } from "db://assets/scripts/game/modules/hangup/context/HangUpContext";
import { HangUpUtils } from "db://assets/scripts/game/modules/hangup/utils/HangUpUtils";
import { EnumUtils } from "db://assets/scripts/core/utils/EnumUtils";
import { TableManager } from "db://assets/scripts/core/table/TableManager";

export class HangUpOneLevelData {
    /**
     * 节点的关卡ID
     */
    levelId: number;
    /**
     * 节点开始时间
     */
    startTimeMs: number;

    /**
     * 节点结束时间
     */
    endTimeMs: number;

    /**
     * 单个挂机数据
     * @param item
     */
    static from(item: Vo.trunkinstance.HangUpNodeVo): HangUpOneLevelData {
        return this.create(
            item.hangUpInstanceId,
            item.hangUpStartTime,
            item.hangUpEndTime
        );
    }

    static create(levelId: number,
                  startTimeMs: number,
                  endTimeMs: number
    ): HangUpOneLevelData {
        const self = new HangUpOneLevelData();
        self.levelId = levelId || 0;
        self.startTimeMs = startTimeMs || 0;
        self.endTimeMs = endTimeMs || 0;
        return self;
    }

    getDiffTimeMs(): number {
        return Math.max(0, this.endTimeMs - this.startTimeMs)
    }

    /**
     * 计算可以获得的道具
     * @param maxHangUpTimeMs
     */
    calculateGainItemIdToCountMap(maxHangUpTimeMs: number): Map<number, number> {
        let allEnums: EnumHangUpType[] = EnumUtils.getAllEnumValues(EnumHangUpType);
        const gainItemIdToCountMap = new Map<number, number>();


        // 当前挂机关卡
        allEnums.forEach((hangUpType: EnumHangUpType, index: number) => {

            // 当前关卡
            let config = TableManager.getDataById(table.trunkinstance.TrunkInstanceConfig, this.levelId);
            if (!config) {
                return;
            }
            let tempDiffTimeMs = this.endTimeMs - this.startTimeMs;
            if (tempDiffTimeMs <= 0) {
                return 0;
            }

            // 有效的挂机时间
            let diffTimeMs = Math.min(tempDiffTimeMs, maxHangUpTimeMs);

            // 挂机类型 -> 多少秒结算一次
            let countPerSecond = HangUpUtils.getHangUpCountPerSecondByType(config, hangUpType);
            if (countPerSecond <= 0) {
                return;
            }

            const countPerMs = countPerSecond / 1000
            // 道具数量
            let count = Math.floor(diffTimeMs * countPerMs);

            // 获得的道具 id
            const itemId = HangUpUtils.getGainItemIdByHangUpType(config, hangUpType)

            if (count <= 0) {
                return;
            }
            if (!itemId) {
                return;
            }

            gainItemIdToCountMap.merge(itemId, count, (oldValue, newValue) => oldValue + newValue)
        })

        return gainItemIdToCountMap
    }
}

/**
 * 某种类型的所有阶段的挂机数据
 */
export class HangUpHistoryData {

    // 挂机类型
    private _type: EnumHangUpType;
    // 所有关卡的挂机数据
    private _levelDataArray: Array<HangUpOneLevelData> = [];
    private _historyHangUpTimeMs: number = 0;


    static from(type: EnumHangUpType,
                array: Array<Vo.trunkinstance.HangUpNodeVo>
    ): HangUpHistoryData {
        let data = new HangUpHistoryData();

        data._type = type;
        if (array) {
            data._levelDataArray = array.map(item => HangUpOneLevelData.from(item));
        } else {
            data._levelDataArray = [];
        }
        // 累计挂机时间
        data._historyHangUpTimeMs = data._levelDataArray.toDataStream()
            .reduce((acc, cur) => acc + Math.max(0, cur.endTimeMs - cur.startTimeMs), 0);

        return data;
    }

    get type(): EnumHangUpType {
        return this._type;
    }

    get levelDataArray(): Array<HangUpOneLevelData> {
        return this._levelDataArray;
    }

    /**
     * 清理历史挂机数据
     */
    clearLevelDataArray() {
        this._levelDataArray = [];
        this._historyHangUpTimeMs = 0;
    }


    /**
     * 获取历史挂机时间
     */
    getHistoryHangUpTimeMs(): number {
        return this._historyHangUpTimeMs
    }
}
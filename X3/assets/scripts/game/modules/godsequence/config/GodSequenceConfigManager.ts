import { TableManager } from "db://assets/scripts/core/table/TableManager";
import { TimeManager } from "db://assets/scripts/core/time/TimeManager";
import { WeekDay } from "db://assets/scripts/core/time/WeekDay";
import { GodSequenceModel } from "db://assets/scripts/game/modules/godsequence/model/GodSequenceModel";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";

/**
 * 序列验证
 */
export class GodSequenceConfigManager {

    private static _maxDiffLayerCount: number = 1;

    private static _weekDayToTypeConfigArrayMap: Map<number, table.ladder.LadderTypeConfig[]> = new Map<number, table.ladder.LadderTypeConfig[]>();
    private static _typeToLayerConfigArrayMap: Map<number, table.ladder.LadderConfig[]> = new Map<number, table.ladder.LadderConfig[]>();
    private static _typeToLayerNumToConfigMap: Map<number, Map<number, table.ladder.LadderConfig>> = new Map<number, Map<number, table.ladder.LadderConfig>>();
    private static _typeToMaxLayerNumMap: Map<number, number> = new Map<number, number>();
    // 序列类型 
    private static _typeArray: Array<number> = [];

    protected static _openAllActivityId:number = 0;

    // 是否初始化过
    private static _isInit: boolean = false;

    static init() {
        if (this._isInit) {
            return;
        }
        this._isInit = true;

        this._maxDiffLayerCount = TableManager.getDataById(table.ladder.LadderConstantConfig, "LADDER:MAX_DIFF_FLOOR")?.content?.toInt() || 1;
        this._openAllActivityId = TableManager.getDataById(table.ladder.LadderConstantConfig, "LADDER:OPEN_ALL_ACTIVITY_ID")?.content?.toInt() || 0;

        let typeConfigs = TableManager.getAllData(table.ladder.LadderTypeConfig);
        for (let typeConfig of typeConfigs) {
            const type = ServerEnums.Career[typeConfig.id];

            this._typeArray.push(type);

            let array = typeConfig.openDayOfWeek as number[];
            for (let day of array) {
                const set = this._weekDayToTypeConfigArrayMap.getOrCreate(day, () => []);
                set.push(typeConfig);
            }
        }

        this._typeToLayerConfigArrayMap = TableManager.getAllData(table.ladder.LadderConfig)
            .toDataStream()
            .handle(it => {
                const type = ServerEnums.Career[it.type];
                this._typeToLayerNumToConfigMap.getOrCreate(type, () => new Map<number, table.ladder.LadderConfig>())
                    .set(it.layerNum, it);

                this._typeToMaxLayerNumMap.merge(type, it.layerNum, (v1, v2) => Math.max(v1, v2));

            })
            .groupBy(it => ServerEnums.Career[it.type])
        ;


    }


    static getConfigById(id: number): table.ladder.LadderConfig | null {
        return TableManager.getDataById(table.ladder.LadderConfig, id)
    }


    static get maxDiffLayerCount(): number {
        return this._maxDiffLayerCount;
    }

    /**全部开启的活动id*/
    static get openAllActivityId():number {
        return this._openAllActivityId;
    }

    static getTodayTypeConfig(): table.ladder.LadderTypeConfig[] {
        let curTimeMs = TimeManager.serverNow;
        let weekDay = WeekDay.getWeekDayByTimeMs(curTimeMs);
        let humanWeekDayNum = weekDay.getHumanWeekDayNum();

        let typeConfigArray = this._weekDayToTypeConfigArrayMap.get(humanWeekDayNum);

        return typeConfigArray || [];
    }

    static getTypeConfigArray(): table.ladder.LadderTypeConfig[] {
        return TableManager.getAllData(table.ladder.LadderTypeConfig);
    }

    static getLayerConfigArrayByType(type: number) {
        return this._typeToLayerConfigArrayMap.get(type) || [];
    }

    // 玩家可见的层数
    static getPlayerCanSeeLayerConfigArrayByType(type: number) {
        const context = GodSequenceModel.ins().context;
        const minLayerNum = context.getMinLayerNum();
        const canSeeMaxLayerNum = minLayerNum + this._maxDiffLayerCount;
        return this.getLayerConfigArrayByType(type)
            .filter(it => {
                return it.layerNum <= canSeeMaxLayerNum
            });
    }

    static getTypeConfigByType(type: number) {
        const typeStr = ServerEnums.Career[type];
        return TableManager.getDataById(table.ladder.LadderTypeConfig, typeStr);
    }

    static getConfigByTypeAndLayer(type: number,
                                   layerNum: number
    ): table.ladder.LadderConfig | null {
        return this._typeToLayerNumToConfigMap.get(type)?.get(layerNum)
    }

    static getAllTypeArray(): number[] {
        return this._typeArray;
    }


    static getMaxLayerNumByType(type: number): number {
        return this._typeToMaxLayerNumMap.get(type) || 0;
    }

    static getFirstTypeConfig(): table.ladder.LadderTypeConfig | null {
        return TableManager.getAllData(table.ladder.LadderTypeConfig)[0]
    }
}
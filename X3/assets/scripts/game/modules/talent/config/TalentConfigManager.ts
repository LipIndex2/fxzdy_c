import { TableManager } from "db://assets/scripts/core/table/TableManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import TalentType = ServerEnums.TalentType;
import { ConditionManager } from "../../condition/ConditionManager";

export class TalentConfigManager {
    private static _isInit: boolean = false;

    // 一键升级次数
    static readonly ONE_KEY_LV_UP_COUNT: number = 5;
    // 一键解锁条件
    private static _oneKeyUnlockConditions: Array<Array<any>> = [];

    private static _smallRowIdToConfigMap: Map<number, table.talent.TalentConfig>;
    private static _bigRowIdToConfigMap: Map<number, table.talent.TalentConfig>;

    private static _unlockLvToMaxRowIdMap: Map<number, number> = new Map();


    static init() {
        if (this._isInit) {
            return;
        }
        this._isInit = true;

        this._smallRowIdToConfigMap = this.getRowIdToConfigMapByType(ServerEnums.TalentType.NORMAL);
        this._bigRowIdToConfigMap = this.getRowIdToConfigMapByType(ServerEnums.TalentType.ADVANCED);

        let conditionStr = TableManager.getDataById(table.talent.TalentConstantConfig, "TALENT:ONE_KEY_ACTIVE_OPEN_CONDITIONS")?.content || "";
        this._oneKeyUnlockConditions = ConditionManager.ins().parseConditionStr(conditionStr);

        for (let c of TableManager.getAllData(table.talent.TalentConfig)) {
            const type = this.getTalentType(c.talentType)
            if (type == TalentType.ADVANCED) {
                continue
            }
            const rowId = c.rowId;
            const unlockLv = c.unlockLv || 0;

            this._unlockLvToMaxRowIdMap.merge(unlockLv, rowId, (v1, v2) => Math.max(v1, v2));
        }
    }

    static getMaxRowIdByUnlockLv(unlockLv: number): number {
        return this._unlockLvToMaxRowIdMap.get(unlockLv) || 0;
    }

    private static getTalentType(talentType: string): ServerEnums.TalentType {
        return ServerEnums.TalentType[talentType];
    }

    static get oneKeyUnlockConditions() {
        return this._oneKeyUnlockConditions;
    }

    /**
     * 天赋
     */
    static getRowIdToConfigMapByType(targetType: ServerEnums.TalentType): Map<number, table.talent.TalentConfig> {
        return TableManager.getAllData(table.talent.TalentConfig)
            .toDataStream()
            .filter(it => ServerEnums.TalentType[it.talentType] == targetType)
            .toMap(it => it.rowId, it => it, (v1, v2) => {
                console.error(`【小天赋】rowId 重复. rowId = ${v1.rowId}`);
                return v1;
            });
    }

    static getConfigByRowId(type: ServerEnums.TalentType, rowId: number): table.talent.TalentConfig | null {
        if (type == ServerEnums.TalentType.NORMAL) {
            return this._smallRowIdToConfigMap.get(rowId);
        } else {
            return this._bigRowIdToConfigMap.get(rowId);
        }
    }

    static getRowIdByTalentId(talentId: number): number {
        return TableManager.getDataById(table.talent.TalentConfig, talentId)?.rowId || 0;
    }

    static getConfigByTalentId(talentId: number): table.talent.TalentConfig {
        return TableManager.getDataById(table.talent.TalentConfig, talentId);
    }


    static getTalentTypeById(talentId: number): TalentType {
        const talentTypeStr = this.getConfigByTalentId(talentId)?.talentType;
        if (talentTypeStr == null) {
            return TalentType.NORMAL;
        }
        return TalentType[talentTypeStr]
    }
}
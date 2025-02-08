import G from "db://assets/scripts/core/comm/G";
import { TableManager } from "db://assets/scripts/core/table/TableManager";
import { IBattleEnterData } from "../vo/IBattleEnterData";
import { NumberRange } from "db://assets/scripts/core/utils/NumberRange";
import { StringUtils } from "db://assets/scripts/core/utils/StringUtils";
import { Logger } from "db://assets/scripts/core/log/Logger";

/**
 * 战斗 UI 工具
 */
export class BattleUIUtils {

    /**
     * 根据战斗配置ID获取怪物属性配置数组
     * @param battleConfigId
     */
    static getMonsterAttributeConfigArrayByBattleConfigId(battleConfigId: number): table.monster.MonsterAttributeConfig[] {
        let battleConfig = TableManager.getDataById(table.battle.BattleConfig, battleConfigId);
        if (!battleConfig) {
            return [];
        }
        // 怪物配置
        let monsterResourceIds: number[] = (battleConfig.monsterResourceIds || []) as number[];
        return monsterResourceIds.toDataStream()
            .map(monsterResId => {
                let monsterResConfig = TableManager.getDataById(table.battle.MonsterResourceConfig, monsterResId);
                if (!monsterResConfig) {
                    // Logger.error(`[战斗配置] 关系丢失. BattleConfig.monsterResourceIds = ${monsterResId} 没找到 MonsterResourceConfig.id `);
                    return null;
                }
                let monsterId1 = monsterResConfig.monsterId;
                const monsterAttrConfig = TableManager.getDataById(table.monster.MonsterAttributeConfig, monsterId1);
                if (!monsterAttrConfig) {
                    // Logger.error(`[战斗配置] 关系丢失. MonsterResourceConfig.monsterId = ${monsterId1} 没找到 MonsterAttributeConfig.id `);
                    return null;
                }
                return monsterAttrConfig;
            })
            // .filterNotNull()
            .toArray();
    }

    /**
     * 获取战斗剩余时间（单位：毫秒）
     * @param battleStartState 战斗开始状态
     */
    static getBattleRestTimeMs(battleStartState: IBattleEnterData): number {
        if (!battleStartState) {
            return 0;
        }
        let endTimeMs = battleStartState.endTime;
        // 0 = 永久
        if (endTimeMs <= 0) {
            return 0;
        }
        return endTimeMs - G.TimeManager.serverNow
    }

    /**
     * 修正范围
     * @param cpDamageMod
     */
    static getCpModRangeMap(cpDamageMod: string): Map<NumberRange, number> {
        const map = new Map();

        if (StringUtils.isBlank(cpDamageMod)) {
            return map;
        }

        for (let csv of cpDamageMod.split(";")) {
            const array = csv.split(",");

            // [0, 1]
            const left = ((array[0]?.toInt() || 0) / 100);
            // right
            const rightOrigin = array[1]?.toInt() || 0;
            let right = 0;
            if (rightOrigin == -1) {
                right = Number.MAX_VALUE;
            } else {
                right = (rightOrigin / 100);
            }
            const value = ((array[2]?.toInt() || 0) / 100);

            if (left > right) {
                Logger.error(`BattleConfig.cpDamageMod 策划配置区间有问题, string = ${cpDamageMod} , left = ${left}, right = ${right}`);
                continue;
            }

            const range = NumberRange.create(left, right);
            map.set(range, value);
        }

        return map;
    }

    // power
    static getPowerByBattleConfigId(battleConfigId: number) {
        return TableManager.getDataById(table.battle.BattleConfig, battleConfigId)?.power || 0;
    }
}
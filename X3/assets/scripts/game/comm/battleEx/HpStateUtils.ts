
import { BattleLogicManager } from "../battle/BattleLogicManager";
import { HpShowType } from "../battle/config/BattleSetting";
import { UnitType } from "../battle/enum/BattleEnum";
import { FightType } from "../battle/enum/FightType";

export default class HpStateUtils {
    /**获取总血量 */
    private static _getMaxHp(fighttype: FightType, teamId: number, unitType?: UnitType) {
        let totalHp = 0;
        let battleLogic = BattleLogicManager.ins().get(fighttype)
        let units = battleLogic.unitProcessor.getUnitsByTeamId(teamId);
        for (let i = 0; i < units.length; i++) {
            if (units[i].summon || units[i].isNotStatisticsHp || units[i].type == UnitType.Pet)
                continue;
            if (!unitType || units[i].type === UnitType.Boss) {
                totalHp += units[i].attr.maxHp;
            }
        }
        return totalHp;
    }

    /**获取当前血量 */
    private static _getCurHp(fighttype: FightType, teamId: number, unitType?: UnitType) {
        let totalHp = 0;
        let battleLogic = BattleLogicManager.ins().get(fighttype)
        let units = battleLogic.unitProcessor.getUnitsByTeamId(teamId);
        for (let i = 0; i < units.length; i++) {
            if (units[i].summon || units[i].isNotStatisticsHp || units[i].type == UnitType.Pet)
                continue;
            if (!unitType || units[i].type === UnitType.Boss) {
                totalHp += units[i].hp;
            }
        }
        return totalHp;
    }

    /**获取最大血量
     * 不指定类型则返回确保
     */
    public static getMaxHpByType(fighttype: FightType, teamId: number, type: HpShowType) {
        switch (type) {
            case HpShowType.TOTAL:
                return this._getMaxHp(fighttype, teamId);
            case HpShowType.BOSS:
                return this._getMaxHp(fighttype, teamId, UnitType.Boss);
        }

        return 0;
    }

    /**获取当前血量
     * 不指定类型则返回确保
     */
    public static getCurHpByType(fighttype: FightType, teamId: number, type: HpShowType) {
        switch (type) {
            case HpShowType.TOTAL:
                return this._getCurHp(fighttype, teamId);
            case HpShowType.BOSS:
                return this._getCurHp(fighttype, teamId, UnitType.Boss);
        }

        return 0;
    }
}

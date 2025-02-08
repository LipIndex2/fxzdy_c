import { FightType } from "../../../comm/battle/enum/FightType";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";

/**
 * 战斗结算格式
 * @see Vo.battle.BattleStatisticsVo
 */
export interface IBattleResult {
    /**
     * 战斗配置ID
     */
    battleConfigId: number;

    /**
     * 战斗类型
     */
    fightType: FightType;

    /**
     * 战斗结果类型,BattleResult
     */
    battleResult: ServerEnums.BattleResult;

    /**
     * 攻击方累计伤害
     */
    attackerTotalHurt: number;

    /**
     * 防守方累计伤害
     */
    defenderTotalHurt: number;

    /**
     * 攻击方剩余总血量
     */
    attackerSurplusHp: number;

    /**
     * 防守方剩余总血量
     */
    defenderSurplusHp: number;

    /**
     * 战斗时长(秒)
     */
    //battleSeconds: number;

    /**
     * 死亡次数
     */
    //deadTimes: number;

    /**
     * 进攻方单位统计信息
     */
    attackerUnitStatisticsVos: Array<Vo.battle.FightUnitStatisticsVo>;

    /**
     * 防守方单位统计信息
     */
    defenderUnitStatisticsVos: Array<Vo.battle.FightUnitStatisticsVo>;

    /***是否隐藏战斗 */
    isHideBattle: boolean;
    /***异常伤害列表 */
    maxHurtList: Vo.battle.FightUnitAbnormalHurtVo[]

    /**
         * 攻击方剩余血量百分比
         */
    attackerHpPercent: number;

    /**
     * 防守方剩余血量百分比
     */
    defenderHpPercent: number;

}
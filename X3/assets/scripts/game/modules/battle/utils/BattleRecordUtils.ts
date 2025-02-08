import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { TeamChallengeModel } from "../../teamChallenge/model/TeamChallengeModel";

/**
 * 战斗记录 工具
 */
export class BattleRecordUtils {

    /**
     * 是否显示防守方
     * @param fightType
     */
    static isShowDefender(fightType: ServerEnums.FightType) {
        return [
            ServerEnums.FightType.SECRET_INSTANCE,
            ServerEnums.FightType.MAP_INSTANCE,
            ServerEnums.FightType.GUARD_SHIP,
            ServerEnums.FightType.SEASON_SECRET,
            ServerEnums.FightType.TRIAL,
        ].indexOf(fightType) == -1;
    }

    /**
     * 是否隐藏防守方头像
     * @param fightType
     */
    static isHideDefenderIcon(fightType: ServerEnums.FightType) {
        return ([
            ServerEnums.FightType.TRUNK_INSTANCE,
            ServerEnums.FightType.MAP_INSTANCE,
            ServerEnums.FightType.SECRET_INSTANCE,
            ServerEnums.FightType.GUARD_SHIP,
            ServerEnums.FightType.TEAM_INSTANCE,
            ServerEnums.FightType.PET_DUNGEON,
            ServerEnums.FightType.COLLECTIBLES_DUNGEON,
        ].indexOf(fightType) > -1);
    }

    /**
     * 是否隐藏攻击方头像
     * @param fightType
     */
    static isHideAttkerIcon(fightType: ServerEnums.FightType) {
        if (ServerEnums.FightType.TEAM_INSTANCE == fightType) {
            //组队副本里里多人组队才隐藏
            return TeamChallengeModel.ins().inTeam()
        }
        return ([
            ServerEnums.FightType.TEAM_INSTANCE,
        ].indexOf(fightType) > -1);
    }
}
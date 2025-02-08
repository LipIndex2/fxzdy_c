import { RedDotPath } from "db://assets/scripts/game/modules/common/redDot/structs/RedDotPath";
import { RedDotCom } from "db://assets/scripts/game/modules/common/redDot/redDotCom";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { RedDotKeys } from "db://assets/scripts/game/modules/common/redDot/RedDotKeys";
import { LocalStorageKeys } from "db://assets/scripts/game/comm/cache/LocalStorageKeys";
import { PlayerModel } from "db://assets/scripts/game/modules/player/model/PlayerModel";
import SystemType = ServerEnums.SystemType;

export class RedDotUtils {

    static castComp(redDot: ui.comm.com.RedDot): RedDotCom {
        return FguiScriptUtils.toMyScriptClass(redDot, RedDotCom);
    }



    static getMainCityRedDotPathArray(): RedDotPath[] {
        return [
            RedDotKeys.drawCard,
            RedDotKeys.dailyBoss,
            RedDotKeys.captainSkill,
            RedDotKeys.League,
            RedDotKeys.jjc,
            RedDotKeys.TeamChallenge,
        ];
    }

    static getMainCityRedDotEventNameArray(): string[] {
        return this.getMainCityRedDotPathArray().map(it => it.toEventName());
    }

    /**
     * 业务模块入口 -> 红点路径
     * 应用:
     * 1. 世界地图用
     * @param moduleEnum
     */
    static getRedDotPathByModule(moduleEnum: SystemType): RedDotPath {
        switch (moduleEnum) {
            case SystemType.RECRUIT: {
                return RedDotKeys.drawCard;
            }
            case SystemType.DAILY_BOSS: {
                return RedDotKeys.dailyBoss;
            }
            case SystemType.CAPTAIN: {
                return RedDotKeys.captainSkill;
            }
            case SystemType.LEAGUE: {
                return RedDotKeys.League;
            }
            case SystemType.ARENA: {
                return RedDotKeys.jjc;
            }
            case SystemType.EQUIP:{
                return RedDotKeys.Equip_enter;
            }
            case SystemType.FACTORY:{
                return RedDotKeys.Factory;
            }
            case SystemType.PET:{
                return RedDotKeys.Pet_enter;
            }
            case SystemType.SECRET_INSTANCE:{
                return RedDotKeys.Secret_enter;
            }
            case SystemType.LADDER:{
                return RedDotKeys.Ladder_enter;
            }
            case SystemType.TEAM_INSTANCE:{
                return RedDotKeys.TeamChallenge;
            }
            case SystemType.COLLECTIBLES_DUNGEON:{
                return RedDotKeys.CollectiblesDungeon;
            }
            case SystemType.PET_DUNGEON:{
                return RedDotKeys.PetDungeon;
            }
        }

        return RedDotKeys.Null;
    }


}
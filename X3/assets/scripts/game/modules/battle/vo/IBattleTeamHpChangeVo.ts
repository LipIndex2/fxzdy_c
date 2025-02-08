import {WorldUnitTeam} from "db://assets/scripts/game/comm/battle/enum/BattleEnum";
import { HpShowType } from "../../../comm/battle/config/BattleSetting";

export interface IBattleTeamHpChangeVo {
    /** 队伍类型*/
    teamId : WorldUnitTeam;

    /** 血量信息类型 */
    type : HpShowType;

    /** 总血量*/
    totalHP : number;
    /**  当前血量*/
    curHp : number;
}
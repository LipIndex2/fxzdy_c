import { FightType } from "../../../comm/battle/enum/FightType";
import { IBattlePetData } from "./IBattlePetData";
import { IBattleTeamData } from "./IBattleTeamData";
import { IBattleUnitData } from "./IBattleUnitData";

export interface IBattleEnterData {
    /***攻击方玩家ID */
    atkPlayerId: number;
    /***防守方玩家ID */
    defPlayerId: number;
    /**战斗Id @see table.battle.BattleConfig.id*/
    battleConfigId: number;
    /**战斗类型 */
    fightType: FightType;
    /**结束时间 （小于0 不限时） */
    endTime: number;
    /**结束时间 （小于0 不限时） */
    endTimeFrame?: number;

    /**发起者单位数据 */
    attackerUnitDatas: IBattleUnitData[];
    /***攻击方宠物 */
    attackerPetUnitDatas?: IBattlePetData[];
    /**防守方单位数据 */
    defenderUnitDatas: IBattleUnitData[];
    /***防守方方宠物 */
    defenderPetUnitDatas?: IBattlePetData[];

    /***防守方名字 */
    defenderName: string
    /***防守方头像 */
    defenderIcon: number | string
    /***是否隐藏战斗 */
    hideBattle?: boolean;
    /**随机种子 */
    randomSeed?: number;
    /***是否观战者 */
    watcher?: boolean;

    /***战斗力 */
    fv?: number

    /** 模块玩法信息,不同战斗类型处理不一样,具体类型询问对应功能的服务端 */
    modulePlayInfo?: Object

    /**需要进入的地图id (FightType为普通类型时才有效)*/
    mapId?: number
    /**需要进入的地图位置 (FightType为普通类型时才有效)*/
    mapPos?: { x: number, y: number }

    /**
         * 战斗验证参数
         */
    verifyParam?: Vo.battle.BattleVerifyParam;

    /***攻击方的队伍技能 */
    attackerBattleTeamDatas?: IBattleTeamData[],
    /***防守方的队伍技能 */
    defenderBattleTeamDatas?: IBattleTeamData[]

    /**j进入战斗的扩展属性 */
    battleEnterData?: any


    /***队伍的默认技能列表 */
    teamSkillListMap?: { [teamId: number]: string[] }
}
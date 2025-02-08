import G from "../../../../core/comm/G";

/**
 * 排行榜通用数据
 */
export class RankCommonData {
    /**
     * 玩家基础信息
     */
    baseVo: Vo.player.PlayerBaseVo;

    /**
     * 名次
     */
    rankNum: number;

    /**
     * 排行榜值
     */
    rankValue: number;

    /**
     * 附加值
     */
    addition: number;

    /**
     * 服务器ID
     */
    serverId: string;

    /**
     * 服务器名称
     */
    serverName: string;

    // optional 竞技场段位id
    pvpRankConfigId?: number = 0;

    // 每日boss
    dailyBossDifficulty?: number = 0;
    // 每日boss 伤害值
    dailyBossHurtValue?: number = 0;

    // 神之序列 | 层
    layerNum?: number = 0;

    /**积分*/
    score: number;

    /**波次*/
    roundId: number;
    /**关卡*/
    instanceName: string;
    
    /**联盟bannerid*/
    banner:number;
    /**旗帜id*/
    iconFlag:number;
    /**盟主id*/
    leaderId:number;
    leaderName:string;
    leaderImageId:number;
    leagueId:number;
    leagueName:string;


    static createByRankItemVo(it: Vo.ranking.RankItemVo): RankCommonData {
        const data = new RankCommonData();
        data.baseVo = it.baseVo;
        data.rankNum = it.rank;
        data.rankValue = it.value;
        data.addition = it.addition;
        data.serverId = it.serverId;
        data.serverName = it.serverName;
        return data;
    }

    // PVP 排行榜数据
    static createByPVP(it: Vo.arena.ArenaRankItemVo): RankCommonData {
        const data = new RankCommonData();
        data.baseVo = it.baseVo;
        data.rankNum = it.rank;
        data.rankValue = it.score;
        data.addition = 0;
        data.serverId = it.serverId;
        data.serverName = it.serverName;
        data.pvpRankConfigId = it.rankConfigId || 0;
        return data;
    }

    // 每日boss
    static createByDailyBoss(it: Vo.dailyboss.DailyBossRankItemVo): RankCommonData {
        const data = new RankCommonData();
        data.baseVo = it.baseVo;
        data.rankNum = it.rank;
        data.rankValue = it.value;
        data.addition = 0;
        data.serverId = it.serverId;
        data.serverName = it.serverName;
        data.dailyBossDifficulty = it.difficulty || 1;
        data.dailyBossHurtValue = it.value || 0;

        return data;
    }

    // 神之序列
    static createByGodSequence(it: Vo.ranking.RankItemVo) {
        const data = new RankCommonData();
        data.baseVo = it.baseVo;
        data.rankNum = it.rank;
        data.rankValue = it.value;
        data.addition = 0;
        data.serverId = it.serverId;
        data.serverName = it.serverName;
        data.layerNum = it.value || 1;

        return data;
    }

    // 守卫母舰
    static createByGuardShip(it: Vo.guardship.GuardShipRankItemVo) {
        const data = new RankCommonData();
        data.baseVo = it.baseVo;
        data.rankNum = it.rank;
        data.rankValue = it.value;
        data.addition = it.addition;
        data.serverId = it.serverId;
        data.serverName = it.serverName;  
        data.score = it.score;
        let cfg = G.TableManager.getDataById(table.guardship.GuardShipInstanceConfig,  data.rankValue)
        if (cfg) {
            data.instanceName = cfg.name
            let roundIndex:number = cfg.roundIds.indexOf(data.addition)
            data.roundId = roundIndex + 1
        }
        return data;
    }

    /** 秘境排行榜 */
    static createBySecretInstance(it: Vo.secretinstance.SecretInstanceRankItemVo) {
        const data = new RankCommonData();
        data.baseVo = it.baseVo;
        data.rankNum = it.rank;
        data.rankValue = it.value;
        data.addition = it.passSeconds;
        data.serverId = it.serverId;
        data.serverName = it.serverName;
        return data;

    }

    /**勘探联盟排行*/
    static createByLeauge(it:Vo.leagueexplore.LeagueExploreRankItemVo) {
        const data = new RankCommonData();
        data.banner = it.banner;
        data.iconFlag = it.icon;
        data.rankValue = it.score;
        data.rankNum = it.rank;
        data.leaderId = it.leaderId;
        data.leaderName = it.leaderName;  
        data.leagueId = it.leagueId;
        data.leagueName = it.name;  
        data.leaderImageId = it.imageId;
        return data;
    }
}
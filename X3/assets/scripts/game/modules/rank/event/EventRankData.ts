import { RankCommonData } from "db://assets/scripts/game/modules/rank/structs/RankCommonData";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import G from "../../../../core/comm/G";

/**
 * event 排行榜响应数据
 */
export class EventRankDataResp {

    // 排行榜类型
    private _rankType: ServerEnums.RankingType;
    // 子类型
    private _subType: number = 0;
    // 最大页数
    private _maxPage: number = 0;
    // 我的排名
    private _myRankNum: number = 0;
    // 我的积分
    private _myRankValue: number = 0;
    // 排行榜数据
    private _dataList: Array<RankCommonData> = [];

    // optional data
    // 每日boss 难度
    private _dailyBossDifficulty: number = 0;
    // 每日boss 伤害值
    private _dailyBossHurtValue: number = 0;

    /**波次*/
    private _addition: number;
    /**积分*/
    private _score: number;
    /**波次id*/
    private _roundId: number;
    /**关卡id*/
    private _instanceName: string;

    // 通用排行榜
    static createByCommon(
        rankType: ServerEnums.RankingType,
        subType: string,
        vo: Vo.ranking.RankingVo
    ): EventRankDataResp {
        const rankData = new EventRankDataResp();
        rankData._rankType = rankType;
        rankData._subType = subType?.toInt() || 0;
        rankData._myRankNum = vo?.rank || 0;
        rankData._myRankValue = vo?.value || 0;
        rankData._maxPage = vo?.maxPage || 0;
        if (rankType === ServerEnums.RankingType.LEAGUE_FIGHT) {
            rankData._dataList = (vo?.list || []) as any;
        } else if (rankType == ServerEnums.RankingType.LEAGUE_EXPLORE_SCORE) {
            rankData._dataList = (vo?.list || []).map(it => {
                return RankCommonData.createByLeauge(it);
            });
        } else {
            rankData._dataList = ((vo?.list || []) as Array<Vo.ranking.RankItemVo>)
                .map(it => {
                    return RankCommonData.createByRankItemVo(it);
                });
        }
        return rankData;
    }

    // JJC 排行榜
    static createByPVP(
        rankType: ServerEnums.RankingType,
        vo: Vo.arena.ArenaRankingVo
    ): EventRankDataResp {

        const rankData = new EventRankDataResp();
        rankData._rankType = rankType;
        rankData._subType = 0;
        rankData._myRankNum = vo?.rank || 0;
        rankData._myRankValue = vo?.score || 0;
        rankData._maxPage = vo?.maxPage || 0;
        rankData._dataList = ((vo?.list || []) as Array<Vo.arena.ArenaRankItemVo>)
            .map(it => {
                return RankCommonData.createByPVP(it);
            });
        return rankData;
    }


    // 每日boss
    static createByDailyBoss(rankingVo: Vo.dailyboss.DailyBossRankingVo, bossType: number) {
        const rankData = new EventRankDataResp();
        rankData._rankType = ServerEnums.RankingType.DAILY_BOSS;
        rankData._subType = bossType;
        rankData._myRankNum = rankingVo?.rank || 0;
        rankData._myRankValue = rankingVo?.value || 0;
        rankData._maxPage = rankingVo?.maxPage || 0;
        rankData._dataList = (rankingVo.list || [])
            .map(it => RankCommonData.createByDailyBoss(it));
        // boss
        rankData._dailyBossDifficulty = Math.max(rankingVo.difficulty || 1, 1);
        rankData._dailyBossHurtValue = rankingVo.value || 0;


        return rankData;
    }

    /**守卫母舰*/
    static createByGuardShip(rankingVo: Vo.guardship.GuardShipRankingVo) {
        const rankData = new EventRankDataResp();
        rankData._rankType = ServerEnums.RankingType.GUARD_SHIP;
        rankData._subType = 0;
        rankData._myRankNum = rankingVo?.rank || 0;
        rankData._myRankValue = rankingVo?.value || 0;
        rankData._maxPage = rankingVo?.maxPage || 0;
        rankData._dataList = (rankingVo.list || [])
            .map(it => RankCommonData.createByGuardShip(it));

        rankData._addition = rankingVo.addition;
        rankData._score = rankingVo.score;
        let cfg = G.TableManager.getDataById(table.guardship.GuardShipInstanceConfig, rankData._myRankValue)
        if (cfg) {
            rankData._instanceName = cfg.name
            let roundIndex: number = cfg.roundIds.indexOf(rankData._addition)
            rankData._roundId = roundIndex + 1
        }
        return rankData;
    }

    static createBySecretInstance(rankingVo: Vo.secretinstance.SecretInstanceRankingVo) {
        const rankData = new EventRankDataResp();
        rankData._rankType = ServerEnums.RankingType.SECRET_INSTANCE;
        rankData._myRankNum = rankingVo.rank;
        rankData._myRankValue = rankingVo.value;
        rankData._maxPage = rankingVo.maxPage;
        rankData._dataList = (rankingVo.list || []).map(a => { return RankCommonData.createBySecretInstance(a); });
        rankData._addition = rankingVo.passSeconds;

        return rankData;
    }



    get rankType(): ServerEnums.RankingType {
        return this._rankType;
    }

    get myRankNum(): number {
        return this._myRankNum;
    }

    get myRankValue(): number {
        return this._myRankValue;
    }

    get dataList(): Array<RankCommonData> {
        return this._dataList;
    }

    get maxPage(): number {
        return this._maxPage;
    }


    get subType(): number {
        return this._subType;
    }


    get dailyBossDifficulty(): number {
        return this._dailyBossDifficulty;
    }

    get dailyBossHurtValue(): number {
        return this._dailyBossHurtValue;
    }

    get addition(): number {
        return this._addition;
    }

    get score(): number {
        return this._score;
    }

    get instanceName(): string {
        return this._instanceName;
    }

    get roundId(): number {
        return this._roundId;
    }
}
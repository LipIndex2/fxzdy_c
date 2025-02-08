import { ILeagueExploreStarVo } from "./ILeagueExploreStarVo";

/**勘探星球等级数据*/
export interface ILeagueExploreStarLevelVo {
    cfg: table.leagueexplore.LeagueExploreStarLevelConfig;
    stars:ILeagueExploreStarVo[]
}
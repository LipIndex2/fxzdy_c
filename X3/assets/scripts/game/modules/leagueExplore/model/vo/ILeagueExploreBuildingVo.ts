/**勘探建筑数据*/
export interface ILeagueExploreBuildingVo {
    /**配置信息*/
    cfg: table.leagueexplore.LeagueExploreBuildingConfig;
    /**建筑配置*/
    buildingCfg: table.map.MapBuildingConfig;
    /**简要信息*/
    briefVo: Vo.leagueexplore.LeagueExploreBuildingBriefVo;
    /**完整信息*/
    vo: Vo.leagueexplore.LeagueExploreBuildingVo;
}
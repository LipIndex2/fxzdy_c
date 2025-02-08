/**勘探建筑占领状态*/
export enum LeaugeExploreBuildingOccupyState {
    /**空闲状态*/
    Idle = 0,
    /**我占领*/
    Me = 1,
    /**我方占领(有空位)*/
    MyLeagueNoFull = 2,
    /**我方占领可互换*/
    MyLeagueCanExchange = 3,
    /**我方占领不可互换*/
    MyLeagueNoExchange = 4,
    /**敌方占领*/
    Enemy = 5,
}
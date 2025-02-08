/**勘探星球挂机数据*/
export interface ILeagueExploreHangUpVo {
    /**道具消耗*/
    costs: {k:number, v:number}[];
    /**奖励时长*/
    hangUpMinutes:number;
    /**是否高级采矿*/
    isAdvanced:boolean;
}
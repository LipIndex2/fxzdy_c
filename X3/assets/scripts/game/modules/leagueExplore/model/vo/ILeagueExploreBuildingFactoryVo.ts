import { ILeagueExploreBuildingVo } from "./ILeagueExploreBuildingVo";

/**勘探工厂数据*/
export interface ILeagueExploreBuildingFactoryVo {
    /**工厂信息*/
    factory: ILeagueExploreBuildingVo;
    /**矿信息*/
    mines: ILeagueExploreBuildingVo[];
}
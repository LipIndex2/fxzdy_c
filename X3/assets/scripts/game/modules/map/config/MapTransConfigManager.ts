import { TableManager } from "db://assets/scripts/core/table/TableManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";

export interface IMapTransStarData {
    id: number
    cfg: table.map.TrunkMapStarConfig
    name: string
}

export class MapTransConfigManager {

    protected static _testTabId: number = 9999;
    protected static _testTabName: string = '测试星球';
    protected static _mapStars: IMapTransStarData[] = []
    protected static _transCfgMap: Map<number, table.map.TeleportlistConfig[]> = new Map();
    protected static _buildStarIdMap:Map<number, number> = new Map()

    static getAllHeroItemIdArray() {
        return TableManager.getAllData(table.item.ItemConfig)
            .filter(it => ServerEnums.ItemType[it.type] == ServerEnums.ItemType.HERO_CARD)
            .map(it => it.id);
    }

    static initTransMap(): void {
        if (this._transCfgMap.size <= 0) {
            let allCfgs = TableManager.getAllData(table.map.TeleportlistConfig);
            allCfgs.forEach((cfg) => {
                let cfgList: table.map.TeleportlistConfig[] = null
                let mapCfg = TableManager.getDataById(table.map.MapidConfig, cfg.map_id)
                let starId = this._testTabId
                if (mapCfg && mapCfg.starId) {
                    starId = mapCfg.starId
                    
                }
                this._buildStarIdMap.set(cfg.building_id, starId)
                if (this._transCfgMap.has(starId)) {
                    cfgList = this._transCfgMap.get(starId)
                } else {
                    cfgList = []
                    this._transCfgMap.set(starId, cfgList)
                    let tabName = this._testTabName
                    let starCfg = null
                    if (starId != this._testTabId) {
                        starCfg = TableManager.getDataById(table.map.TrunkMapStarConfig, cfg.map_id)
                        tabName = starCfg ? starCfg.name : '未知星球' + starId
                    }

                    let tabData: IMapTransStarData = {
                        id: starId,
                        cfg: starCfg,
                        name: tabName
                    }
                    this._mapStars.push(tabData)
                }
                cfgList.push(cfg)
            })
            //传送点排序
            this._transCfgMap.forEach((list) => {
                list.sort((a, b) => {
                    return b.id - a.id
                })
            })
        }
    }

    static getMapStars(): IMapTransStarData[] {
        this.initTransMap()
        return this._mapStars
    }

    static getTransMap(): Map<number, table.map.TeleportlistConfig[]> {
        this.initTransMap()
        return this._transCfgMap

    }

    static getBuildStarId(buildingId:number):number {
        this.initTransMap()
        if (this._buildStarIdMap.has(buildingId)) {
            return this._buildStarIdMap.get(buildingId)
        }
        return 0
    }
}
import { TableManager } from "db://assets/scripts/core/table/TableManager";
import { IMapMainAdCfg } from "../model/vo/IMapMainAdCfg";
import G from "../../../core/comm/G";
import { StringUtils } from "../../../core/utils/StringUtils";

export class MapConfigManager {

    protected static _adCfg:IMapMainAdCfg = null
    
    static getMapConfig(mapId: number): any {
        return TableManager.getDataById(table.map.MapidConfig, mapId);
    }

    static getAdCfg():IMapMainAdCfg {
        if (this._adCfg == null) {
            let activeTime:number = 0
            let rewards:{k:any, v:any}[] = []
            let timeCfg = G.TableManager.getDataById(table.map.MapConstantConfig, 'MAP:MAIN_CITY_ADVERT_BOX_EXPIRE_MINUTES')
            if (timeCfg) {
                activeTime = Number(timeCfg.content) * 60 * 1000
            }
            let rewardCfg = G.TableManager.getDataById(table.map.MapConstantConfig, 'MAP:MAIN_CITY_ADVERT_BOX_REWARD_SHOW')
            if (rewardCfg) {
                rewards = StringUtils.toObject1Arr(rewardCfg.content)
            }
            this._adCfg = {
                activeTime:activeTime,
                rewards:rewards
            }
        }
        return this._adCfg
    }

}
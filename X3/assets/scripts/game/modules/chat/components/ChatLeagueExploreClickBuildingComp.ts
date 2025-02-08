import { _decorator, Component, EventTouch } from 'cc';
import G from 'db://assets/scripts/core/comm/G';
import GIns from '../../../GIns';
import { ChatUIKeys } from '../ChatUIKeys';
const { ccclass, property } = _decorator;

@ccclass('ChatLeagueExploreClickBuildingComp')
export class ChatLeagueExploreClickBuildingComp extends Component {

    onClickBuilding(eventTouch: EventTouch, param: string) {
        let buildingConfigId: number = Number(param);
        if (buildingConfigId) {
            let buildingCfg = G.TableManager.getDataById(table.leagueexplore.LeagueExploreBuildingConfig, buildingConfigId);
            if (buildingCfg) {
                if (buildingCfg.starConfigId == GIns.mapMgr.curMap?.getMapID()) {
                    //同一星球寻路
                    GIns.leagueExploreMgr.gotoBuilding(buildingCfg.id);
                } else {
                    //不同星球传送
                    GIns.leagueExploreMgr.enterPlanet(buildingCfg.starConfigId, buildingConfigId);
                }
                G.UIManager.close(ChatUIKeys.ChatMainView);
            }
        }
    }
}
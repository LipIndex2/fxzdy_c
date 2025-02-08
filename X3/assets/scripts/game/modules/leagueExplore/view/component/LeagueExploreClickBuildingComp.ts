import { _decorator, Component, EventTouch } from 'cc';
import GIns from '../../../../GIns';
import G from '../../../../../core/comm/G';
import { UILeagueExploreConfig } from '../../const/UILeagueExploreConfig';
const { ccclass, property } = _decorator;

@ccclass('LeagueExploreClickBuildingComp')
export class LeagueExploreClickBuildingComp extends Component {

    onClickedFromRecord(eventTouch: EventTouch, param: string) {
        GIns.leagueExploreMgr.gotoBuilding(Number(param));
        G.UIManager.close(UILeagueExploreConfig.LeagueExploreIncomeWin);
    }
}
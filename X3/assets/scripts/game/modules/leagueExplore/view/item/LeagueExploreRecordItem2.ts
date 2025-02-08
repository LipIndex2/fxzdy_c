import * as fgui from "fairygui-cc";
import G from "../../../../../core/comm/G";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { DateUtils } from "../../../../../core/utils/DateUtils";
import { ServerEnums } from "../../../../../libs/extras/ServerEnums";
import GIns from "../../../../GIns";
import { LeagueExploreUtils } from "../../LeagueExploreUtils";
import { LeagueExploreClickBuildingComp } from "../component/LeagueExploreClickBuildingComp";

/**
 * 勘探联盟日志item
 */
@bindFguiExtension('ui://leagueExplore/LeagueExploreRecordItem2')
export class LeagueExploreRecordItem2 extends fgui.GComponent {

    static pkgName: string = "leagueExplore";
    static viewName: string = "LeagueExploreRecordItem2";

    private get view(): ui.leagueExplore.item.LeagueExploreRecordItem2 {
        return this as any;
    }

    /***组件初始化 */
    protected onInit(): void {

    }

    protected onPreDispose(): void {

    }

    protected onClickBuilding(): void {
    }

    protected updateUI(logType: number, buildingId: number, time: number, playerId: number): void {
        let myPlayerId: number = GIns.playerModel.playerId;
        let buildingCfg = G.TableManager.getDataById(table.map.MapBuildingConfig, buildingId);
        let buildingName: string = buildingCfg ? buildingCfg.name : '';
        let buildingColorHex: string = '';
        let desStr: string = '';
        let isMe: boolean = playerId == myPlayerId;
        switch (logType) {
            case ServerEnums.LeagueExploreLogType.OCCUPY_BUILDING:
                //占领
                buildingColorHex = LeagueExploreUtils.colorForEnemy.toHEX();
                desStr = isMe ? '您' : '联盟';
                desStr += `占领了<color=#${buildingColorHex}><u><on click="onClickedFromRecord" param="${buildingId}">${buildingName}</on></u></color>`;
                break;
            case ServerEnums.LeagueExploreLogType.BE_OCCUPY_BUILDING:
                //被占领
                if (isMe) {
                    buildingColorHex = LeagueExploreUtils.colorForLeauge.toHEX();
                    desStr = '您';
                } else {
                    buildingColorHex = LeagueExploreUtils.colorForLeauge.toHEX();
                    desStr = '联盟';
                }
                desStr += `的<color=#${buildingColorHex}><u><on click="onClickedFromRecord" param="${buildingId}">${buildingName}</on></u></color>被占领`;
                break;
            case ServerEnums.LeagueExploreLogType.ATTACK_BUILDING_DEFENDER:
                //进攻
                buildingColorHex = LeagueExploreUtils.colorForEnemy.toHEX();
                desStr = isMe ? '您' : '联盟';
                desStr += `挑战了<color=#${buildingColorHex}><u><on click="onClickedFromRecord" param="${buildingId}">${buildingName}</on></u></color>`;
                break;
            case ServerEnums.LeagueExploreLogType.ATTACK_BUILDING_DEFENDER:
                //防守
                if (isMe) {
                    buildingColorHex = LeagueExploreUtils.colorForLeauge.toHEX();
                    desStr = '您';
                } else {
                    buildingColorHex = LeagueExploreUtils.colorForLeauge.toHEX();
                    desStr = '联盟';
                }
                desStr += `的<color=#${buildingColorHex}><u><on click="onClickedFromRecord" param="${buildingId}">${buildingName}</on></u></color>被挑战`;
                break;
        }
        this.view.lbDes.text = desStr;
        this.view.lbTime.text = DateUtils.dateTimeFormat(time, 'yyyy/MM/dd hh:mm:ss');

        //添加点击组件
        if (this.view.lbDes.node.getComponent(LeagueExploreClickBuildingComp) == null) {
            this.view.lbDes.node.addComponent(LeagueExploreClickBuildingComp)
        }
    }

    public setData(data: Vo.leagueexplore.LeagueExploreRecord): void {
        this.updateUI(data.logType, data.buildingConfigId, data.time, data.baseVo.id);
    }

    public setDataByPlayer(data: Vo.leagueexplore.PlayerLeagueExploreRecord): void {
        this.updateUI(data.logType, data.buildingConfigId, data.time, data.attackerBaseVo.id);
    }
}
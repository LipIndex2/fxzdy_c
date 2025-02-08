import * as fgui from "fairygui-cc";
import G from "../../../../../core/comm/G";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { DateUtils } from "../../../../../core/utils/DateUtils";
import { FguiScriptUtils } from "../../../../../core/utils/FguiScriptUtils";
import GIns from "../../../../GIns";
import { FightType } from "../../../../comm/battle/enum/FightType";
import { PlayerAvatar } from "../../../common/playerInfo/PlayerAvatar";
import { LeagueExploreUtils } from "../../LeagueExploreUtils";
import { UILeagueExploreConfig } from "../../const/UILeagueExploreConfig";

/**
 * 勘探个人日志item
 */
@bindFguiExtension('ui://leagueExplore/LeagueExploreRecordItem1')
export class LeagueExploreRecordItem1 extends fgui.GComponent {

    static pkgName: string = "leagueExplore";
    static viewName: string = "LeagueExploreRecordItem1";

    protected _recordData: Vo.leagueexplore.PlayerLeagueExploreRecord = null;
    private get view(): ui.leagueExplore.item.LeagueExploreRecordItem1 {
        return this as any;
    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.btnReport.onClick(this.onClickReport, this);
        this.view.btnGoto.onClick(this.onClickGoto, this);
    }

    protected onPreDispose(): void {

    }

    protected onClickReport(): void {
        if (!this._recordData.attackerStatisticsVos || !this._recordData.defenderStatisticsVos || this._recordData.attackerStatisticsVos.length <= 0 || this._recordData.defenderStatisticsVos.length <= 0) {
            //没有战斗单位数据
            GIns.floatingTextMgr.showTips('本场战斗记录遗失，暂无法查看');
            return;
        }
        GIns.battleRecordMgr.showRecordViewByServer(
            FightType.LEAGUE_EXPLORE,
            this._recordData.attackerBaseVo,
            this._recordData.defenderBaseVo,
            this._recordData.attackerStatisticsVos,
            this._recordData.defenderStatisticsVos,
            this._recordData.attackerWin
        )
    }

    protected onClickGoto(): void {
        GIns.leagueExploreMgr.gotoBuilding(this._recordData.buildingConfigId);
        G.UIManager.close(UILeagueExploreConfig.LeagueExploreIncomeWin);
    }

    public setData(data: Vo.leagueexplore.PlayerLeagueExploreRecord): void {
        this._recordData = data;
        let myPlayerId: number = GIns.playerModel.playerId;
        let isWin: boolean = false;
        let myPlayerBaseVo: Vo.player.PlayerBaseVo = null;
        let otherPlayerBaseVo: Vo.player.PlayerBaseVo = null;
        let buildingColorHex: string = '';
        let tipStr: string = '';
        if (data.attackerBaseVo.id == myPlayerId) {
            //我是攻击方
            this.view.getController('attkState').selectedIndex = 0;
            isWin = data.attackerWin;
            myPlayerBaseVo = data.attackerBaseVo;
            otherPlayerBaseVo = data.defenderBaseVo;
            if (isWin) {
                tipStr = '挑战成功'
            } else {
                tipStr = '挑战失败'
            }
            buildingColorHex = LeagueExploreUtils.colorForEnemy.toHEX();
        } else {
            //我是防守方
            this.view.getController('attkState').selectedIndex = 1;
            isWin = !data.attackerWin;
            myPlayerBaseVo = data.defenderBaseVo;
            otherPlayerBaseVo = data.attackerBaseVo;
            if (isWin) {
                tipStr = '防守成功'
            } else {
                tipStr = '防守失败'
            }
            buildingColorHex = LeagueExploreUtils.colorForLeauge.toHEX();
        }
        this.view.getController('winState').selectedIndex = isWin ? 0 : 1;

        this.view.lbMyName.text = GIns.playerModel.playerName;
        this.view.lbMyLeague.text = GIns.LeagueModel.getLeagueName();
        this.view.lbEnemyName.text = otherPlayerBaseVo.name;
        if (GIns.LeagueModel.getLeagueId() == otherPlayerBaseVo.leagueId) {
            //攻打的是同联盟的
            this.view.lbEnemyLeague.text = GIns.LeagueModel.getLeagueName();
        } else {
            this.view.lbEnemyLeague.text = otherPlayerBaseVo.leagueName;
        }

        FguiScriptUtils.toMyScriptClass(this.view.avatarMy, PlayerAvatar).resetMe();
        this.view.avatarMy.touchable = false;
        FguiScriptUtils.toMyScriptClass(this.view.avatarEnemy, PlayerAvatar).resetByPlayerInfo(otherPlayerBaseVo);

        let buildingCfg = G.TableManager.getDataById(table.map.MapBuildingConfig, data.buildingConfigId);
        let buildingName: string = buildingCfg ? buildingCfg.name : '';
        this.view.lbDes.text = `<color=#${buildingColorHex}><u>${buildingName}</u></color> ${tipStr} ${DateUtils.dateTimeFormat(data.time, 'yyyy/MM/dd hh:mm:ss')}`;
    }
}
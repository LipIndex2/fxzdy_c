import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { FguiScriptUtils } from "../../../../../core/utils/FguiScriptUtils";
import { StringUtils } from "../../../../../core/utils/StringUtils";
import { ServerEnums } from "../../../../../libs/extras/ServerEnums";
import GIns from "../../../../GIns";
import { PlayerAvatar } from "../../../common/playerInfo/PlayerAvatar";
import { ILeagueExploreBuildingVo } from "../../model/vo/ILeagueExploreBuildingVo";

/**
 * 勘探防守成员item
 */
@bindFguiExtension('ui://leagueExplore/LeagueExploreDefendItem')
export class LeagueExploreDefendItem extends fgui.GComponent {

    static pkgName: string = "leagueExplore";
    static viewName: string = "LeagueExploreDefendItem";

    protected _buildingVo: ILeagueExploreBuildingVo = null;
    private get view(): ui.leagueExplore.item.LeagueExploreDefendItem {
        return this as any;
    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.btnTop.onClick(this.onClickTop, this);
    }

    protected onPreDispose(): void {

    }

    protected onClickTop(): void {
        if (this._buildingVo) {
            if (this._buildingVo.vo?.attacking) {
                GIns.floatingTextMgr.showTips('1号位玩家正在被攻打，请稍后再试')
                return;
            }
            GIns.leagueExploreModel.sendTopBuildingOccupy();
        }
    }

    /**设置无人驻守的提示*/
    public setOccupyTip(value: string): void {
        this.view.lbOccupyTip.text = value;
    }

    public setData(data: Vo.leagueexplore.LeagueExploreMemberVo, index: number, buildingVo: ILeagueExploreBuildingVo): void {
        this._buildingVo = buildingVo;
        if (ServerEnums.LeagueExploreBuildingType[buildingVo?.cfg.buildingType] == ServerEnums.LeagueExploreBuildingType.MINE) {
            this.view.getController('style').selectedIndex = 1;
        } else {
            this.view.getController('style').selectedIndex = 0;
        }
        this.view.lbIdx.text = (index + 1) + '号';
        this.view.btnTop.visible = false;
        if (data == null) {
            //无人驻守
            this.view.getController('state').selectedIndex = 0;
            this.view.iconMarker.visible = false;
        } else {
            let myLeagueId: number = GIns.LeagueModel.getLeagueId();
            let myPlayerId: number = GIns.playerModel.playerId;
            if (data.baseVo.id == myPlayerId) {
                //我驻守
                this.view.getController('state').selectedIndex = 1;
                this.view.btnTop.visible = data.occupyIndex != 1;
            } else if (data.baseVo.leagueId == myLeagueId) {
                //我方驻守
                this.view.getController('state').selectedIndex = 2;
            } else {
                //敌方驻守
                this.view.getController('state').selectedIndex = 3;
            }
            this.view.lbName.text = data.baseVo.name;
            this.view.lbFight.text = '战力：' + StringUtils.getFightStr(data.baseVo.fight);
            FguiScriptUtils.toMyScriptClass(this.view.avatar, PlayerAvatar).resetByPlayerInfo(data.baseVo);
            this.view.avatar.touchable = data.baseVo.id != myPlayerId;
            this.view.iconMarker.visible = data.continueWinOrFail > 0;
            if (data.continueWinOrFail > 0) {
                this.view.iconMarker.visible = true;
                this.view.iconMarker.lbWin.text = data.continueWinOrFail + '连胜';
            } else {
                this.view.iconMarker.visible = false;
            }
        }
        
    }
}
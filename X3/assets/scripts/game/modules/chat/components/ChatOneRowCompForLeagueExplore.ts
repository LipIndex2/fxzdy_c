import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { ChatRowVo } from "db://assets/scripts/game/modules/chat/vo/ChatRowVo";
import G from "../../../../core/comm/G";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import GIns from "../../../GIns";
import { PlayerAvatar } from "../../common/playerInfo/PlayerAvatar";
import { LeagueExploreUtils } from "../../leagueExplore/LeagueExploreUtils";
import { ChatOneRowContentBaseComp } from "./ChatOneRowContentBaseComp";
import { ChatUIKeys } from "../ChatUIKeys";
import { Color } from "cc";

@bindFguiExtension('ui://chat/ChatOneRowCompForLeagueExplore')
export class ChatOneRowCompForLeagueExplore extends ChatOneRowContentBaseComp {

    protected _rowVo: ChatRowVo = null;

    protected _defaultContentH: number = 0
    protected _defaultBgH: number = 0
    protected _defaultH: number = 0

    protected _noneColor:Color = new Color('#284eb8');
    protected _myColor:Color = new Color('#04b80d');
    protected _myLeagueColor:Color = new Color('#2eaeff');
    protected _otherColor:Color = new Color('#ff5555');



    private get view(): ui.chat.components.ChatOneRowCompForLeagueExplore {
        return this as any;
    }


    protected onInit() {
        //记录默认颜色
        this._defaultColor.set(this.view.textPlayerNameL.color)
        this._defaultOutlineWidth = this.view.textContentL.stroke
        if (this._defaultOutlineWidth > 0 && this.view.textPlayerNameL.strokeColor) {
            this._defaultOutlineColor = this.view.textPlayerNameL.strokeColor.clone()
        }

        this.view.btnGotoL.onClick(this.onClickGoto, this)
        this.view.btnGotoR.onClick(this.onClickGoto, this)

        this._defaultContentH = this.view.textContentL.height
        this._defaultBgH = this.view.bgContentL.height
        this._defaultH = this.view.height
    }

    protected getLbNames(): FGUI.GTextField[] {
        return [this.view.textPlayerNameL, this.view.textPlayerNameR]
    }

    protected getAvatar(): PlayerAvatar {
        return FguiScriptUtils.toMyScriptClass(this.view.playerAvatar, PlayerAvatar);
    }

    protected onClickGoto(): void {
        let shareVo = this._rowVo?.templateVo?.termVo?.buildingShareVo;
        if (shareVo) {
            let buildingCfg = G.TableManager.getDataById(table.leagueexplore.LeagueExploreBuildingConfig, shareVo.buildingConfigId);
            if (buildingCfg) {
                if (buildingCfg.starConfigId == GIns.mapMgr.curMap?.getMapID()) {
                    //同一星球寻路
                    GIns.leagueExploreMgr.gotoBuilding(buildingCfg.id);
                }else {
                    //不同星球传送
                    GIns.leagueExploreMgr.enterPlanet(buildingCfg.starConfigId, 0, { x: shareVo.point.x, y: shareVo.point.y });
                }
                
                G.UIManager.close(ChatUIKeys.ChatMainView);
            }
        }
    }

    reset(rowVo: ChatRowVo) {
        this._rowVo = rowVo;
        this.setRowVo(rowVo);
        const showType = rowVo.type;

        this.view.getController("type").selectedIndex = showType;

        let shareVo = rowVo?.templateVo?.termVo?.buildingShareVo;
        if (shareVo) {
            let buildingCfg = G.TableManager.getDataById(table.map.MapBuildingConfig, shareVo.buildingConfigId)
            this.view.textBuildingL.text = this.view.textBuildingR.text = buildingCfg ? buildingCfg.name : '';

            let myLeagueId = GIns.LeagueModel.getLeagueId();
            let nameColor = this._noneColor;
            if (shareVo.occupyLeagueId > 0) {
                if (shareVo.occupyLeagueId == myLeagueId) {
                    //我的联盟占领
                    if (shareVo.occupyPlayerId == GIns.playerModel.playerId) {
                        //我占领的
                        nameColor = this._myColor;
                    } else {
                        nameColor = this._myLeagueColor;
                    }
                } else {
                    nameColor = this._otherColor;
                }
            }
            this.view.textLeagueNameL.color = this.view.textLeagueNameR.color = nameColor;
            this.view.textLeagueNameL.text = this.view.textLeagueNameR.text = shareVo.occupyPlayerName ? shareVo.occupyPlayerName : '    无';
            this.view.textContentL.text = this.view.textContentR.text = '占领者：'
            this.view.iconLoaderL.icon = this.view.iconLoaderR.icon = buildingCfg.building_collection;
        } else {
            this.view.textBuildingL.text = this.view.textBuildingR.text = '';
            this.view.textLeagueNameL.text = this.view.textLeagueNameR.text = '';
        }
    }
}
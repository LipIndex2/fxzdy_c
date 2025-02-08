import { RichText } from "cc";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { RichTextUtils } from "../../../../core/utils/RichTextUtils";
import GIns from "../../../GIns";
import { LeaugeExploreBuildingOccupyState } from "../const/LeagueExploreEnum";
import { ILeagueExploreExchangeConfirmOpenArgs, LeagueExploreConfirmType, UILeagueExploreConfig } from "../const/UILeagueExploreConfig";

@bindScript(UILeagueExploreConfig.LeagueExploreExchangeConfirmWin)
export class LeagueExploreExchangeConfirmWin extends UICommWin {
    static pkgName: string = "leagueExplore";
    static viewName: string = "LeagueExploreExchangeConfirmWin";

    protected _args: ILeagueExploreExchangeConfirmOpenArgs = null;

    private get view(): ui.leagueExplore.view.LeagueExploreExchangeConfirmWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
        ];
    }

    notificationHandler(event: string, args?: any): void {

    }

    /***组件初始化 */
    protected onInit(): void {
        this.view.btnYes.onClick(this.onClickYes, this);
        this.view.btnNo.onClick(this.closeSelf, this);
    }

    protected onPreDispose(): void {

    }
    protected onClickYes(): void {
        if (this._args?.okFunc) {
            this._args.okFunc();
        }
        this.closeSelf();
    }

    protected updateUI(): void {
        let buildingVo = GIns.leagueExploreModel.getBuildingVo(this._args.buildingId);
        let tipStr: string = '';
        let atlasPath: string = null;
        if (buildingVo) {
            let state: LeaugeExploreBuildingOccupyState = GIns.leagueExploreModel.getBuildingOccupyState(buildingVo);
            let myIcon: string = null;
            let curIcon: string = null;
            let myBuildingId: number = GIns.leagueExploreModel.activityinfo.playerInfoVo.occupyBuildingConfigId;
            let myBuildingVo = GIns.leagueExploreModel.getBuildingVo(myBuildingId);
            let trunkCfg = GIns.miniMapMgr.getBuildingTrunkCfg(myBuildingVo?.buildingCfg?.building_type);
            if (trunkCfg) {
                let lastIndex = trunkCfg.myOccupyIconPath.lastIndexOf('/');
                if (lastIndex != -1) {
                    atlasPath = trunkCfg.myOccupyIconPath.substring(0, lastIndex);
                    myIcon = trunkCfg.myOccupyIconPath.substring(lastIndex + 1);
                    if (this._args.type == LeagueExploreConfirmType.Exchange) {
                        //更换占领
                        trunkCfg = GIns.miniMapMgr.getBuildingTrunkCfg(buildingVo.buildingCfg.building_type);
                        if (state == LeaugeExploreBuildingOccupyState.Idle) {
                            lastIndex = trunkCfg.activeIconPath.lastIndexOf('/')
                            curIcon = trunkCfg.activeIconPath.substring(lastIndex + 1);
                        } else if (state == LeaugeExploreBuildingOccupyState.Enemy) {
                            lastIndex = trunkCfg.otherOccupyIconPath.lastIndexOf('/')
                            curIcon = trunkCfg.otherOccupyIconPath.substring(lastIndex + 1);
                        } else {
                            lastIndex = trunkCfg.myOccupyIconPath.lastIndexOf('/')
                            curIcon = trunkCfg.myOccupyIconPath.substring(lastIndex + 1);
                        }
                        tipStr = `当前已占领<img src='${myIcon}' width='36' height='36'/>${myBuildingVo?.buildingCfg?.name}，<br/>是否确认更换为<img src='${curIcon}' width='36' height='36'/>${buildingVo?.buildingCfg?.name}`
                    } else if (this._args.type == LeagueExploreConfirmType.CancelOccupy) {
                        //取消占领
                        tipStr = `当前正在占领<img src='${myIcon}' width='36' height='36'/>${myBuildingVo?.buildingCfg?.name}，<br/>是否确认退出建筑？`
                    }
                }
            }
        }
        if (atlasPath) {
            //有图标配置
            RichTextUtils.setTextWithImg(tipStr, this.view.labelContent.node.getComponent(RichText), atlasPath);
        } else {
            this.view.labelContent.text = tipStr;
        }
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this._args = args;
        this.updateUI();
    }

    protected onClose(dontDispose?: boolean): void {

    }
}
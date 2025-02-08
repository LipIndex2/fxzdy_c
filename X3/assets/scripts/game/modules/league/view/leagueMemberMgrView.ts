import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import { UIView, ViewAdaptType } from "../../../../core/mvc/view/UIView";
import * as fgui from "fairygui-cc";
import NotificationKey from "../../../event/NotificationKey";
import { LeagueModel } from "../LeagueModel";
import { LeagueManager } from "../leagueManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { RankCommonData } from "../../rank/structs/RankCommonData";
import { PlayerManager } from "../../player/PlayerManager";
import { PlayerModel } from "../../player/model/PlayerModel";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { PlayerAvatar } from "../../common/playerInfo/PlayerAvatar";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UILeagueKey } from "../const/UILeagueConst";

@bindScript(UILeagueKey.LeagueMemberMgrView)
export class LeagueMemberMgrView extends UICommWin {
    static pkgName: string = "league";

    static viewName: string = "memberMgrView";

    private get view(): ui.league.memberMgrView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [NotificationKey.EVENT_LEAGUE_MEMBER_CHANGE];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_LEAGUE_MEMBER_CHANGE:
                this.updateView();
                break;


        }
    }

    protected onInit(): void {
        let view = this.view;

        view.list.itemRenderer = this.listRender.bind(this);
        
    }

   
    public onOpen(): void {

        LeagueModel.ins().loadLeagueMemberList();

    }
    private listDatas: Vo.league.LeagueMemberVo[];
    private updateView(): void {
        let view = this.view;
        this.listDatas = LeagueManager.ins().mLeagueMemberList;
        if (this.listDatas && this.listDatas.length > 0) {
            view.list.numItems = this.listDatas.length;

        }
        let loginVo = LeagueManager.ins().mPlayerLeagueLoginVo;
        //看看我有没有权限
        let p1 = LeagueModel.ins().hasPermission(loginVo.jobType, ServerEnums.LeaguePermissionType.REMOVE_MEMBER);
        let p2 = LeagueModel.ins().hasPermission(loginVo.jobType, ServerEnums.LeaguePermissionType.MEMBER_APPOINT);
        let p3 = LeagueModel.ins().hasPermission(loginVo.jobType, ServerEnums.LeaguePermissionType.TRANSFER_LEADER);
        if (p1 || p2 || p3) {

        }
        else {
            //没有任何权限
            this.closeSelf();
        }

    }



    private listRender(index: number, obj: ui.league.com.manageCell): void {

        let data = this.listDatas;
        let loginVo = LeagueManager.ins().mPlayerLeagueLoginVo;
        if (data) {
            let vo = data[index];
            obj.nameLab.text = vo.name;
            obj.fightLab.text = `战力：${vo.fight}`;
            let onlineState = obj.getController("state");
            let stateData = LeagueModel.ins().getMemberOnlineState(vo);
            onlineState.selectedIndex = stateData.state;
            obj.onLineLab.text = stateData.timeStr;
            obj.dayOutLab.text = stateData.timeStr;

            obj.jobList.selectedIndex = vo.jobType - 1;

            const avatar = FguiScriptUtils.toMyScriptClass(obj.avatar, PlayerAvatar);
            avatar.reset(vo.id, vo.headIcon, vo.headFrame, vo.imageId);
           // avatar.setCanShowMe(true);

            if (vo.id == PlayerModel.ins().Vo.id) {
                //不能对自己操作
                obj.removeBtn.visible = false;
                obj.jobList.touchable = false;
            }
            else if(vo.jobType == ServerEnums.LeagueJobType.LEADER)
            {
                //不能对盟主操作
                obj.removeBtn.visible = false;
                obj.jobList.touchable = false;
            }
            else {
                obj.removeBtn.visible = LeagueModel.ins().hasPermission(loginVo.jobType, ServerEnums.LeaguePermissionType.REMOVE_MEMBER);
                obj.jobList.touchable = LeagueModel.ins().hasPermission(loginVo.jobType, ServerEnums.LeaguePermissionType.MEMBER_APPOINT);
                // obj.jobList.getChildAt(0).enabled = 

                obj.removeBtn.clearClick();
                obj.removeBtn.onClick(() => {
                    LeagueModel.ins().removeMember(vo.id, vo.name);
                }, this);
                obj.jobList.clearClick();
                obj.jobList.onClick(() => {
                    if ((obj.jobList.selectedIndex + 1) != vo.jobType) {
                        let jobType = obj.jobList.selectedIndex + 1;
                        if (jobType == ServerEnums.LeagueJobType.LEADER) {
                            if (LeagueModel.ins().hasPermission(loginVo.jobType, ServerEnums.LeaguePermissionType.TRANSFER_LEADER))
                                LeagueModel.ins().memberAppoint(vo.id, vo.name, jobType);
                        }
                        else {
                            LeagueModel.ins().memberAppoint(vo.id, vo.name, jobType);
                        }

                    }
                }, this);


            }
        }

    }

}
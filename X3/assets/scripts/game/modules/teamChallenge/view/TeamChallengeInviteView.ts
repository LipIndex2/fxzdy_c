/** 组队副本  队伍邀请界面 */

import G from "../../../../core/comm/G";
import UIScriptManager from "../../../../core/comm/UIScriptManager";
import { LogBusiness } from "../../../../core/log/LogBusiness";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import NotificationKey from "../../../event/NotificationKey";
import { TeamChallengeInviteItem } from "../component/TeamChallengeInviteItem";
import { TeamChallengePage2Btn } from "../component/TeamChallengePage2Btn";
import { TeamChallengeShareBtn } from "../component/TeamChallengeShareBtn";
import { TeamChallengeModel } from "../model/TeamChallengeModel";
import { TeamChallengeUIKeys } from "../TeamChallengeUIKeys";

/**组队副本邀请类型*/
export enum TeamChallengeInviteType {
    /**好友*/
    Friend = 1,
    /**最近组队 */
    Group = 2,
    /**好友镜像 */
    FriendMirror =5,
    /**好友标题 */
    FriendTitle =3,
    /**最近组队标题 */
    GroupTitle = 4,
    /**好友镜像标题 */
    FriendMirrorTitle =6,
    /**好友镜像说明提示 */
    FriendMirrorTitleInfo =7,
    /**普通机器人 */
    NormalRobot = 8,

}

export class TeamChallengeInviteView extends UICommWin {

    static pkgName: string = "teamChallenge";
    static viewName: string = "TeamChallengeInviteView";

    /**滚动位置 */
    private _sIndex:number;
    /**滚动位置2 */
    private _sIndex2:number;


    private _subTab:number[]=[
        TeamChallengeInviteType.Friend,
        TeamChallengeInviteType.Group,
        TeamChallengeInviteType.FriendMirror
    ]

    private _type:number;

    
    private get view(): ui.teamChallenge.TeamChallengeInviteView {
        return this._view as any;
    }

    private get model():TeamChallengeModel{
        return TeamChallengeModel.ins();
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.EVENT_TEAM_INVITE_PAGE_CHANGE,
            NotificationKey.EVENT_TEAM_INVITE_LIST_UPDATE,
            NotificationKey.EVENT_TEAM_SHARE_ALL_SUCESS,
            NotificationKey.SYSTEM_NEW_DAY,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_TEAM_INVITE_PAGE_CHANGE:
                //更新分页
                this.updateSubPage(args);
                break;
            case NotificationKey.EVENT_TEAM_INVITE_LIST_UPDATE:
                this.updateList();
                break;
            case NotificationKey.EVENT_TEAM_SHARE_ALL_SUCESS:
                this.updateList();
                break;
            case NotificationKey.SYSTEM_NEW_DAY:
                this.sendList();
                break;
        }
    }

    @LogBusiness("关闭界面")
    protected onClose() {
        GameTimer.ins().clearAll(this);

        super.onClose();
    }

    protected onInit() {
        const t = this;
        t.view.btnShare.onClick(t.onShare, t);
        t.view.btnShare.title = '一键分享';

        t.view.listFriends.setVirtual();
        t.view.listFriends.itemRenderer = t.addFriends.bind(t);
        t.view.listFriends.itemProvider = t.irProvider.bind(t);

        t.view.listTabs.setVirtual();
        t.view.listTabs.itemRenderer = t.addTabs.bind(t);
        t.view.listTabs.itemProvider = t.irProTab.bind(t);
    }   

    @LogBusiness("打开界面")
    public onOpen(args: any): void {
        const t = this;
        // model
        t._type = TeamChallengeInviteType.Friend;
        t.sendList();

       const btnSever = FguiScriptUtils.toMyScriptClass(t.view.btnSever, TeamChallengeShareBtn);
       btnSever.reset(ServerEnums.ChannelType.TEAM);
       const btnLeague = FguiScriptUtils.toMyScriptClass(t.view.btnLeague, TeamChallengeShareBtn);
       btnLeague.reset(ServerEnums.ChannelType.LEAGUE);
    }

    public sendList(){
        const t = this;
        const ctrl = t.view.getController('state');
        if(TeamChallengeModel.ins().isCaptain()){
            t.model.sendLoadFriendList();
            t.model.sendLoadRecentPlayerList();
            t.model.sendLoadFriendImageList();
            ctrl.selectedIndex = 0;
        }else{
            t.model.sendLoadFriendList();
            t.model.sendLoadRecentPlayerList();
            ctrl.selectedIndex = 1;
        }
    }

    public onShare(){
        const t = this;
        const btnSever = FguiScriptUtils.toMyScriptClass(t.view.btnSever, TeamChallengeShareBtn);
        const btnLeague = FguiScriptUtils.toMyScriptClass(t.view.btnLeague, TeamChallengeShareBtn);
        if(!btnSever.getMask().visible || !btnLeague.getMask().visible){
            this.model.sendOneKeyShareTeam();
        }        
    }

    private addTabs(indent:number, item:TeamChallengePage2Btn){
        const subType = this._subTab[indent];
        item.reset(subType, this._type);
    }

    private addFriends(index:number, item:TeamChallengeInviteItem){
        let info = TeamChallengeModel.ins().getInviteList(TeamChallengeModel.ins().isCaptain());
        const vos = info[0];
        this._sIndex = info[1];
        this._sIndex2 = info[2];

        const vo = vos[index];
        item.reset(vo);
    }

    private updateList(){
        const t = this;
        const model = TeamChallengeModel.ins();
        const info = model.getInviteList(TeamChallengeModel.ins().isCaptain());
        const vos = info[0]
        this._sIndex = info[1];
        this._sIndex2 = info[2];

        t.view.listFriends.numItems = vos.length;
        t.view.listTabs.numItems = model.isCaptain()?3:2;
    }

    private updateSubPage(type){
        const t = this;
        if(t._type== type){
            return;
        }
        t._type = type
        if(t._type == TeamChallengeInviteType.Friend){
            t.view.listFriends.scrollToView(0, false, true);
        }else if(t._type == TeamChallengeInviteType.Group){
            t.view.listFriends.scrollToView(t._sIndex, false, true);
        }else if(t._type == TeamChallengeInviteType.FriendMirror){
            t.view.listFriends.scrollToView(t._sIndex2, false, true);
        }
        t.view.listTabs.numItems = TeamChallengeModel.ins().isCaptain()?3:2;
    }

    

    protected irProvider(index: number): string {
        const vos = TeamChallengeModel.ins().getInviteList(TeamChallengeModel.ins().isCaptain())[0];
        const vo = vos[index];
        if(vo.type == TeamChallengeInviteType.FriendTitle ||
            vo.type == TeamChallengeInviteType.GroupTitle ||
            vo.type == TeamChallengeInviteType.FriendMirrorTitle
        ){  
            //标题
            return 'ui://teamChallenge/TeamChallengeInviteTitle';
        }else if(vo.type == TeamChallengeInviteType.FriendMirrorTitleInfo){
             //说明
            return 'ui://teamChallenge/TeamChallengeInviteInfo';
        }
        //item
        return 'ui://teamChallenge/TeamChallengeInviteItem';
    }

    protected irProTab(){
        if(TeamChallengeModel.ins().isCaptain()){
            //是队长，有三个
            return 'ui://teamChallenge/TeamChallengePage2Btn';
        }else{
            return 'ui://teamChallenge/TeamChallengePage3Btn';
        }
    }

}
UIScriptManager.bindScript(TeamChallengeUIKeys.TeamChallengeInviteView, TeamChallengeInviteView);
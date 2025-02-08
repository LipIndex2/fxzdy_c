import * as fgui from "fairygui-cc";
import { TeamChallengeMgrSubUIKeys } from "../TeamChallengeUIKeys";
import FacadeManager from "../../../../core/mvc/FacadeManager";
import NotificationKey from "../../../event/NotificationKey";
import { TeamChallengeInviteType } from "../view/TeamChallengeInviteView";

export class TeamChallengePage2Btn extends fgui.GComponent {

    private _index: number = 1;

    get view(): ui.teamChallenge.components.TeamChallengePage2Btn {
        return this as any;
    }


    protected onConstruct() {
        super.onConstruct();

        this.view.onClick(this.onClickPage, this);
    }

    onClickPage() {
        FacadeManager.ins().emit(NotificationKey.EVENT_TEAM_INVITE_PAGE_CHANGE, this._index);
    }

    reset(index:number,choose:number) {
        const t = this;
        t._index =index;
        
        if(t._index ==  TeamChallengeInviteType.Friend){
            //队伍设置
            t.view.lb.text = '好友';
        }else if(t._index ==  TeamChallengeInviteType.Group){
            //加入申请
            t.view.lb.text = '最近组队';
        }else if(t._index ==  TeamChallengeInviteType.FriendMirror){
            //好友镜像
            t.view.lb.text = '好友镜像';
        }

        if(t._index == choose){
            t.view.imgSel.visible = true;
        }else{
            t.view.imgSel.visible = false;
        }
    }

}
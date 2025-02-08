/*组队副本 邀请item标题 */

import * as fgui from "fairygui-cc";
import { TeamChallengeInviteType } from "../view/TeamChallengeInviteView";

export class TeamChallengeInviteTitle extends fgui.GComponent {

    static pkgName: string = "teamChallenge";
    static viewName: string = "TeamChallengeInviteTitle";

        
    private _index: number = 1;

    get view(): ui.teamChallenge.components.TeamChallengeInviteTitle {
        return this as any;
    }


    protected onConstruct() {
        super.onConstruct(); 
    }


    reset(vo:{
        type: number;
        vo: Vo.player.PlayerWithServerVo;
    }) {
        const t = this;
        t._index = vo.type;
        if(t._index == TeamChallengeInviteType.FriendTitle){
            t.view.title.text = '好友';
        }else if(t._index == TeamChallengeInviteType.GroupTitle){
            t.view.title.text = '最近组队';
        }else if(t._index == TeamChallengeInviteType.FriendMirrorTitle){
            t.view.title.text = '好友镜像';
        }
    }

}
import * as fgui from "fairygui-cc";
import { TeamChallengeInviteType } from "../view/TeamChallengeInviteView";
import { TeamChallengeConfigManager } from "../config/TeamChallengeConfigManager";
import { TeamChallengeModel } from "../model/TeamChallengeModel";
import FGUINotificationComponent from "../../../../core/fgui/com/FGUINotificationComponent";
import NotificationKey from "../../../event/NotificationKey";

export class TeamChallengeInviteInfo extends FGUINotificationComponent {

    static pkgName: string = "teamChallenge";
    static viewName: string = "TeamChallengeInviteInfo";

        
    listenNotifications(): string[] {
        return [
            NotificationKey.EVENT_TEAM_BASEINFO_UPDATE,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_TEAM_BASEINFO_UPDATE:
                // 更新申请状态
                this.reset();
                break;
        }

    }

    private _index: number = 1;

    get view(): ui.teamChallenge.components.TeamChallengeInviteInfo {
        return this as any;
    }


    protected onConstruct() {
        super.onConstruct(); 
    }


    reset(vo?:{
        type: number;
        vo: Vo.player.PlayerWithServerVo;
    }) {
        const t = this;
        if(vo?.type){
            t._index = vo.type;
        }
        if(t._index == TeamChallengeInviteType.FriendMirrorTitleInfo){
            const limit = +TeamChallengeConfigManager.getConstValue('TEAM_INSTANCE:FRIEND_IMAGE_COUNT');
            const left = TeamChallengeModel.ins().mirrorInviteTimes();
            t.view.lb2.text = `今日邀请镜像次数：${left}/${limit}`;
        }
    }

}
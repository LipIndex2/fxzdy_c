import * as fgui from "fairygui-cc";
import { TeamChallengeMgrSubUIKeys } from "../TeamChallengeUIKeys";
import FacadeManager from "../../../../core/mvc/FacadeManager";
import NotificationKey from "../../../event/NotificationKey";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";

export class TeamChallengePageBtn extends fgui.GComponent {
    private _index: number = 1;

    get view(): ui.teamChallenge.components.TeamChallengePageBtn {
        return this as any;
    }


    protected onConstruct() {
        super.onConstruct();

        this.view.onClick(this.onClickDay, this);
    }

    onClickDay() {
        FacadeManager.ins().emit(NotificationKey.EVENT_TEAM_MGR_VIEW_CHANGE, this._index);
    }

    reset(index:number,chooseIndex:number) {
        const t = this;
        t._index =index;
        
        if(t._index ==  TeamChallengeMgrSubUIKeys.TeamChallengeMgrSetSubView){
            //队伍设置
            t.view.lb.text = '队伍设置';
        }else{
            //加入申请
            t.view.lb.text = '加入申请';
        }

        if(t._index == chooseIndex){
            t.view.selImg.visible = true;
            t.view.unSelImg.visible = false;
        }else{
            t.view.selImg.visible = false;
            t.view.unSelImg.visible = true;
        }

        if(t._index ==  TeamChallengeMgrSubUIKeys.TeamChallengeMgrJoinSubView){
            FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom).reset(RedDotKeys.TeamChallenge_join);
        }
        
    }

}
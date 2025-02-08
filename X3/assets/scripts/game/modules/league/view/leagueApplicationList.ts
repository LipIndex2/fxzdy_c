
import NotificationKey from "../../../event/NotificationKey";
import { LeagueModel } from "../LeagueModel";
import { LeagueManager } from "../leagueManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { PlayerAvatar } from "../../common/playerInfo/PlayerAvatar";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UILeagueKey } from "../const/UILeagueConst";

@bindScript(UILeagueKey.LeagueApplyListView)
export class LeagueApplicationList extends UICommWin {
    static pkgName: string = "league";

    static viewName: string = "leagueApplicationList";

    private get view(): ui.league.leagueApplicationList {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [NotificationKey.EVENT_LEAGUE_apply_LIST];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_LEAGUE_apply_LIST:
            case NotificationKey.EVENT_LEAGUE_APPROVAL_RESP:    
                this.updateView();
                break;
           

        }
    }

    protected onInit(): void {
        let view = this.view;
      
        view.onKey.onClick(this.onOneKey, this);
        view.autoBtn.onClick(this.onAutoSelect, this);
        view.list.itemRenderer = this.listRender.bind(this);
    }


    public onOpen(): void {

        LeagueModel.ins().loadLeagueApply();
        

    }
    private listDatas: Vo.league.LeagueApplyVo[];
    private updateView(): void {
        let view = this.view;



        this.listDatas = LeagueModel.ins().sortLeagueMemberList(LeagueManager.ins().applyPlayers) as Vo.league.LeagueApplyVo[];
        if (this.listDatas && this.listDatas.length > 0) {

        

            view.list.numItems = this.listDatas.length;
            view.noList.visible = false;
        }

        else {
            view.list.numItems = 0;
            view.noList.visible = true;
        }
        this.showAutoAccept();
    }
   private  autoAplly: boolean = false;
    private onOneKey(): void {
       
        LeagueModel.ins().oneKeyAgree();
        
    }

    private listRender(index: number, obj: ui.league.com.applyCell): void {
        let view = this.view;
        let data = this.listDatas;
        if (data) {
            let vo = data[index];
            obj.nameLab.text = vo.name;
            obj.fightLab.text = `战力：${vo.fight}`;
            
            const avatar = FguiScriptUtils.toMyScriptClass(obj.avatar, PlayerAvatar);
            avatar.reset(vo.id, vo.headIcon, vo.headFrame, vo.imageId);
            avatar.setCanShowMe(true);
           
            obj.agreeBtn.clearClick();
            obj.agreeBtn.onClick(() => {
                this.approvalLeagueApply(vo,true);
            }, this);

            obj.rejectBtn.clearClick();
            obj.rejectBtn.onClick(() => {
                this.approvalLeagueApply(vo,false);
            }, this);

           

        }
    }

    private approvalLeagueApply(vo: Vo.league.LeagueApplyVo,isAgree:boolean): void {
        LeagueModel.ins().approvalLeagueApply(vo.id, isAgree);
    }




    private onAutoSelect(): void {
        let autoAplly = !this.autoAplly;
        LeagueModel.ins().changeAutoAccept(autoAplly);
    }

    private showAutoAccept(): void {
        let view = this.view;
        let myLeague = LeagueManager.ins().mLeagueVo;
        this.autoAplly = myLeague.autoAccept;
       
        let btn = view.autoBtn.getController("state");
        btn.selectedIndex = this.autoAplly ? 1 : 0;
    }




}
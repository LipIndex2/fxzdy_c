
import NotificationKey from "../../../event/NotificationKey";
import { LeagueModel } from "../LeagueModel";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UILeagueKey } from "../const/UILeagueConst";
/**查看联盟任务完成的成员列表 */
@bindScript(UILeagueKey.LeagueCompletedList)
export class LeagueCompletedList extends UICommWin {
    static pkgName: string = "league";

    static viewName: string = "leagueCompletedList";

    private get view(): ui.league.leagueCompletedList {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [NotificationKey.EVENT_TASK_COMPLETE_MEMBER_LIST];
    }

    notificationHandler(eventName: string, args: Vo.league.LeagueMemberBriefVo[]): void {
        switch (eventName) {
            case NotificationKey.EVENT_TASK_COMPLETE_MEMBER_LIST:
                this.updateView(args);
                break;


        }
    }

    protected onInit(): void {
        let view = this.view;

        view.list.itemRenderer = this.listRender.bind(this);
        
    }


    public onOpen(taskId:number): void {

        LeagueModel.ins().viewChallengeTaskMember(taskId);

    }
    private listDatas: Vo.league.LeagueMemberBriefVo[];
    private updateView(list:Vo.league.LeagueMemberBriefVo[]): void {
        let view = this.view;
        this.listDatas = list;
        if (this.listDatas) {
            view.list.numItems = this.listDatas.length;

        }

    }



    private listRender(index: number, obj: ui.league.com.memberCell): void {

        let data = this.listDatas;
        if (data) {
            let vo = data[index];
            obj.nameLab.text = vo.name;
            obj.fightLab.text = `战力：${vo.fight}`;

            obj.activeLab.text = ``;

          
            obj.onLineLab.text = "";
            obj.dayOutLab.text = "";

            let officia = obj.getController("officia");

            officia.selectedIndex = vo.jobType - 1;

        }
    }

}
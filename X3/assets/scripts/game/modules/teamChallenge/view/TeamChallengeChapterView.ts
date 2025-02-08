/** 组队副本  章节信息界面 */

import UIScriptManager from "../../../../core/comm/UIScriptManager";
import { LogBusiness } from "../../../../core/log/LogBusiness";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { TableManager } from "../../../../core/table/TableManager";
import { GameTimer } from "../../../../core/timer/GameTimer";
import NotificationKey from "../../../event/NotificationKey";
import { TeamChallengeChapterItem } from "../component/TeamChallengeChapterItem";
import { TeamChallengeConfigManager } from "../config/TeamChallengeConfigManager";
import { TeamChallengeModel } from "../model/TeamChallengeModel";
import { TeamChallengeUIKeys } from "../TeamChallengeUIKeys";

export class TeamChallengeChapterView extends UICommWin {

    static pkgName: string = "teamChallenge";
    static viewName: string = "TeamChallengeChapterView";

    
    private get view(): ui.teamChallenge.TeamChallengeChapterView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.EVENT_TEAM_CHAPTER_REWARD_UPDATE,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_TEAM_CHAPTER_REWARD_UPDATE:
                this.updateUI();
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
        t.view.listItems.setVirtual();
        t.view.listItems.itemRenderer = t.addItem.bind(t);

        const cfgs = TableManager.getAllData(table.teaminstance.TeamInstanceChapterConfig);
        t.view.listItems.numItems = cfgs.length;
        const curId = TeamChallengeConfigManager.getCurChapterCfg()?.id;
        let index = cfgs.length - 2;
        if(curId){
            index = (curId - 2) > index ? index :(curId - 2);
            if(index < 0){
                index = 0;
            }
        } 
        t.view.listItems.scrollToView(index);
    }

    updateUI(){
        const cfgs = TableManager.getAllData(table.teaminstance.TeamInstanceChapterConfig);
        this.view.listItems.numItems = cfgs.length;

    }

    private addItem(index:number, item:TeamChallengeChapterItem){
        const t = this;
        const cfgs = TableManager.getAllData(table.teaminstance.TeamInstanceChapterConfig);
        item.reset(cfgs[index])
    }

    @LogBusiness("打开界面")
    public onOpen(args: any): void {
    }

}
UIScriptManager.bindScript(TeamChallengeUIKeys.TeamChallengeChapterView, TeamChallengeChapterView);
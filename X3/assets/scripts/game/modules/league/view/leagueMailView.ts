import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import { UIView, ViewAdaptType } from "../../../../core/mvc/view/UIView";
import * as fgui from "fairygui-cc";
import { UIWin } from "../../../../core/mvc/view/UIWin";
import { UIPage } from "../../../../core/mvc/view/UIPage";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import NotificationKey from "../../../event/NotificationKey";
import { LeagueManager } from "../leagueManager";
import { LeagueModel } from "../LeagueModel";
import { NoOwnerItem } from "../../backpack/vo/NoOwnerItem";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UILeagueKey } from "../const/UILeagueConst";
import { ForbiddenManager } from "db://assets/scripts/core/comm/ForbiddenManager";
import { FloatingTextManager } from "db://assets/scripts/game/modules/floatingText/FloatingTextManager";
/**
 * 联盟邮件编辑界面
 */
@bindScript(UILeagueKey.LeagueMailView)
export class LeagueMailView extends UICommWin {
    static pkgName: string = "league";

    static viewName: string = "leagueMailView";


    private get view(): ui.league.leagueMailView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [NotificationKey.EVENT_LEAGUE_INFO_CHANGE];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_LEAGUE_INFO_CHANGE:
                this.updateView();
                break;
        }
    }
    private maxLen: number;
    protected onInit(): void {
        this.view.sendBtn.onClick(this.onSure, this);
        
      
        let maxLen = this.maxLen = LeagueModel.ins().getLeagueMailMaxLen();
        this.view.mailTxt.maxLength = maxLen;
        this.view.mailTitle.text = LeagueModel.ins().getLeagueMailTitle();
        this.updateWords();
        //监听输入
        this.view.mailTxt.on(fgui.Event.TEXT_CHANGE, this.updateWords, this);
    }

    protected onOpen(args: any): void {
        LeagueModel.ins().loadLeagueInfo();
    }

    private updateView()
    {
        let cost = LeagueModel.ins().getChangeLeagueMailCost();
        let vo = LeagueManager.ins().mLeagueVo;
        if (vo) {
            this.view.sendBtn.costNum.text = `每周次数(${cost-vo.weekEmailTimes}/${cost})`;
            this.view.sendBtn.getController("state").selectedIndex = 0;
        }
    }


    public onSure(): void {
        let name = this.view.mailTxt.text;


        ForbiddenManager.isForbidden(name, (content: string) => {
            if (!content) {
                FloatingTextManager.ins().showTips("内容含有敏感词");
                return;
            }

            LeagueModel.ins().sendLeagueEmail(content);
        });

    }

    private updateWords(): void {
        let maxLen = this.maxLen;
        let wordNum = this.view.mailTxt.text.length;
        this.view.countLab.text = `${wordNum}/${maxLen}`;

    }




}
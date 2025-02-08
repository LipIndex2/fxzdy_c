import * as fgui from "fairygui-cc";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import NotificationKey from "../../../event/NotificationKey";
import { BackpackManager } from "../../backpack/BackpackManager";
import { NoOwnerItem } from "../../backpack/vo/NoOwnerItem";
import { BtnChangGui1WithItem } from "../../common/btn/BtnChangGui1WithItem";
import { UILeagueKey } from "../const/UILeagueConst";
import { LeagueModel } from "../LeagueModel";
import { FloatingTextManager } from "../../floatingText/FloatingTextManager";
import GIns from "../../../GIns";
import { ForbiddenManager } from "db://assets/scripts/core/comm/ForbiddenManager";
/**
 * 联盟邀请编辑界面
 */
@bindScript(UILeagueKey.LeagueInviteView)
export class LeagueInviteView extends UICommWin {
    static pkgName: string = "league";

    static viewName: string = "leagueInviteView";


    private get view(): ui.league.leagueInviteView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.EVENT_LEAGUE_INVITE_CHANGE,
            NotificationKey.EVENT_LEAGUE_INVITE_COMPLETE,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.EVENT_LEAGUE_INVITE_CHANGE:
                this.updateCost();
                break;
            case NotificationKey.EVENT_LEAGUE_INVITE_COMPLETE:
                GIns.floatingTextMgr.showTips('发送成功')
                this.closeSelf();
                break;

        }
    }

    private maxLen: number;

    protected onInit(): void {
        this.view.sendBtn.onClick(this.onSure, this);
        //最大字数
        let maxLen = this.maxLen = LeagueModel.ins().getLeagueInviteMaxLen();
        this.view.mailTxt.maxLength = maxLen;
        this.updateWords();
        //监听输入
        this.view.mailTxt.on(fgui.Event.TEXT_CHANGE, this.updateWords, this);
        this.updateCost();
    }

    protected updateCost(): void {
        let costs = LeagueModel.ins().getInviteCost();
        let item = costs?.length > 0 ? NoOwnerItem.create(costs[0].k, costs[0].v) : null
        const btn = FguiScriptUtils.toMyScriptClass(this.view.sendBtn, BtnChangGui1WithItem);
        btn.reset("发送", item);
    }

    public onSure(): void {
        let content = this.view.mailTxt.text;
        if (content == '') {
            GIns.floatingTextMgr.showTips('招募内容不能为空')
            return
        }
        let costs = LeagueModel.ins().getInviteCost();
        if (!BackpackManager.ins().isCanPayTheseItemArrayByConfig(costs, true)) {
            return
        }

        ForbiddenManager.isForbidden(content, (content: string) => {
            if (!content) {
                FloatingTextManager.ins().showTips("内容含有敏感词");
                return;
            }

            LeagueModel.ins().chatInvite(content);
        });
    }

    private updateWords(): void {
        let maxLen = this.maxLen;
        let wordNum = this.view.mailTxt.text.length;
        this.view.countLab.text = `${wordNum}/${maxLen}`;
    }
}
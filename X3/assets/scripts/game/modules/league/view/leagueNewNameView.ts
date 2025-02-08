import * as fgui from "fairygui-cc";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import { LeagueModel } from "../LeagueModel";
import { NoOwnerItem } from "../../backpack/vo/NoOwnerItem";
import { Color } from "cc";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UILeagueKey } from "../const/UILeagueConst";
import { ForbiddenManager } from "db://assets/scripts/core/comm/ForbiddenManager";
import { FloatingTextManager } from "db://assets/scripts/game/modules/floatingText/FloatingTextManager";
/**
 * 联盟改名界面
 */
@bindScript(UILeagueKey.LeagueNewNameView)
export class LeagueNewNameView extends UICommWin {
    static pkgName: string = "league";

    static viewName: string = "leagueNewNameView";


    private get view(): ui.league.leagueNewNameView {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {


        }
    }

    protected onInit(): void {
        //默认不可点击
        this.view.sureBtn.grayed = true;
        this.view.sureBtn.enabled = false;

        this.view.sureBtn.onClick(this.onSure, this);
        let cost = LeagueModel.ins().getChangeLeagueNameCost();
        let item = NoOwnerItem.create(cost.itemId, cost.count);
        this.view.sureBtn.costIcon.url = item.getIconPath();
        this.view.sureBtn.costNum.text = `${item.count}`;;
        this.view.newName.maxLength = LeagueModel.ins().getLeagueNameMaxLen();

        if (item.isCanPay()) {
            this.view.sureBtn.costNum.color = new Color("#ffffff");
            this.view.sureBtn.costNum.strokeColor = new Color("#C96B06");
        } else {
            this.view.sureBtn.costNum.color = new Color("#FF0000");
            this.view.sureBtn.costNum.strokeColor = new Color("#000000");
        }

        this.view.newName.on(fgui.Event.TEXT_CHANGE, this.onNameChanged, this);
    }

    private onNameChanged(): void {
        let name = this.view.newName.text;
        if (name.length > 0) {
            this.view.sureBtn.grayed = false;
            this.view.sureBtn.enabled = true;
        }
        else {
            this.view.sureBtn.grayed = true;
            this.view.sureBtn.enabled = false;
        }
    }

    public onSure(): void {
        let name = this.view.newName.text;

        ForbiddenManager.isForbidden(name, (content: string) => {
            if (!content) {
                FloatingTextManager.ins().showTips("内容含有敏感词");
                return;
            }

            LeagueModel.ins().changeLeagueName(content);
        });

    }




}
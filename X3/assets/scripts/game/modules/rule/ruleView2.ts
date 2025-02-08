import { UICommWin } from "../../../core/mvc/view/UICommWin";
import { UIView } from "../../../core/mvc/view/UIView";
import { TableManager } from "../../../core/table/TableManager";


export class RuleView2 extends UICommWin {
    static pkgName: string = "rule";

    static viewName: string = "ruleView2";

    private get view(): ui.rule.ruleView2 {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [];
    }

    notificationHandler(eventName: string, args: Vo.league.LeagueMemberBriefVo[]): void {
        switch (eventName) {
           

        }
    }

    protected onInit(): void {
       
        
    }


    public onOpen(configId:number): void {
        let cfg = TableManager.getDataById(table.rule.RuleConfig,configId);
        this.view.title.text = cfg.title;
        this.view.content.content.text = cfg.content;

    }
    

}
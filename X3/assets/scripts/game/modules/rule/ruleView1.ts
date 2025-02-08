import { Vec3 } from "cc";
import { UICommWin } from "../../../core/mvc/view/UICommWin";
import { UIView } from "../../../core/mvc/view/UIView";
import { TableManager } from "../../../core/table/TableManager";
import { input } from "cc";
import { Input } from "cc";
import { game } from "cc";
import * as fgui from "fairygui-cc";
import { ViewBlackBgComp } from "../../../core/mvc/view/comp/ViewBlackBgComp";
import { ScreenAdaptManager } from "../../../core/comm/ScreenAdaptManager";

export class RuleView1 extends UIView {
    static pkgName: string = "rule";

    static viewName: string = "ruleView1";

    private get view(): ui.rule.ruleView1 {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [];
    }

    notificationHandler(eventName: string, args: Vo.league.LeagueMemberBriefVo[]): void {
        
    }

    protected onInit(): void {
        this.view.bg.onClick(this.onClickBg, this)
    }

    protected onClickBg():void {
        this.closeSelf()
    }


    public onOpen(data: { configId: number, showPoint: Vec3 }): void {
        let cfg = TableManager.getDataById(table.rule.RuleConfig, data.configId);
        this.view.content.content.text = cfg.content;

        
        

        //提示框右边超出屏幕右边的尺寸
        let rightOver = (data.showPoint.x + this.view.bgContent.width + 50 - ScreenAdaptManager.viewWidth);
        if (rightOver > 0) {
            //确保提示框右边不超屏幕右边的显示区域
            data.showPoint.x -= rightOver;
        }

        //提示框底部超出屏幕底部的尺寸
        let bottomOver = data.showPoint.y - this.view.bgContent.height - 20
        if (bottomOver < 0) {
            //确保提示框底部不超屏幕底部显示区域
            data.showPoint.y -= bottomOver;
        }

        //node的本地坐标是以左下角为0，0的,Y向上，X向左
        this.view.node.setWorldPosition(data.showPoint);
    }


}
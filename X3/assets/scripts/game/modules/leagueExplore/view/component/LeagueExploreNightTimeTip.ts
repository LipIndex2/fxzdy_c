import G from "../../../../../core/comm/G";
import { bindFguiExtension } from "../../../../../core/comm/UIScriptManager";
import { FguiNotificationGComponent } from "../../../../../core/mvc/view/FguiNotificationGComponent";
import { TimeUtils } from "../../../../comm/utils/TimeUtils";
import NotificationKey from "../../../../event/NotificationKey";
import GIns from "../../../../GIns";
import { ILeagueExploreConstCfg } from "../../model/vo/ILeagueExploreConstCfg";

@bindFguiExtension('ui://leagueExplore/LeagueExploreNightTimeTip')
export class LeagueExploreNightTimeTip extends FguiNotificationGComponent {
    static pkgName: string = "leagueExplore";
    static viewName: string = "LeagueExploreNightTimeTip";

    listenNotifications(): string[] {
        return [
            NotificationKey.SYSTEM_TIME_UPDATE
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.SYSTEM_TIME_UPDATE:
                this.updateUI();
                break;
        }
    }

    private get view(): ui.leagueExplore.component.LeagueExploreNightTimeTip {
        return this as any;
    }

    /***组件初始化 */
    protected onInit(): void {
        super.onInit();

        let constCfg = GIns.leagueExploreModel.constCfg;
        let startHour:string = TimeUtils.padZero(constCfg.dailyWarStartHour);
        let endHour:string = TimeUtils.padZero(constCfg.dailyWarEndHour);
        this.view.lbNightTime.text = `${endHour}:00-次日${startHour}:00`;

        //默认隐藏
        this.view.gTime.visible = false;
    }

    protected onPreDispose(): void {
        super.onPreDispose();
        G.GameTimer.clearAll(this);
    }

    public updateUI(): void {
        G.GameTimer.clearAll(this);
        let oneHourMs:number = 3600000;
        let constCfg: ILeagueExploreConstCfg = GIns.leagueExploreModel.constCfg;
        let todayZero: number = G.TimeManager.todayZero;
        let nowTime: number = G.TimeManager.serverNow;
        let curMs: number = nowTime - todayZero;
        let curHour: number = Math.floor(curMs / oneHourMs);
        let remainTime:number = 0;
        if (curHour < constCfg.dailyWarStartHour || curHour >= constCfg.dailyWarEndHour) {
            //非战斗时间
            this.view.gTime.visible = true;
            //计算出结束时间
            remainTime = todayZero + constCfg.dailyWarStartHour * oneHourMs - nowTime;
            if (remainTime < 0) {
                //代表是第二天
                remainTime += oneHourMs * 24;
            }
        } else {
            this.view.gTime.visible = false;
            remainTime = todayZero + constCfg.dailyWarEndHour * oneHourMs - nowTime;
            if (remainTime < 0) {
                //代表是第二天
                remainTime += oneHourMs * 24;
            }
        }
        G.GameTimer.once(remainTime, this, this.updateUI);
    }

}
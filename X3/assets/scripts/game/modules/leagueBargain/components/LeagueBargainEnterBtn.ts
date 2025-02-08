import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import * as fgui from "fairygui-cc";
import G from "../../../../core/comm/G";
import { TimeUtils } from "../../../comm/utils/TimeUtils";
import GIns from "../../../GIns";
import { LeagueBargainUIKeys } from "../LeagueBargainUIKeys";

@bindFguiExtension("ui://league/LeagueBargainEnterBtn")
export class LeagueBargainEnterBtn extends fgui.GButton {

    protected _timerKey: string = null;
    protected _endTime: number = 0;

    get view(): ui.league.btn.LeagueBargainEnterBtn {
        return this as any;
    }

    protected onInit() {
        this.onClick(this.onClickItem, this);
    }

    protected onPreDispose() {
        this.removeTimer();
    }

    protected onClickItem():void {
        G.UIManager.open(LeagueBargainUIKeys.LeagueBargainMainView);
    }

    /**添加计时器*/
    protected addTimer(): void {
        if (!this._timerKey) {
            this._timerKey = G.GameTimer.loop(500, this, this.onTimer)
        }
        this.onTimer();
    }

    /**移除计时器*/
    protected removeTimer(): void {
        if (this._timerKey) {
            G.GameTimer.clearByKey(this._timerKey)
            this._timerKey = null
        }
    }

    protected onTimer(): void {
        let diffTime: number = GIns.LeagueModel.bargainContext.getDiffTimeMs();
        if (diffTime <= 0) {
            diffTime = 0;
            this.removeTimer();
        }
        this.view.lbTime.text = TimeUtils.formatTimeMsToDayHourMinuteSecondText(diffTime);
    }

    public updateUI(): void {
        let data = GIns.LeagueModel.bargainContext.data;
        if (data) {
            this._endTime = data.endTime;
        } else {
            this._endTime = 0;
        }
        let nowTime: number = G.TimeManager.serverNow;
        if (this._endTime > nowTime) {
            this.addTimer();
        } else {
            this.onTimer();
        }
    }
}
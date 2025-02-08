import * as fgui from "fairygui-cc";
import { GmModel } from "db://assets/scripts/gm/model/GMModel";
import { SystemModel } from "db://assets/scripts/game/modules/system/model/SystemModule";
import { DateUtils } from "db://assets/scripts/core/utils/DateUtils";
import G from "db://assets/scripts/core/comm/G";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import GIns from "../../../game/GIns";


/**
 * GM 邮件
 */
export class GMAddServerTimeView extends fgui.GComponent {


    // region 静态属性 for FGUI
    static pkgName: string = "gm";

    static viewName: string = "GMAddServerTimeView";

    // endregion
    private _firstSetFlag: boolean = false;


    private get view(): ui.gm.serverTime.GMAddServerTimeView {
        return this as any;
    }

    protected onPreDispose() {
        GameTimer.ins().clearAll(this);
    }

    public onInit() {

        this.view.btnOk.labelTitle.text = "确定增加"

        this.view.btnOk.on(fgui.Event.CLICK, this.onClickOk, this)

        GameTimer.ins().frameLoop(30, this, this.updateTime)
    }

    updateTime() {
        const serverNowTimeMs = G.TimeManager.serverNow;
        const dateTimeText = DateUtils.dateTimeFormat(serverNowTimeMs, "yyyy-MM-dd hh:mm:ss");
        const ar = dateTimeText.split(" ");
        this.view.labelCurDate.inputName.text = ar[0];
        this.view.labelCurTime.inputName.text = ar[1];

        // first
        if (!this._firstSetFlag) {
            this._firstSetFlag = true;
            // set
            this.view.labelSetDate.inputName.text = ar[0];
            this.view.labelSetTime.inputName.text = ar[1];

        }

    }


    private onClickOk() {
        const textDate = this.view.labelSetDate.inputName.text.trim();
        const textTime = this.view.labelSetTime.inputName.text.trim();

        const dateTimeFormat: string = `${textDate} ${textTime}`;
        const timeMs = DateUtils.parseDateTimeTextToTimeMs(dateTimeFormat, "yyyy-MM-dd HH:mm:ss");

        const diffTimeMs = Math.abs(timeMs - G.TimeManager.serverNow);
        if (diffTimeMs <= 0) {
            GIns.floatingTextMgr.showTips("不允许时间回滚. 只允许增加时间");
            return;
        }
        const oneDayTimeMs = 24 * 60 * 60 * 1000;
        if (diffTimeMs > oneDayTimeMs) {
            GIns.floatingTextMgr.showTips("不允许添加超过 24h 的时间");
            return;
        }

        // 添加分钟
        const addMinutes = (diffTimeMs / 1000 / 60).toInt();

        GmModel.ins().sendAddWindowsSystemMinutes({
            addMinutes: addMinutes,
        });

// 获取最新的时间        
        SystemModel.ins().sendSystemTime()

    }
}
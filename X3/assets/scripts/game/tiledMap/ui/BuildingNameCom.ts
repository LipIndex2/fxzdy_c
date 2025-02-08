import * as fgui from "fairygui-cc";
import { TimeUtils } from "../../comm/utils/TimeUtils";
import G from "../../../core/comm/G";
import FGUICocosNodeComponent from "../../../core/fgui/com/FGUICocosNodeComponent";
import { bindFguiExtension } from "../../../core/comm/UIScriptManager";


/** 地图建筑名组件 */
@bindFguiExtension("ui://comm/BuildingNameCom")
export class BuildingNameCom extends FGUICocosNodeComponent {
    static pkgName: string = "comm";
    static viewName: string = "BuildingNameCom";

    private _time;

    private _timerKey: string;

    static create() {
        return fgui.UIPackage.createObject(this.pkgName, this.viewName) as BuildingNameCom;
    }

    private get view(): ui.comm.building.BuildingNameCom {
        return this as any;
    }

    setName(name: string) {
        this.view.nameTxt.text = name;
    }

    /** 名字下的时间 */
    setTime(time: number, name: string) {
        this._time = time;
        this.loopTime(this._time, name);
        this.clearTimer();
        this._timerKey = G.GameTimer.loop(1000, this, () => {
            this.loopTime(this._time, name);
        })
    }

    loopTime(time: number, name: string) {
        if (time >= G.TimeManager.serverNow) {
            this.view.T_time.visible = true;
            let timeStr = TimeUtils.formatTimeMsToDayHourMinuteText(time - G.TimeManager.serverNow);
            this.view.T_time.text = `${timeStr}刷新${name}`;
        } else {
            this.view.T_time.visible = false;
            G.GameTimer.clearAll(this);
        }
    }

    show() {
        this.view.getTransition("hide").stop();
        this.view.getTransition("show").play();
        this.view.visible = true;
    }

    hide() {
        this.view.getTransition("show").stop();
        this.view.getTransition("hide").play(() => {
            this.view.visible = false;
        });
        this.clearTimer();
    }

    clearTimer() {
        if (this._timerKey) {
            G.GameTimer.clearByKey(this._timerKey);
        }
    }

    protected onPreDispose() {
        this.clearTimer();
    }
}
import { UIWin } from "../../../../core/mvc/view/UIWin";
import { GameTimer } from "../../../../core/timer/GameTimer";
import { CameraAnimUtils } from "../../../tiledMap/CameraAnimUtils";
import { TimeManager } from "../../../../core/time/TimeManager";
import * as fgui from "fairygui-cc";
import { CameraAnimBackType, CameraAnimBattleStopType, ICameraAnim } from "../enum/AnimType";
import { EnumUIViewLayer } from "../../../../core/comm/LayerManager";
import UIScriptManager, { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommonKey } from "../const/UICommonConfig";
import { BattleManager } from "../../../comm/battle/BattleManager";
import GIns from "../../../GIns";

/**移动镜头动画 */
@bindScript(UICommonKey.CameraMoveAnimWin)
export class CameraMoveAnimWin extends UIWin {
    static pkgName: string = "comm";
    static viewName: string = "TouchMaskWin";
    protected _layer = EnumUIViewLayer.WARN;
    private _animData: ICameraAnim;
    private _lockEndTime: number;

    listenNotifications(): string[] {
        return;
    }

    notificationHandler(event: string, args?: any): void {
    }

    protected cancelAllTouches() {
        fgui.GRoot.inst.inputProcessor.cancelAllTouches();
    }

    protected onOpen(animData: ICameraAnim): void {
        this.cancelAllTouches();
        if (!animData.battleStopType)
            GIns.battleMgr.stopFightAi();
        else if (animData.battleStopType == CameraAnimBattleStopType.StopAll) {
            GIns.battleMgr.pauseBattle();
        }
        this._animData = animData;
        this.play(animData);
    }

    private play(animData: ICameraAnim) {
        let timeMs = animData.timeMs;
        let holdTimeMs = animData?.holdTimeMs || 0;

        this._lockEndTime = TimeManager.serverNow + timeMs + holdTimeMs;
        GIns.cameraAnimUtils.moveMapByTargetPos(animData.targetPos, timeMs);
        GameTimer.ins().once(timeMs, this, this.onStarMoveTweenComplete);

        if (animData.backType === CameraAnimBackType.AutoBack) {
            GameTimer.ins().once(timeMs + holdTimeMs, this, this.autoBack);
        } else {
            this._view.onClick(this.onClick, this);
        }
    }

    private onStarMoveTweenComplete() {
        if (this._animData.battleStopType == CameraAnimBattleStopType.StopAll) {
            GIns.battleMgr.battleLogic.showMgr.setOpenCreateAllNow(true)
        }
    }

    public onClose(): void {
        GameTimer.ins().clearAll(this);
        if (!this._animData.battleStopType)
            GIns.battleMgr.openFightAi();
        else if (this._animData.battleStopType == CameraAnimBattleStopType.StopAll) {
            GIns.battleMgr.battleLogic.showMgr.setOpenCreateAllNow(false)
            GIns.battleMgr.resumeBattle();
        }

        if (this._animData.onAnimEndNotification) {
            //结束时发射事件
            this.emit(this._animData.onAnimEndNotification);
        }
    }

    private autoBack() {
        this.backTeamPos();
    }

    private onClick() {
        if (this._lockEndTime < TimeManager.serverNow) {
            this.backTeamPos();
        }
    }

    private backTeamPos() {
        GameTimer.ins().clearAll(this);
        this._view.offClick(this.onClick, this);

        let team = GIns.battleMgr.curUnitProcessor.myTeam;
        GIns.cameraAnimUtils.moveMapByTargetPos(team.pos, this._animData.timeMs);
        GameTimer.ins().once(this._animData.timeMs, this, this.onMoveTweenComplete);
    }

    private onMoveTweenComplete() {
        this.closeSelf();
    }
}
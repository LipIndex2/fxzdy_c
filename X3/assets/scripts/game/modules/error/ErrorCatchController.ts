import { sys } from "cc";
import { BaseController } from "../../../core/mvc/controller/BaseController";
import { HttpRequest } from "../../../core/net/HttpRequest";
import { ChannelManager } from "../../../core/sdk/ChannelManager";
import { AccountModel } from "../account/model/AccountModel";
import { PlayerModel } from "../player/model/PlayerModel";
import LocalStorage from "../../comm/cache/LocalStorage";
import G from "../../../core/comm/G";
import { GameTimer } from "../../../core/timer/GameTimer";
import { Utils } from "../../../core/utils/Utils";
import { DEBUG } from "cc/env";
import { FormationManager } from "../formation/FormationManager";
import { TimeManager } from "../../../core/time/TimeManager";
import { TimeUtils } from "../../comm/utils/TimeUtils";
import GIns from "../../GIns";
import { assetManager } from "cc";

export class ErrorCatchController extends BaseController {
    private _http: HttpRequest = new HttpRequest();
    private _uid: string
    private _lasttime: number = 0;
    private _isReload: boolean = true;

    /***
     * 发送1个LOG
     * type==0的话是默认报错，报错后会重启游戏
     */
    public sendLog(msg: string, stack: string, type: number = 0, otherParam?: any): void {
        // if (DEBUG)
        //     return

        if (this._lasttime != 0/* && (Date.now() - this._lasttime) < 1000*/) //一次报错即可
            return

        this._http.timeout = 3000;
        let errorMsgData = this.getDefalutData()
        errorMsgData.type = type;
        errorMsgData.msg = msg;
        errorMsgData.stack = stack;
        if (otherParam)
            errorMsgData.exData = otherParam;

        var param = { uid: this._uid, data: JSON.stringify(errorMsgData) };
        this._http.post(ChannelManager.ins().errorCatchUrl, param, this.onSuccess.bind(this, type), this.onFail.bind(this, type));

        this._lasttime = Date.now()
    }

    /***自定义传输的信息 */
    private getDefalutData(): any {
        let data = {
            hotVersion: window["_hotVersion"] || "unknow",
            deviceUID: this._uid,
            agent: ChannelManager.ins().agent,
            resUrl: assetManager.downloader.remoteServerAddress,
            name: PlayerModel.ins().playerName || "",
            playerId: PlayerModel.ins().playerId || 0,
            playerLv: FormationManager.ins().getCommonLevel() || 0,
            serverId: AccountModel.ins().serverId || 0,
            osPlatform: sys.platform,
            mapId: GIns.mapMgr.curMap?.getMapID() || "null",
            onlineTime: TimeUtils.formatTimeMsToDayHourMinuteSecondText(TimeManager.serverNow - PlayerModel.ins().loginTime),
        }
        return data;
    }

    onInit() {
        this._uid = LocalStorage.sys.deviceUuid;
        if (!this._uid) {
            this._uid = LocalStorage.sys.deviceUuid = Utils.getGUID();
        }
        let thisObj = this;
        // window.addEventListener("error", (error) => {
        //     console.log(error)
        // }, true)
        if (sys.isNative) {
            if ("undefined" !== typeof jsb && jsb["onError"]) {
                //@ts-ignore
                jsb.onError((location, message, stack) => {
                    // 你的处理
                    thisObj.onError(location + "::" + message, "", 0, 0, stack);
                });
            }
        } else {
            window.onerror = (msg, url, line, col, error) => {
                var errorStack = error ? error.stack : null;
                thisObj.onError(msg, url, line, col, errorStack)
            };
        }
    }

    private onError(msg, url, line, col, error) {
        var errorObj = error ? error : '';
        this.sendLog(msg, errorObj);
    }

    private onSuccess(type: number): void {
        if (type == 0)
            this.reload()
    }

    private onFail(type: number): void {
        if (type == 0)
            this.reload()
    }

    private get isReload() {
        return this._isReload && !sys.isBrowser; //网页不重启
    }


    private reload(): void {
        if (this.isReload)
            G.reload()
    }
}
ErrorCatchController.ins().doInit();
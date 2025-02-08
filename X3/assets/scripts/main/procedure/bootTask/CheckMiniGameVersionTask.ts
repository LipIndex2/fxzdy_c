import { MINIGAME, NATIVE } from "cc/env";
import { Handler } from "../../../core/utils/Handler";
import { Task } from "../../../core/task/TaskManager";
import { HotOptions, HotUpdateManager } from "../../modules/hotUpdate/model/HotUpdateManager";
import { UIManager } from "../../../core/mvc/UIManager";
import { LoginConfirmViewOpenArgs, UILoginKey } from "../../modules/login/const/UILoginConfig";
import { assetManager } from "cc";
import { HttpRequest } from "../../../core/net/HttpRequest";
import { sys } from "cc";
import { StringUtils } from "../../../core/utils/StringUtils";
import { game } from "cc";

/**
 * 资源小游戏版本检测
 */
export default class CheckMiniGameVersionTask extends Task {
    private _http: HttpRequest;
    private _tempRemoteVersionKey: string = "tempRemoteVersion";

    run(args?: any): void {

        console.log("CheckMinigameVersionTask");

        if (MINIGAME) {
            this.getMiniGameResVersion();
        } else {
            this.onCompleted();
        }
    }

    /**获取小游戏资源版本 */
    getMiniGameResVersion() {
        this.readTempResVersion();

        let remote = assetManager.downloader.remoteServerAddress;
        let resVersionUrl = remote + "/remote/remoteVersion.json";
        // console.log("resVersionUrl : " + resVersionUrl);
        if (!this._http) {
            this._http = new HttpRequest();
        }
        this._http.getWithParams(resVersionUrl, { t: Date.now() }, this.onGetVersionSuccess.bind(this), this.onGetVersionFailure.bind(this));
    }

    private _count = 0;
    /**获取数据成功 */
    onGetVersionSuccess(data: { bundleVers: {}, resVersion: string }) {
        // console.log(" codeVersion: " + window["_hotVersion"]);

        if (data.resVersion) {
            if (StringUtils.isNewVersion(window["_resVersion"], data.resVersion)) {
                //是否是新版本
                window["_resVersion"] = data.resVersion;
                window["newBundleResJsonVers"] = data.bundleVers;
                // console.log(" newVersion: " + data.resVersion);
                sys.localStorage.setItem(this._tempRemoteVersionKey, JSON.stringify(data));

                this.cleanBundle();
            }
        }
        this.onCompleted();
    }

    /**获取数据失败 */
    onGetVersionFailure() {
        UIManager.ins().open(UILoginKey.LOGIN_CONFIRM_VIEW, {
            title: "提示",
            titleConfirm: "重试",
            content: "母舰通信中断，请确认网络状态后重试！",
            onBtnYes: () => {
                this.getMiniGameResVersion();
            },
        } as LoginConfirmViewOpenArgs);
    }

    readTempResVersion() {
        let temp = sys.localStorage.getItem(this._tempRemoteVersionKey);
        if (temp) {
            let data = JSON.parse(temp);
            if (data.resVersion) {
                if (StringUtils.isNewVersion(window["_hotVersion"], data.resVersion)) {
                    //是否比本地版本新, 报错时会用到
                    window["_resVersion"] = data.resVersion;
                    window["newBundleResJsonVers"] = data.bundleVers;
                }
            }
        }
    }

    cleanBundle() {
        let resBundle = assetManager.getBundle("resources");  //提示用到的资源包
        if (resBundle) {
            //清理资源包
            resBundle.releaseAll();
            assetManager.removeBundle(resBundle);
        }
    }

    onCompleted() {
        game.emit("RESOURCES_BUNDLE_LOADED");
        this.end();
    }
}
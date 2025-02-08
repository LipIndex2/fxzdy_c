import { SpriteAtlas } from "cc";
import FacadeManager from "../../../core/mvc/FacadeManager";
import { UIManager } from "../../../core/mvc/UIManager";
import { Res } from "../../../core/res/Res";
import { StartGameEvent, UploadEventManager } from "../../../core/sdk/UploadEventManager";
import { Task } from "../../../core/task/TaskManager";
import LoginNotificationKey from "../../modules/LoginNotificationKey";
import { GameTaskProgress, GameTaskProgressTag, GameTaskProgressTime } from "../GameTaskProgress";
import { Texture2D } from "cc";
import { GameTimer } from "../../../core/timer/GameTimer";
import { sp } from "cc";


/**加载常驻资源 */
export default class LoadResTask extends Task {
    private _tag = GameTaskProgressTag.LoadResTask;
    static readonly refKey = "LoadResTask";
    private _args: any;

    run(args?: any): void {

        FacadeManager.ins().emit(LoginNotificationKey.LOGIN_PROGRESS_UPDATE_BY_TAG, { tag: this._tag });

        // console.log(">> run LoadResTask");

        this._args = args;

        //fgui模块资源 (美术字必须提前加载)
        var packageRes = [
            "comm",
            "battleNum",
        ];

        //fgui模块资源
        var package2Res = [
            "comm1",
            "commChat",
            "commBattle",
            "commFrame",
            "map"
        ];

        //合图资源
        var atlasRes = [
        ];

        //不合图资源
        var unpackRes = [
            "ui/unpack/loading/gcdh_bg"
        ];

        //spine资源
        var spineRes = [
        ];

        var loadSpinePackageRes = () => {
            if (spineRes.length > 0) {
                Res.getResRefByUrls(spineRes, null, sp.SkeletonData, LoadResTask.refKey, () => {
                    GameTimer.ins().callLater(this, this.complete);
                });
            } else {
                this.complete();
            }
        }

        var loadUnpackPackageRes = () => {
            if (unpackRes.length > 0) {
                Res.getResRefByUrls(unpackRes, null, Texture2D, LoadResTask.refKey, () => {
                    GameTimer.ins().callLater(this, loadSpinePackageRes);
                });
            } else {
                loadSpinePackageRes();
            }
        }

        var loadAtlasPackageRes = () => {
            if (atlasRes.length > 0) {
                Res.getResRefByUrls(atlasRes, null, SpriteAtlas, LoadResTask.refKey, () => {
                    GameTimer.ins().callLater(this, loadUnpackPackageRes);
                });
            } else {
                loadUnpackPackageRes();
            }
        }


        var loadFguiPackageRes2 = () => {
            if (package2Res.length > 0) {
                try {
                    UIManager.ins().loadPkg(package2Res, null, LoadResTask.refKey, () => {
                        GameTimer.ins().callLater(this, loadAtlasPackageRes);
                    });
                } catch (error) {
                    console.error(error);
                    this.exit();
                }
            } else {
                loadAtlasPackageRes();
            }
        }

        var loadFguiPackageRes = () => {
            if (packageRes.length > 0) {
                try {
                    UIManager.ins().loadPkg(packageRes, null, LoadResTask.refKey, () => {
                        GameTimer.ins().callLater(this, loadFguiPackageRes2);
                    });
                } catch (error) {
                    console.error(error);
                    this.exit();
                }
            } else {
                loadFguiPackageRes2();
            }
        }

        loadFguiPackageRes();
    }

    private complete(): void {
        // console.log(">> end LoadResTask");
        UploadEventManager.ins().startGame(StartGameEvent.CommResLoadDone);
        this.end();
    }
}
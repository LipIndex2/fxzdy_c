import { MINIGAME, NATIVE } from "cc/env";
import { Handler } from "../../../core/utils/Handler";
import { Task } from "../../../core/task/TaskManager";
import { HotUpdateManager } from "../../modules/hotUpdate/model/HotUpdateManager";
import { NativeAPI } from "../../../core/native/NativeAPI";
import { sys } from "cc";
import BattleTimer from "../../../core/timer/BattleTimer";

declare let wx: any;
/**
 * 获取设置app状态
 */
export default class InitAppStateTask extends Task {
    private GB = 1024 * 1024 * 1024;

    run(args?: any): void {
        if (NATIVE) {
            this.setNative();
        } else if (MINIGAME) {
            this.setMiniGame();
        } else {
            this.setFps(60);
        }

        this.end();
    }

    /**原生 */
    setNative() {
        let fps = 30;
        if (NativeAPI.appInfo) {
            let totalMem = NativeAPI.appInfo.totalMem || 0;
            if (sys.platform === sys.Platform.ANDROID) {
                if (totalMem >= 7 * this.GB) {
                    fps = 60;
                }
            } else if (sys.platform === sys.Platform.IOS) {
                if (totalMem >= 5 * this.GB) {
                    fps = 60;
                }
            }
        }
        this.setFps(fps);
    }

    /**小游戏 */
    setMiniGame() {
        let fps = 30;
        if (sys.platform === sys.Platform.WECHAT_GAME) {
            let deviceInfo = wx?.getDeviceInfo();
            if (deviceInfo) {
                let platform = deviceInfo.platform;
                let totalMem = deviceInfo.memorySize * 1024 * 1024;
                if (platform === "windows" || platform === "mac" || platform === "devtools") {
                    fps = 60;
                } else if (platform === "ios") {
                    if (totalMem >= 5 * this.GB) {
                        fps = 60;
                    }
                } else if (totalMem >= 7 * this.GB) {
                    fps = 60;
                }
            }
        }
        this.setFps(fps);
    }


    setFps(fps: number) {
        BattleTimer.ins().setFrameRate(fps);
    }
}
import { assetManager } from "cc";
import { TableManager } from "../../../core/table/TableManager";
import { Task } from "../../../core/task/TaskManager";
import { AssetManager } from "cc";
import { sys } from "cc";
import { DebugUtils } from "../../../core/utils/DebugUtils";

declare let wx: any;

/**
 * 代码
 */
export default class GameScriptsTask extends Task {
    static isLoaded = false;

    /**子包关键字 */
    private _bundleKeys = ["game"];
    private _index = 0;

    run(args?: any): void {
        if (GameScriptsTask.isLoaded) {
            this.onComplete();
            return;
        }

        this.loadNext();
    }

    loadNext() {
        let key = this._bundleKeys[this._index++];
        if (key) {
            if (sys.platform === sys.Platform.WECHAT_GAME) {
                wx?.loadSubpackage({
                    name: key,
                    success: () => {
                        this.loadBundle(key);
                    },
                    fail: () => {
                        this.exit();
                    }
                });
            } else {
                this.loadBundle(key);
            }
        } else {
            this.onComplete();
        }
    }

    loadBundle(bundleKey: string) {
        let bundle = assetManager.getBundle(bundleKey);
        if (!bundle) {
            assetManager.loadBundle(bundleKey, (err: Error, bundle: AssetManager.Bundle) => {
                if (err) {
                    this.exit();
                    return;
                }
                this.loadNext();
            });
        } else {
            this.loadNext();
        }
    }

    loadGM() {
        if (!DebugUtils.isEnableGM()) return;
        let gmKey = "gm";
        if (sys.platform === sys.Platform.WECHAT_GAME) {
            wx?.loadSubpackage({
                name: gmKey,
                success: () => {
                    assetManager.loadBundle(gmKey, (err: Error, bundle: AssetManager.Bundle) => { });
                },
                fail: () => {
                }
            });
        } else {
            assetManager.loadBundle(gmKey, (err: Error, bundle: AssetManager.Bundle) => { });
        }
    }

    private onComplete() {
        DebugUtils.isEnableGM() && this.loadGM();

        GameScriptsTask.isLoaded = true;
        DebugUtils.isDebugMode() &&  console.log("Script complete");
        // 加载完成
        this.end();
    }
}
import { JsonAsset, error } from "cc";
import { Task } from "../../../core/task/TaskManager";
import { Res } from "../../../core/res/Res";
import { Logger } from "../../../core/log/Logger";
import { ResRef } from "../../../core/res/ResRef";
import { ForbiddenManager } from "../../../core/comm/ForbiddenManager";
import { DebugUtils } from "../../../core/utils/DebugUtils";

/**
 * 加载屏蔽字
 */
export default class ForbiddenTask extends Task {
    private _args: any;
    private _configUrl: string = "forbidden";

    static isComplete() {
        return ForbiddenManager.isInited();
    }

    run(args?: any): void {
        this._args = args;
        if (!ForbiddenTask.isComplete()) {
            let config: string = this._configUrl;
            Res.getResRef({ url: config, type: JsonAsset }, "ForbiddenTask", (ref: ResRef) => {
                if (!ref) this.exit();

                let data: JsonAsset = ref.content;
                ForbiddenManager.initWorkMap(data?.json);

                ref.dispose();
                this.onComplete();
            });
        } else {
            this.onComplete();
        }
    }

    onComplete(): void {
        DebugUtils.isDebugMode() && console.log("Forbidden complete !!!");
        this.end();
    }
}
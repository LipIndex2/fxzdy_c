import { NATIVE } from "cc/env";
import { Handler } from "../../../core/utils/Handler";
import { Task } from "../../../core/task/TaskManager";
import { HotUpdateManager } from "../../modules/hotUpdate/model/HotUpdateManager";
import { NativeAPI } from "../../../core/native/NativeAPI";

/**
 * 获取应用信息
 */
export default class InitAppInfoTask extends Task {

    run(args?: any): void {
        if (NATIVE) {
            NativeAPI.getAppInfo();
        }
        this.end();
    }
}
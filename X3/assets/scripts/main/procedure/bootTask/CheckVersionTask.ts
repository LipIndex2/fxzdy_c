import { MINIGAME, NATIVE } from "cc/env";
import { Handler } from "../../../core/utils/Handler";
import { Task } from "../../../core/task/TaskManager";
import { HotOptions, HotUpdateManager } from "../../modules/hotUpdate/model/HotUpdateManager";
import { UIManager } from "../../../core/mvc/UIManager";
import { LoginConfirmViewOpenArgs, UILoginKey } from "../../modules/login/const/UILoginConfig";
import { assetManager } from "cc";
import { HttpRequest } from "../../../core/net/HttpRequest";

/**
 * 资源版本检测
 */
export default class CheckVersionTask extends Task {

    run(args?: any): void {
        if (NATIVE) {
            let option = new HotOptions();
            option.onNoUpdate = this.end.bind(this);
            option.onUpdateFailed = this.onHotFailed.bind(this);
            HotUpdateManager.ins().init(option);
        } else {
            this.end();
        }
    }

    onHotFailed() {
        UIManager.ins().open(UILoginKey.LOGIN_CONFIRM_VIEW, {
            title: "提示",
            titleConfirm: "重试",
            content: "更新失败，请确认网络状态后重试！",
            onBtnYes: () => {
                HotUpdateManager.ins().checkUpdate();
            },
        } as LoginConfirmViewOpenArgs);
    }

}
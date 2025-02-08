import G from "../../../core/comm/G";
import { NativeAPI } from "../../../core/native/NativeAPI";
import { SdkManager } from "../../../core/sdk/SdkManager";
import { StartGameEvent, UploadEventManager } from "../../../core/sdk/UploadEventManager";
import { Task } from "../../../core/task/TaskManager";
import { UILoginKey } from "../../modules/login/const/UILoginConfig";


/**
 * 登录界面
 */
export default class LoginPageTask extends Task {
    run(args?: any): void {
        G.UIManager.open(UILoginKey.LOGIN_PAGE, null, () => {
            UploadEventManager.ins().startGame(StartGameEvent.OpenLoginView);
            NativeAPI.splash(false);
            this.end();
        });
    }
}
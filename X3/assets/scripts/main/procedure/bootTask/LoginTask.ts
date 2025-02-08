import G from "../../../core/comm/G";
import { SdkManager } from "../../../core/sdk/SdkManager";
import { StartGameEvent, UploadEventManager } from "../../../core/sdk/UploadEventManager";
import { Task } from "../../../core/task/TaskManager";
// import { AudioManager } from "../../../game/comm/mgr/AudioManager";
import { UILoginKey } from "../../modules/login/const/UILoginConfig";


/**
 * 账号登陆
 */
export default class LoginTask extends Task {
    run(args?: any): void {
        // AudioManager.ins().playMusic("loginbgm");

        let isSdk = SdkManager.ins().isEnable();
        if (!isSdk) {
            G.UIManager.open(UILoginKey.ACCOUNT_WIN, null, () => {
                this.end();
            });
            return;
        }

        SdkManager.ins().login();
        UploadEventManager.ins().startGame(StartGameEvent.LoginCall);
        this.end();
    }
}
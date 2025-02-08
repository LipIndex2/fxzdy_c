import G from "../core/comm/G";
import { BaseController } from "../core/mvc/controller/BaseController";
import { TimeManager } from "../core/time/TimeManager";
import { UIFloatingLoginTipsKey } from "../main/modules/floatingTips/const/UIFloatingLoginTipsConfig";
import { UILoginKey } from "../main/modules/login/const/UILoginConfig";
import LoginNotificationKey from "../main/modules/LoginNotificationKey";
import { TouchEffectMgr } from "./comm/mgr/TouchEffectMgr";
import NotificationKey from "./event/NotificationKey";
import GIns from "./GIns";
import { UIJoystickKey } from "./ui/joystick/const/UIJoystickConfig";
import { UIMainKey } from "./ui/main/const/UIMainConfig";

/**进入游戏控制器 */
export default class EnterGameController extends BaseController {
    private isInited: boolean = false;
    listenNotifications(): string[] {
        return [LoginNotificationKey.INIT_GAME_WORLD, NotificationKey.ENTER_WORLD];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case LoginNotificationKey.INIT_GAME_WORLD:
                this.initGameWorld();
                break;
            case NotificationKey.ENTER_WORLD:
                !this.isInited && this.initGameWorldCompleted();
                break;
        }
    }

    onInit(): void {
    }

    /**初始化游戏世界 */
    private initGameWorld() {
        let mapId = 1;
        GIns.playerModel.loginTime = TimeManager.serverNow;
        G.UIManager.close(UILoginKey.ACCOUNT_WIN);
        G.UIManager.close(UILoginKey.LOGIN_PAGE);
        G.UIManager.close(UIFloatingLoginTipsKey.FloatingLoginTipsView);

        G.UIManager.open(UIJoystickKey.JOYSTICK_VIEW);
        // 主界面
        G.UIManager.open(UIMainKey.MAIN_PAGE);

        G.FacadeManager.emit(NotificationKey.LOAD_WORLD, mapId);
        TouchEffectMgr.ins().init();
    }


    /**
     * 初始化游戏世界完成后的处理函数。
     * 当游戏世界初始化完成后，设置初始化状态为 true，并触发登录通知键 `INIT_GAME_WORLD_COMPLETED`。
     * 如果已经初始化，则不会重复执行。
     */
    private initGameWorldCompleted() {
        this.isInited = true;
        this.emit(LoginNotificationKey.INIT_GAME_WORLD_COMPLETED);
        EnterGameController.destroy(); //登录完成 销毁控制器
    }
}

EnterGameController.ins().doInit();

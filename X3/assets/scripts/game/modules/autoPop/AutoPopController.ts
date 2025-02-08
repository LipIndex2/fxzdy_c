import G from "../../../core/comm/G";
import { BaseController } from "../../../core/mvc/controller/BaseController";
import NotificationKey from "../../event/NotificationKey";
import { AutoPopActivityContext } from "./context/AutoPopActivityContext";
// import { AutoPopActivityContext } from "./context/AutoPopActivityContext";
import { AutoPopBaseContext } from "./context/AutoPopBaseContext";
import { AutoPopDailySaleContext } from "./context/AutoPopDailySaleContext";
import { AutoPopFuncOpenContext } from "./context/AutoPopFuncOpenContext";
import { AutoPopLimitPackContext } from "./context/AutoPopLimitPackContext";

/** 自动弹框总管理器 */
export class AutoPopController extends BaseController {
    /**自动弹框上下文*/
    protected _contexts: AutoPopBaseContext[] = [];

    listenNotifications(): string[] {
        return [
            NotificationKey.OPEN_ViEW,
            NotificationKey.CLOSE_ViEW,
            NotificationKey.AUTO_POP_CHANGE,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.OPEN_ViEW:
            case NotificationKey.CLOSE_ViEW:
            case NotificationKey.AUTO_POP_CHANGE:
                this.checkPopLater();
                break;
        }
    }

    onInit(): void {
        this._contexts = [
            new AutoPopActivityContext(),
            new AutoPopDailySaleContext(),
            new AutoPopLimitPackContext(),
            new AutoPopFuncOpenContext(),
        ];
    }

    onDestroy(): void {
        this._contexts?.forEach((context) => {
            context.onDestroy();
        })
        this._contexts.length = 0;
        super.onDestroy();
    }

    /**需要延时处理 会出现关闭了UI 但是层级判断没有及时刷新问题*/
    protected checkPopLater(delay: number = 50): void {
        if (G.UIManager.isLoadingUI == false) {
            G.GameTimer.once(delay, this, this.checkPopNext);
            // console.log('checkPop---   Later ', Date.now());
        }
    }

    protected checkPopNext(): void {
        if (G.UIManager.isLoadingUI == false) {
            // console.log('checkPop---   Next ', Date.now());
            //每次UI层级发生改变需要判断一次弹出逻辑
            for (let i = 0; i < this._contexts.length; i++) {
                if (this._contexts[i].checkPopNext()) {
                    break;
                }
            }
        }
    }
}
AutoPopController.ins().doInit();

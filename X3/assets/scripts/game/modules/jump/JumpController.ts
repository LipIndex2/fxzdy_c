import { _decorator } from 'cc';
import { BaseController } from "db://assets/scripts/core/mvc/controller/BaseController";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import G from "db://assets/scripts/core/comm/G";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { EnumJumpType } from "db://assets/scripts/game/modules/jump/const/EnumJumpType";
import { JumpManager } from "db://assets/scripts/game/modules/jump/JumpManager";

const { ccclass, property } = _decorator;


/**
 * 邮件控制器
 */
export class JumpController extends BaseController {

    listenNotifications(): string[] {
        return [
            NotificationKey.EVENT_JUMP_TO_OTHER_FEATURE,
            NotificationKey.EVENT_JUMP_TO_OTHER_FEATURE_ARGS
        ];
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.EVENT_JUMP_TO_OTHER_FEATURE: {
                // 主界面打开完成后, 打开主线任务
                const jumpId = args as number;
                JumpManager.ins().jumpById(jumpId);
                break;
            }
            case NotificationKey.EVENT_JUMP_TO_OTHER_FEATURE_ARGS: {
                const data = args as { jumpId: number, arg?: any };
                JumpManager.ins().jumpById(data.jumpId, data.arg);
                break;
            }
        }
    }

    onInit(): void {
    }

}

JumpController.ins().doInit();



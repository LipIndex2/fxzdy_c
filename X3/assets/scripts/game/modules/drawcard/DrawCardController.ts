import { BaseController } from "../../../core/mvc/controller/BaseController";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { DrawCardUIKeys } from "db://assets/scripts/game/modules/drawcard/DrawCardUIKeys";
import { DrawCardResultViewOpenArgs } from "db://assets/scripts/game/modules/drawcard/view/DrawCardResultView";
import { UIManager } from "db://assets/scripts/core/mvc/UIManager";


/** 抽卡 */
export class DrawCardController extends BaseController {

    listenNotifications(): string[] {
        return [
            NotificationKey.DRAW_CARD_GAIN_ITEMS,
            NotificationKey.DRAW_CARD_EXIT_RESULT
        ];
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.DRAW_CARD_GAIN_ITEMS:
                UIManager.ins().open(DrawCardUIKeys.DrawCardResultView, args as DrawCardResultViewOpenArgs);
                break;
            case NotificationKey.DRAW_CARD_EXIT_RESULT:
                // 尝试获取进度奖励 | 废
                // DrawCardModel.ins().context.tryGainProgressReward()
                break;
        }
    }

    constructor() {
        super();
    }

    onInit(): void {
    }


}

DrawCardController.ins().doInit();
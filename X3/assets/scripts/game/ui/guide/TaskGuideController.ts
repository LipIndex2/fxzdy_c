import { BaseController } from "db://assets/scripts/core/mvc/controller/BaseController";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import FGUIManager from "db://assets/scripts/core/fgui/FGUIManager";
import {
    TargetDownArrowComponent,
    TargetDownArrowComponentOpenArgs
} from "db://assets/scripts/game/ui/guide/view/TargetDownArrowComponent";
import BattleShowFactory from "db://assets/scripts/game/comm/battle/factory/BattleShowFactory";
import { Node, UITransform, view } from "cc";
import G from "db://assets/scripts/core/comm/G";
import { LocalMemoryData } from "db://assets/scripts/game/comm/cache/LocalMemoryData";
import * as fgui from "fairygui-cc";

/**
 * 任务指引
 *
 */
export class TaskGuideController extends BaseController {
    listenNotifications(): string[] {
        return [
            NotificationKey.TASK_GUIDE_TO_TARGET_DOWN_ARROW,
            NotificationKey.TASK_GUIDE_START,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.TASK_GUIDE_TO_TARGET_DOWN_ARROW:
                // 显示目标箭头
                BattleShowFactory.createTipsDownArrow(args as TargetDownArrowComponentOpenArgs)
                break;
            case NotificationKey.TASK_GUIDE_START:
                // 引导遮罩
                this.createGuideMaskNode()
                break;
        }
    }

    createGuideMaskNode() {
        LocalMemoryData.ins().isInGuide = true;
        fgui.GRoot.inst.once(fgui.Event.TOUCH_BEGIN, () => {
            LocalMemoryData.ins().isInGuide = false;
            G.FacadeManager.emitNow(NotificationKey.TASK_GUIDE_END);
        })
    }

    doInit(): void {
        super.doInit();

        FGUIManager.ins().bindScript("ui://comm/TargetDownArrowComponent", TargetDownArrowComponent);
    }
}

TaskGuideController.ins().doInit();
import G from "../../../core/comm/G";
import { BaseController } from "../../../core/mvc/controller/BaseController";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import { RedDotKeys } from "../common/redDot/RedDotKeys";
import { ConditionUtils } from "../condition/ConditionUtils";

/**功能开启 */
export class PredictionController extends BaseController {
    //功能是否开启
    private _isOpen: boolean;

    listenNotifications(): string[] {
        return [
            NotificationKey.SYSTEM_OPEN_FUNCTION,
            NotificationKey.FUNCTION_NOTICE_UPDATE,
            // 解锁
            ...ConditionUtils.getUnlockEventNameArray(),
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.SYSTEM_OPEN_FUNCTION:
            case NotificationKey.FUNCTION_NOTICE_UPDATE:
                this.checkRedDot();
                break;
        }

        const ok = ConditionUtils.isNeedHandleForUnlock(event);
        if (ok) {
            this.checkRedDot();
        }
    }

    //红点检查
    public checkRedDot() {
        // if (this._isOpen == null) {
        //     this._isOpen = GIns.moduleOpenMgr.isCanOpenModuleWithoutTips(ServerEnums.SystemType.PREVIEW);
        // }
        // if (!this._isOpen) return;
        G.GameTimer.once(500, this, () => {
            this.updateRedDot();
        });
    }

    //
    private updateRedDot() {
        let allcfg = GIns.predictionMgr.previewConfig;
        let isShow = false;
        for (let cfg of allcfg) {
            isShow = false;
            if (GIns.predictionMgr.openPreviewIds.indexOf(cfg.id) != -1) {
                if (GIns.predictionMgr.receivedPreviewIds.indexOf(cfg.id) == -1) {
                    isShow = true;
                } else {
                    isShow = false;
                }
            }
            // FguiScriptUtils.toMyScriptClass(item.redDot, RedDotCom).reset(RedDotKeys.FunctionPreview_task, [cfg.id]);
            GIns.redDotMgr.setRedDot(RedDotKeys.FunctionPreview_task, isShow, [cfg.id]);
        }
    }
}

PredictionController.ins().doInit();

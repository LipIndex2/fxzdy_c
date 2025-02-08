import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { bindScript } from "../../../../core/comm/UIScriptManager";
import { UICommWin } from "../../../../core/mvc/view/UICommWin";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { ActivityController } from "../../activity/ActivityController";
import { ActivityRushRankVo } from "../../activity/model/ActivityRushRankVo";
import { ModelNode } from "../../common/node/ModelNode";
import { PlayerTitleSmallComp } from "../../common/playerInfo/PlayerTitleSmallComp";
import { PlayerInfoConfigManager } from "../../player/config/PlayerInfoConfigManager";
import { UIActivityAutoPopConfig } from "../const/UIActivityAutoPopConfig";

/**
 * 活动冲榜banner弹框
 */
@bindScript(UIActivityAutoPopConfig.ActivityAutoPopRankSettleWin)
export class ActivityAutoPopRankSettleWin extends UICommWin {
    static pkgName: string = "activityAutoPop";
    static viewName: string = "ActivityAutoPopRankSettleWin";

    protected _args: table.activity.ActivityConstant.ActivityAutoPopConfig = null;

    private get view(): ui.activityAutoPop.view.ActivityAutoPopRankSettleWin {
        return this._view as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK,
            NotificationKey.ACTIVITY_UPDATE,
            NotificationKey.ACTIVITY_REQUEST_BACK,
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.ACTIVITY_UPDATE:
                if (args === this._args.activityId) {
                    this.checkActivityExist();
                }
                break;
            case NotificationKey.ACTIVITY_SINGLE_REQUEST_BACK:
                if (args === this._args.activityId) {
                    this.checkActivityExist();
                }
                break;
            case NotificationKey.ACTIVITY_REQUEST_BACK:
                this.checkActivityExist();
                break;
        }
    }

    protected onInit(): void {

    }

    protected checkActivityExist(): void {
        if (ActivityController.ins().isActivityUnlock(this._args.activityId) == false) {
            //活动不存在
            this.closeSelf();
        }
    }

    protected updateUI(): boolean {
        if (ActivityController.ins().isActivityUnlock(this._args.activityId) == false) {
            //活动不存在
            this.closeSelf();
            return false;
        }

        let vo = GIns.activityModel.getActivityVoById(this._args.activityId) as ActivityRushRankVo;
        if (vo) {
            let settleRound = vo.getCurSettleRound();
            //后端round从0开始 前端从1开始
            let settleVo = vo?.activityVo?.settleVos?.find((value) => value.roundIndex == settleRound - 1);
            if (settleVo && settleVo.firstPlayerBaseVo) {
                this.view.banner.icon = this._args.banner;
                this.view.lbTitle.text = this._args.title;
                this.view.lbTitle.ensureSizeCorrect();
                this.view.bgTitle.width = this.view.lbTitle.width + 76;
                let modelNode = this.view.modelNode as ModelNode;
                modelNode.setScale(3.5, 3.5);
                let modelId = PlayerInfoConfigManager.getModelIdByPlayerInfo(settleVo.firstPlayerBaseVo)
                modelNode.loadByModelId(modelId);
                this.view.lbName.text = settleVo.firstPlayerBaseVo.name;
                FguiScriptUtils.toMyScriptClass(this.view.titleComp, PlayerTitleSmallComp).resetByTitleId(settleVo.firstPlayerBaseVo.title);

                if (this._args.bubbleTip) {
                    this.view.bubble.visible = true;
                    this.view.bubble.lbTip.text = this._args.bubbleTip;
                    this.view.getTransition('enter').play();
                }
                return true;
            }
        }
        this.closeSelf();
        return false;
    }

    protected onOpen(args: any, isReopen?: boolean): void {
        this._args = args;
        let result:boolean = this.updateUI();
        if (result) {
            return;
        }
    }

    protected onClose(dontDispose?: boolean): void {

    }
}

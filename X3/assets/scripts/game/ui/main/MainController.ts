import { TrunkTaskBtn } from "db://assets/scripts/game/ui/main/components/TrunkTaskBtn";
import G from "../../../core/comm/G";
import FGUIManager from "../../../core/fgui/FGUIManager";
import { Logger } from "../../../core/log/Logger";
import { BaseController } from "../../../core/mvc/controller/BaseController";
import { UIManager } from "../../../core/mvc/UIManager";
import { TableManager } from "../../../core/table/TableManager";
import { ActivityModel } from "../../comm/activity/model/ActivityModel";
import NotificationKey from "../../event/NotificationKey";
import { ConditionManager } from "../../modules/condition/ConditionManager";
import { PlayerModel } from "../../modules/player/model/PlayerModel";
import { UIMainKey } from "./const/UIMainConfig";
import GIns from "../../GIns";
import { DebugUtils } from "../../../core/utils/DebugUtils";

export class MainController extends BaseController {
    listenNotifications(): string[] {
        return [
            NotificationKey.BACK_MAIN_VIEW,

            //活动开启条件，完成时刷新一下活动列表（防止后端已经开启活动之后，前端才达成开启条件，会导致入口不刷新的问题）
            //后续有新条件需要添加
            NotificationKey.HERO_UP_LEVEL, //等级
            NotificationKey.HERO_UP_STAR, //星级
            NotificationKey.EVENT_TRUNK_TASK_ID_NEXT, //主线任务
            NotificationKey.HANG_UP_MAX_PASS_LEVEL_ID_CHANGE, //通关主线关卡
            NotificationKey.SECRET_AREA_BATTLE_WIN, //秘境战斗胜利
        ];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.BACK_MAIN_VIEW:
                if (!UIManager.ins().isUILayerTop(UIMainKey.MAIN_PAGE)) {
                    UIManager.ins().open(UIMainKey.MAIN_PAGE);
                    break;
                }
            case NotificationKey.HERO_UP_LEVEL:
            case NotificationKey.HERO_UP_STAR:
            case NotificationKey.EVENT_TRUNK_TASK_ID_NEXT:
            case NotificationKey.HANG_UP_MAX_PASS_LEVEL_ID_CHANGE:
            case NotificationKey.SECRET_AREA_BATTLE_WIN:
                G.GameTimer.once(500, this, this.checkAllOpenActivity);
                // this.checkAllOpenActivity();
                break;
        }
    }

    constructor() {
        super();

        Logger.game(" MainController init ");
    }

    onInit(): void {
        // 主线任务
        FGUIManager.ins().bindScript("ui://main/TrunkTaskBtn", TrunkTaskBtn);
    }

    private _allCfg: table.activity.ActivityConstant.ActivityConfig[];
    //检测是否所有开启的活动都显示了入口
    private checkAllOpenActivity() {
        if (!this._allCfg) {
            this._allCfg = TableManager.getAllData(table.activity.ActivityConstant.ActivityConfig);
        }

        for (let cfg of this._allCfg) {
            if (ConditionManager.ins().checkCondition(cfg.openConditions)) {
                let vo = ActivityModel.ins().getActivityVoById(cfg.id);
                let isShow = false;
                let state = GIns.activityModel.getActivityStateById(cfg.id);
                isShow = state == 3 || state == 4;
                let isEnd = true;
                let stateVo = GIns.activityModel.getActivityStateVoById(cfg.id);
                if (stateVo) {
                    let startState = stateVo.visibleStartTime <= 0 || (stateVo.visibleStartTime > 0 && G.TimeManager.serverNow - stateVo.visibleStartTime >= 0);
                    let endState = stateVo.visibleEndTime > 0 && G.TimeManager.serverNow - stateVo.visibleEndTime >= 0;
                    if (startState && !endState) isEnd = false;
                }
                if (!vo && isShow && !isEnd) {
                    ActivityModel.ins().sendActivity(cfg.id);
                    DebugUtils.isDebugMode() && console.log(`${cfg.id} 活动数据为空，发送请求`);
                }
            }
        }
    }
}

MainController.ins().doInit();

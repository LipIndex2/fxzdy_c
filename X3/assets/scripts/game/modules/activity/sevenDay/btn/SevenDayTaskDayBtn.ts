import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { ActivityModel } from "db://assets/scripts/game/comm/activity/model/ActivityModel";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import {
    ActivitySevenDayTaskModelVo
} from "db://assets/scripts/game/modules/activity/model/ActivitySevenDayTaskModelVo";
import { Logger } from "db://assets/scripts/core/log/Logger";
import { FloatingTextManager } from "db://assets/scripts/game/modules/floatingText/FloatingTextManager";
import { RedDotUtils } from "db://assets/scripts/game/modules/common/redDot/utils/RedDotUtils";
import { RedDotKeys } from "db://assets/scripts/game/modules/common/redDot/RedDotKeys";


@bindFguiExtension("ui://sevenDay/SevenDayTaskDayBtn")
export class SevenDayTaskDayBtn extends FGUI.GComponent {
    
    private _day: number = 1;
    private _isUnlock: boolean = false;


    get view(): ui.sevenDay.btn.SevenDayTaskDayBtn {
        return this as any;
    }


    protected onConstruct() {
        super.onConstruct();

        this.view.onClick(this.onClickDay, this);
    }

    onClickDay() {
        if (!this._isUnlock) {
            FloatingTextManager.ins().showTips(`第 ${this._day} 天解锁`);
            return;
        }

        FacadeManager.ins().emit(NotificationKey.SEVEN_DAY_TASK_CHOOSE_DAY, this._day);
    }

    reset(day: number,
          chooseDay: number
    ) {
        const vo = ActivityModel.ins().getActivityVoByType(ServerEnums.ActivityType.CARNIVAL) as ActivitySevenDayTaskModelVo;
        if (!vo) {
            Logger.error(`活动未开启 | ActivityType.CARNIVAL`)
            return;
        }
        this._day = day;

        RedDotUtils.castComp(this.view.redDot)
            .reset(RedDotKeys.SevenDay_Task_DAY, [day])


        this.view.labelTitle.text = `${day}`;

        // 解锁? 可以选 N + 1 天
        const maxDay = vo.getMaxDay();
        const isUnlock = (maxDay + 1) >= day;
        this._isUnlock = isUnlock;
        this.view.getController("isUnlock").selectedIndex = isUnlock ? 1 : 0;

        // 选中
        const isChoose = chooseDay == day;
        this.view.getController("isChoose").selectedIndex = isChoose ? 1 : 0;

    }

}
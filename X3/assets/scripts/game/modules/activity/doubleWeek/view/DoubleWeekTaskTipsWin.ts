import G from "../../../../../core/comm/G";
import { EnumUIViewLayer } from "../../../../../core/comm/LayerManager";
import { bindScript } from "../../../../../core/comm/UIScriptManager";
import { UIWin } from "../../../../../core/mvc/view/UIWin";
import { TableManager } from "../../../../../core/table/TableManager";
import { UIActivityKey } from "../../const/UIActivityConfig";

/**
 * 双周活动
 * 任务弹窗
 */
@bindScript(UIActivityKey.DoubleWeekTaskTipsWin)
export class DoubleWeekTaskTipsWin extends UIWin {
    static pkgName: string = "activityDoubleWeek";
    static viewName: string = "DoubleWeekTaskTipsWin";
    public _layer = EnumUIViewLayer.TIPS;

    private get view(): ui.activityDoubleWeek.DoubleWeekTaskTipsWin {
        return this._view as any;
    }

    protected onInit(): void {}

    protected onOpen(args: Vo.task.TaskVo, isReopen?: boolean): void {
        if (!args) {
            G.GameTimer.clearAll(this);
            this.closeSelf();
            return;
        }
        let cfg = TableManager.getDataById(table.activity.Task.ActivityTaskConfig, args.taskId);
        if (!cfg) {
            G.GameTimer.clearAll(this);
            this.closeSelf();
            return;
        }

        G.GameTimer.once(3000, this, this.closeSelf);

        this.view.T_desc.text = cfg.desc;
        this.view.bar.max = cfg.maxProgress;
        this.view.bar.value = args.progress;

        this.view.getController("c1").selectedIndex = args.state == 3 ? 1 : 0;

        if (args.state == 3) {
            this.view.bar.value = cfg.maxProgress;
        }

        this.view.getTransition("anim").play();
    }
}

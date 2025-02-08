import { EnumTaskViewTabIndex, TaskView } from "../view/TaskView";
import { RedDotUtils } from "db://assets/scripts/game/modules/common/redDot/utils/RedDotUtils";
import { RedDotKeys } from "db://assets/scripts/game/modules/common/redDot/RedDotKeys";
import FGUI from "db://assets/scripts/core/fgui/FGUI";


/**
 * 任务 tab
 */
export class TaskTabButton extends FGUI.GButton {

    private _tabIndex: EnumTaskViewTabIndex;


    private get view(): ui.task.button.TaskTabButton {
        return this as any;
    }

    constructor() {
        super();
    }


    onConstruct() {
        this.onInit()
    }

    public onInit() {

    }

    reset(index: EnumTaskViewTabIndex,
          name: string,
          chooseFlag: boolean,
    ) {
        this._tabIndex = index;
        if (chooseFlag) {
            this.view.getController("chooseState").selectedIndex = 1;
        } else {
            this.view.getController("chooseState").selectedIndex = 0;
        }

        this.view.labelTitle.text = name;

        this.refreshRedDot();
    }

    private refreshRedDot() {
        const redDotCom = RedDotUtils.castComp(this.view.redDot);
        if (this._tabIndex == EnumTaskViewTabIndex.TASK) {
            redDotCom.reset(RedDotKeys.dailyTask);
        } else if (this._tabIndex == EnumTaskViewTabIndex.ACHIEVEMENT) {
            redDotCom.reset(RedDotKeys.achievement);
        } else {
            redDotCom.reset(RedDotKeys.Null);
        }

    }
}
import * as fgui from "fairygui-cc";
import { GmModel } from "db://assets/scripts/gm/model/GMModel";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { StringUtils } from "db://assets/scripts/core/utils/StringUtils";


/**
 * GM 邮件
 */
export class GMTaskView extends fgui.GComponent {

    private static __inputBoxTaskType: string = "";
    private static __inputBoxTaskId: string = "";
    private static __inputBoxNewProgress: string = "";


    private get view(): ui.gm.task.GMTaskView {
        return this as any;
    }


    onConstruct() {
        this.onInit()
    }


    protected onPreDispose() {

        super.onPreDispose();
    }

    public onInit() {


        this.view.inputBoxTaskType.labelTitle.text = "任务类型enum数字"
        this.view.inputBoxTaskId.labelTitle.text = "任务id"
        this.view.inputBoxNewProgress.labelTitle.text = "add进度数字"
        // button
        this.view.btnOk.labelTitle.text = "确认增加"

        this.view.btnOk.on(fgui.Event.CLICK, this.onClickOk, this)

    }


    private onClickOk() {
        const taskTypeStr = this.view.inputBoxTaskType.inputName.text;
        let taskType = 0;
        if (StringUtils.isNumberString(taskTypeStr)) {
            taskType = taskTypeStr.toInt();
        } else {
            taskType = ServerEnums.TaskType[taskTypeStr];

        }
        const taskId = this.view.inputBoxTaskId.inputName.text.toInt();
        const addProgress = this.view.inputBoxNewProgress.inputName.text.toInt();


        GmModel.ins().sendFakeTaskProgress({
            taskType: taskType,
            taskId: taskId,
            addProgress: addProgress
        } as Vo.gm.FakeTaskProgressC2S);

        this.view.inputBoxTaskId.inputName.text = (taskId + 1).toString();


    }
}
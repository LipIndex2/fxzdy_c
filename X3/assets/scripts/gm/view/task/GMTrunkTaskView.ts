import * as fgui from "fairygui-cc";
import { GmModel } from "db://assets/scripts/gm/model/GMModel";
import { TrunkTaskModel } from "db://assets/scripts/game/modules/task/model/TrunkTaskModel";
import { FloatingTextManager } from "db://assets/scripts/game/modules/floatingText/FloatingTextManager";
import { ColorUtils } from "db://assets/scripts/core/utils/ColorUtils";
import GIns from "../../../game/GIns";


/**
 * GM 邮件
 */
export class GMTrunkTaskView extends fgui.GComponent {

    private get view(): ui.gm.task.GMTrunkTaskView {
        return this as any;
    }

    onConstruct() {
        this.onInit()
    }

    public onInit() {


        this.view.input1.labelTitle.text = "到哪个主线任务id";
        // button
        this.view.btnOk.labelTitle.text = "完成直到id!";
        this.view.btnChangeTaskId.labelTitle.text = "向前跳任务!";
        this.view.btnChangeTaskId.labelTitle.color = ColorUtils.COLOR_RED;

        this.view.btnOk.on(fgui.Event.CLICK, this.onClickOk, this)
        this.view.btnChangeTaskId.on(fgui.Event.CLICK, this.onClickChangeTaskId, this)

    }

    onClickChangeTaskId() {
        const toTaskId = this.view.input1.inputName.text.toInt();

        GmModel.ins().sendChangeTrunkTask({
            taskId: toTaskId,
        });

    }


    private onClickOk() {
        const toTaskId = this.view.input1.inputName.text.toInt();

        if (TrunkTaskModel.ins().isPass(toTaskId)) {
            GIns.floatingTextMgr.showTips("任务已完成, 不能往前跳任务");
            return;
        }
        
        GmModel.ins().sendJumpTrunkTaskAndReward({
            trunkTaskId: toTaskId,
        });

    }
}
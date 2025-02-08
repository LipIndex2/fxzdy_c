import { _decorator } from 'cc';
import { BaseController } from "db://assets/scripts/core/mvc/controller/BaseController";
import { BackpackItemComp } from "db://assets/scripts/game/modules/backpack/components/BackpackItemComp";
import { BackpackItemTypeButtonView } from "db://assets/scripts/game/modules/backpack/view/BackpackItemTypeButtonView";
import FGUIManager from "db://assets/scripts/core/fgui/FGUIManager";

const {ccclass, property} = _decorator;

export class BackpackController extends BaseController {
    listenNotifications(): string[] {
        return [];
    }


    notificationHandler(event: string, args?: any): void {
        switch (event) {
        }
    }

    onInit(): void {
        //绑定脚本给组件
        FGUIManager.ins().bindScript("ui://backpack/BackpackItemComp", BackpackItemComp);
        FGUIManager.ins().bindScript("ui://backpack/buttonItemType", BackpackItemTypeButtonView);

    }

}

BackpackController.ins().doInit();



import { _decorator, } from 'cc';
import BaseSingleton from "db://assets/scripts/core/base/BaseSingleton";
import { GrowthPathPanelComp } from "db://assets/scripts/game/modules/growthpath/components/GrowthPathPanelComp";
import FGUIManager from "db://assets/scripts/core/fgui/FGUIManager";
import { GrowthPathTaskRowComp } from "db://assets/scripts/game/modules/growthpath/components/GrowthPathTaskRowComp";
import {
    GrowthPathOneRowRewardComp
} from "db://assets/scripts/game/modules/growthpath/components/GrowthPathOneRowRewardComp";

const {ccclass, property} = _decorator;

export class GrowthPathController extends BaseSingleton {

    onInit(): void {
        // 绑定脚本给组件
        FGUIManager.ins().bindScript("ui://growthPath/GrowthPathPanelComp", GrowthPathPanelComp);
        FGUIManager.ins().bindScript("ui://growthPath/GrowthPathTaskRowComp", GrowthPathTaskRowComp);
        FGUIManager.ins().bindScript("ui://growthPath/GrowthPathOneRowRewardComp", GrowthPathOneRowRewardComp);
    }

}

GrowthPathController.ins();
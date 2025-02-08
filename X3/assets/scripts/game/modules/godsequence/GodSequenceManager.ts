import { _decorator, } from 'cc';
import BaseSingleton from "db://assets/scripts/core/base/BaseSingleton";
import G from "db://assets/scripts/core/comm/G";
import {
    GodSequenceLeftRightComp
} from "db://assets/scripts/game/modules/godsequence/components/GodSequenceLeftRightComp";
import { GodSequenceOneColComp } from "db://assets/scripts/game/modules/godsequence/components/GodSequenceOneColComp";
import { GodSequenceOneGridComp } from "db://assets/scripts/game/modules/godsequence/components/GodSequenceOneGridComp";
import { GodSequenceDialog } from "db://assets/scripts/game/modules/godsequence/components/GodSequenceDialog";

const {ccclass, property} = _decorator;

export class GodSequenceManager extends BaseSingleton {

    onInit(): void {
        // 绑定脚本给组件
        G.FGUIManager.bindScript("ui://godSequence/GodSequenceLeftRightComp", GodSequenceLeftRightComp);
        G.FGUIManager.bindScript("ui://godSequence/GodSequenceOneColComp", GodSequenceOneColComp);
        G.FGUIManager.bindScript("ui://godSequence/GodSequenceDialog", GodSequenceDialog);
    }

}

GodSequenceManager.ins();
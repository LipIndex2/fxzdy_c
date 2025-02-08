import BaseSingleton from "../../../core/base/BaseSingleton";
import {HangUpModel} from "db://assets/scripts/game/modules/hangup/model/HangUpModel";


/**
 * 挂机管理器
 * */
export class HangUpManager extends BaseSingleton {

    /**
     * 获取当前关卡名称
     */
    getCurrentLevelName(): string {
        return HangUpModel.ins().getCurrentLevelIdString()
    }


}
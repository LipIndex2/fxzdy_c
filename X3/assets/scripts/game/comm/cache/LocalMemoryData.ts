import BaseSingleton from "db://assets/scripts/core/base/BaseSingleton";
import { Logger } from "db://assets/scripts/core/log/Logger";


/**
 * 内存临时数据
 */
export class LocalMemoryData extends BaseSingleton {

    // 玩家id
    playerId: number = 0;

    // 是否在引导中
    private _isInGuide: boolean = false;


    get isInGuide(): boolean {
        return this._isInGuide;
    }

    set isInGuide(value: boolean) {
        Logger.debug(`引导状态改变: ${this._isInGuide}`)
        this._isInGuide = value;
    }
}
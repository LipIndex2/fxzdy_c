import BaseSingleton from "db://assets/scripts/core/base/BaseSingleton";
import { PlayerModel } from "db://assets/scripts/game/modules/player/model/PlayerModel";

export class PlayerManager extends BaseSingleton {

    /**
     * 获取玩家等级
     */
    getPlayerLevel(): number {
        return PlayerModel.ins().Vo.level;
    }


    /**
     * 判断玩家等级是否达到指定等级
     * @param unlockLv
     */
    isGteTargetLevel(unlockLv: number): boolean {
        return this.getPlayerLevel() >= unlockLv;
    }
}
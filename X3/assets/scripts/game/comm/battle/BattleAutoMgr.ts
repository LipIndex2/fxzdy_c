import { ArenaAutoFight } from "./auto/ArenaAutoFight"
import { BaseAutoFight } from "./auto/BaseAutoFight"
import { TestInstanceAutoHandler } from "./auto/TestInstanceAutoHandler"
import { TrunkInstanceAutoHandler } from "./auto/TrunkInstanceAutoHandler"
import { BattleLogic } from "./BattleLogic"
import { FightType } from "./enum/FightType"

export class BattleAutoMgr {
    public battleLogic: BattleLogic;
    public autoHandler: BaseAutoFight;
    public enterScene(): void {
        if (FightType.TRUNK_INSTANCE == this.battleLogic.fightType) {
            this.autoHandler = new TrunkInstanceAutoHandler()
        }
        else if (FightType.TEST == this.battleLogic.fightType) {
            this.autoHandler = new TestInstanceAutoHandler()
        }
        else if (FightType.WORLD_BOSS == this.battleLogic.fightType || FightType.DAILY_BOSS == this.battleLogic.fightType || FightType.LEAGUE_BOSS == this.battleLogic.fightType || FightType.SEASON_BOSS == this.battleLogic.fightType) {
            this.autoHandler = new BaseAutoFight()
        }
        else if (FightType.ARENA == this.battleLogic.fightType) {
            this.autoHandler = new ArenaAutoFight()
        }

        if (this.autoHandler) {
            this.autoHandler.battleLogic = this.battleLogic;
            this.autoHandler.setData()
        }
    }

    public stop(): void {
        if (this.autoHandler)
            this.autoHandler.stop()
    }

    /**执行玩法的自动战斗逻辑 */
    public update(): void {
        if (!this.battleLogic.isAutoFight)
            return

        if (this.battleLogic.isStopFightAi)
            return

        if (this.autoHandler)
            this.autoHandler.autoHandler()
    }
}
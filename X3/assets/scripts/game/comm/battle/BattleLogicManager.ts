import BaseSingleton from "../../../core/base/BaseSingleton";
import { BattleLogic } from "./BattleLogic";
import { FightType } from "./enum/FightType";

export class BattleLogicManager extends BaseSingleton {
    private map: { [key: number]: BattleLogic } = {}
    /***根据当前玩法创建1个的战斗逻辑 */
    public create(fightType: FightType): BattleLogic {
        let logic = new BattleLogic();
        logic.init(fightType)
        this.map[fightType] = logic;
        return logic
    }

    public get(fightType: FightType): BattleLogic {
        let logic = this.map[fightType];
        if (!logic)
            logic = this.create(fightType);

        return logic;
    }

    public getNotCreate(fightType: FightType): BattleLogic {
        return this.map[fightType];
    }

    public getBattleLogicById(battleConfigId: number): BattleLogic {
        for (let i in this.map) {
            if (this.map[i].battleConfigId == battleConfigId)
                return this.map[i]
        }
    }

    /****移除1个战斗逻辑 */
    public remove(fightType: FightType): void {
        if (this.map[fightType]) {
            this.map[fightType].remove()
            delete this.map[fightType];
        }
    }

    public update(fightType: FightType): void {
        this.map[fightType].update()
    }

    /***是否自动战斗,包括移动 */
    public setAutoFight(fightType: FightType, value: boolean) {
        this.get(fightType).isAutoFight = value;
    }

    /***是否自动战斗,包括移动 */
    public getAutoFight(fightType: FightType): boolean {
        return this.get(fightType).isAutoFight;
    }
}

import { BattleUnit } from "../BattleUnit";

export class BattleUnitComp {
    public owner: BattleUnit
    public constructor (unit: BattleUnit) {
        this.owner = unit;
    }

    public update(): void {

    }

    public dispose() {
    }
}
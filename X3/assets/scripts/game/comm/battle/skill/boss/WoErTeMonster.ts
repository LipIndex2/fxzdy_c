import { MonsterUnit } from "../../unit/battle/MonsterUnit";

export class WoErTeMonster extends MonsterUnit {
    public skill3Num: number = 0;
    public enterFight(teamEnter: boolean = true): boolean {
        if (this.isBeginToFight)
            return false
        let b = super.enterFight()
        this.skill3Num = 0;
        return b
    }
}

import { MonsterShowUnit } from "../../show/MonsterShowUnit";
import { MonsterUnit } from "../../unit/battle/MonsterUnit";
import { PassivitySkillFlag } from "../SkillEnum";

export class NuoWaMonsterShow extends MonsterShowUnit {
    public fadeIn(v: number, alpha: number = 255): void {
        let P4312_p101Parm = this.unitData.attr.getPassiveSkillFlag(PassivitySkillFlag.P4312_p101)
        if (P4312_p101Parm)
            super.fadeIn(v, 120)
        else
            super.fadeIn(v, alpha)
    }
}

export class NuoWaMonster extends MonsterUnit {
    /***获取当前绑定的对应显示单位，不一定有值 */
    public showUnit(): NuoWaMonsterShow {
        return super.showUnit() as NuoWaMonsterShow;
    }

    public enterFight(teamEnter: boolean = true): boolean {
        let b = super.enterFight()
        if (b) {
            let P4312_p101Parm = this.attr.getPassiveSkillFlag(PassivitySkillFlag.P4312_p101)
            if (P4312_p101Parm)
                this.showUnit()?.setAlpha(1)
        }
        return b
    }

    /***脱离战斗 */
    public exitFight(): void {
        super.exitFight()
        if (this.isActive) {
            let P4312_p101Parm = this.attr.getPassiveSkillFlag(PassivitySkillFlag.P4312_p101)
            if (P4312_p101Parm)
                this.showUnit()?.setAlpha(0.5)
        }
    }
}
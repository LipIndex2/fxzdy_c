import { TableManager } from "../../../../../core/table/TableManager";
import RandomUtils from "../../../../../core/utils/RandomUtils";
import { MonsterShowUnit } from "../../show/MonsterShowUnit";
import { MonsterUnit } from "../../unit/battle/MonsterUnit";

export class HuiMieZheMonsterShow extends MonsterShowUnit {
    protected getActionEffectData(): table.battle.SkillEffectConfig {
        if (this.unitData.skillInfo.skillIndex == 0) {
            if (RandomUtils.randomBoolean())
                return TableManager.getDataById(table.battle.SkillEffectConfig, this.unitData.skillInfo.cfg.anim)
            else
                return TableManager.getDataById(table.battle.SkillEffectConfig, this.unitData.skillInfo.cfg.anim + 1)
        }
        return this.unitData.skillInfo.getActionEffectData()
    }
}

export class HuiMieZheMonster extends MonsterUnit {
    public canPassivitySkill1: boolean = true;//是否能触发被动的复活
    public enterFight(): boolean {
        let b = super.enterFight()
        if (b) {
            this.canPassivitySkill1 = true
        }
        return b
    }
}
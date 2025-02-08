import { Vec2 } from "cc";
import { IPool } from "../../../../../core/pool/IPoolInstance";
import { ICaster } from "../../skill/ICaster";
import { BaseUnit } from "../BaseUnit";
import { v2 } from "cc";
import { BattleCommandType } from "../../BattleCommand";
import { BattleUnit } from "../battle/BattleUnit";
import { OtherSkillData } from "../../skill/OtherSkillData";
import { SkillData } from "../../skill/SkillData";
import { BattleAttr } from "../../attribute/BattleAttr";

export class OtherSkillUnitAttr extends BattleAttr {
    init() {
        this._attrs = {};
        this._buffs = [];
    }
}

export class OtherSkillUnit extends BattleUnit implements IPool, ICaster {
    public get atk(): number {
        let attack = 0
        let units = this.battleLogic.unitProcessor.getUnitsByTeamId(this.teamId)
        for (let i = 0; i < units.length; i++) {
            if (units[i].isActive) {
                attack += units[i].atk;
            }
        }
        return attack
    }

    init(data: OtherSkillData) {
        this.skillInfo = data;
        if (!this._attr)
            this._attr = new OtherSkillUnitAttr(this);
        this._attr.init()
    }
}
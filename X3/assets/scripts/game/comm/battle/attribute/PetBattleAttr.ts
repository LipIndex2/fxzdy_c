import { TableManager } from "../../../../core/table/TableManager";
import { SortUtils } from "../../../../core/utils/SortUtils";
import BattleConstantConfig from "../config/BattleConstantConfig";
import { SkillData } from "../skill/SkillData";
import { SkillType } from "../skill/SkillEnum";
import { PetBattleData } from "../unit/battle/PetBattleData";
import { AttrEnum } from "./AttrEnum";
import { BattleAttr } from "./BattleAttr";

export class PetBattleAttr extends BattleAttr {
    protected _cfg: table.pet.PetConfig;
    protected battleData: PetBattleData
    initByPet(battleData: PetBattleData) {
        this.battleData = battleData;
        let cfg = battleData.cfg
        this._cfg = cfg;
        this.atkTimeSpeed = cfg.atkSpeed || 1000;
        this.init()
        if (!this._attrs[AttrEnum.HP]) this._attrs[AttrEnum.HP] = 1;
        if (!battleData.attr) {
            let atk = this.owner.battleLogic.getTeamInitAttrValue(this.owner.teamId, AttrEnum.ATK)
            let hp = this.owner.battleLogic.getTeamInitAttrValue(this.owner.teamId, AttrEnum.HP)
            let def = this.owner.battleLogic.getTeamInitAttrValue(this.owner.teamId, AttrEnum.DEF)
            this._attrs[AttrEnum.ATK] = Math.ceil(atk * (this._cfg.atkMod ? (this._cfg.atkMod / BattleConstantConfig.getRandBase) : 1));
            this._attrs[AttrEnum.HP] = Math.ceil(hp * (this._cfg.hpMod ? (this._cfg.hpMod / BattleConstantConfig.getRandBase) : 1));
            this._attrs[AttrEnum.DEF] = Math.ceil(def * (this._cfg.defMod ? (this._cfg.defMod / BattleConstantConfig.getRandBase) : 1));
            if (cfg.secondAttrs) {
                for (let i = 0; i < cfg.secondAttrs.length; i++) {
                    let attrTid = TableManager.getDataById(table.battle.AttributeConfig, cfg.secondAttrs[i].k).tid
                    this._attrs[attrTid] = +cfg.secondAttrs[i].v;
                }
            }
        }
        else {
            for (const key in battleData.attr) {
                this._attrs[key] = battleData.attr[key];
            }
        }
        this._hp = this._attrs[AttrEnum.HP];

        this.initMoveSpeed = BattleConstantConfig.summonMoveSpeed;
        this.name = cfg.name;
        this.initMaxHp();
        this._isDeath = false;
        this.initSkill(battleData.skills);
        this.initMaxHurt();
    }

    public initSkill(skills: string[]): void {
        for (let i = 0; i < skills.length; i++) {
            let skillCfg = TableManager.getDataById(table.battle.SkillConfig, skills[i])
            if (!skillCfg) {
                continue
            }
            let skillData = this.initSkillHandler(skillCfg, false)
            let index = this._cfg.skillIds.indexOf(skillData.cfg.belongType);
            skillData.skillIndex = index;
        }
        //排序技能
        SortUtils.sortBy2(this._activeSkills, ["skillIndex"], [true], false)
    }

    protected initSkillIndex(skill: SkillData): void {
    }

    /**
     * 刷新复活冷却时间。
     * 调用此方法将刷新战斗数据中的复活冷却时间。
     */
    public refreshReviveCD(): void {
        this.battleData.refreshCD()
    }
}
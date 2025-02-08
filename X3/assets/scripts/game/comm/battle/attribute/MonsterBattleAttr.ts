import { TableManager } from "../../../../core/table/TableManager";
import { SortUtils } from "../../../../core/utils/SortUtils";
import { IBattleUnitData } from "../../../modules/battle/vo/IBattleUnitData";
import { BattleDebugManager } from "../BattleDebugManager";
import BattleConstantConfig from "../config/BattleConstantConfig";
import { AttrEnum } from "./AttrEnum";
import { BattleAttr } from "./BattleAttr";

export class MonsterBattleAttr extends BattleAttr {
    protected _cfg: table.monster.MonsterAttributeConfig;
    /***非的话就是英雄怪物 */
    public heroId: number = 0;

    initByMonsterAttr(cfg: table.monster.MonsterAttributeConfig, attr?: { [key: number]: number }) {
        this._cfg = cfg;
        this.skillSortList = cfg.skillSortList?.concat();
        this.heroId = cfg.belongType || 0;
        this.init();

        for (const key in attr) {
            this._attrs[key] = attr[key];
        }

        if (!this._attrs[AttrEnum.DEF]) this._attrs[AttrEnum.DEF] = 0;//后端数据没有防御 临时处理
        this._hp = this._attrs[AttrEnum.HP];

        if (cfg.secondAttrs) {
            for (let i = 0; i < cfg.secondAttrs.length; i++) {
                let attrTid = TableManager.getDataById(table.battle.AttributeConfig, cfg.secondAttrs[i].k).tid
                this._attrs[attrTid] = +cfg.secondAttrs[i].v;
            }
        }

        this.initMoveSpeed = BattleConstantConfig.monsterMoveSpeed;
        this.name = cfg.name;
        this.initMaxHp();
        this.initSkillByMonster();
    }

    private initSkillByMonster(): void {
        let skills = this.createMonsterSkillCfgs(this._cfg as table.monster.MonsterAttributeConfig);
        for (let i = 0; i < skills.length; i++) {
            let skillData = this.initSkillHandler(skills[i], true)
            skillData.skillIndex = i;
        }
        //排序技能
        SortUtils.sortBy2(this._activeSkills, ["skillIndex"], [true], false)

        let passSkills = (this._cfg as table.monster.MonsterAttributeConfig).passivitySkils
        if (passSkills) {
            for (let j = 0; j < passSkills.length; j++) {
                this.addOtherPassiveSkill(passSkills[j])
            }
        }

        if (BattleDebugManager.ins().isDebug) {
            // this.addOtherPassiveSkill("4310_x101")
        }
        this.initTeamSkills()
    }

    /**创建技能列表 */
    private createMonsterSkillCfgs(data: table.monster.MonsterAttributeConfig): table.battle.SkillConfig[] {
        let skills: table.battle.SkillConfig[] = [];
        for (let i = 0; i < 5; i++) {
            let cfg = TableManager.getDataById(table.battle.SkillConfig, data["skill" + i]);
            if (cfg) {
                skills.push(cfg);
            }
        }

        if (data.skillIds?.length > 0) {
            for (let i = 0; i < data.skillIds.length; i++) {
                let cfg = TableManager.getDataById(table.battle.SkillConfig, data.skillIds[i]);
                if (cfg) {
                    skills.push(cfg);
                }
            }
        }
        return skills;
    }

    initByMonster(cfg: table.monster.MonsterAttributeConfig, data?: IBattleUnitData) {
        this._cfg = cfg;
        this.skillSortList = cfg.skillSortList?.concat();
        this.heroId = cfg.belongType || 0;
        this.atkTimeSpeed = cfg.atkSpeed || 1000;
        this.init();

        if (!this._attrs[AttrEnum.HP]) this._attrs[AttrEnum.HP] = 1;

        if (!data) {
            this._attrs[AttrEnum.ATK] = this._attrsMod && this._attrsMod[AttrEnum.ATK] ? Math.floor(this._attrsMod[AttrEnum.ATK] * this._cfg.atk) : this._cfg.atk; //AttrEnum.ATK * (1 + AttrEnum.ATK_BONUS/ 10000) + AttrEnum.ATK;
            this._attrs[AttrEnum.HP] = this._attrsMod && this._attrsMod[AttrEnum.HP] ? Math.floor(this._attrsMod[AttrEnum.HP] * this._cfg.hp) : this._cfg.hp; //AttrEnum.HP * (1 + AttrEnum.HP_BONUS/ 10000) + AttrEnum.HP;
            this._attrs[AttrEnum.DEF] = this._attrsMod && this._attrsMod[AttrEnum.DEF] ? Math.floor(this._attrsMod[AttrEnum.DEF] * this._cfg.def) : this._cfg.def; //AttrEnum.DEF * (1 + AttrEnum.DEF_BONUS/ 10000) + AttrEnum.DEF;
            if (cfg.secondAttrs) {
                for (let i = 0; i < cfg.secondAttrs.length; i++) {
                    let attrTid = TableManager.getDataById(table.battle.AttributeConfig, cfg.secondAttrs[i].k).tid
                    this._attrs[attrTid] = +cfg.secondAttrs[i].v;
                }
            }

            if (this._secondAttrsMod) {
                for (let key in this._secondAttrsMod) {
                    if (this._attrs[key])
                        this._attrs[key] += this._secondAttrsMod[key];
                    else
                        this._attrs[key] = this._secondAttrsMod[key];
                }
            }

            this._hp = this._attrs[AttrEnum.HP];
        } else {
            this.lv = data.level
            for (const key in data.attrs) {
                this._attrs[key] = data.attrs[key];
            }

            if (!this._attrs[AttrEnum.DEF]) this._attrs[AttrEnum.DEF] = 0;//后端数据没有防御 临时处理

            if (!data.surplusHp || data.surplusHp < 0)
                this._hp = this._attrs[AttrEnum.HP];
            else
                this._hp = data.surplusHp;
        }

        // console.log(this._attrs);

        this.initMoveSpeed = BattleConstantConfig.monsterMoveSpeed;
        this.name = cfg.name;
        this.initMaxHp();
        this.initSkillByMonster();
        this._isDeath = false;
    }

    public getMonsterCfg(): table.monster.MonsterAttributeConfig {
        return TableManager.getDataById(table.monster.MonsterAttributeConfig, this.getConfigId())
    }
}
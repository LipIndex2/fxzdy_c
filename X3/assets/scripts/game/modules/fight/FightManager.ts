import { tween, Tween } from "cc";
import { FormationManager } from "db://assets/scripts/game/modules/formation/FormationManager";
import BaseSingleton from "../../../core/base/BaseSingleton";
import G from "../../../core/comm/G";
import { TableManager } from "../../../core/table/TableManager";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import GIns from "../../GIns";
import { SkillConfigDatas } from "../../table/battle/SkillConfigDatas";
import { Attribute, AttributeType, AttrType } from "../attr/AttrEnum";
import { AttrData, AttrManager } from "../attr/AttrManager";
import { PositionVo } from "../formation/vo/PositionVo";
import { HeroManager } from "../hero/HeroManager";
import { HeroSkillData } from "../hero/HeroVo";
import { HeroStarConfigDatas } from "../../table/hero/HeroStarConfigDatas";
import { HeroStageConfigDatas } from "../../table/hero/HeroStageConfigDatas";

/**
 * 战力
 */
export class FightManager extends BaseSingleton {
    /** 面板属性data[] */
    private _panelAttrDatas: AttrData[] = [];
    /** 二级属性data[] */
    private _secondaryAttrDatas: AttrData[] = [];
    /** 英雄的所有技能id */
    private _skillIds = [];

    /** 战力记录（用于战力变更飘字） */
    private _fight = 0;
    /** 战力变更量 */
    private _fightChange = 0;

    /** 记录系统的战力 */
    private _systemFightMap: { [key: string]: number } = {};

    /**
     * 默认队伍的战斗力
     */
    public getFightByDefault() {
        let posVos = FormationManager.ins().getAllPosData();
        return this.getAllFight(posVos);
    }

    /** 获取总战力 */
    public getAllFight(posVos: PositionVo[], fightType?: XJ.EFightType, showFightAni: boolean = true) {
        let fight = 0;
        let _fightType = fightType || ServerEnums.FightType.TRUNK_MAP;
        for (let posVo of posVos) {
            if (posVo.heroId) {
                let heroVo = HeroManager.ins().getHeroVoByID(posVo.heroId);
                fight += heroVo.getHeroFight;
            }
        }

        if (this.getFightMod()) {
            let fight2 = fight + Math.floor((fight * this.getFightMod()) / 10000);
            fight = fight2;
        }

        //只有默认阵容战力变化才弹战力变化，其他的不弹
        if (_fightType == ServerEnums.FightType.TRUNK_MAP && showFightAni) {
            if (!this._fight) this._fight = fight;
            if (this._fight && this._fight != fight) {
                this._fightChange += fight - this._fight;
                this._fight = fight;
                Tween.stopAllByTarget(this);
                // 延迟 1s 飘字，
                tween(this)
                    .delay(0.75)
                    .call(() => {
                        if (this._fightChange != 0) {
                            GIns.floatingTextMgr.showFight(this._fight, this._fightChange);
                            this._fightChange = 0;
                        }
                    })
                    .start();
            }
        }

        return fight;
    }

    /** 更新单个系统的战力 */
    public updateSystemFight(posVos: PositionVo[], type: systemFight) {
        let fight = 0;
        for (let posVo of posVos) {
            if (posVo.heroId) {
                fight += this.getHeroFight(posVo.heroId, false, type);
            }
        }
        this._systemFightMap[type] = this.getAllFight(posVos) - fight;
    }

    /** 获取系统战力 systemFight*/
    public getSystemFight(posVos: PositionVo[], type: systemFight) {
        if (!this._systemFightMap[type]) {
            this.updateSystemFight(posVos, type);
        }
        return this._systemFightMap[type];
    }

    /** 总战力的战力修正 */
    public getFightMod() {
        let modValue: number = 0;
        //宠物战力修正
        modValue += GIns.formationMgr.trunkPetFightMod;
        return modValue;
    }

    /**
     * 计算单个英雄总战力， 存储到对应英雄vo中，没有属性变更不再计算
     * 英雄战力 = ∑ ( 面板属性值 * 面板属性战力系数 ）* 属性模板修正 *  （1 + ∑（ 二级属性值 * 二级属性战力修正）+ ∑（技能战力修正）） + ∑（ 二级属性值 * 二级属性战力系数）+ ∑（技能战力）
     * @param  注1 公式中的面板属性是指面板攻击、面板防御、面板生命这三项属性
     * @param  注2 属性模板修正、二级属性值、二级属性战力修正、技能战力修正等数值的配置值均为万分比，计算时需要除以一万
     * @param  注3 技能战力中包含了主动技能、被动技能、技能特质（随升星解锁）、种族羁绊、职业羁绊等
     * @param heroId 英雄id
     * @param isCommon 是否按照共鸣等级算战力
     * @param systemType 计算某一模块战力，不传则计算总战力
     */
    public getHeroFight(heroId: number, isCommon: boolean = false, systemType?: systemFight) {
        if (!heroId) return;
        this.getAttrs(heroId, isCommon, systemType);
        this.getSkillids(heroId);

        //∑ ( 面板属性值 * 面板属性战力系数 ）
        let panelFight = 0;
        for (let data of this._panelAttrDatas) {
            if (data.num && data.worth) {
                panelFight += data.num * data.worth;
            }
        }

        let heroVo = HeroManager.ins().getHeroVoByID(heroId);
        //属性模板修正
        let attrMod = heroVo.heroCfg.cpMod / 10000;

        //∑（ 二级属性值 * 二级属性战力修正）
        let secondaryModFight = 0;
        //∑（ 二级属性值 * 二级属性战力系数）
        let secondaryWorthFight = 0;
        for (let data of this._secondaryAttrDatas) {
            if (data.num && data.mod) {
                secondaryModFight += (data.num / 10000) * (data.mod / 10000);
            }
            if (data.num && data.worth) {
                secondaryWorthFight += (data.num / 10000) * data.worth;
            }
        }

        //∑（技能战力修正）
        let skillModFight = 0;
        //∑（技能战力）
        let skillFight = 0;
        for (let id of this._skillIds) {
            let skillCfg = TableManager.getDataById(table.battle.SkillConfig, id);
            if (skillCfg) {
                skillModFight += skillCfg.cpMod / 10000;
                skillFight += skillCfg.cpWorth;
            }
        }

        let allCaptainFights = GIns.captainSkillMgr.getAllAddPowers();
        allCaptainFights?.forEach((data) => {
            skillModFight += data.Mod;
            skillFight += data.Fight;
        });

        //单个英雄总战力
        let allFight = panelFight * attrMod * (1 + secondaryModFight + skillModFight) + secondaryWorthFight + skillFight;
        return Math.round(allFight);
    }

    /**（仅预览使用）获取英雄纯战力*/
    public getPureFightByParams(heroId: number, lv: number, star: number, stage: number): number {
        let attrs = this.getPureAttrByParams(heroId, lv, star, stage);
        let skillDatas = this.getPureSkillDatasByParams(heroId, lv, star, stage);
        return this.getPureFightByAttrAndSkills(heroId, attrs, skillDatas);
    }

    /**根据属性和技能获取纯战力*/
    public getPureFightByAttrAndSkills(heroId: number, attrs: AttrData[], skillDatas: HeroSkillData[]): number {
        let heroCfg = G.TableManager.getDataById(table.hero.HeroConfig, heroId);
        //属性模板修正
        let attrMod = heroCfg.cpMod / 10000;
        //∑ ( 面板属性值 * 面板属性战力系数 ）
        let panelFight = 0;
        //∑（ 二级属性值 * 二级属性战力修正）
        let secondaryModFight = 0;
        //∑（ 二级属性值 * 二级属性战力系数）
        let secondaryWorthFight = 0;
        attrs?.forEach((value) => {
            if (value.type == AttributeType.PANEL_ATTR) {
                //面板属性
                if (value.num && value.worth) {
                    panelFight += value.num * value.worth;
                }
            } else if (value.type == AttributeType.SECONDARY_ATTR) {
                if (value.num && value.mod) {
                    secondaryModFight += (value.num / 10000) * (value.mod / 10000);
                }
                if (value.num && value.worth) {
                    secondaryWorthFight += (value.num / 10000) * value.worth;
                }
            }
        });
        //∑（技能战力修正）
        let skillModFight = 0;
        //∑（技能战力）
        let skillFight = 0;
        skillDatas?.forEach((value) => {
            if (value.curCfg) {
                skillModFight += value.curCfg.cpMod / 10000;
                skillFight += value.curCfg.cpWorth;
            }
        });
        //单个英雄总战力
        let allFight = panelFight * attrMod * (1 + secondaryModFight + skillModFight) + secondaryWorthFight + skillFight;
        return Math.round(allFight);
    }

    //获取英雄纯属性
    public getPureAttrByParams(heroId: number, lv: number, star: number, stage: number): AttrData[] {
        let attrArr: AttrData[] = [];
        let heroCfg = G.TableManager.getDataById(table.hero.HeroConfig, heroId);
        let atk = AttrManager.ins().calculateBaseAttrNum(heroId, AttrType.Attack, lv, stage, star);
        let def = AttrManager.ins().calculateBaseAttrNum(heroId, AttrType.Defense, lv, stage, star);
        let hp = AttrManager.ins().calculateBaseAttrNum(heroId, AttrType.Blood, lv, stage, star);
        /********************基础面板属性*****************/
        //攻击
        let AttrATKCfg = TableManager.getDataById(table.battle.AttributeConfig, Attribute.ATK);
        let atkData: AttrData = new AttrData();
        atkData.id = Attribute.ATK;
        atkData.type = AttributeType.PANEL_ATTR;
        atkData.num = atk;
        atkData.worth = AttrATKCfg.cpWorth;
        atkData.mod = AttrATKCfg.cpMod;
        attrArr.push(atkData);
        //血量
        let AttrHPCfg = TableManager.getDataById(table.battle.AttributeConfig, Attribute.HP);
        let hpData: AttrData = new AttrData();
        hpData.id = Attribute.HP;
        hpData.type = AttributeType.PANEL_ATTR;
        hpData.num = hp;
        hpData.worth = AttrHPCfg.cpWorth;
        hpData.mod = AttrHPCfg.cpMod;
        attrArr.push(hpData);
        //防御
        let AttrDEFCfg = TableManager.getDataById(table.battle.AttributeConfig, Attribute.DEF);
        let defData: AttrData = new AttrData();
        defData.id = Attribute.DEF;
        defData.type = AttributeType.PANEL_ATTR;
        defData.num = def;
        defData.worth = AttrDEFCfg.cpWorth;
        defData.mod = AttrDEFCfg.cpMod;
        attrArr.push(defData);
        /********************二级附加属性*****************/
        //英雄初始二级属性
        if (heroCfg?.baseSecondAttrs) {
            for (let attr of heroCfg.baseSecondAttrs) {
                let data = AttrManager.ins().convertDataFormat(attr.k, attr.v);
                attrArr.push(data);
            }
        }
        return attrArr;
    }

    /**（仅预览使用）获取英雄技能组数据*/
    public getPureSkillDatasByParams(heroId: number, lv: number, star: number, stage: number, isMaxSkill: boolean = true): HeroSkillData[] {
        let skillDatas: HeroSkillData[] = [];
        let heroCfg = G.TableManager.getDataById(table.hero.HeroConfig, heroId);
        let heroStarCfgs = HeroStarConfigDatas.ins().getConfigsByQuality(heroCfg.quality);
        let heroStarCfg: table.hero.HeroStarConfig = null;
        for (let i = 0; i < heroStarCfgs.length; i++) {
            if (heroStarCfgs[i].star == star) {
                heroStarCfg = heroStarCfgs[i];
                break;
            }
        }
        if (heroStarCfg == null) {
            return skillDatas;
        }
        /** TODO
         * 这里有bug 相同星级对应的技能不一样
         */
        // let maxSkillLv = heroStarCfg.skillLevel || 1;
        // let skillCfgs = G.TableManager.getAllData(table.battle.SkillConfig);
        let groupIds = [heroCfg.skill0, heroCfg.skill1, heroCfg.skill2, heroCfg.skill3, heroCfg.skill4, heroCfg.skill5];
        let slotId = 0;
        let skillcfgDataIns = SkillConfigDatas.ins();
        for (let i = 0; i < groupIds.length; i++) {
            let id = groupIds[i];
            if (id == "") {
                continue;
            }
            let skillCfgsForGroup = skillcfgDataIns.getConfigsByGroup(id);
            if (skillCfgsForGroup.length <= 0) {
                slotId++;
                continue;
            }
            let skillLv = 0;
            let curCfg = null;

            let maxSkillLv = HeroStarConfigDatas.ins().getSkillLevel(heroCfg.quality, star, slotId);

            if (!isMaxSkill) {
                skillLv = HeroStarConfigDatas.ins().getSkillLevel(heroCfg.quality, star, i);
            } else {
                skillCfgsForGroup.forEach((value) => {
                    if (value.level <= maxSkillLv && value.level >= skillLv) {
                        skillLv = value.level;
                        curCfg = value;
                    }
                });
            }

            let data: HeroSkillData = {
                slotId: slotId,
                groupId: id,
                ids: skillCfgsForGroup.map((value) => {
                    return value.id;
                }),
                unlock: this.isSkillSlotUnlock(slotId, star, heroCfg.quality, stage),
                isUltimateSkill: id == heroCfg.skill2,
                level: skillLv,
                cfg: skillCfgsForGroup[0],
                curCfg: curCfg,
            };
            skillDatas.push(data);
            slotId++;
        }
        return skillDatas;
    }

    /**技能槽是否解锁*/
    public isSkillSlotUnlock(slotId: number, star: number, quality: number, stage: number): boolean {
        return HeroStarConfigDatas.ins().getSkillLevel(quality, star, slotId) > 0 && HeroStageConfigDatas.ins().isUnlockSkillPos(slotId, stage);
    }

    /**
     * 获取共鸣等级下的英雄战力
     */
    public getHeroFightByCommonLevel() {}

    //获取英雄属性data存到变量中
    private getAttrs(heroId: number, isCommon: boolean = false, systemType?: systemFight) {
        let heroVo = HeroManager.ins().getHeroVoByID(heroId);
        let attrDataArr = heroVo.allAttrDataArr(isCommon, systemType);

        this._panelAttrDatas = [];
        this._secondaryAttrDatas = [];

        //分类一二级属性
        for (let data of attrDataArr) {
            if (data.type == AttributeType.PANEL_ATTR) {
                this._panelAttrDatas.push(data);
            } else if (data.type == AttributeType.SECONDARY_ATTR) {
                this._secondaryAttrDatas.push(data);
            }
        }
    }

    //获取英雄技能
    private getSkillids(heroId: number) {
        this._skillIds = HeroManager.ins().getHeroSkillIdByFight(heroId);
    }
}

/** 系统战力 */
export enum systemFight {
    /** 所有 */
    ALL = "ALL",
    /** 英雄 */
    HERO = "HERO",
    /** 装备 */
    EQUIP = "EQUIP",
    /** 专武 */
    WEAPON = "WEAPON",
    /** 星灵 */
    PET = "PET",
    /** 收藏品 */
    COLLECTIONS = "COLLECTIONS",
}

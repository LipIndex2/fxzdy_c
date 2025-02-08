import BaseSingleton from "../../../core/base/BaseSingleton";
import G from "../../../core/comm/G";
import { TableManager } from "../../../core/table/TableManager";
import { DebugUtils } from "../../../core/utils/DebugUtils";
import ObjectUtils from "../../../core/utils/ObjectUtils";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import { AttrEnum } from "../../comm/battle/attribute/AttrEnum";
import { IBattleHeroData } from "../../comm/battle/attribute/IBattleHeroData";
import { FightType } from "../../comm/battle/enum/FightType";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import { Attribute, AttrType } from "../attr/AttrEnum";
import { AttrData, AttrManager } from "../attr/AttrManager";
import { IBattleUnitData } from "../battle/vo/IBattleUnitData";
import { ECollectiblesSkillTargetType } from "../collections/const/UICollectionsConfig";
import { FormationManager } from "../formation/FormationManager";
import { PositionVo } from "../formation/vo/PositionVo";
import { WeaponVo } from "../weapon/vo/WeaponVo";
import { WeaponManager } from "../weapon/WeaponManager";
import { HeroController } from "./HeroController";
import { HeroConfigManager } from "./config/HeroConfigManager";
import { GroupType, HeroCampType, HeroCareerType } from "./HeroEnum";
import { HeroVo, HeroVoDate } from "./HeroVo";
import { DNABtnClickType } from "./page/HeroPotentialPage";

/** 英雄卡牌管理类 */
export class HeroManager extends BaseSingleton {
    /** 所有卡牌vo数据 */
    private _allHeroData: HeroVo[] = [];
    /** 所有卡牌vo数据，按照ID存储 */
    private _allHeroDataByID: { [heroID: number]: HeroVo } = {};
    /** 英雄常量表 */
    private _constantCfg: table.hero.HeroConstantConfig;
    /** 升级升星所需的材料（刷新红点用） */
    private _itemIds = [];

    constructor () {
        super();
    }

    /** 初始化英雄信息 */
    public setHeroData(vo: Vo.hero.HeroVo[]) {
        this._allHeroData.length = 0;
        for (let data of vo) {
            let heroVo = this._allHeroDataByID[data.id];

            let heroVoDate: HeroVoDate = {
                id: data.id,
                baseId: data.heroBaseId,
                fragment: data.fragment,
                star: data.star,
                isActivate: data.active,
                heroSkinIds: data.heroSkinIds,
                useSkinId: data.useSkinId,
                heroDNA: data.heroDna,
            };

            if (!heroVo) {
                heroVo = new HeroVo();
                heroVo.setHeroVoData(heroVoDate);
                this._allHeroData.push(heroVo);
                this._allHeroDataByID[data.heroBaseId] = heroVo;
            } else {
                heroVo.setHeroVoData(heroVoDate);
                for (let k in this._allHeroData) {
                    if (this._allHeroData[k].baseId == data.heroBaseId) {
                        this._allHeroData[k].setHeroVoData(heroVoDate);
                    }
                }
            }
        }
    }

    /** 更新单个英雄vo信息 */
    public updateHeroData(data: Vo.hero.HeroVo) {
        let heroVoDate: HeroVoDate = {
            id: data.id,
            baseId: data.heroBaseId,
            fragment: data.fragment,
            star: data.star,
            isActivate: data.active,
            heroSkinIds: data.heroSkinIds,
            useSkinId: data.useSkinId,
            heroDNA: data.heroDna,
        };
        let posVo = this._allHeroDataByID[data.heroBaseId];
        if (!posVo) {
            return;
        }

        posVo.setHeroVoData(heroVoDate);
        for (let k in this._allHeroData) {
            if (this._allHeroData[k].baseId == data.heroBaseId) {
                this._allHeroData[k].setHeroVoData(heroVoDate);
            }
        }
    }

    /**
     * 根据ID获取某个英雄Vo
     * @param heroID 英雄配置ID
     */
    public getHeroVoByID(heroID: number) {
        if (this._allHeroDataByID[heroID]) {
            return this._allHeroDataByID[heroID];
        }
        DebugUtils.isDebugMode() &&  console.log("无此ID卡牌数据:" + heroID);
        return null;
    }

    /***获取英雄的最大星级 */
    public getHeroMaxStar(heroId: number): number {
        let heroCfg = TableManager.getDataById(table.hero.HeroConfig, heroId);
        let starCfgs = G.TableManager.getAllData(table.hero.HeroStarConfig);
        //获取最大星级 等级和品阶
        let star = heroCfg.initStar;
        for (let i = starCfgs.length - 1; i >= 0; i--) {
            if (starCfgs[i].quality == heroCfg.quality) {
                star = starCfgs[i].star;
                break;
            }
        }

        return star;
    }

    /**阵位Id 找 英雄Id*/
    private _posToHeroId: { [position: number]: number } = {};
    /**
     * 设置单个英雄的阵位ID
     */
    public setHeroPosId(vo: Vo.formation.PositionVo) {
        let oldHeroId = this._posToHeroId[vo.position];
        if (oldHeroId) {
            let heroVo1 = this.getHeroVoByID(oldHeroId);
            heroVo1.posId = null;
        }

        //设置英雄的阵位id
        if (vo.heroBaseId) {
            let heroVo2 = this.getHeroVoByID(vo.heroBaseId);
            heroVo2.posId = vo.position;
        }

        this._posToHeroId[vo.position] = vo.heroBaseId;
    }

    /**
     * 获取阵位ID的英雄
     */
    public getHeroVoByPosId(posId: number) {
        let heroId = this._posToHeroId[posId];
        if (heroId) {
            return this.getHeroVoByID(heroId);
        }
    }

    /** 获取所有上阵的英雄 */
    public getPosToHeroIds() {
        return this._posToHeroId;
    }

    /**
     * 设置英雄的阵位ID 组
     */
    public setHeroPosIds(vos: Vo.formation.PositionVo[]) {
        // this.setHeroPosId(vo);
        //卸下阵位旧英雄
        for (const vo1 of vos) {
            let oldHeroId = this._posToHeroId[vo1.position];
            if (oldHeroId) {
                let heroVo1 = this.getHeroVoByID(oldHeroId);
                heroVo1.posId = null;
                //更新英雄技能data
                heroVo1.updateAllSkillData();
            }
        }

        //设置阵位的新英雄id
        for (const vo2 of vos) {
            if (vo2.heroBaseId) {
                let heroVo2 = this.getHeroVoByID(vo2.heroBaseId);
                heroVo2.posId = vo2.position;
                //更新英雄技能data
                heroVo2.updateAllSkillData();
            }
            this._posToHeroId[vo2.position] = vo2.heroBaseId;
        }
    }

    /**英雄vo转战斗数据 */
    public getBattleDataByHeroId(heroId: number) {
        let heroVo = this.getHeroVoByID(heroId);
        if (!heroVo.posId) return;
        let posVo = FormationManager.ins().getPosVoById(heroVo.posId);
        return this.getBattleData(posVo);
    }

    /**英雄vo转战斗数据 */
    public getBattleData(posVo: PositionVo) {
        let heroVo = this.getHeroVoByID(posVo.heroId);

        let temp = heroVo.allAttrDataArr();
        let attrs = {};
        for (let i = 0; i < temp.length; i++) {
            let attrCfg = TableManager.getDataById(table.battle.AttributeConfig, temp[i].id);
            if (!attrs[attrCfg.tid]) attrs[attrCfg.tid] = temp[i].num;
            else attrs[attrCfg.tid] += temp[i].num;
        }
        //getHeroAttrs();
        // heroVo.getHeroAttrs();
        let heroSkills = HeroManager.ins().getHeroSkills(posVo.heroId);

        let data = {
            configId: posVo.heroId,
            type: ServerEnums.UnitType.HERO,
            level: posVo.level,
            stage: posVo.stage,
            star: heroVo.star,
            skillIds: heroSkills,
            modelId: heroVo.modelId,
            skinId: heroVo.skinId,
            attrs: attrs,
            position: posVo.positionId,
        } as IBattleUnitData;
        return data;
    }

    /**
     * 获取阵位英雄的战斗数据
     */
    public getInPosHeroBattleData() {
        let posVos = FormationManager.ins().getHeroInPosVos();
        let battleDatas: IBattleUnitData[] = [];
        for (let i = 0; i < posVos.length; i++) {
            let data = this.getBattleData(posVos[i]);
            if (data) {
                battleDatas.push(data);
            }
        }
        return battleDatas;
    }

    /**
     * 添加英雄碎片数量
     * @param itemID 碎片id
     * @param count 碎片数量
     */
    public addFragment(itemID: number, count: number) {
        for (let data of this._allHeroData) {
            if (data.heroCfg.fragmentItemId == itemID) {
                data.addFragment(count);
            }
        }
    }

    /**
     * 根据碎片id 获取英雄配置表
     */
    public getHeroIdByFragmentId(itemID: number) {
        for (let data of this._allHeroData) {
            if (data.heroCfg.fragmentItemId == itemID) {
                return data.heroCfg;
            }
        }
    }

    /**
     * 激活英雄
     * @param heroId 英雄id
     */
    public activeHero(heroId: number) {
        let heroVo = this.getHeroVoByID(heroId);
        heroVo.activateHero();
    }

    /** 获取所有英雄Vo */
    public getAllHeroVo() {
        return this._allHeroData;
    }

    /**
     * 赛选某个阵营和职业的英雄
     * @param filterCampType 英雄阵营     可以为空，为空则不筛选阵营
     * @param filterCareer 英雄职业   可以为空，为空则不筛选职业
     * @param isShowUnlock 是否显示未解锁的英雄  默认显示（true）
     * @param heroVos 英雄Vo        可以不传，传入则筛选传入的数据
     */
    public getHeroVoArrByCampType(filterCampType: HeroCampType, filterCareer: ServerEnums.Career, isShowUnlock: boolean = true, heroVos?: HeroVo[]) {
        let allHeroData = this.getAllHeroStor();
        if (heroVos) {
            allHeroData = heroVos;
        }

        let unlickArr: HeroVo[] = [];
        if (isShowUnlock) {
            unlickArr = allHeroData;
        } else {
            for (let data of allHeroData) {
                if (data && data.heroVoData.isActivate) {
                    unlickArr.push(data);
                }
            }
        }

        let campVoDatas: HeroVo[] = [];
        if (!filterCampType) {
            campVoDatas = unlickArr;
        } else {
            for (let data of unlickArr) {
                if (data && data.heroCfg.camp == filterCampType) {
                    campVoDatas.push(data);
                }
            }
        }

        let allVoDatas: HeroVo[] = [];
        if (!filterCareer) {
            allVoDatas = campVoDatas;
        } else {
            for (let data of campVoDatas) {
                if (data && ServerEnums.Career[data.heroCfg.career] == filterCareer) {
                    allVoDatas.push(data);
                }
            }
        }
        return allVoDatas;
    }

    /** 英雄常量表 */
    public getHeroConstantCfg(id: string) {
        this._constantCfg = TableManager.getDataById(table.hero.HeroConstantConfig, id);
        return this._constantCfg;
    }

    /**
     * 获取所有英雄（已排序）
     * 排序规则：碎片可合成＞未上阵英雄 品质高>品质低 星级高>星级低 战力高>战力低 同战力ID大在前
     */
    public getAllHeroStor() {
        let heroVo: HeroVo[] = [];
        for (let data of this._allHeroData) {
            heroVo.push(data);
        }

        heroVo.sort((a: HeroVo, b: HeroVo) => {
            //上阵英雄
            if (a.posId != b.posId) {
                if (a.posId && b.posId) {
                    return a.posId - b.posId;
                }
                return a.posId ? -1 : 1;
            }
            //可合成
            if (a.isCanActive != b.isCanActive) {
                return a.isCanActive ? -1 : 1;
            }
            //已激活
            if (a.heroVoData.isActivate != b.heroVoData.isActivate) {
                return a.heroVoData.isActivate ? 1 : -1;
            }
            //品质
            if (a.heroCfg.quality != b.heroCfg.quality) {
                return b.heroCfg.quality - a.heroCfg.quality;
            }
            //星级
            if (a.star != b.star) {
                return b.star - a.star;
            }
            //战力
            // if()
            //id
            return b.baseId - a.baseId;
        });

        return heroVo;
    }

    /** 获取按照共鸣战力排序的英雄列表（包含以上阵的） */
    public getHeroListByFight() {
        let heroVos: HeroVo[] = [];
        for (let data of this._allHeroData) {
            if (data.heroVoData.isActivate) {
                heroVos.push(data);
            }
        }

        heroVos.sort((a: HeroVo, b: HeroVo) => {
            if (a.getHeroFightByCommonLevel != b.getHeroFightByCommonLevel) {
                return b.getHeroFightByCommonLevel - a.getHeroFightByCommonLevel;
            }

            return b.baseId - a.baseId;
        });

        return heroVos;
    }

    /** 培养模块红点 */
    public getRedPoint() {
        let heroVos = this.getAllHeroVo();

        return false;
    }
    /** --------------------------------------------------------英雄技能------------------------------------------------------------ */

    /** 对英雄生效的技能id列表（包含羁绊等） */
    public getHeroSkills(heroId: number) {
        let heroVo = this.getHeroVoByID(heroId);
        if (!heroVo.heroVoData.isActivate) return [];

        let ids = [];

        for (let skill of heroVo.allSkill) {
            if (skill) {
                let nowSkillId = skill.nowSkillId;
                if (nowSkillId.length > 0) {
                    ids.push(nowSkillId);
                }
            }
        }

        let heroWeapon: WeaponVo = WeaponManager.ins().getWeaponForHero(heroId);
        if (heroWeapon) {
            //专属武器技能
            let heroWeaponSkill = heroWeapon.getSkillId();
            if (heroWeaponSkill) {
                ids.push(heroWeaponSkill);
            }
        }

        //装备
        let equipSkills = GIns.equipMgr.getEquipSkills();
        for (let skillId of equipSkills) {
            if (skillId) {
                ids.push(skillId);
            }
        }

        //羁绊
        let fetterCfgs = FormationManager.ins().getDefaultFormationVo().getAllActivateSkillCfgs();
        for (let cfg of fetterCfgs) {
            if (cfg && cfg.passiveId) {
                if (cfg.triggerType == "ALL") {
                    ids.push(cfg.passiveId);
                } else if (cfg.groupType == GroupType.CAMP && cfg.typeParam == heroVo.heroCfg.camp) {
                    ids.push(cfg.passiveId);
                } else if (cfg.groupType == GroupType.CAREER && cfg.typeParam == ServerEnums.Career[heroVo.heroCfg.career]) {
                    ids.push(cfg.passiveId);
                }
            }
        }

        //收藏品
        GIns.collectionsModel.context.getBattleSkill(ECollectiblesSkillTargetType.HERO).forEach((skill) => {
            if (skill.effectType == heroVo.heroCfg.career || skill.effectType == heroVo.heroCfg.attackRange) {
                ids.push(skill.skillId);
            }
        });

        // //宠物
        // let petSkill = GIns.petCfgMgr.getCurOnArrayPetSkillData();
        // for (let skill of petSkill) {
        //     for (let skillId of skill.skillIds) {
        //         ids.push(skillId);
        //     }
        // }

        return ids;
    }

    /** 获取有战力的技能id （只用在战力计算上） */
    public getHeroSkillIdByFight(heroId: number) {
        let heroVo = this.getHeroVoByID(heroId);
        if (!heroVo.heroVoData.isActivate) return [];

        let ids = [];

        for (let skill of heroVo.allSkill) {
            if (skill) {
                let nowSkillId = skill.nowSkillId;
                if (nowSkillId.length > 0) {
                    ids.push(nowSkillId);
                }
            }
        }

        let heroWeapon: WeaponVo = WeaponManager.ins().getWeaponForHero(heroId);
        if (heroWeapon) {
            //专属武器技能
            let heroWeaponSkill = heroWeapon.getSkillId();
            if (heroWeaponSkill) {
                ids.push(heroWeaponSkill);
            }
        }

        //装备
        let equipSkills = GIns.equipMgr.getEquipSkills();
        for (let skillId of equipSkills) {
            if (skillId) {
                ids.push(skillId);
            }
        }

        //羁绊
        let fetterCfgs = FormationManager.ins().getDefaultFormationVo().getAllActivateSkillCfgs();
        for (let cfg of fetterCfgs) {
            if (cfg && cfg.passiveId) {
                if (cfg.triggerType == "ALL") {
                    ids.push(cfg.passiveId);
                } else if (cfg.groupType == GroupType.CAMP && cfg.typeParam == heroVo.heroCfg.camp) {
                    ids.push(cfg.passiveId);
                } else if (cfg.groupType == GroupType.CAREER && cfg.typeParam == ServerEnums.Career[heroVo.heroCfg.career]) {
                    ids.push(cfg.passiveId);
                }
            }
        }

        //收藏品
        GIns.collectionsModel.context.getBattleSkill(ECollectiblesSkillTargetType.HERO).forEach((skill) => {
            if (skill.effectType == heroVo.heroCfg.career || skill.effectType == heroVo.heroCfg.attackRange) {
                ids.push(skill.skillId);
            }
        });

        //宠物
        let petSkill = GIns.petCfgMgr.getCurOnArrayPetSkillData();
        for (let skill of petSkill) {
            for (let skillId of skill.skillIds) {
                ids.push(skillId);
            }
        }

        return ids;
    }

    isSlotIdCanLvUp(slotId: number) {
        const posVo = FormationManager.ins().getPosVoById(slotId);
        const maxLv = HeroManager.ins().getHeroConstantCfg("HERO:IN_BATTLE_MAX_LEVEL_GAP").content.toInt();

        //判断相差等级
        const posLv = posVo.level;
        const commonLv = FormationManager.ins().getCommonLevel();
        if (posLv == commonLv) {
            const curSta = commonLv / 10 - 1;
            const nowStage = posVo.stage;
            return nowStage != curSta;
        }
        return commonLv - posLv < maxLv;
    }

    isHaveHero(heroId: number) {
        let heroVo = this.getHeroVoByID(heroId);
        if (heroVo == null) {
            return false;
        }
        return heroVo.heroVoData.isActivate;
    }

    /** 获取 星级 > num 的英雄数量 */
    public getHeroNumByStar(star: number) {
        let num = 0;
        for (let data of this._allHeroData) {
            if (data.star >= star) {
                num++;
            }
        }
        return num;
    }

    public heroSkinCfg: { [id: string]: Array<table.hero.HeroSkinConfig> } = null;

    /**获取对应的英雄id的皮肤list */
    public getHeroSkinListById(id) {
        if (!this.heroSkinCfg) {
            this.heroSkinCfg = {};
            let allCfg = TableManager.getAllData(table.hero.HeroSkinConfig);
            for (let cfg of allCfg) {
                this.heroSkinCfg[cfg.heroBaseId] = this.heroSkinCfg[cfg.heroBaseId] || [];
                this.heroSkinCfg[cfg.heroBaseId].push(cfg);
            }
        }
        return this.heroSkinCfg[id] || [];
    }

    isHaveAnyHeroReachStarCount(star: number) {
        return this.getHeroNumByStar(star) > 0;
    }

    private _petShowCondition: number;
    /** 获取宠物显示条件 */
    public get petShowCondition() {
        if (!this._petShowCondition) {
            this._petShowCondition = +TableManager.getDataById(table.hero.HeroConstantConfig, "HERO:PET_SHOW_CONDITION")?.content;
        }
        return this._petShowCondition;
    }

    //皮肤属性map
    private _skinAttrMap: { [id: string]: AttrData[] };
    /** 初始化皮肤属性 */
    public allSkinAttrs() {
        let skinAttrMap: { [id: string]: AttrData[] } = {};
        //所有英雄
        let allHeroVo = this.getAllHeroVo();

        for (let heroVo of allHeroVo) {
            //当前英雄的所有皮肤
            let skinCfgs = this.getHeroSkinListById(heroVo.heroCfg.id);
            //当前英雄已获得的皮肤id
            let heroSkinIds = heroVo.heroVoData.heroSkinIds || [];

            for (let cfg of skinCfgs) {
                if (cfg && heroSkinIds.indexOf(cfg.id) != -1) {
                    let list: AttrData[] = [];
                    for (let attr of cfg.attrs) {
                        let data = AttrManager.ins().convertDataFormat(attr.k as Attribute, attr.v);
                        list.push(data);
                    }
                    skinAttrMap[cfg.id] = list;
                }
            }
        }
        return skinAttrMap;
    }

    /** 获取所有皮肤属性Map */
    public getSkinAttrsMap() {
        if (!this._skinAttrMap) {
            this._skinAttrMap = this.allSkinAttrs();
        }
        return this._skinAttrMap;
    }
    /** 获得新皮肤 */
    public setSkinAttrsMap(itemId: number) {
        let cfg = TableManager.getDataById(table.hero.HeroSkinConfig, itemId);
        let list: AttrData[] = [];
        for (let attr of cfg.attrs) {
            let data = AttrManager.ins().convertDataFormat(attr.k as Attribute, attr.v);
            list.push(data);
        }
        this._skinAttrMap[cfg.id] = list;
        G.FacadeManager.emitNow(NotificationKey.FIGHT_UPDATE_ALL_HERO);
        G.FacadeManager.emit(NotificationKey.EQUIP_WEAR_EQUIP);

        let heroVo = this.getHeroVoByID(cfg.heroBaseId)
        if (heroVo) {
            HeroController.ins().checkSkinRedDot(heroVo)
        }
    }

    /** 获取所有皮肤属性 */
    public getSkinAttrs(): AttrData[] {
        let attrMap = ObjectUtils.deepCopy(this.getSkinAttrsMap());
        let keys = Object.keys(attrMap);

        let attrDatas = [];
        for (let key of keys) {
            let attrs = attrMap[key];
            for (let attr of attrs) {
                attrDatas.push(attr);
            }
        }

        attrDatas = GIns.attrMgr.mergeAttrDataArray(attrDatas);
        return attrDatas;
    }

    /** --------------------------------------------------------英雄潜能-START------------------------------------------------------------ */
    /**
     * @desc 更新英雄潜能信息
     * @param data 英雄潜能升级信息
     */
    public updateDNAInfo(data: Vo.hero.HeroDnaUpLevelVo, heroId: number): void {
        this.updateDNAData(heroId, data.heroDnaVo, { name: NotificationKey.HERO_DNA_LEVEL_UP });
    }

    /**
     * @desc 更新觉醒信息
     * @param data 英雄觉醒信息
     */
    public updateAwakenInfo(data: Vo.hero.HeroDnaAwakenResultVo, info: Vo.hero.AwakenDnaC2S): void {
        let eventKey = null;
        if (data.first) {
            eventKey = NotificationKey.HERO_DNA_AWAKEN_FIRST;
        } else {
            eventKey = NotificationKey.HERO_DNA_AWAKEN_REFRESH;
        }
        this.updateDNAData(info.baseId, { awaken: data.awaken, awakenTemp: data.awakenTemp }, { name: eventKey, args: info });
    }

    /**
     * @desc 更新觉醒词条替换信息
     * @param data 英雄觉醒词条
     */
    public updateAwakenReplaceInfo(data: Vo.hero.HeroDnaReplaceAwakenResultVo, info: Vo.hero.AwakenDnaC2S): void {
        this.updateDNAData(info.baseId, { awaken: data.awaken, awakenTemp: data.awakenTemp }, { name: NotificationKey.HERO_DNA_REFRESH_CONFIRM, args: info });
    }

    /**
     * 更新数据
     */
    private updateDNAData(heroId: number, newData: Partial<Vo.hero.HeroDnaVo>, event?: { name: any; args?: any }): void {
        const heroVo = this.getHeroVoByID(heroId);
        if (!heroVo || !newData) {
            return;
        }

        Object.assign(heroVo.heroVoData.heroDNA, newData);
        if (event) {
            G.FacadeManager.emit(event.name, event?.args);
        }
    }

    /**
     * @desc 获取各阶段DNAmap
     */
    public getDNAInfoMap(baseId: number): { [key: number]: { isUnlocked: boolean; level: number } } {
        const heroVo = this.getHeroVoByID(baseId);
        const dnaData = heroVo.getDNAInfo();
        const currentStage = dnaData.stage;
        const map: {
            [key: number]: {
                isUnlocked: boolean;
                level: number;
            };
        } = {};

        for (let i = 0; i < 6; i++) {
            if (i < currentStage - 1) {
                map[i] = { isUnlocked: true, level: 10 }; // 已解锁阶段，满级
                continue;
            }

            if (i === currentStage - 1) {
                map[i] = { isUnlocked: true, level: dnaData.level }; // 当前阶段
                continue;
            }

            map[i] = { isUnlocked: false, level: 0 }; // 未解锁阶段
        }

        return map;
    }

    /**
     * 获取指定阶段的DNA等级
     * @param dnaIndex DNA阶段索引
     */
    public getDNALevel(baseId: number, dnaIndex: number): number {
        const dnaMap = this.getDNAInfoMap(baseId);
        const dnaInfo = dnaMap[dnaIndex];
        return dnaInfo.isUnlocked ? dnaInfo.level : 0;
    }

    /**
     * 确认当前可操作类型
     */
    public checkCurOperation(baseId: number, curStage: number): DNABtnClickType {
        const heroVo = this.getHeroVoByID(baseId);
        const dnaData = heroVo.getDNAInfo();

        // 升级
        if (dnaData.stage < 6) {
            return DNABtnClickType.DNA_LEVEL_UP;
        }

        if (dnaData.level < 9) {
            return DNABtnClickType.DNA_LEVEL_UP;
        }

        // 刷新
        if (dnaData.awaken && dnaData.awaken[curStage]) {
            return DNABtnClickType.DNA_AWAKEN_FRESH;
        }

        // 觉醒
        return DNABtnClickType.DNA_AWAKEN;
    }

    /** --------------------------------------------------------英雄潜能-END-------------------------------------------------------------- */
}

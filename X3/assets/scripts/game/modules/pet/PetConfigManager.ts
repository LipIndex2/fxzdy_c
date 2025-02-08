import { DEBUG } from "cc/env";
import BaseSingleton from "../../../core/base/BaseSingleton";
import G from "../../../core/comm/G";
import { LogBusiness } from "../../../core/log/LogBusiness";
import { Logger } from "../../../core/log/Logger";
import { INotification } from "../../../core/mvc/interface/INotification";
import { TableManager } from "../../../core/table/TableManager";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import { SkillConfigDatas } from "../../table/battle/SkillConfigDatas";
import { Attribute, AttrType } from "../attr/AttrEnum";
import { AttrData } from "../attr/AttrManager";
import { NoOwnerItem } from "../backpack/vo/NoOwnerItem";
import { IBattlePetData } from "../battle/vo/IBattlePetData";
import { RedDotKeys } from "../common/redDot/RedDotKeys";
import { systemFight } from "../fight/FightManager";
import { ItemUtils } from "../item/utils/ItemUtils";
import { EnumQuality } from "../common/quality/enums/EnumQuality";
import { PetHubModel } from "./PetHubModel";
import { BackpackManager } from "../backpack/BackpackManager";

type TkvStar2Cfg = {
    [star in number]: table.pet.PetStarConfig;
};

interface IQualityStarInfo {
    maxStar: number; //此品质下的最高星级
    skillLvMap: Map<number, number[]>; //每个星级对应技能等级列表
    kv: TkvStar2Cfg;
}

/**宠物数据管理 */
let hasInit = false;
export class PetConfigManager extends BaseSingleton implements INotification {
    //最高等级
    maxShareLV: number;
    //最高阶级
    maxShareStage: number;

    //品质星级对应
    private _qualityStarMap: {
        [quality in number]: IQualityStarInfo;
    } = {};

    //品质对应能升级到的最大星级
    private _quality2MaxStar: Record<number, number> = {};

    //key 宠物碎片itemId
    private _allPetFragementItems: Map<number, table.pet.PetConfig> = new Map();
    //所有的宠物物品id映射为宠物碎片id
    private _petItemId2PetFragementId: Map<number, number> = new Map();

    private _stageLV2CostArr: Map<number, NoOwnerItem[]> = new Map();

    private _cacheFight = {
        curLV: -1,
        curStage: -1,
        fight: 0,
    };

    init() {
        if (hasInit) return;
        hasInit = true;

        let { TableManager } = G;

        G.GameTimer.once(200, this, () => {
            this.updateMaxLv();
            this.updateAllRed();
        });

        this.maxShareStage = TableManager.getAllData(table.pet.PetStageConfig)
            .toDataStream()
            .maxByWeightNumber((n) => {
                return n.id;
            }).id;

        TableManager.getAllData(table.pet.PetConfig).forEach((n) => {
            this._petItemId2PetFragementId.set(n.id, n.fragmentItemId);
            this._allPetFragementItems.set(n.fragmentItemId, n);
        });

        G.TableManager.getAllData(table.pet.PetStarConfig)
            .toDataStream()
            .groupBy((n) => {
                return n.quality;
            })
            .forEach((v, quality) => {
                let kv: TkvStar2Cfg = {},
                    maxStar: number;
                maxStar = v[0].star;
                let skillLvMap = new Map();
                v.forEach((v) => {
                    if (v.star > maxStar) {
                        maxStar = v.star;
                    }
                    kv[v.star] = v;

                    let skillPosLV: number[] = [];
                    for (let strSkillPos of Object.keys(v.skillPosLevelContent)) {
                        let skillPos = strSkillPos.toInt() - 1;
                        let skillLV = v.skillPosLevelContent[strSkillPos];
                        skillPosLV[skillPos] = skillLV;
                    }

                    skillLvMap.set(v.star, skillPosLV);
                });

                this._qualityStarMap[quality] = {
                    maxStar: maxStar,
                    skillLvMap: skillLvMap,
                    kv: kv,
                };

                this._quality2MaxStar[quality] = maxStar;
            });

        G.FacadeManager.registerNotification(this);
    }

    listenNotifications(): string[] {
        return [NotificationKey.EVENT_CHANGE_ITEMS, NotificationKey.PET_UP_SHARE_LV, NotificationKey.PET_UP_STAGE_LV, NotificationKey.PET_ACTIVER];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
            case NotificationKey.EVENT_CHANGE_ITEMS:
                let costItemIdToAmountMap = args as Map<number, number>;
                let needCalculateRedItemIds: table.pet.PetConfig[] = [];
                costItemIdToAmountMap.forEach((amount, id) => {
                    let petFregementId = this._petItemId2PetFragementId.get(id);
                    if (!petFregementId) {
                        petFregementId = id;
                    }
                    let petCfg = this._allPetFragementItems.get(petFregementId);
                    if (petCfg) {
                        needCalculateRedItemIds.push(petCfg);
                    }
                });
                this.calculateActiveUpStarRed(needCalculateRedItemIds);
                this.calculateUpLVUpStageRed();
                this.calculatePetHubRed();
                break;
            case NotificationKey.PET_ACTIVER:
            case NotificationKey.PET_UP_SHARE_LV:
            case NotificationKey.PET_UP_STAGE_LV:
                this.calculateUpLVUpStageRed();
                break;
        }
    }

    // region 判断条件
    /**
     * 是否升到最高等级
     */
    isMaxLV() {
        let shareLevel = GIns.petModel.petContext.shareLevel;
        let isMax = shareLevel >= this.maxShareLV;
        return isMax;
    }

    //初始等级
    private _startLv: number;
    //加成等级
    private _upLvArr: { [key: number]: number };
    /** 更新当前可升级的最大等级 */
    updateMaxLv() {
        if (!this._startLv) this._startLv = +TableManager.getDataById(table.pet.PetConstantConfig, "PET:BASE_LEVEL_LIMIT").content;
        if (!this._upLvArr) {
            let str1 = TableManager.getDataById(table.pet.PetConstantConfig, "PET:QUALITY_LEVEL_LIMIT_INCREMENT").content;
            this._upLvArr = JSON.parse(str1);
        }

        let petIds = this.getAllPetCfgId();
        let num = 0;
        for (let id of petIds) {
            if (this.isUnlock(id)) {
                let petCfg = TableManager.getDataById(table.pet.PetConfig, id);
                if (this._upLvArr[petCfg.quality]) {
                    num += Number(this._upLvArr[petCfg.quality]);
                }
            }
        }
        this.maxShareLV = this._startLv + num;
    }

    /**
     * 能否升阶，不算消耗的情况下
     */
    isCanUpStageWithOutCost() {
        let shareLevel = GIns.petModel.petContext.shareLevel;
        let { TableManager } = G;
        let LVCfg = TableManager.getDataById(table.pet.PetLevelConfig, shareLevel);
        if (!LVCfg) {
            return false;
        }

        if (LVCfg.stageCondition == this.maxShareStage) {
            // 已到最大阶级
            return false;
        }

        let nextStage = LVCfg.stageCondition + 1;
        let nextStageCfg = TableManager.getDataById(table.pet.PetStageConfig, nextStage);
        if (!nextStageCfg) {
            //未到升阶等级
            return false;
        }

        let canUpStage = nextStageCfg.levelCondition == shareLevel;
        return canUpStage;
    }

    /**
     * 星灵是否解锁
     * @param cfgId PetConfig 的id
     */
    isUnlock(cfgId: number) {
        let petVo = GIns.petModel.petContext.getDataByCfgId(cfgId);
        let isUnlock = false;
        if (petVo) {
            isUnlock = petVo.active;
        }
        return isUnlock;
    }

    /**
     * 星灵能否升星
     * @param cfgId PetConfig 的id
     */
    isCanUpStar(cfgId: number, star?: number) {
        let petCfg = G.TableManager.getDataById(table.pet.PetConfig, cfgId);
        let petVo = GIns.petModel.petContext.getDataByCfgId(cfgId);
        if (petVo.active == false) {
            return false;
        }
        if (star === undefined) {
            star = petVo.star;
        }
        let { maxStar } = this._qualityStarMap[petCfg.quality];
        if (star <= maxStar) {
            let fragmentCount = GIns.itemModel.getItemCountById(petCfg.fragmentItemId);
            let upStarNeedFragementCount = this.getUpStarNeedFragmentNum(cfgId);
            if (fragmentCount >= upStarNeedFragementCount) {
                return true;
            }
        }

        return false;
    }

    // /**
    //  * 指定星级是否激活了
    //  * @param cfgId 
    //  * @param star 0星返回表示是否解锁宠物
    //  */
    // isActiveStar(cfgId: number, star: number) {
    //     let petVo = GIns.petModel.petContext.getDataByCfgId(cfgId);
    //     if (star == 0) {
    //         // 0星返回表示是否解锁宠物
    //         return petVo.active;
    //     }
    //     return petVo.star >= star;
    // }

    /**获取当前宠物技能等级列表*/
    getPetSkillLvs(cfgId: number): number[] {
        let petCfg = G.TableManager.getDataById(table.pet.PetConfig, cfgId);
        let petVo = GIns.petModel.petContext.getDataByCfgId(cfgId);
        let star = petVo.active ? petVo.star : 0;
        return this._qualityStarMap[petCfg.quality].skillLvMap.get(star);
    }

    // /**
    //  * 指定星级的宠物是否新解锁技能
    //  */
    // hasNewUnLockSkill(petCfgId: number, star: number){
    //     if(star == 0) return false

    //     let petCfg = G.TableManager.getDataById(table.pet.PetConfig, petCfgId)
    //     let curStarCfg = this._qualityStarMap[petCfg.quality].kv[star]
    //     let lastStarCfg = this._qualityStarMap[petCfg.quality].kv[star - 1]
    //     return curStarCfg.skillPos != lastStarCfg.skillPos
    // }

    /**
     * 星灵是否满星
     * @param cfgId  PetConfig 的id
     */
    isMaxStar(cfgId: number) {
        let petCfg = G.TableManager.getDataById(table.pet.PetConfig, cfgId);
        let petVo = GIns.petModel.petContext.getDataByCfgId(cfgId);
        let { maxStar } = this._qualityStarMap[petCfg.quality];
        if (petVo.star >= maxStar) {
            return true;
        }
        return false;
    }

    /**
     * 判断是否能显示
     * 隐藏未获得的红色及以上品质星灵
     * @param petCfgId 
     * @return true: 有碎片或者已激活，显示。 false：不显示
     */
    isCanShow(petCfgId: number) {
        let cfg = G.TableManager.getDataById(table.pet.PetConfig, petCfgId);
        if (cfg.quality >= EnumQuality.Red) {
            //有碎片，显示
            if (GIns.backpackMgr.getItemCountByItemId(cfg.fragmentItemId) > 0) {
                return true;
            }
            //已激活的显示
            let petVo = GIns.petModel.petContext.getDataByCfgId(cfg.id);
            return petVo.active;
        }
        return true;
    }

    // region 数据获取
    /**
     * 获取升星需要的碎片数量
     * @param cfgId  PetConfig 的id
     */
    getUpStarNeedFragmentNum(cfgId: number) {
        let petCfg = G.TableManager.getDataById(table.pet.PetConfig, cfgId);
        let petVo = GIns.petModel.petContext.getDataByCfgId(cfgId);
        let { kv } = this._qualityStarMap[petCfg.quality];
        let cfg = kv[petVo.star + 1];
        let fragmentCostAmount = cfg?.fragmentCostAmount || Number.MAX_SAFE_INTEGER;
        return fragmentCostAmount;
    }

    /**
     * 获取升阶消耗，根据输入参数的不同，返回的可以是不允许修改的缓存数据
     * @param stageLV 升阶前的阶级
     */
    getUpStageCost(): Readonly<Array<Readonly<NoOwnerItem>>>;
    getUpStageCost(stageLV: number): Readonly<Array<Readonly<NoOwnerItem>>>;
    getUpStageCost(stageLV: number, copy: true): Array<NoOwnerItem>;
    getUpStageCost(stageLV?: number, copy?: true): Readonly<Array<Readonly<NoOwnerItem>>> | Array<NoOwnerItem> {
        if (!stageLV) {
            let petContext = GIns.petModel.petContext;
            let { shareStage } = petContext;
            stageLV = shareStage;
        }

        let cost = this._stageLV2CostArr.get(stageLV);
        if (cost) {
            if (copy) {
                return Array.from(cost);
            } else {
                return cost;
            }
        }

        let StageFloor = Math.min(this.maxShareStage, stageLV + 1);
        let stageCost: Array<NoOwnerItem> = [];
        let nextStageCfg = G.TableManager.getDataById(table.pet.PetStageConfig, StageFloor);
        let nextLVCfg = G.TableManager.getDataById(table.pet.PetLevelConfig, nextStageCfg.levelCondition + 1);
        if (nextStageCfg) {
            stageCost.push(...ItemUtils.parseKvArrayToItemArray(nextStageCfg.costItems));
        }
        if (nextLVCfg) {
            stageCost.push(...ItemUtils.parseKvArrayToItemArray(nextLVCfg.costItems));
        }

        this._stageLV2CostArr.set(stageLV, stageCost);
        if (copy) {
            return Array.from(stageCost);
        } else {
            return stageCost;
        }
    }

    /**
     * 获取指定星级的宠物槽位技能等级改变信息，第一个槽位是0，
     * @return 返回null表示此星级技能没有改变信息
     */
    skillChgInfo(petCfgId: number, star: number): {
        pos: number //槽位，第一个槽位是0
        lv: number //此槽位的技能等级
        isUnlock: boolean //是否解锁技能，true：解锁技能，false：技能升级
    } {
        if (star == 0) return null;

        let petCfg = G.TableManager.getDataById(table.pet.PetConfig, petCfgId);
        let curStarCfg = this._qualityStarMap[petCfg.quality].kv[star];
        let lastStarCfg = this._qualityStarMap[petCfg.quality].kv[star - 1];
        let chgInfo = {};
        for (let strPos of Object.keys(curStarCfg.skillPosLevelContent)) {
            let curSkillLV = curStarCfg.skillPosLevelContent[strPos];
            if (lastStarCfg.skillPosLevelContent[strPos] !== curSkillLV) {
                return {
                    pos: strPos.toInt() - 1,
                    lv: curSkillLV,
                    isUnlock: curSkillLV == 1,
                }
            }
        }
        return null;
    }

    /**
     * 获取星灵大招技能
     * @param petCfgId
     * @param petStar2SkillLV 指定技能的等级对应的星级，传入的是宠物的星级
     * @returns
     */
    getPetPureSkillDatasByParams(petCfgId: number, petStar2SkillLV?: number): IPet.PetSkillData {
        // let skillDatas: HeroSkillData
        let petCfg = G.TableManager.getDataById(table.pet.PetConfig, petCfgId);
        let groupId = petCfg.skillIds[1]; //大招技能是第二个

        let skillCfgsForGroup = SkillConfigDatas.ins().getConfigsByGroup(groupId);

        if (!skillCfgsForGroup) {
            return null;
        }

        let petContext = GIns.petModel.petContext;
        let petVo = petContext.getDataByCfgId(petCfgId);
        let petStar = petStar2SkillLV ? petStar2SkillLV : petVo.star;

        let petStarCfg = this._qualityStarMap[petCfg.quality].kv[petStar];
        if (!petStarCfg) {
            return null;
        }

        let maxSkillLv = petStarCfg.skillPosLevelContent[2];
        let searchLV = 0;
        let curCfg: table.battle.SkillConfig = null;
        skillCfgsForGroup.forEach((value) => {
            if (value.level <= maxSkillLv && value.level >= searchLV) {
                searchLV = value.level;
                curCfg = value;
            }
        });
        let data: IPet.PetSkillData = {
            slotId: 1,
            groupId: groupId,
            ids: skillCfgsForGroup.map((value) => {
                return value.id;
            }),
            unlock: petContext.isSkillSlotUnlock(petCfgId),
            level: searchLV,
            cfg: skillCfgsForGroup[0],
            curCfg: curCfg,
        };

        return data;
    }

    /***根据当前技能位置和等级，获取需要的星级 */
    getSkillNeedStarByLvAndPos(quality: number, level: number, skillPos: number): number {
        let skillLvMap = this._qualityStarMap[quality].skillLvMap;
        for (let star of skillLvMap.keys()) {
            let posLV = skillLvMap.get(star);
            if (posLV[skillPos] == level) {
                return star;
            }
        }
        Logger.error("getSkillNeedStarByLvAndPos 不应该到这里");
        return 999;
    }

    /**
     * 获取指定宠物的星级数据
     * @param petCfgId
     * @param star
     */
    public getPetStarCfg(petCfgId: number, star: number): Readonly<table.pet.PetStarConfig> {
        let petCfg = G.TableManager.getDataById(table.pet.PetConfig, petCfgId);
        let starCfg = this._qualityStarMap[petCfg.quality].kv[star];
        return starCfg;
    }

    /**
     * 获取指定星灵的所有星级
     * @param petCfgId 
     */
    public getPetAllStar(petCfgId: number) {
        let petCfg = G.TableManager.getDataById(table.pet.PetConfig, petCfgId);
        let data = this._qualityStarMap[petCfg.quality]
        return Object.keys(data.kv).map(v => { return v.toInt(); }).sort((a, b) => { return a - b });
    }

    /**
     * 获取指定星灵的最大星级
     * @param petCfgId
     * @returns
     */
    public getMaxStar(petCfgId: number) {
        let cfg = G.TableManager.getDataById(table.pet.PetConfig, petCfgId);
        let maxStar = this._quality2MaxStar[cfg.quality];
        return maxStar;
    }

    /**
     * 获取所有宠物id
     */
    getAllPetCfgId() {
        return new Set(this._petItemId2PetFragementId.keys());
    }

    // region 战斗战力相关============================================================
    /**获取升级/升阶后星灵战力*/
    public getLVStageFight() {
        let { shareLevel, shareStage } = GIns.petModel.petContext;
        if (this._cacheFight.curLV != shareLevel || this._cacheFight.curStage != shareStage) {
            let { fightMgr, formationMgr } = GIns;
            let posVos = formationMgr.getAllPosData();

            let totalFight = fightMgr.getFightByDefault();
            let totalFightWithoutPet = GIns.fightMgr.getSystemFight(posVos, systemFight.PET);
            this._cacheFight.fight = totalFight - totalFightWithoutPet;
        }

        return this._cacheFight.fight;
    }

    /**获取图鉴界面星灵显示战力*/
    public getIllustrationFight(petCfgId: number) {
        // 图鉴这边的星灵战力用技能战力之和来算就好。
        // 目前的具体算法是：1级普攻+满级主动技能的战力。
        let { TableManager } = G;
        let maxStar = this.getMaxStar(petCfgId);
        let cfgMaxStar = this.getPetStarCfg(petCfgId, maxStar);
        let petCfg = TableManager.getDataById(table.pet.PetConfig, petCfgId);

        let normal = TableManager.get1DataByMulti(table.battle.SkillConfig, {
            group: petCfg.skillIds[0],
            level: 1,
        });

        let sp = TableManager.get1DataByMulti(table.battle.SkillConfig, {
            group: petCfg.skillIds[1],
            level: cfgMaxStar.skillPosLevelContent[2],
        });

        let fight = 0;
        if (normal) {
            fight += normal.cpWorth;
        }
        if (sp) {
            fight += sp.cpWorth;
        }
        return fight;
    }

    /** 升星属性 */
    private _starAttrs: { k: any; v: any; }[];
    /** 更新升星属性 （升星宠物时调用） */
    @LogBusiness("更新宠物星级属性")
    public updateStarAttrs() {
        this._starAttrs = [];

        let petIds = this.getAllPetCfgId();
        for (let id of petIds) {
            if (this.isUnlock(id)) {
                let petCfg = TableManager.getDataById(table.pet.PetConfig, id);
                //初始0星属性
                this._starAttrs.push(...petCfg.baseAttrs);

                //升星属性
                let petVo = GIns.petModel.petContext.getDataByCfgId(id);
                if (petVo.star > petCfg.initStar) {
                    for (let starAttr of petCfg.starAttrs) {
                        let num = Number(starAttr.v) * (petVo.star - petCfg.initStar)
                        this._starAttrs.push({
                            k: starAttr.k,
                            v: num
                        });
                    }
                }
            }
        }
    }

    /**
     * 获取星灵模块当前等级、阶级、星级的加成属性
     */
    public getLVStageAttr(out_attrDatas: AttrData[]) {
        if (!GIns.moduleOpenMgr.isCanOpenModuleWithoutTips(ServerEnums.SystemType.PET)) return out_attrDatas;
        let { shareLevel, shareStage } = GIns.petModel.petContext;
        let lvCfg = G.TableManager.getDataById(table.pet.PetLevelConfig, shareLevel);
        let stageCfg = G.TableManager.getDataById(table.pet.PetStageConfig, shareStage);

        if (lvCfg && lvCfg.heroAttrAdditions) {
            out_attrDatas.push(...AttrData.fromTableConfig(lvCfg.heroAttrAdditions));
        }
        if (stageCfg && stageCfg.heroAttrAdditions) {
            out_attrDatas.push(...AttrData.fromTableConfig(stageCfg.heroAttrAdditions));
        }
        //升星属性
        if (!this._starAttrs) this.updateStarAttrs();
        out_attrDatas.push(...AttrData.fromTableConfig(this._starAttrs));
    }

    //升级&&升阶属性
    public getLVAttr(out_attrDatas?: AttrData[], shareLevel?: number, shareStageLV?: number) {
        let attrDatas: AttrData[] = [];
        if (shareLevel === undefined) {
            shareLevel = GIns.petModel.petContext.shareLevel;
        }
        if (shareStageLV === undefined) {
            shareStageLV = GIns.petModel.petContext.shareStage;
        }
        let lvCfg = G.TableManager.getDataById(table.pet.PetLevelConfig, shareLevel);
        let stageCfg = G.TableManager.getDataById(table.pet.PetStageConfig, shareStageLV);
        if (lvCfg) attrDatas.push(...AttrData.fromTableConfig(lvCfg.heroAttrAdditions));
        if (stageCfg) attrDatas.push(...AttrData.fromTableConfig(stageCfg.heroAttrAdditions));
        attrDatas = GIns.attrMgr.mergeAttrDataArray(attrDatas);
        if (out_attrDatas) out_attrDatas.push(...attrDatas);
        return attrDatas;
    }

    // //某个宠物的升星属性
    // public getStarAttr(out_attrDatas: AttrData[], petId: number, star?: number) {
    //     if (this.isUnlock(petId)) {
    //         if (star === undefined) {
    //             let petVo = GIns.petModel.petContext.getDataByCfgId(petId);
    //             star = petVo.star;
    //         }
    //         let attrsKV = this.getStarAttrKV(petId, star);
    //         let arr = AttrData.fromTableConfig2(attrsKV);
    //         out_attrDatas.push(...arr);
    //     }
    // }
    //某个宠物的升星属性
    public getStarAttrKV(petId: number, star: number) {
        //初始0星属性
        let attrsKV: Array<{ k: any, v: any }>;
        let petCfg = TableManager.getDataById(table.pet.PetConfig, petId);
        //初始0星属性
        attrsKV = petCfg.baseAttrs.concat();

        //升星属性
        if (star > petCfg.initStar) {
            let mul = star - petCfg.initStar;
            for (let starAttr of petCfg.starAttrs) {
                let attr2: { k: any, v: any } = {
                    k: starAttr.k,
                    v: starAttr.v * mul
                };
                attrsKV.push(attr2);
            }
        }

        return attrsKV;
    }

    /**
     * 获取基础加成
     * @param petCfgId PetConfig.xlsx id
     * @param type 属性类型
     */
    public getPanelAttrByPetId(petCfgId: number, type: AttrType) {
        let baseNum = "";
        let petCfgData = G.TableManager.getDataById(table.pet.PetConfig, petCfgId);
        switch (type) {
            case AttrType.Attack:
                baseNum = Math.round((petCfgData.atkMod / 10000) * 100) + "%";
                break;
            case AttrType.Blood:
                baseNum = Math.round((petCfgData.hpMod / 10000) * 100) + "%";
                break;
            case AttrType.Defense:
                baseNum = Math.round((petCfgData.defMod / 10000) * 100) + "%";
                break;
        }

        return baseNum;
    }

    /**
     *  获取当前上阵的宠物的技能
     */
    public getCurOnArrayPetSkillData(): IBattlePetData[] {
        GIns.formationMgr.getFormationVoByType(ServerEnums.FightType.TRUNK_MAP);
        let curOnArrayPetCfgId = 0; //当前上阵的宠物的PetConfig id
        let arrVo = GIns.formationMgr.getFormationVoByType(ServerEnums.FightType.TRUNK_MAP);
        let petVo: Omit<Vo.pet.PetVo, "fragment">;
        if (arrVo && arrVo.petId) {
            curOnArrayPetCfgId = arrVo.petId;
            if (curOnArrayPetCfgId) {
                petVo = GIns.petModel.petContext.getDataByCfgId(curOnArrayPetCfgId);
            }
        }
        let battlePetData: IBattlePetData[] = [];
        if (petVo) {
            let skillIds: string[] = [];
            let petCfg = G.TableManager.getDataById(table.pet.PetConfig, curOnArrayPetCfgId);
            let skill1Level = 1; //技能1默认是解锁的，且等级1级
            let petStar = petVo.star;
            if (petStar > 0) {
                let petStarCfg = this._qualityStarMap[petCfg.quality].kv[petStar];
                skill1Level = petStarCfg.skillPosLevelContent[2];
            }
            petCfg.skillIds.forEach((baseSkillId, idx) => {
                if (idx == 0) {
                    //第一个固定为普攻技能
                    skillIds.push(`${baseSkillId}01`);
                } else {
                    if (skill1Level < 10) {
                        skillIds.push(`${baseSkillId}0${skill1Level}`);
                    } else {
                        skillIds.push(`${baseSkillId}${skill1Level}`);
                    }
                }
            });

            let data: IBattlePetData = {
                configId: curOnArrayPetCfgId,
                skillIds: skillIds,
            };
            battlePetData.push(data);
        }
        return battlePetData;
    }

    /**
     * 判断指定宠物ID是否可以激活。
     * @param petId 宠物ID
     * @returns 如果宠物可以激活则返回true，否则返回false。
     * 该方法首先检查宠物ID是否存在，然后获取宠物对象并判断其是否未激活。
     * 如果宠物未激活，则进一步检查背包中是否有足够的碎片来激活宠物。
     * 如果碎片数量满足激活成本，则返回true，否则返回false。
     */
    public isCanActive(petId: number) {
        if (petId) {
            let petVo = GIns.petModel.petContext.getDataByCfgId(petId);
            if (petVo.active == false) {
                let petCfg = G.TableManager.getDataById(table.pet.PetConfig, petId);
                let petItemCount = GIns.backpackMgr.getItemCountByItemId(petCfg.fragmentItemId);
                return petItemCount >= petCfg.activeCostFragment;
            }
        }
        return false;
    }

    /**
     * 获取并排序宠物配置列表。
     * 该函数首先获取所有宠物配置数据，然后根据宠物是否可激活以及品质、ID进行排序。
     * 可激活状态的宠物优先级最高，其次是品质，最后是ID。
     * @returns 排序后的宠物配置列表
     */
    public getSortedPetCfgList() {
        let petList = G.TableManager.getAllData(table.pet.PetConfig);
        let cfgId2PetVo = GIns.petModel.petContext.cfgId2PetVoMap;

        let canActiveStateList: { [petId: number]: number } = {};
        for (let i = 0; i < petList.length; i++) {
            var cfg = petList[i];
            var petId = cfg.id;
            var vo = cfgId2PetVo.get(petId);
            if (vo && vo.active) {
                canActiveStateList[petId] = 1;
            } else {
                canActiveStateList[petId] = this.isCanActive(petId) ? 2 : 0;
            }
        }

        let petListSorted = petList.sort((a, b) => {
            return (
                canActiveStateList[b.id] - canActiveStateList[a.id] ||
                b.quality - a.quality ||
                b.id - a.id
            );
        });
        return petListSorted;
    }

    // region 红点相关
    //刷新全部红点
    updateAllRed() {
        this.calculateActiveUpStarRed();
        this.calculateUpLVUpStageRed();
        this.calculatePetHubRed();
    }
    /**
     * 计算指定的宠物碎片对应的宠物的激活，升星红点
     * @param itemIds 要计算红点的碎片
     */
    private calculateActiveUpStarRed(petCfgs?: table.pet.PetConfig[]) {
        if (!petCfgs) {
            //计算全部宠物红点
            this._allPetFragementItems.forEach((petCfg) => {
                this.calculatePetActiveUpStarRed(petCfg);
            });
        } else {
            petCfgs.forEach((petCfg) => {
                this.calculatePetActiveUpStarRed(petCfg);
            });
        }
    }
    //计算激活升星红点
    private calculatePetActiveUpStarRed(petCfg: table.pet.PetConfig) {
        let activeRed = false,
            upStarRed = false;
        let petVo = GIns.petModel.petContext.getDataByCfgId(petCfg.id);
        if (petVo.active == false) {
            //够宠物碎片合成
            let fragementCount = GIns.backpackMgr.getItemCountByItemId(petCfg.fragmentItemId);
            activeRed = fragementCount >= petCfg.activeCostFragment;
        } else if (this.isCanUpStar(petCfg.id)) {
            upStarRed = true;
        }
        GIns.redDotMgr.setRedDot(RedDotKeys.Pet_active, activeRed, [petCfg.id]);
        GIns.redDotMgr.setRedDot(RedDotKeys.Pet_UpStar, upStarRed, [petCfg.id]);
    }

    //计算升级进阶红点
    private calculateUpLVUpStageRed() {
        let { shareLevel, shareStage } = GIns.petModel.petContext;
        let red = false;
        do {
            if (shareLevel >= this.maxShareLV) {
                break;
            }

            if (GIns.petModel.petContext.petActiveNum <= 0) {
                break;
            }

            if (this.isCanUpStageWithOutCost()) {
                red = GIns.petCfgMgr.getUpStageCost().every((noi) => {
                    let canPay = noi.isCanPay();
                    return canPay;
                });
            } else if (this.isMaxLV() == false) {
                let netxtLVCfg = G.TableManager.getDataById(table.pet.PetLevelConfig, shareLevel + 1);
                for (let n of netxtLVCfg.costItems) {
                    red = GIns.backpackMgr.getItemCountByItemId(n.k) >= n.v;
                    if (red == false) {
                        break;
                    }
                }
            }
        } while (false);

        GIns.redDotMgr.setRedDot(RedDotKeys.Pet_upLVStage, red);
    }

    // 计算星灵招募红点
    private calculatePetHubRed() {
        let red = false;
        const cfg = PetHubModel.ins().getDrawCardConfig();
        if (!cfg || !cfg.costItems) return;
        const item = cfg.costItems[0];
        const itemConfig = ItemUtils.getItemConfigByItemId(item.k);
        const noOwnerItem = NoOwnerItem.createByConfigKv({k: item.k, v: item.v * 10});
        red = BackpackManager.ins().isCanPayItem(noOwnerItem, false);
        GIns.redDotMgr.setRedDot(RedDotKeys.Pet_Hub_Cost, red);
    }
}

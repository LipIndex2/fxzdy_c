import G from "../../../core/comm/G";
import { TableManager } from "../../../core/table/TableManager";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import { AttrEnum } from "../../comm/battle/attribute/AttrEnum";
import GIns from "../../GIns";
import { HeroStageConfigDatas } from "../../table/hero/HeroStageConfigDatas";
import { HeroStarConfigDatas } from "../../table/hero/HeroStarConfigDatas";
import { Attribute, AttributeType, AttrType } from "../attr/AttrEnum";
import { AttrData, AttrManager } from "../attr/AttrManager";
import { EquipManager } from "../equip/EquipManager";
import { FightManager, systemFight } from "../fight/FightManager";
import { FormationManager } from "../formation/FormationManager";
import { ItemModel } from "../item/model/ItemModel";
import { WeaponManager } from "../weapon/WeaponManager";
import { HeroCampType, HeroSelectKey } from "./HeroEnum";
import { HeroManager } from "./HeroManager";
import { HeroSkillVo } from "./HeroSkillVo";
import { ComparatorBuilder } from "db://assets/scripts/core/utils/ComparatorBuilder";
import { TimeManager } from "../../../core/time/TimeManager";
import { DNABtnClickType } from "./page/HeroPotentialPage";
import { HeroConfigManager } from "./config/HeroConfigManager";
import { ItemUtils } from "../item/utils/ItemUtils";
import { BackpackManager } from "../backpack/BackpackManager";
import { NoOwnerItem } from "../../modules/backpack/vo/NoOwnerItem";
import ObjectUtils from "../../../core/utils/ObjectUtils";

/** 英雄VO */
export class HeroVo {
    /** 英雄表 */
    private _heroCfg: table.hero.HeroConfig;

    /** 英雄数据data */
    private _heroVoData: HeroVoDate;

    /** 阵位ID */
    private _posId: number;

    /** 战力 */
    private _fight: number;

    /** 共鸣等级战力 */
    private _commonLevelFight: number;

    /** 英雄添加的羁绊数量 */
    private _careerCount: number = 1;

    /** 英雄技能组map  {技能组id:Data} */
    private _skillMap: { [groupId: string]: HeroSkillVo } = {};
    private _allSkillMap: HeroSkillVo[] = [];

    public static readonly ComparatorByFilter = ComparatorBuilder.create<HeroVo>()
        .addComparator((v1, v2) => {
            // 激活状态
            if (v1.heroVoData?.isActivate != v2.heroVoData?.isActivate) {
                return v1.heroVoData?.isActivate ? -1 : 1;
            }
            return 0;
        })
        .addComparator((v1, v2) => {
            // 锁定状态
            if (v1.isLock && !v2.isLock) {
                return 1;
            }
            if (!v1.isLock && v2.isLock) {
                return -1;
            }
            return 0;
        })
        .addComparator((v1, v2) => {
            // 上阵
            return v1._posId - v2._posId;
        })
        .addComparator((v1, v2) => {
            // 品质
            return v2._heroCfg.quality - v1._heroCfg.quality;
        })
        .addComparator((v1, v2) => {
            // 星级
            return v2._heroVoData.star - v1._heroVoData.star;
        })
        .addComparator((v1, v2) => {
            // 战力
            return v2._fight - v1._fight;
        })
        .addComparator((v1, v2) => {
            // 英雄 ID
            return v2._heroCfg.id - v1._heroCfg.id;
        })
        .build();

    /*阵营*/
    get campType(): HeroCampType {
        return this.heroCfg.camp;
    }

    /** 设置英雄数据 */
    public setHeroVoData(data: HeroVoDate) {
        if (!data) {
            return;
        }
        this._heroVoData = data;
        this._heroCfg = TableManager.getDataById(table.hero.HeroConfig, data.baseId);

        //延迟100毫秒，确保英雄的其他数据有了再初始化技能
        G.GameTimer.once(100, this, this.setSkillData);
    }

    //英雄技能数据
    public setSkillData() {
        let groupIds = [this._heroCfg.skill0, this._heroCfg.skill1, this._heroCfg.skill2, this._heroCfg.skill3, this._heroCfg.skill4, this._heroCfg.skill5];
        let slotId = 0;
        for (let id of groupIds) {
            if (id) {
                let skillIds = this.getSkillIds(id);
                let skillCfg = TableManager.getDataById(table.battle.SkillConfig, skillIds[0]);
                if (skillCfg) {
                    let data: HeroSkillData = {
                        slotId: slotId,
                        groupId: id,
                        ids: skillIds,
                        unlock: this.skillIsUnlock(slotId),
                        isUltimateSkill: id == this._heroCfg.skill2,
                        level: this.getSkillLevel(slotId),
                        cfg: skillCfg,
                    };
                    let skillVo = this._skillMap[id];

                    if (!skillVo) {
                        skillVo = new HeroSkillVo();
                        this._skillMap[id] = skillVo;
                        this._allSkillMap.push(skillVo);
                    }
                    skillVo.setData(data);
                }
            }
            slotId++;
        }

        this._allSkillMap.sort((a, b) => {
            if (a.data.isUltimateSkill != b.data.isUltimateSkill) {
                return a.data.isUltimateSkill ? -1 : 1;
            }
        });
    }

    /** 更新所有技能data */
    public updateAllSkillData() {
        for (let skillVo of this._allSkillMap) {
            this.updateSkillDataByGroupId(skillVo.data.groupId);
        }
    }

    /** 更新技能data */
    public updateSkillDataByGroupId(groupId: string) {
        let skillVo = this._skillMap[groupId];
        if (!skillVo) return;

        let data: HeroSkillData = {
            slotId: skillVo.data.slotId,
            groupId: skillVo.data.groupId,
            ids: skillVo.data.ids,
            unlock: this.skillIsUnlock(skillVo.data.slotId),
            isUltimateSkill: skillVo.data.isUltimateSkill,
            level: this.getSkillLevel(skillVo.data.slotId),
            cfg: skillVo.data.cfg,
        };

        skillVo.setData(data);
        this._skillMap[groupId] = skillVo;
    }

    /** 获取当前英雄生效的羁绊数量 */
    public getCareerCount() {
        let data = this._skillMap[this._heroCfg.skill5];
        if (data) {
            this._careerCount = data.data.cfg.careerCount;
        }

        return this._careerCount;
    }

    //获取对应技能组id的所有技能id
    private getSkillIds(groupId: string) {
        let skillIds = [];
        let skillidsCfg = TableManager.getAllData(table.battle.SkillConfig);
        for (let cfg of skillidsCfg) {
            if (cfg && cfg.group == groupId) {
                skillIds.push(cfg.id);
            }
        }
        return skillIds;
    }

    //判断当前技能槽位是否解锁
    public skillIsUnlock(slotId: number) {
        // if(slotId == 0) return true;
        return this.getSkillLevel(slotId) > 0 && HeroStageConfigDatas.ins().isUnlockSkillPos(slotId, this.stage);
    }

    //获取当前技能等级
    public getSkillLevel(groupId: number) {
        return HeroStarConfigDatas.ins().getSkillLevel(this.heroCfg.quality, this.star, groupId);
    }

    get isLock(): boolean {
        const canUse = this._heroVoData.isCanUse;
        if (canUse == null) {
            return false;
        }
        return !canUse;
    }

    /** 英雄数据 */
    get heroVoData() {
        return this._heroVoData;
    }

    /** 英雄配置ID */
    get baseId() {
        return this.heroVoData.baseId;
    }

    /** 英雄表 */
    get heroCfg() {
        return this._heroCfg;
    }

    /** 魔方vo */
    get magicCubeVo() {
        return GIns.magicCubeMgr.getMagicCubeVoByHeroId(this._heroCfg.id);
    }

    /** 获取英雄所有技能 */
    get allSkill() {
        if (this._allSkillMap.length == 0) {
            this.setSkillData();
        }
        return this._allSkillMap;
    }

    /** 获取技能展示列表 */
    get skillList() {
        let skillMap = [];
        for (let data of this._allSkillMap) {
            if (data.data.slotId > 0) {
                skillMap.push(data);
            }
        }
        return skillMap;
    }

    /** 获得当前展示的showModelId，根据当前使用的皮肤id获得对应的showModelId
     *  根据角色身上的皮肤获得对应的大模型showModelId
     */
    get showModelId() {
        if (this.heroVoData.useSkinId) {
            let skinCfg = TableManager.getDataById(table.hero.HeroSkinConfig, this.heroVoData.useSkinId);
            return skinCfg.showModelId;
        } else {
            return this.heroCfg.showModelId;
        }
    }

    /** 获得当前展示的headPath，根据当前使用的皮肤id获得对应的headPath
     *  根据角色身上的皮肤获得对应的半身像headPath
     */
    get headPath() {
        if (this.heroVoData.useSkinId) {
            let skinCfg = TableManager.getDataById(table.hero.HeroSkinConfig, this.heroVoData.useSkinId);
            return skinCfg.headPath;
        } else {
            return this.heroCfg.headPath;
        }
    }

    /** 获得当前展示的modelId，根据当前使用的皮肤id获得对应的modelId
     *  根据角色身上的皮肤获得对应的小模型modelId
     */
    get modelId() {
        if (this.heroVoData.useSkinId) {
            let skinCfg = TableManager.getDataById(table.hero.HeroSkinConfig, this.heroVoData.useSkinId);
            return skinCfg.modelId;
        } else {
            return this.heroCfg.modelId;
        }
    }

    /***当前使用的皮肤ID */
    get skinId(): number {
        return this.heroVoData.useSkinId || 0;
    }

    /** 获取当前的潜能DNA信息 */
    getDNAInfo(): Vo.hero.HeroDnaVo {
        function objectEntries<T>(obj: { [key: string]: T }): [string, T][] {
            const result: [string, T][] = [];
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    result.push([key, obj[key]]);
                }
            }
            return result;
        }

        // 替换原本定义的object类型
        function transformAwakenDataInPlace(data: any): void {
            for (const key in data) {
                if (data[key]?.attrs) {
                    // 将 attrs 转换为 [{ k, v }]
                    data[key].attrs = objectEntries(data[key].attrs).map(([k, v]) => ({
                        k: Number(k), // 转换为数字
                        v: v, // 保持原值
                    }));
                }
            }
        }

        let dnaData = ObjectUtils.deepCopy(this.heroVoData.heroDNA);
        if (dnaData?.awaken) {
            transformAwakenDataInPlace(dnaData.awaken);
        }
        if (dnaData?.awakenTemp) {
            transformAwakenDataInPlace(dnaData.awakenTemp);
        }
        return dnaData;
    }

    /** 获取对应技能组ID的技能data */
    public getSkillDataById(groupId: string) {
        return this._skillMap[groupId];
    }

    /** 获取对应槽位的技能data */
    public getSkillDataBySlotId(slotId: number) {
        for (let skillVo of this._allSkillMap) {
            if (skillVo && skillVo.data.slotId == slotId) {
                return skillVo.data;
            }
        }
    }

    /**
     * 获取某一星级的升星表
     * @param setStar 星级，不填取当前星级
     * @returns
     */
    public getHeroStarCfg(setStar?: number) {
        let star = setStar ? setStar : this.heroVoData.star;
        let starAllCfg = TableManager.getAllData(table.hero.HeroStarConfig);
        for (let cfg of starAllCfg) {
            if (cfg.quality == this.heroCfg.quality && cfg.star == star) {
                return cfg;
            }
        }
        return null;
    }

    /** 设置阵位id */
    set posId(posId: number) {
        this._posId = posId;
    }

    /** 阵位id  有则已上阵，null则未上阵 */
    get posId() {
        return this._posId;
    }

    /** 星级 */
    get star() {
        return this.heroVoData.star || this.heroCfg.initStar;
    }

    /** 等级，未上阵返回共鸣等级 */
    get Level() {
        let level = 0;
        if (!this.posId) return FormationManager.ins().getCommonLevel();
        let posVo = FormationManager.ins().getPosVoById(this.posId);
        level = posVo.level;
        return level;
    }

    /** 等阶，未上阵返回共鸣等阶 */
    get stage(): number {
        let stage = 0;
        if (!this.posId) return FormationManager.ins().getCommonStage();
        let posVo = FormationManager.ins().getPosVoById(this.posId);
        stage = posVo.stage;
        return stage;
    }

    /** 增加碎片数量 */
    public addFragment(count: number) {
        this.heroVoData.fragment += count;
    }

    /** 碎片数量 */
    set fragment(count: number) {
        this.heroVoData.fragment = count;
    }
    /** 碎片数量 */
    get fragment() {
        return this.heroVoData.fragment || 0;
    }

    /** 激活英雄 */
    public activateHero() {
        this.heroVoData.isActivate = true;
    }

    /** 是否可激活 */
    get isCanActive() {
        if (this.heroVoData.isActivate) return false;
        return this.fragment >= this.heroCfg.activeCostFragment;
    }

    /** 更新当前战力 */
    public updateFight() {
        this._fight = FightManager.ins().getHeroFight(this.baseId);
        this._commonLevelFight = FightManager.ins().getHeroFight(this.baseId, true);
    }

    /** 当前战力 */
    get getHeroFight() {
        if (!this._fight) {
            this._fight = FightManager.ins().getHeroFight(this.baseId);
        }
        return this._fight;
    }

    /** 共鸣等级战力 */
    get getHeroFightByCommonLevel() {
        if (!this._commonLevelFight) {
            this._commonLevelFight = FightManager.ins().getHeroFight(this.baseId, true);
        }
        return this._commonLevelFight;
    }

    /** 是否可升级或者升阶 */
    public isCanUpgrade() {
        if (!this.posId) return false;
        let posVo = FormationManager.ins().getPosVoById(this.posId);
        let nextLevelCfg = TableManager.getDataById(table.hero.HeroLevelConfig, posVo.level + 1);
        if (!nextLevelCfg) return false;
        let nextStageCfg = TableManager.getDataById(table.hero.HeroStageConfig, posVo.stage + 1);
        if (!nextStageCfg) return false;
        let maxLevel = HeroManager.ins().getHeroConstantCfg("HERO:IN_BATTLE_MAX_LEVEL_GAP").content;
        //判断相差等级
        if (posVo.level >= FormationManager.ins().getCommonLevel() + Number(maxLevel)) return false;

        //升阶
        if (nextLevelCfg && nextLevelCfg.stageCondition > posVo.stage) {
            if (this.isEnough(nextStageCfg.costItems) && this.isEnough(nextLevelCfg.costItems)) {
                return true;
            } else {
                return false;
            }
        }

        //升级
        let items = nextLevelCfg.costItems;
        if (this.isEnough(items)) {
            return true;
        } else {
            //道具不足
            return false;
        }
    }

    protected addCostItemToMap(costItem: any[], map: Map<number, number>): void {
        for (let k = 0; k < costItem.length; k++) {
            let arr = costItem[k];
            let itemId = Number(Object.keys(arr)[0]);
            let itemCnt = Number(arr[itemId]);
            let totalCnt = 0;
            if (map.has(itemId)) {
                totalCnt = map.get(itemId);
            }
            totalCnt += itemCnt;
            map.set(itemId, totalCnt);
        }
    }

    protected isEnoughForMap(map: Map<number, number>): boolean {
        let itemIds = Array.from(map.keys());
        for (let i = 0; i < itemIds.length; i++) {
            let item = ItemModel.ins().getItemById(itemIds[i]);
            if (!item || item.count < map.get(itemIds[i])) {
                return false;
            }
        }
        return true;
    }

    public isCanUpgradeMore(upLevel: number): boolean {
        if (!this.posId) return false;
        let posVo = FormationManager.ins().getPosVoById(this.posId);
        let maxLevel = HeroManager.ins().getHeroConstantCfg("HERO:IN_BATTLE_MAX_LEVEL_GAP").content;
        //判断相差等级
        if (posVo.level >= FormationManager.ins().getCommonLevel() + Number(maxLevel)) return false;

        let upCnt: number = 1;
        let stageMap: Map<number, boolean> = new Map();
        let costItemMap: Map<number, number> = new Map();
        while (upCnt <= upLevel) {
            if (posVo.level + upCnt >= FormationManager.ins().getCommonLevel() + Number(maxLevel)) return false;
            let nextLevelCfg = TableManager.getDataById(table.hero.HeroLevelConfig, posVo.level + upCnt);
            if (!nextLevelCfg) return false;
            //升阶
            this.addCostItemToMap(nextLevelCfg.costItems, costItemMap);
            if (nextLevelCfg && nextLevelCfg.stageCondition > posVo.stage && stageMap.has(nextLevelCfg.stageCondition) == false) {
                let nextStageCfg = TableManager.getDataById(table.hero.HeroStageConfig, nextLevelCfg.stageCondition);
                if (nextStageCfg) {
                    this.addCostItemToMap(nextStageCfg.costItems, costItemMap);
                }
            }
            if (this.isEnoughForMap(costItemMap)) {
            } else {
                //道具不足
                return false;
            }
            upCnt++;
        }
        return true;
    }

    /** 是否可升阶 */
    public isCanUpStage() {
        if (!this.posId) return false;
        let posVo = FormationManager.ins().getPosVoById(this.posId);
        let nextLevelCfg = TableManager.getDataById(table.hero.HeroLevelConfig, posVo.level + 1);
        if (!nextLevelCfg) return false;
        let nextStageCfg = TableManager.getDataById(table.hero.HeroStageConfig, posVo.stage + 1);
        if (!nextStageCfg) return false;
        let maxLevel = HeroManager.ins().getHeroConstantCfg("HERO:IN_BATTLE_MAX_LEVEL_GAP").content;
        //判断相差等级
        if (posVo.level >= FormationManager.ins().getCommonLevel() + Number(maxLevel)) return false;

        //升阶
        if (nextLevelCfg && nextLevelCfg.stageCondition > posVo.stage) {
            if (this.isEnough(nextStageCfg.costItems) && this.isEnough(nextLevelCfg.costItems)) {
                return true;
            } else {
                return false;
            }
        }
    }

    /** 是否可以升星 */
    public isCanUpStar() {
        if (!this.heroVoData.isActivate) return false;

        let starNextCfg = this.getHeroStarCfg(this.star + 1);
        if (!starNextCfg) return false;

        if (this.fragment >= starNextCfg.cost) {
            return true;
        } else {
            return false;
        }
    }

    public isCanOpenDna() {
        if (this.star >= 15 && TimeManager.serverHaveOpenDay >= 8) {
            return true;
        } else {
            return false;
        }
    }

    public isCanDnaAwaken() {
        // const dnaData = this.getDNAInfo();
        // const operaType = HeroManager.ins().checkCurOperation(this.baseId, dnaData.stage);
        // if (operaType == DNABtnClickType.DNA_AWAKEN) {
        //     const cfg = HeroConfigManager.getAwakenConfig(this.baseId, dnaData.stage);
        //     const costItem = cfg.costItems[0];
        //     let noOwnerItem = NoOwnerItem.createByConfigKv(costItem);
        //     const isCanPay = BackpackManager.ins().isCanPayItem(noOwnerItem, false);
        //     return isCanPay;
        // }
        return false;
    }

    public isCanDnaLevelUp() {
        // const dnaData = this.getDNAInfo();
        // const operaType = HeroManager.ins().checkCurOperation(this.baseId, dnaData.stage);
        // if (operaType == DNABtnClickType.DNA_LEVEL_UP) {
        //     const nextCfg = HeroConfigManager.getDNAConfig(dnaData.stage, dnaData.level + 1);
        //     const costItem = nextCfg.costItems[0];
        //     let noOwnerItem = NoOwnerItem.createByConfigKv(costItem);
        //     const isCanPay = BackpackManager.ins().isCanPayItem(noOwnerItem, false);
        //     return isCanPay;
        // }
        return false;
    }

    /** 判断道具数组是否全部满足条件 */
    private isEnough(items: Array<number>) {
        for (let k = 0; k < items.length; k++) {
            let arr = items[k];
            let itemId = Object.keys(arr)[0];
            let item = ItemModel.ins().getItemById(Number(itemId));
            if (!item || item.count < arr[itemId]) {
                return false;
            }
        }
        return true;
    }

    /** 获取红点 */
    public getRedPoints() {
        return this.isCanUpgrade() || this.isCanUpStar();
    }

    /** --------------------------------------------------------英雄属性------------------------------------------------------------ */

    /** 获取当前英雄的某个面板属性 */
    private getHeroAttr(type: AttrType, systemType?: systemFight) {
        let attr = AttrManager.ins().getPanelAttrByHeroId(this.heroVoData.baseId, type, null, null, null, systemType);
        return attr;
    }

    /** 获取当前英雄的某个共鸣面板属性（用于计算自动上阵的共鸣战力） */
    private getCommonAttr(type: AttrType) {
        let level = FormationManager.ins().getCommonLevel();
        let stage = FormationManager.ins().getCommonStage();
        let attr = AttrManager.ins().getPanelAttrByHeroId(this.heroVoData.baseId, type, level, stage);
        return attr;
    }

    /** 面板属性 */
    private getPanelAttrs(isCommon: boolean = false, systemType?: systemFight) {
        let attrArr: AttrData[] = [];
        //攻击
        let AttrATKCfg = TableManager.getDataById(table.battle.AttributeConfig, Attribute.ATK);
        let atkData: AttrData = new AttrData();
        atkData.id = Attribute.ATK;
        atkData.type = AttributeType.PANEL_ATTR;
        atkData.num = isCommon ? this.getCommonAttr(AttrType.Attack) : this.getHeroAttr(AttrType.Attack, systemType);
        atkData.worth = AttrATKCfg.cpWorth;
        atkData.mod = AttrATKCfg.cpMod;
        attrArr.push(atkData);
        //血量
        let AttrHPCfg = TableManager.getDataById(table.battle.AttributeConfig, Attribute.HP);
        let hpData: AttrData = new AttrData();
        hpData.id = Attribute.HP;
        hpData.type = AttributeType.PANEL_ATTR;
        hpData.num = isCommon ? this.getCommonAttr(AttrType.Blood) : this.getHeroAttr(AttrType.Blood, systemType);
        hpData.worth = AttrHPCfg.cpWorth;
        hpData.mod = AttrHPCfg.cpMod;
        attrArr.push(hpData);
        //防御
        let AttrDEFCfg = TableManager.getDataById(table.battle.AttributeConfig, Attribute.DEF);
        let defData: AttrData = new AttrData();
        defData.id = Attribute.DEF;
        defData.type = AttributeType.PANEL_ATTR;
        defData.num = isCommon ? this.getCommonAttr(AttrType.Defense) : this.getHeroAttr(AttrType.Defense, systemType);
        defData.worth = AttrDEFCfg.cpWorth;
        defData.mod = AttrDEFCfg.cpMod;
        attrArr.push(defData);

        return attrArr;
    }

    private heroAllSkillAttr: AttrData[];
    /** 英雄技能属性 */
    public getHeroAllSkillAttr() {
        if (this.heroAllSkillAttr) return this.heroAllSkillAttr;

        let attrDatas: AttrData[] = [];
        let skillIds = HeroManager.ins().getHeroSkills(this.baseId);
        for (let skillId of skillIds) {
            let skillCfg = TableManager.getDataById(table.battle.SkillConfig, skillId);
            if (skillCfg && skillCfg.skillAttrs?.length > 0) {
                let keys = Object.keys(skillCfg.skillAttrs);
                for (let i = 0; i < keys.length; i++) {
                    let attr = skillCfg.skillAttrs[keys[i]];
                    let data = AttrManager.ins().convertDataFormat(keys[i] as Attribute, attr);
                    attrDatas.push(data);
                }
            }
        }
        this.heroAllSkillAttr = attrDatas;
        return this.heroAllSkillAttr;
    }

    /** 英雄属性data[] */
    public allAttrDataArr(isCommon: boolean = false, systemType?: systemFight): AttrData[] {
        const attrDatas: AttrData[] = [];
        //面板属性  一级属性
        let attrs = this.getPanelAttrs(isCommon, systemType);
        for (let attr of attrs) {
            if (attr) attrDatas.push(attr);
        }

        /** ----------------- 二级属性加成模块 ----------------------- */
        //添加其他模块的属性加成，其他模块的属性加成必须是所有属性数组（方便和后端校验战力是否正确），放到这里用for加到总数组中

        //英雄初始二级属性
        if (this.heroCfg.baseSecondAttrs) {
            for (let attr of this.heroCfg.baseSecondAttrs) {
                let data = AttrManager.ins().convertDataFormat(attr.k, attr.v);
                attrDatas.push(data);
            }
        }

        //英雄所有技能属性
        let skillAttrs = this.getHeroAllSkillAttr();
        if (skillAttrs) {
            for (let attr of skillAttrs) {
                attrDatas.push(attr);
            }
        }

        //魔方
        if (this.magicCubeVo) {
            for (let attr of this.magicCubeVo.getAttr()) {
                if (attr) {
                    attrDatas.push(attr);
                }
            }
        }

        //装备
        if (systemType !== systemFight.EQUIP) {
            attrs = EquipManager.ins().allEquipAttrs;
            for (let attr of attrs) {
                if (attr) {
                    attrDatas.push(attr);
                }
            }
        }

        //专武
        if (systemType !== systemFight.WEAPON) {
            this.updateWeaponAttr(attrDatas);
        }

        //皮肤
        let skinAttrs = GIns.heroMgr.getSkinAttrs();
        if (skinAttrs) {
            for (let attr of skinAttrs) {
                attrDatas.push(attr);
            }
        }
        // this.updateSkinAttr(attrDatas);

        //星灵
        if (systemType !== systemFight.PET) {
            GIns.petCfgMgr.getLVStageAttr(attrDatas);

            //星灵羁绊
            GIns.petModel.petGroupContext.getGroupAttr(attrDatas);
        }

        let attrstemp = [];
        //收藏品
        if (systemType !== systemFight.COLLECTIONS) {
            for (let v of GIns.collectionsModel.context.getMergedAddAttrDataArray()) {
                if (v.unitEffectiveType && v.unitEffectiveType != ServerEnums.TalentEffectType[this.heroCfg.attackRange] && v.unitEffectiveType != ServerEnums.TalentEffectType[this.heroCfg.career]) {
                    continue;
                }
                attrDatas.push(v);
                attrstemp.push(v);
            }
        }

        // 英雄潜能
        const dnaData = this.getDNAInfo();
        if (dnaData && dnaData.awaken) {
            for (const index in dnaData.awaken) {
                const info = dnaData.awaken[index];
                if (!info || !info.attrs || !info.attrs[0]) {
                    continue;
                }
                let attrId = AttrEnum[info.attrs[0].k] as Attribute;
                let data = AttrManager.ins().convertDataFormat(attrId, info.attrs[0].v);
                attrDatas.push(data);
            }
        }

        // 其他全局加成
        const otherModuleProvideAttrDataArray = AttrManager.ins().getOtherModuleProvideGlobalAttrDataArray();
        for (let attr of otherModuleProvideAttrDataArray) {
            if (
                attr.unitEffectiveType &&
                attr.unitEffectiveType != ServerEnums.TalentEffectType[this.heroCfg.attackRange] &&
                attr.unitEffectiveType != ServerEnums.TalentEffectType[this.heroCfg.career]
            ) {
                continue;
            }
            attrDatas.push(attr);
        }
        // attrDatas.push(...otherModuleProvideAttrDataArray);

        return attrDatas;
    }

    /** 获取额外属性 */
    public allExtraAttrs(type: AttrType, systemType?: systemFight) {
        const attrDatas: AttrData[] = [];
        /** -----------------额外属性加成模块（确定没有额外属性加成的可以不加在这里）----------------------- */

        //英雄所有技能属性
        let skillAttrs = this.getHeroAllSkillAttr();
        if (skillAttrs) {
            for (let attr of skillAttrs) {
                attrDatas.push(attr);
            }
        }

        //魔方
        if (this.magicCubeVo) {
            for (let attr of this.magicCubeVo.getAttr()) {
                if (attr) {
                    attrDatas.push(attr);
                }
            }
        }

        //装备
        let attrs = [];
        if (systemType !== systemFight.EQUIP) {
            attrs = EquipManager.ins().allEquipAttrs;
            for (let attr of attrs) {
                if (attr) attrDatas.push(attr);
            }
        }

        //专武
        if (systemType !== systemFight.WEAPON) {
            this.updateWeaponAttr(attrDatas);
        }

        //皮肤
        let skinAttrs = GIns.heroMgr.getSkinAttrs();
        if (skinAttrs) {
            for (let attr of skinAttrs) {
                attrDatas.push(attr);
            }
        }
        // this.updateSkinAttr(attrDatas);

        //星灵
        if (systemType !== systemFight.PET) {
            GIns.petCfgMgr.getLVStageAttr(attrDatas);

            //星灵羁绊
            GIns.petModel.petGroupContext.getGroupAttr(attrDatas);
        }
        let attrstemp = [];
        //收藏品
        if (systemType !== systemFight.COLLECTIONS) {
            for (let v of GIns.collectionsModel.context.getMergedAddAttrDataArray()) {
                if (v.unitEffectiveType && v.unitEffectiveType != ServerEnums.TalentEffectType[this.heroCfg.attackRange] && v.unitEffectiveType != ServerEnums.TalentEffectType[this.heroCfg.career]) {
                    continue;
                }
                attrDatas.push(v);
                attrstemp.push(v);
            }
        }

        // 英雄潜能
        const dnaData = this.getDNAInfo();
        if (dnaData && dnaData.awaken) {
            for (const index in dnaData.awaken) {
                const info = dnaData.awaken[index];
                if (!info || !info.attrs || !info.attrs[0]) {
                    continue;
                }
                let attrId = AttrEnum[info.attrs[0].k] as Attribute;
                let data = AttrManager.ins().convertDataFormat(attrId, info.attrs[0].v);
                attrDatas.push(data);
            }
        }

        // 其他全局加成
        const otherModuleProvideAttrDataArray = AttrManager.ins().getOtherModuleProvideGlobalAttrDataArray();
        attrDatas.push(...otherModuleProvideAttrDataArray);

        let num = 0;
        for (let attr of attrDatas) {
            if (
                attr.unitEffectiveType &&
                attr.unitEffectiveType != ServerEnums.TalentEffectType[this.heroCfg.attackRange] &&
                attr.unitEffectiveType != ServerEnums.TalentEffectType[this.heroCfg.career]
            ) {
                continue;
            }

            if (attr.id == Attribute.ATK_ADD && type == AttrType.Attack) {
                num += attr.num;
            } else if (attr.id == Attribute.DEF_ADD && type == AttrType.Defense) {
                num += attr.num;
            } else if (attr.id == Attribute.HP_ADD && type == AttrType.Blood) {
                num += attr.num;
            }
        }
        return num;
    }

    /** 获取所有百分比加成属性 */
    public allPercentagesAttrs(type: AttrType, systemType?: systemFight) {
        const allAttrDataArray: AttrData[] = [];
        /** -----------------百分比属性加成模块（确定没有百分比属性加成的可以不加在这里）----------------------- */

        //英雄所有技能属性
        let skillAttrs = this.getHeroAllSkillAttr();
        if (skillAttrs) {
            for (let attr of skillAttrs) {
                allAttrDataArray.push(attr);
            }
        }

        //魔方
        if (this.magicCubeVo) {
            for (let attr of this.magicCubeVo.getAttr()) {
                if (attr) {
                    allAttrDataArray.push(attr);
                }
            }
        }

        //装备
        let attrs = [];
        if (systemType !== systemFight.EQUIP) {
            attrs = EquipManager.ins().allEquipAttrs;
            for (let attr of attrs) {
                if (attr) {
                    allAttrDataArray.push(attr);
                }
            }
        }

        //专武
        if (systemType !== systemFight.WEAPON) {
            this.updateWeaponAttr(allAttrDataArray);
        }

        //皮肤
        let skinAttrs = GIns.heroMgr.getSkinAttrs();
        if (skinAttrs) {
            for (let attr of skinAttrs) {
                allAttrDataArray.push(attr);
            }
        }
        // this.updateSkinAttr(attrDatas);

        //星灵
        if (systemType !== systemFight.PET) {
            GIns.petCfgMgr.getLVStageAttr(allAttrDataArray);

            //星灵羁绊
            GIns.petModel.petGroupContext.getGroupAttr(allAttrDataArray);
        }

        let attrstemp = [];
        //收藏品
        if (systemType !== systemFight.COLLECTIONS) {
            for (let v of GIns.collectionsModel.context.getMergedAddAttrDataArray()) {
                if (v.unitEffectiveType && v.unitEffectiveType != ServerEnums.TalentEffectType[this.heroCfg.attackRange] && v.unitEffectiveType != ServerEnums.TalentEffectType[this.heroCfg.career]) {
                    continue;
                }
                allAttrDataArray.push(v);
                attrstemp.push(v);
            }
        }

        // 英雄潜能
        const dnaData = this.getDNAInfo();
        if (dnaData && dnaData.awaken) {
            for (const index in dnaData.awaken) {
                const info = dnaData.awaken[index];
                if (!info || !info.attrs || !info.attrs[0]) {
                    continue;
                }
                let attrId = AttrEnum[info.attrs[0].k] as Attribute;
                let data = AttrManager.ins().convertDataFormat(attrId, info.attrs[0].v);
                allAttrDataArray.push(data);
            }
        }

        // 其他全局加成
        const otherModuleProvideAttrDataArray = AttrManager.ins().getOtherModuleProvideGlobalAttrDataArray();
        // for (let attr of otherModuleProvideAttrDataArray) {
        //     if (
        //         attr.unitEffectiveType &&
        //         attr.unitEffectiveType != ServerEnums.TalentEffectType[this.heroCfg.attackRange] &&
        //         attr.unitEffectiveType != ServerEnums.TalentEffectType[this.heroCfg.career]
        //     ) {
        //         continue;
        //     }
        //     allAttrDataArray.push(attr);
        // }
        allAttrDataArray.push(...otherModuleProvideAttrDataArray);

        let num = 0;
        for (let attr of allAttrDataArray) {
            if (
                attr.unitEffectiveType &&
                attr.unitEffectiveType != ServerEnums.TalentEffectType[this.heroCfg.attackRange] &&
                attr.unitEffectiveType != ServerEnums.TalentEffectType[this.heroCfg.career]
            ) {
                continue;
            }

            if (attr.id == Attribute.ATK_BONUS && type == AttrType.Attack) {
                num += attr.num;
            } else if (attr.id == Attribute.DEF_BONUS && type == AttrType.Defense) {
                num += attr.num;
            } else if (attr.id == Attribute.HP_BONUS && type == AttrType.Blood) {
                num += attr.num;
            }
        }
        return num / 10000;
    }

    /** 获取所有职业模板修正属性 (目前只有英雄有) */
    public careerMod(type: AttrType, systemType?: systemFight) {
        const allAttrDataArray: AttrData[] = [];
        //英雄初始二级属性
        if (this.heroCfg.baseSecondAttrs) {
            for (let attr of this.heroCfg.baseSecondAttrs) {
                let data = AttrManager.ins().convertDataFormat(attr.k, attr.v);
                allAttrDataArray.push(data);
            }
        }

        let num = 0;
        for (let attr of allAttrDataArray) {
            if (
                attr.unitEffectiveType &&
                attr.unitEffectiveType != ServerEnums.TalentEffectType[this.heroCfg.attackRange] &&
                attr.unitEffectiveType != ServerEnums.TalentEffectType[this.heroCfg.career]
            ) {
                continue;
            }

            if (attr.id == Attribute.ATK_ADD_MOD && type == AttrType.Attack) {
                num += attr.num;
            } else if (attr.id == Attribute.DEF_ADD_MOD && type == AttrType.Defense) {
                num += attr.num;
            } else if (attr.id == Attribute.HP_ADD_MOD && type == AttrType.Blood) {
                num += attr.num;
            }
        }
        return num / 10000;
    }

    /**更新专武属性*/
    public updateWeaponAttr(list: AttrData[]): AttrData[] {
        let weaponVo = WeaponManager.ins().getWeaponForHero(this.baseId);
        if (weaponVo) {
            for (let attr of weaponVo.attrs) {
                if (attr) {
                    list.push(attr);
                }
            }
        }
        return list;
    }

    /**更新皮肤属性*/
    // protected updateSkinAttr(list: AttrData[]): AttrData[] {
    //     let maxCfg: table.hero.HeroSkinConfig = null;
    //     this.heroVoData.heroSkinIds?.forEach((skinId: number) => {
    //         let cfg = G.TableManager.getDataById(table.hero.HeroSkinConfig, skinId);
    //         if ((cfg && maxCfg == null) || maxCfg.priority < cfg.priority) {
    //             maxCfg = cfg;
    //         }
    //     });
    //     if (maxCfg) {
    //         maxCfg.attrs?.forEach((value) => {
    //             list.push(AttrData.create(value.k, value.v));
    //         });
    //     }
    //     return list;
    // }
}

export class HeroVoDate {
    /** 英雄唯一ID */
    public id: number;

    /** 英雄配置ID */
    public baseId: number;

    /** 碎片数量 */
    public fragment: number;

    /** 英雄星级 */
    public star: number;

    /** 是否激活 */
    public isActivate: boolean;

    // 是否可以使用 | default true
    isCanUse?: boolean;
    /**玩家已获得的皮肤id */
    public heroSkinIds?: number[];

    /**当前使用的皮肤Id */
    public useSkinId?: number;

    /** 英雄潜能信息 */
    public heroDNA?: Vo.hero.HeroDnaVo;
}

export class HeroSkillData {
    /** 技能槽位id */
    public slotId: number;
    /** 技能组id */
    public groupId: string;
    /** 对应技能组id中所有的技能id */
    public ids: any[];
    /** 是否解锁 */
    public unlock: boolean;
    /** 是否是必杀技 */
    public isUltimateSkill: boolean;
    /** 等级 */
    public level: number;
    /** 1级的config */
    public cfg: table.battle.SkillConfig;
    /** 当前等级的config(可选 有可能没有赋值) */
    public curCfg?: table.battle.SkillConfig;
}

export class HeroSelectData {
    key: HeroSelectKey;
    campType?: HeroCampType;
    careerType?: ServerEnums.Career;
}

import BaseSingleton from "../../../core/base/BaseSingleton";
import { TableManager } from "../../../core/table/TableManager";
import { FormationManager } from "../formation/FormationManager";
import { HeroManager } from "../hero/HeroManager";
import { Attribute, AttributeType, AttrType } from "./AttrEnum";
import ObjectUtils from "../../../core/utils/ObjectUtils";
import { systemFight } from "../fight/FightManager";
import { IModuleAttrApi } from "db://assets/scripts/game/modules/attr/api/IModuleAttrApi";
import { TalentManager } from "db://assets/scripts/game/modules/talent/TalentManager";
import { CaptainSkillManager } from "db://assets/scripts/game/modules/captainSkill/CaptainSkillManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { LeagueManager } from "../league/leagueManager";
import { AttrConfigManager } from "db://assets/scripts/game/modules/attr/config/AttrConfigManager";
import { SettingsManager } from "db://assets/scripts/game/modules/settings/SettingsManager";

/** 属性 */
export class AttrManager extends BaseSingleton {
    /**
     * 提供全局属性的其他模块
     * TODO 其他模块提供了全局属性加成后, 接入到这里
     */
    getOtherAttrModuleApiArray(): IModuleAttrApi[] {
        return [
            // 天赋
            TalentManager.ins(),
            // 战队科技
            CaptainSkillManager.ins(),
            //联盟模块
            LeagueManager.ins(),
            SettingsManager.ins(),
        ];
    }

    /**
     * 获取其他模块, 全局加成的属性
     */
    getOtherModuleProvideGlobalAttrDataArray(): AttrData[] {
        const array = new Array<AttrData>();
        const otherAttrModuleApiArray = this.getOtherAttrModuleApiArray();
        for (let iModuleAttrApi of otherAttrModuleApiArray) {
            const otherAttrArray = iModuleAttrApi.getMergedAllAddAttrDataArray();
            for (let attrData of otherAttrArray) {
                const attrId = attrData.id;
                const attributeConfig = AttrConfigManager.getConfigById(attrId);
                attrData.type = attributeConfig?.type || null;
            }
            array.push(...otherAttrArray);
        }
        return array;
    }

    /** 属性名 */
    public getAttrName(type: number) {
        let name = "";
        switch (type) {
            case AttrType.Attack:
                name = "攻击";
                break;
            case AttrType.Blood:
                name = "血量";
                break;
            case AttrType.Defense:
                name = "防御";
                break;
        }
        return name;
    }

    public getAttrNameByType(str: string) {
        let name = "";
        let cfg = TableManager.getDataById(table.battle.AttributeConfig, str);
        if (cfg) name = cfg.attrName;
        return name;
    }

    /** 属性图标 */
    public getAttrIcon(type: number) {
        let icon = "";
        switch (type) {
            case AttrType.Attack:
                icon = "ui://38fa8c75dtss5g";
                break;
            case AttrType.Blood:
                icon = "ui://38fa8c75dtss5i";
                break;
            case AttrType.Defense:
                icon = "ui://38fa8c75dtss5f";
                break;
        }
        return icon;
    }

    /**
     *
     * 攻击、防御、生命的基础属性计算
     * 基础属性 = （初始值 + 成长值 * （等级 + 升阶份额 + 升星份额））*  (1 + 升阶修正) * (1 + 升星修正)
     * 升阶份额、升星份额、升阶修正、升星修正取不到值时取0
     * @param heroId 英雄id
     * @param type 属性类型
     * @param setLv 英雄等级（不填则按英雄当前等级取）
     * @param setStage 英雄等阶（不填则按英雄当前等阶取）
     * @param setStar 英雄星级（不填则按英雄当前星级取）
     * @returns
     */
    public calculateBaseAttrNum(heroId: number, type: AttrType, setLv?: number, setStage?: number, setStar?: number): number {
        if (!heroId) return;
        if (!type) return;
        let baseNum = 0; //初始值
        let growthNum = 0; //成长值
        let level = 0; //等级
        let stage = 0; //等阶
        let star = 0; //星级
        let stageAttrBonus = 0; //升阶份额
        let stageAttrModifier = 0; //升阶修正(万分比)
        let starAttrBonus = 0; //升星份额
        let starAttrModifier = 0; //升星修正(万分比)

        let heroVo = HeroManager.ins().getHeroVoByID(heroId);
        let posVo = FormationManager.ins().getPosVoById(heroVo.posId);

        //可能会出现当前1阶，但是需要计算0阶的属性（升阶成功中有用到）
        if (!setStage && setStage != 0) {
            stage = posVo ? posVo.stage : FormationManager.ins().getCommonStage();
        } else {
            stage = setStage;
        }
        // stage = setStage?setStage:(posVo?posVo.stage:FormationManager.ins().getCommonStage());
        level = setLv ? setLv : posVo ? posVo.level : FormationManager.ins().getCommonLevel();
        star = setStar ? setStar : heroVo.star;

        let stageCfg = TableManager.getDataById(table.hero.HeroStageConfig, stage);
        let starCfg = heroVo.getHeroStarCfg(star);

        stageAttrBonus = stageCfg ? stageCfg.attrBonus || 0 : 0;
        stageAttrModifier = stageCfg ? stageCfg.attrModifier / 10000 || 0 : 0;
        starAttrBonus = starCfg ? starCfg.attrBonus || 0 : 0;
        starAttrModifier = starCfg ? starCfg.attrModifier / 10000 || 0 : 0;

        switch (type) {
            case AttrType.Attack:
                baseNum = heroVo.heroCfg.atk;
                growthNum = heroVo.heroCfg.atkGrowth / 100;
                break;
            case AttrType.Blood:
                baseNum = heroVo.heroCfg.hp;
                growthNum = heroVo.heroCfg.hpGrowth / 100;
                break;
            case AttrType.Defense:
                baseNum = heroVo.heroCfg.def;
                growthNum = heroVo.heroCfg.defGrowth / 100;
                break;
        }

        //基础属性 = （初始值 + 成长值 * （等级 + 升阶份额 + 升星份额））* (1 + 升阶修正) * (1 + 升星修正)
        let num = (baseNum + growthNum * (level + stageAttrBonus + starAttrBonus)) * (1 + stageAttrModifier) * (1 + starAttrModifier);
        return Math.round(num);
    }

    /**
     * 获取英雄面板属性（培养界面展示）
     * 面板属性 = 基础属性 * （ 1 + 百分比加成 ）+ 额外属性                                旧的
     * 面板属性 = 基础属性 * （ 1 + 百分比加成 ）+ 额外属性 * ( 1 + 职业模板修正)           新的
     * 额外属性：装备、技能加成属性
     * @param heroId 英雄id
     * @param type 属性类型
     * @param setLv 英雄等级（不填则按英雄当前等级取）
     * @param setStage 英雄等阶（不填则按英雄当前等阶取）
     * @param setStar 英雄星级（不填则按英雄当前星级取）
     * @param systemType 不计算某一模块战力，不传则计算总战力
     */
    public getPanelAttrByHeroId(heroId: number, type: AttrType, setLv?: number, setStage?: number, setStar?: number, systemType?: systemFight) {
        if (!heroId) return;
        if (!type) return;
        let baseNum = this.calculateBaseAttrNum(heroId, type, setLv, setStage, setStar); //基础属性
        let heroVo = HeroManager.ins().getHeroVoByID(heroId);
        let add = heroVo.allPercentagesAttrs(type, systemType); //百分比加成
        let extraAttr = heroVo.allExtraAttrs(type, systemType); //额外属性
        let mod = heroVo.careerMod(type, systemType);

        //面板属性 = 基础属性 * （ 1 + 百分比加成 ）+ 额外属性 * ( 1 + 职业模板修正)
        let num = baseNum * (1 + add) + extraAttr * (1 + mod);
        return Math.round(num);
    }

    /**
     * 转换成AttrData格式
     * @param type Attributele 类型
     * @param num  总数
     */
    public convertDataFormat(type: Attribute, num: number): AttrData {
        if (!type) {
            return;
        }
        let cfg = TableManager.getDataById(table.battle.AttributeConfig, type);
        return {
            id: type,
            type: cfg.type,
            num: num,
            worth: cfg.cpWorth,
            mod: cfg.cpMod,
        } as AttrData;
    }

    /**  */
    /**
     * 合并同类型属性，并且不改变原来的数组。
     * @param aray 源属性数组
     * @returns 返回合并后的数组的拷贝
     */
    public mergeAttrDataArray(array: AttrData[]): AttrData[] {
        let map = new Map<Attribute, AttrData>();
        for (let attrData of array) {
            let id = attrData.id;
            let attrData2 = map.get(id);
            if (attrData2) {
                attrData2.num += attrData.num;
            } else {
                attrData2 = AttrData.create2(id, attrData.num, attrData.unitEffectiveType);
                map.set(id, attrData2);
            }
        }
        return Array.from(map.values());
    }
}

/** 属性data */
export class AttrData {
    /** id, AttributeConfig的id列 */
    private _id: Attribute;
    public get id(): Attribute {
        return this._id;
    }
    public set id(value: Attribute) {
        this._id = value;
        this.cfg = TableManager.getDataById(table.battle.AttributeConfig, value);
        if (this.cfg) {
            this.worth = this.cfg.cpWorth;
            this.mod = this.cfg.cpMod;
        }
    }
    /** 类型 */
    type: AttributeType;
    /** 总值 */
    num: number;
    /** 战力系数 */
    worth: number;
    /** 战力修正 */
    mod: number;
    // 单位生效类型 | null = 所有人都生效 | TODO 等后端增加枚举
    unitEffectiveType?: ServerEnums.Career | ServerEnums.TalentEffectType | ServerEnums.CollectiblesEffectType | null = null;

    cfg?: table.battle.AttributeConfig;

    /**
     * 从 Excel 配置表中创建 AttrData 数组
     * @param kvArray 策划配置
     * @param unitEffectiveType 单位生效类型
     * @returns AttrData[]
     */
    static fromTableConfig(
        kvArray: Array<{ k: any; v: any }>,
        unitEffectiveType: ServerEnums.Career | ServerEnums.TalentEffectType | ServerEnums.CollectiblesEffectType | null = null
    ): Array<AttrData> {
        if (!kvArray) {
            return [];
        }

        return kvArray
            .toDataStream()
            .map((it) => {
                if (!it) {
                    return null;
                }

                // k,v 安全检查
                let k: Attribute = it.k as Attribute;
                let v = it.v;
                if (!k || !v) {
                    return null;
                }
                if (!ObjectUtils.isNumber(v)) {
                    return null;
                }

                const attributeConfig = AttrConfigManager.getConfigById(k);
                if (!attributeConfig) {
                    return null;
                }
                // 数值
                const num = v as number;

                // 属性
                let attrData = new AttrData();
                attrData.id = k;
                attrData.type = attributeConfig.type;
                attrData.num = num;
                attrData.unitEffectiveType = unitEffectiveType;
                attrData.worth = attributeConfig.cpWorth;
                attrData.mod = attributeConfig.cpMod;

                return attrData;
            })
            .filterNotNull()
            .toArray();
    }
    //跟上面的一样，区别就是不用DataSteam
    static fromTableConfig2(
        kvArray: Array<{ k: any; v: any }>,
        unitEffectiveType: ServerEnums.Career | ServerEnums.TalentEffectType | ServerEnums.CollectiblesEffectType | null = null
    ): Array<AttrData> {
        let attrDataArr: Array<AttrData> = [];
        if (!kvArray) {
            return attrDataArr;
        }

        let len = kvArray.length;
        for (let i = 0; i < len; ++i) {
            let kv = kvArray[i];

            // k,v 安全检查
            let k: Attribute = kv.k as Attribute;
            let v = kv.v;
            const attributeConfig = AttrConfigManager.getConfigById(k);
            if (attributeConfig) {
                // 数值
                const num = v as number;

                // 属性
                let attrData = new AttrData();
                attrData.id = k;
                attrData.type = attributeConfig.type;
                attrData.num = num;
                attrData.unitEffectiveType = unitEffectiveType;
                attrData.worth = attributeConfig.cpWorth;
                attrData.mod = attributeConfig.cpMod;

                attrDataArr.push(attrData);
            }
        }

        return attrDataArr;
    }

    static create(attrId: Attribute, num: number) {
        const attrData = new AttrData();
        attrData.id = attrId;
        attrData.num = num;
        const attributeConfig = AttrConfigManager.getConfigById(attrId);
        attrData.type = attributeConfig?.type;
        return attrData;
    }

    static create2(attrId: Attribute, num: number, unitEffectiveType: ServerEnums.Career | ServerEnums.TalentEffectType | ServerEnums.CollectiblesEffectType | null = null) {
        let attrData: AttrData;
        const attributeConfig = AttrConfigManager.getConfigById(attrId);
        if (attributeConfig) {
            attrData = new AttrData();
            attrData.id = attrId as Attribute;
            attrData.type = attributeConfig.type;
            attrData.num = num;
            attrData.unitEffectiveType = unitEffectiveType;
            attrData.worth = attributeConfig.cpWorth;
            attrData.mod = attributeConfig.cpMod;
        }
        return attrData;
    }

    /**
     * 合并两个属性, new 新对象, 避免改动原有对象
     * @param v1
     * @param v2
     */
    static merge(v1: AttrData, v2: AttrData): AttrData {
        const newData = new AttrData();
        // 只和并两个基础属性
        newData.id = v1.id;
        newData.num = 0;
        if (v1) {
            newData.num += v1.num;
        }
        if (v2) {
            if (v2.id === v1.id) {
                newData.num += v2.num;
            }
        }

        newData.unitEffectiveType = v1.unitEffectiveType;

        return newData;
    }
}

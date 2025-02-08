import { Vec2 } from "cc";
import { TableManager } from "db://assets/scripts/core/table/TableManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { AttrData, AttrManager } from "../../attr/AttrManager";
import { Attribute, AttrType } from "../../attr/AttrEnum";
import { AttrConfigManager } from "../../attr/config/AttrConfigManager";
import GIns from "../../../GIns";

export class HeroConfigManager {
    private static _scaleForHeroModel: number = 1;

    static init() {
        const array = JSON.parse(TableManager.getDataById(table.hero.HeroConstantConfig, "HERO:CLIENT_MODEL_SCALE")
            .content || "[]"
        );
        this._scaleForHeroModel = array[0] || 0;
    }


    static get scaleForHeroModel(): number {
        return this._scaleForHeroModel;
    }

    static getAllHeroItemIdArray() {
        return TableManager.getAllData(table.item.ItemConfig)
            .filter(it => ServerEnums.ItemType[it.type] == ServerEnums.ItemType.HERO_CARD)
            .map(it => it.id);
    }

    static getConfigById(heroId: number) {
        return TableManager.getDataById(table.hero.HeroConfig, heroId);
    }

    static getHeroFragmentItemConfigByHeroId(heroId: number) {
        const heroConfig = this.getConfigById(heroId);
        if (!heroConfig) {
            return null;
        }
        return TableManager.getDataById(table.item.ItemConfig, heroConfig.fragmentItemId);
        
    }

    /**
     * 根据阶段和等级获取DNA升级配置
     */
    static getDNAConfig(stage: number, level: number) {
        const config = TableManager.getAllData(table.hero.HeroDnaConfig).find(cfg => cfg.stage === stage && cfg.level === level);
        if (!config) {
            console.warn(`未找到阶段${stage}，等级${level}的配置`);
            return null;
        }
        return config;
    }

    /**
     * 根据DNA升级配置属性
     */
    static getConfigAttr(stage: number, level: number){
        const config = this.getDNAConfig(stage, level);
        if (!config || !config.baseUpAttrs) {
            return null;
        }
        // 解析属性
        let attributes: AttrData[] = [];
        for (let attr of config.baseUpAttrs) {
            let data = AttrManager.ins().convertDataFormat(attr.k as Attribute, attr.v);
            attributes.push(data);
        }
        attributes = GIns.attrMgr.mergeAttrDataArray(attributes);
        return attributes;
    }

    /**
     * 获取觉醒和刷新配置
     */
    static getAwakenConfig(baseId: number, stage: number){
        const config = TableManager.getAllData(table.hero.HeroDnaAwakenConfig).find(cfg=> cfg.heroId === baseId && cfg.stage === stage);
        if (!config) {
            console.warn(`未找到heroId${baseId}，阶段${stage}的配置`);
            return null;
        }
        return config;
    }

    /**
     * 获取英雄的全阶段属性池
     */
    static getHeroAttributesById(heroId) {
        let poolMap = {};
        TableManager.getAllData(table.hero.HeroDnaAwakenPoolConfig).forEach((item) => {
            if (!poolMap[item.poolId]) {
                poolMap[item.poolId] = [];
            }
            poolMap[item.poolId].push({item});
        });

        const heroStages = TableManager.getAllData(table.hero.HeroDnaAwakenConfig).filter((item) => item.heroId === heroId);

        // stage -> 属性池的映射
        const stageMap = {};
        heroStages.forEach((item) => {
            const attributes = poolMap[item.poolId] || [];
            stageMap[item.stage] = attributes
                .map((attr) => ({
                    ...attr,
                    rangeValue: item.rangeValue,
                    attrConversion: item.attrConversion,
                }))
                .sort((a, b) => b.weight - a.weight); // 按 weight 降序排序
        });

        return stageMap;
    }
}
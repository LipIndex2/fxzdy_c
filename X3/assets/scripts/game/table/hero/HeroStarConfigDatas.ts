import { BaseTableManager } from "../BaseTabeManager";

export class HeroStarConfigDatas extends BaseTableManager<table.hero.HeroStarConfig> {
    private map: { [quality: number]: { [star: number]: table.hero.HeroStarConfig } };
    private mapStars: { [quality: number]: table.hero.HeroStarConfig[] };

    private mapSkillLevel: { [quality_star_skilPos: string]: number };

    /***根据当前技能位置和等级，获取需要的星级 */
    private skillPosLevelNeedStarMap: { [quality_star_skilPos: string]: number };
    /***根据当前技能位置，获取解锁需要的星级 */
    private skillPosLevelUnlockStarMap: { [quality_skilPos: string]: number };

    constructor() {
        super(table.hero.HeroStarConfig);
    }

    init() {
        if (!this.map) {
            this.map = {};
            this.mapStars = {};
            this.mapSkillLevel = {};
            this.skillPosLevelNeedStarMap = {};
            this.skillPosLevelUnlockStarMap = {};

            let skillMap = {};
            let curQuality = 0;
            let configs = this.getAllData();
            for (let i = 0, len = configs.length; i < len; ++i) {
                let config = configs[i];
                if (!this.map[config.quality]) {
                    this.map[config.quality] = {};
                    this.mapStars[config.quality] = [];
                }

                this.map[config.quality][config.star] = config;
                this.mapStars[config.quality].push(config);

                if (curQuality != config.quality) {
                    curQuality = config.quality;
                    skillMap = {};
                }

                for (let j = 0; j < config.skillPosLevelContent.length; j++) {
                    this.mapSkillLevel[config.quality + "_" + config.star + "_" + config.skillPosLevelContent[j].k] = config.skillPosLevelContent[j].v;
                    let needStarKey: string = config.quality + "_" + config.skillPosLevelContent[j].v + "_" + config.skillPosLevelContent[j].k;
                    if (this.skillPosLevelNeedStarMap[needStarKey] == undefined || this.skillPosLevelNeedStarMap[needStarKey] > config.star) {
                        this.skillPosLevelNeedStarMap[needStarKey] = config.star;
                    }
                    let unlockKey: string = config.quality + "_" + config.skillPosLevelContent[j].k;
                    if (this.skillPosLevelUnlockStarMap[unlockKey] == undefined || this.skillPosLevelUnlockStarMap[unlockKey] > config.star) {
                        this.skillPosLevelUnlockStarMap[unlockKey] = config.star;
                    }
                }



                // if (config.skillPos) {
                //     skillMap[config.skillPos] = config.skillLevel;
                //     for (const skillPos in skillMap) {
                //         this.mapSkillLevel[config.quality + "_" + config.star + "_" + skillPos] = skillMap[skillPos];
                //     }
                // }
            }
        }
    }

    getConfigsByQuality(quality: number) {
        if (!this.map) {
            this.init();
        }
        return this.mapStars[quality];
    }

    /**
     * 根据品质获取该品质最高星级配置
     * @param quality - 品质等级
     * @returns 返回指定品质的最高星级配置
     */
    getMaxStarConfigInQuality(quality: number) {
        if (!this.map) {
            this.init();
        }
        let len = this.mapStars[quality].length;
        return this.mapStars[quality][len - 1];
    }

    /**
     * 根据品质和星级获取英雄星级配置信息。
     * @param quality - 英雄的品质。
     * @param star - 英雄的星级。
     * @returns 返回对应品质和星级的英雄星级配置。
     */
    getConfigByQualityStar(quality: number, star: number) {
        if (!this.map) {
            this.init();
        }
        return this.map[quality]?.[star];
    }

    /**
     * 根据英雄的品质、星级和技能位置获取技能等级。
     * @param quality 英雄品质
     * @param star 英雄星级
     * @param skillPos 技能位置
     * @returns 技能等级，默认最低1级
     */
    getSkillLevel(quality: number, star: number, skillPos: number) {
        if (!this.map) {
            this.init();
        }
        if (skillPos == 0)
            return 1
        return this.mapSkillLevel[quality + "_" + star + "_" + skillPos] || 0;
    }

    /***根据当前技能位置和等级，获取需要的星级 */
    getSkillNeedStarByLvAndPos(quality: number, level: number, skillPos: number): number {
        if (!this.map) {
            this.init();
        }

        return this.skillPosLevelNeedStarMap[quality + "_" + level + "_" + skillPos] || 1;
    }

    /***根据当前技能位置和等级，获取需要的星级 */
    getSkillUnlockStarByPos(quality: number, skillPos: number): number {
        if (!this.map) {
            this.init();
        }

        return this.skillPosLevelUnlockStarMap[quality + "_" + skillPos] || 1;
    }
}
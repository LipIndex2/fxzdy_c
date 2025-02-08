import G from "db://assets/scripts/core/comm/G";


export class HeroUtils {

    /**
     * 获取英雄配置
     * @param heroId
     */
    static getHeroConfigById(heroId: number): table.hero.HeroConfig | null {
        return G.TableManager.getDataById(table.hero.HeroConfig, heroId)
    }

    /**
     * 获取英雄皮肤配置
     * @param heroId
     */
    static getHeroSkinConfigById(heroId: number): table.hero.HeroSkinConfig | null {
        return G.TableManager.getDataById(table.hero.HeroSkinConfig, heroId)
    }

    /**
     * 获得对应英雄的对应皮肤下的显示参数
     * @param heroId 英雄基础id-对应的heroConfig的唯一id
     * @param skinId 英雄的皮肤id - 对用的heroSkinConfig的唯一id
     * @param type 对应的显示字段，现在只配置有modelId:小模型id，showModelId:界面显示模型id，headPath:头像id
     */
    static getShowTypeById(heroId: number, skinId, type: "modelId" | "showModelId" | "headPath"): string | number {
        if (skinId) {
            return this.getHeroSkinConfigById(skinId)[type];
        } else {
            return this.getHeroConfigById(heroId)[type];
        }
    }

    /**
     * 英雄战斗品质底图 by heroId
     * @param heroId 英雄id
     */
    static getQualityConfigByHeroId(heroId: number): table.quality.QualityConfig | null {
        const heroConfig = HeroUtils.getHeroConfigById(heroId)
        if (!heroConfig) {
            return null
        }
        let quality = heroConfig.quality;
        let dataById = G.TableManager.getDataById(table.quality.QualityConfig, quality);
        if (!dataById) {
            console.error(`not found hero quality config. heroId = ${heroId}, quality = ${quality}`);
            return null;
        }
        return dataById;
    }

    /**
     * 所有 hero config
     */
    static getAllHeroConfigArray(): table.hero.HeroConfig[] {
        return G.TableManager.getAllData(table.hero.HeroConfig);
    }

    /**
     * 种族
     * @param heroId
     */
    static getRaceByHeroId(heroId: number): table.hero.HeroRaceConfig | null {
        const heroConfig = HeroUtils.getHeroConfigById(heroId)
        if (!heroConfig) {
            return null
        }
        const camp = heroConfig.camp;
        return G.TableManager.getDataById(table.hero.HeroRaceConfig, camp);
    }

    /**
     * 职业
     * @param heroId
     */
    static getCareerByHeroId(heroId: number): table.hero.HeroClassConfig | null {
        const heroConfig = HeroUtils.getHeroConfigById(heroId)
        if (!heroConfig) {
            return null
        }
        return G.TableManager.getDataById(table.hero.HeroClassConfig, heroConfig.career);
    }

    /**
     * 显示的星星
     * @param starCount
     */
    static getShowStarCount(starCount: number): number {
        const cycCount = starCount % 5;
        return cycCount == 0 ? 5 : cycCount;
    }

    // static skinRedList: Array<Boolean> = null;

    // static setSkinRed(id, isRed) {
    //     if (!this.skinRedList) {
    //         this.skinRedList = LocalStorageUtils.get("skinRedList", Array<Boolean>);
    //     }
    //     this.skinRedList[id] = isRed;
    //     LocalStorageUtils.set("skinRedList", this.skinRedList);
    // }

    // static getSkinRed(id) {
    //     if (!this.skinRedList) {
    //         this.skinRedList = LocalStorageUtils.get("skinRedList", Array<Boolean>);
    //     }
    //     return this.skinRedList[id];
    // }
}
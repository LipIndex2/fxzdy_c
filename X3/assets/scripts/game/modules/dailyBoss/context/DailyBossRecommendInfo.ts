import G from "../../../../core/comm/G";
import GIns from "../../../GIns";
import { DailyBossConfigManager } from "../config/DailBossConfigManager";
import { DailiesI18nKeys } from "../DailyBossI18nKeys";
import { IHeroHeadData } from "../interface/IHeroHeadData";

export class DailyBossRecommendInfo {
    public name: string;
    /***0是基础阵容，1是进阶阵容,2是玩家 */
    public type: number = 0;
    public totalHurt: number = 0;

    public heroIdStr: string = "";
    public heroList: IHeroHeadData[] = [];

    public bossType: number = 0;

    public playerInfo: Vo.player.PlayerBaseVo
    public statisticsVos: Vo.battle.UnitStatisticsBaseVo[];
    public defendStatisticsVos: Vo.battle.UnitStatisticsBaseVo[];
    public difficulty: number;

    public bossCfg: table.dailyboss.DailyBossConfig

    public constructor (bossType: number) {
        this.bossType = bossType;
    }

    public setDataByCfg(heros: number[], type: number): void {
        this.type = type;
        if (type == 0) {
            //基础
            this.name = G.I18nManager.lang(DailiesI18nKeys.DailiesI18nKeys1)
        }
        else {
            //进阶
            this.name = G.I18nManager.lang(DailiesI18nKeys.DailiesI18nKeys2)
        }

        let stageCfgs = G.TableManager.getAllData(table.hero.HeroStageConfig)
        // let levelCfgs = G.TableManager.getAllData(table.hero.HeroLevelConfig)
        for (let i = 0; i < heros.length; i++) {
            this.heroIdStr += heros[i] + ","
            let heroData = {
                heroId: heros[i],
                star: GIns.heroMgr.getHeroMaxStar(heros[i]),
                stage: stageCfgs[stageCfgs.length - 1].id,
                lv: 0
            } as IHeroHeadData
            this.heroList.push(heroData)
        }
        this.heroIdStr = this.heroIdStr.slice(0, this.heroIdStr.length - 1)
        this.totalHurt = 0;
    }

    public setData(data: Vo.dailyboss.DailyBossFormationRankItemVo): void {
        this.type = 2;
        this.name = data.baseVo.name;
        this.difficulty = data.difficulty;
        this.statisticsVos = data.statisticsVos;
        this.defendStatisticsVos = data.defendStatisticsVos
        this.playerInfo = data.baseVo;
        this.totalHurt = data.value;

        this.bossCfg = DailyBossConfigManager.getBossConfig(this.bossType, data.difficulty)

        for (let i = 0; i < data.formationVisitVo.positionVisitVos.length; i++) {
            let heroVo = data.formationVisitVo.positionVisitVos[i];
            this.heroIdStr += heroVo.heroBaseId + ","
            let heroData = {
                heroId: heroVo.heroBaseId,
                star: heroVo.star,
                stage: heroVo.heroStage,
                lv: heroVo.heroLevel
            } as IHeroHeadData
            this.heroList.push(heroData)
        }
        this.heroIdStr = this.heroIdStr.slice(0, this.heroIdStr.length - 1)
    }
}
import { TableManager } from "db://assets/scripts/core/table/TableManager";

// 种族
export class RaceConfigManager {

    static getConfigById(raceId: number): table.hero.HeroRaceConfig | null {
        return TableManager.getDataById(table.hero.HeroRaceConfig, raceId);
    }

    static getLogoPathByRaceType(raceType: number): string {
        return this.getConfigById(raceType)?.assetPath || "";
    }
}
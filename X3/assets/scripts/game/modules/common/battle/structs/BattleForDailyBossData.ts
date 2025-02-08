export class BattleForDailyBossData {
    
    bossType: number = 0;
    hardId: number = 0;
    damageValue: number = 0;
    
    static create(
        bossType: number,
        hardId: number
    ): BattleForDailyBossData {
        const data = new BattleForDailyBossData();
        data.bossType = bossType;
        data.hardId = hardId;
        return data;
    }
    
}
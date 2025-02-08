
export class SeasonBossBattleResultViewOpenArgs {
    winFlag: boolean;
    rank: number;
    hurt: number;
    oldProgressRewardId: number;
    progressRewardId: number;
    isNewH: boolean;
    isNewR: boolean;
    actId:number;
    bossConfigId:number;
    simulated:boolean;

    static create(
        winFlag: boolean,
        rank: number,
        hurt: number,
        oldProgressRewardId:number,
        progressRewardId: number,
        isNewH: boolean,
        isNewR: boolean,
        actId:number,
        bossConfigId:number,
        simulated:boolean,
    ): SeasonBossBattleResultViewOpenArgs {
        const args = new SeasonBossBattleResultViewOpenArgs();
        args.winFlag = winFlag;
        args.rank = rank;
        args.hurt = hurt;
        args.oldProgressRewardId = oldProgressRewardId;
        args.progressRewardId = progressRewardId;
        args.isNewH = isNewH;
        args.isNewR = isNewR;
        args.actId = actId;
        args.bossConfigId = bossConfigId;
        args.simulated =  simulated;
        return args;
    }
}
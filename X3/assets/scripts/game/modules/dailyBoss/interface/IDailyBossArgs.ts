
export class DailyBossBattleResultViewOpenArgs {
    winFlag: boolean;
    hardId: number;
    progressValueOrHurt: number;
    isNewRecord: boolean;
    isNextHard: boolean;

    static create(
        winFlag: boolean,
        hardId: number,
        progressValue: number,
        isNewRecord: boolean,
        isNextHard: boolean,
    ): DailyBossBattleResultViewOpenArgs {
        const args = new DailyBossBattleResultViewOpenArgs();
        args.winFlag = winFlag;
        args.hardId = hardId;
        args.progressValueOrHurt = progressValue;
        args.isNewRecord = isNewRecord;
        args.isNextHard = isNextHard;

        return args;
    }
}
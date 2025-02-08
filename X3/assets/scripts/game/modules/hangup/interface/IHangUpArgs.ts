export class HangUpBattleResultFailV2ViewOpenArgs {
    // 关卡ID
    levelId: number;

    static create(levelId: number): HangUpBattleResultFailV2ViewOpenArgs {
        let args = new HangUpBattleResultFailV2ViewOpenArgs();
        args.levelId = levelId;

        return args;
    }
}

export class HangUpBattleResultWinV2ViewOpenArgs {
    // 关卡ID
    levelId: number;
    isWin: boolean = true;

    static create(levelId: number,
                  isWin: boolean,
    ): HangUpBattleResultWinV2ViewOpenArgs {
        let args = new HangUpBattleResultWinV2ViewOpenArgs();
        args.levelId = levelId;
        args.isWin = isWin
        return args;
    }
}

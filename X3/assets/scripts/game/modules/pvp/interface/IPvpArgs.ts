import { NoOwnerItem } from "../../backpack/vo/NoOwnerItem";

/**
 * 战斗结果
 */
export class PVPBattleResultViewOpenArgs {

    winFlag: boolean = false;
    rewards: Array<NoOwnerItem> = [];
    finalScore: number = 0;
    changeScore: number = 0;
    previousScore: number = 0;
    // 如果为 0 用积分算段位 | 如果 > 0 则直接不进行动画了, 无法表现
    afterRankConfigId: number = 0;

    static create(winFlag: boolean,
        rewards: Array<NoOwnerItem>,
        finalScore: number,
        changeScore: number,
        afterRankConfigId: number = 0,
    ) {
        const args = new PVPBattleResultViewOpenArgs();
        args.winFlag = winFlag;
        args.rewards = rewards;
        args.finalScore = finalScore;
        args.changeScore = changeScore;
        args.afterRankConfigId = afterRankConfigId;

        args.previousScore = finalScore - changeScore;
        return args;
    }

}
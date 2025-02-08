import { FightType } from "db://assets/scripts/game/comm/battle/enum/FightType";
import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";


export class CommonChallengeViewOpenArgs {
    // 战斗玩法
    fightType: FightType;
    subType: string = "";
    title: string;
    // 敌方战斗力
    enemyPower: number;
    battleConfigId: number;
    // 奖励
    rewards: Array<NoOwnerItem>;
    // 挑战
    challengeCallback: Function | null;
    // auto挑战
    autoChallengeCallback: Function | null;
    //其他参数
    param?: any

    static create(
        fightType: FightType,
        subType: string,
        title: string,
        enemyPower: number,
        battleConfigId: number,
        rewards: Array<NoOwnerItem>,
        challengeCallback: Function,
        autoChallengeCallback: Function | null,
        param?: any
    ): CommonChallengeViewOpenArgs {
        let args = new CommonChallengeViewOpenArgs();
        args.fightType = fightType;
        args.subType = subType;
        args.title = title || "";
        args.enemyPower = enemyPower || 0;
        args.battleConfigId = battleConfigId || 0;
        args.rewards = rewards || [];
        args.challengeCallback = challengeCallback;
        args.autoChallengeCallback = autoChallengeCallback;
        args.param = param
        return args;
    }
}

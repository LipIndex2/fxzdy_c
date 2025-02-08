import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";
import { FightType } from "../../../comm/battle/enum/FightType";

export class CommonBattleResultViewOpenArgs {
    isWin: boolean = false;
    // 是否显示下一关
    isShowNextLevel: boolean = false;
    // 奖励
    rewards: NoOwnerItem[];
    // 下一关 callback
    callbackForNextLevel: Function;
    fightType: FightType;
    // 自动下一关
    autoNextLevelInitSecond: number = 0;
    // 是否显示邮件提示
    emailTips: string = '';
    // 其他参数 每个战斗不同
    param?:any = null;

    static create(isWin: boolean,
                  isCanNextLevel: boolean,
                  noOwnerItems: Array<NoOwnerItem>,
                  nextLevelCb: () => void,
                  fightType: FightType,
                  autoNextLevelInitSecond: number,
                  emailTips?:string,
                  param?:any
    ) {
        const args = new CommonBattleResultViewOpenArgs();
        args.isWin = isWin;
        args.isShowNextLevel = isCanNextLevel;
        args.rewards = noOwnerItems || [];
        args.callbackForNextLevel = nextLevelCb;
        args.fightType = fightType;
        args.autoNextLevelInitSecond = autoNextLevelInitSecond;
        args.emailTips = emailTips?emailTips:'';
        args.param = param;

        return args;
    }
}
import { FightType } from "../../../comm/battle/enum/FightType";
import { FactoryOtherMainType } from "./FactoryEnum";

export enum UIFactoryConfig {
    /** 星际工厂主界面 */
    FactoryMainView = "FactoryMainView",
    /**星际工厂其他工厂主界面*/
    FactoryOtherMainView = "FactoryOtherMainView",
    /**购买体力*/
    FactoryBuyPowerWin = 'FactoryBuyPowerWin',
    /**其他工厂列表*/
    FactoryOthersWin = "FactoryOthersWin",
    /**生产线信息界面*/
    FactoryProductLineWin = "FactoryProductLineWin",
    /**战报详情界面*/
    FactoryRecordDetailWin = "FactoryRecordDetailWin",
    /**战报界面*/
    FactoryRecordWin = "FactoryRecordWin",
    /**战斗胜利弹框*/
    FactoryBattleResultWin = "FactoryBattleResultWin",
}

/**战斗胜利界面参数*/
export class FactoryBattleResultViewOpenArgs {
    isWin: boolean = false
    fightType: FightType
    tip: string

    static create(isWin: boolean,
        fightType: FightType,
        tip: string
    ): FactoryBattleResultViewOpenArgs {
        let args: FactoryBattleResultViewOpenArgs = new FactoryBattleResultViewOpenArgs()
        args.isWin = isWin
        args.fightType = fightType
        args.tip = tip
        return args
    }
}

/**其他玩家工厂界面参数*/
export class FactoryOtherMainViewOpenArgs {
    /**玩家列表*/
    allDatas: Vo.factory.PlayerFactoryBaseVo[]
    /**默认选中index*/
    index: number = 0
    /**打开类型*/
    type: FactoryOtherMainType

    static create(allDatas: Vo.factory.PlayerFactoryBaseVo[],
        index: number = 0,
        type: FactoryOtherMainType = FactoryOtherMainType.Friend
    ): FactoryOtherMainViewOpenArgs {
        let args: FactoryOtherMainViewOpenArgs = new FactoryOtherMainViewOpenArgs()
        args.allDatas = allDatas
        args.index = index
        args.type = type
        return args;
    }
}
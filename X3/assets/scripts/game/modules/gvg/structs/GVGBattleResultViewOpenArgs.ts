import { NoOwnerItem } from "db://assets/scripts/game/modules/backpack/vo/NoOwnerItem";

export interface GVGBattleResultViewOpenArgs {

    // 是否胜负
    isWin: boolean
    // 获得星星
    gainStar: number
    // 联盟总星星
    leagueTotalStar: number
    // 对手减少的血量
    oppoChangeHp: number
    // 对手减少的血量
    oppoCurHp: number
    // 奖励信息列表
    rewards: NoOwnerItem[]
}
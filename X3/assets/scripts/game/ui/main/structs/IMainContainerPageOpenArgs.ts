import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";

export interface IMainContainerPageOpenArgs {
    // 底部栏的第几个 tab | 0 开始
    page: number,

    // 打开抽卡
    drawCardType?: ServerEnums.RecruitType
}
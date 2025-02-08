import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";

export class EventDrawCardNetResult {
    type: ServerEnums.RecruitType;
    is10: boolean;
    drawCount: number;
    rewards: Vo.reward.RewardResult[]

}
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";

export class EventChatChangeTab {
    channelType: ServerEnums.ChannelType;
    playerId: number = 0;


    static create(
        channelType: ServerEnums.ChannelType,
        playerId: number = 0,
    ): EventChatChangeTab {
        const vo = new EventChatChangeTab();
        vo.channelType = channelType;
        vo.playerId = playerId;

        return vo;
    }

}
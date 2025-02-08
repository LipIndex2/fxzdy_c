import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";

export class ChatMainViewOpenArgs {

    channelType: ServerEnums.ChannelType;
    playerId: number = 0;

    static create(
        channelType: ServerEnums.ChannelType,
        playerId: number = 0
    ): ChatMainViewOpenArgs {
        const args = new ChatMainViewOpenArgs();
        args.channelType = channelType;
        args.playerId = playerId;
        return args;
    }

}
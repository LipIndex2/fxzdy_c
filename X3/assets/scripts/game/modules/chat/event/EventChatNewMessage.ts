import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";

export class EventChatNewMessage {
    type: ServerEnums.ChannelType;
    message: Vo.chat.ChatContentVo;


    static create(
        type: ServerEnums.ChannelType,
        message: Vo.chat.ChatContentVo,
    ): EventChatNewMessage {
        const vo = new EventChatNewMessage();
        vo.type = type;
        vo.message = message;

        return vo;
    }

}
import { EnumLeftTabType } from "db://assets/scripts/game/modules/chat/enums/EnumLeftTabType";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { TimeManager } from "db://assets/scripts/core/time/TimeManager";

export class ChatLeftTabItemVo {

    type: EnumLeftTabType = EnumLeftTabType.CHANNEL;

    unreadCount: number = 0;
    // 优先级
    priority: number = 0;
    // 频道
    channelType: ServerEnums.ChannelType = ServerEnums.ChannelType.WORLD;

    // 玩家id
    playerId: number = 0;
    playerName: string = ""
    // 玩家头像框id
    headFrameId: number = 0;
    // 玩家头像id
    headIconId: number = 0;

    static fromChannelConfig(
        it: table.chat.ChatChannelConfig
    ): ChatLeftTabItemVo {
        const item = new ChatLeftTabItemVo();
        item.type = EnumLeftTabType.CHANNEL;
        item.channelType = ServerEnums.ChannelType[it.id];
        item.priority = Number.MAX_VALUE - item.channelType;
        return item;
    }

    static fromPlayer(
        msg: Vo.chat.ChatContentVo,
        unreadCount: number,
    ): ChatLeftTabItemVo {
        const item = new ChatLeftTabItemVo();
        item.channelType = ServerEnums.ChannelType.PRIVATE;
        item.priority = msg.sendTime;
        item.type = EnumLeftTabType.PLAYER;

        item.playerId = msg.id;
        item.playerName = msg.name;
        item.headFrameId = msg.headFrame;
        item.headIconId = msg.headIcon;
        item.unreadCount = unreadCount;
        return item;
    }

    static fromSendFriend(other: Vo.player.PlayerBaseVo) {
        const item = new ChatLeftTabItemVo();
        item.channelType = ServerEnums.ChannelType.PRIVATE;
        item.priority = TimeManager.serverNow;
        item.type = EnumLeftTabType.PLAYER;

        item.playerId = other.id;
        item.playerName = other.name;
        item.headFrameId = other.headFrame;
        item.headIconId = other.headIcon;
        item.unreadCount = 0;
        return item;

    }
}
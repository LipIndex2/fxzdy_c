import { BaseModel } from "db://assets/scripts/core/mvc/model/BaseModel";
import { ChatContext } from "db://assets/scripts/game/modules/chat/context/ChatContext";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { CdUtils } from "db://assets/scripts/game/comm/utils/CdUtils";
import { ChatUtils } from "db://assets/scripts/game/modules/chat/utils/ChatUtils";
import ChannelType = ServerEnums.ChannelType;
import { PostContext } from "../context/PostContext";

/**
 * 聊天模块
 * @author GameCreator
 */
export class ChatModel extends BaseModel {
    /**
     * 模块标识
     */
    private MODULE = 15;
    private _context = new ChatContext();
    private _postContext = new PostContext();

    constructor() {
        super();
        this.regist();
    }


    listenNotifications(): string[] {
        return [
            NotificationKey.EVENT_EXIT_LEAGUE
        ];
    }

    notificationHandler(event: string, args?: any) {
        switch (event) {
            case NotificationKey.EVENT_EXIT_LEAGUE: {
                this._context.deleteChatByChannelType(ChannelType.LEAGUE);
                break;
            }
        }
    }

    get context(): ChatContext {
        return this._context;
    }

    get postContext():PostContext {
        return this._postContext
    }

    public static getModule(): number {
        return this.ins().MODULE;
    }

    /**
     * 注册所有从服务端收到的回调。
     */
    private regist(): void {
        let moduleId = this.MODULE;
        this.registerMsg(moduleId, 1, this.recSend);
        this.registerMsg(moduleId, 2, this.recLoadUnreadMsgCount);
        this.registerMsg(moduleId, 3, this.recLoadWorldHistory);
        this.registerMsg(moduleId, 4, this.recLoadZoneHistory);
        this.registerMsg(moduleId, 5, this.recLoadLocalHistory);
        this.registerMsg(moduleId, 6, this.recLoadLeagueHistory);
        this.registerMsg(moduleId, -1, this.pushChat);
        this.registerMsg(moduleId, -2, this.pushPost);
        this.registerMsg(moduleId, -3, this.pushMsgRetract);

    }

    // 初始化数据
    initData(data: Vo.chat.ChatLoginVo) {
        this._context.reset(data);
        this._postContext.reset();
    }

    /*********************************协议发送*********************************/

    /**
     * 发送聊天信息
     * 模块号：15	指令号：1
     */
    public sendSend(c2s: Vo.chat.SendC2S): void {
        this.send(this.MODULE, 1, c2s, c2s);
    }

    /**
     * 获取指定时间段内频道未读历史消息条数
     * 模块号：15	指令号：2
     */
    public sendLoadUnreadMsgCount(c2s: Vo.chat.LoadUnreadMsgCountC2S): void {
        this.send(this.MODULE, 2, c2s, c2s);
    }

    /**
     * 获取世界历史消息最后的 N 条
     * 模块号：15	指令号：3
     */
    public sendLoadWorldHistory(c2s: Vo.chat.LoadWorldHistoryC2S): void {
        this.send(this.MODULE, 3, c2s, c2s);
    }

    /**
     * 获取战区频道历史消息
     * 模块号：15	指令号：4
     */
    public sendLoadZoneHistory(c2s: Vo.chat.LoadZoneHistoryC2S): void {
        this.send(this.MODULE, 4, c2s, c2s);
    }

    /**
     * 获取本服频道历史消息
     * 模块号：15	指令号：5
     */
    public sendLoadLocalHistory(c2s: Vo.chat.LoadLocalHistoryC2S): void {
        this.send(this.MODULE, 5, c2s, c2s);
    }

    /**
     * 获取联盟频道历史消息
     * 模块号：15	指令号：6
     */
    public sendLoadLeagueHistory(c2s: Vo.chat.LoadLeagueHistoryC2S): void {
        this.send(this.MODULE, 6, c2s, c2s);
    }

    /*********************************协议监听*********************************/

    /**
     * 发送聊天信息
     * 模块号：15	指令号：1
     */
    public recSend(data: Vo.chat.SendS2C, c2s: Vo.chat.SendC2S): void {
        const messageVo = c2s.messageVo;
        const channelType = messageVo.channel;
        
        if (data.code < 0) {
            const cdName = ChatUtils.createChannelCDName(channelType);
            CdUtils.remove(cdName);
            return;
        }

        const content = data.content;
        const costs = content.results;


        this.emit(NotificationKey.EVENT_RECEIVE_SERVER_COST_ITEMS, costs as Array<Vo.cost.CostItemResult>);

        console.info(`发送消息成功 channelId = ${channelType}`);
    }

    /**
     * 获取指定时间段内频道未读历史消息条数
     * 模块号：15	指令号：2
     */
    public recLoadUnreadMsgCount(data: Vo.chat.LoadUnreadMsgCountS2C): void {
        if (data.code < 0) {
            return;
        }

        // Map<频道Id，未读消息数量>
        const content = data.content || {};
        for (let channelIdStr of Object.keys(content)) {
            const count = content[channelIdStr];
            const channelId = channelIdStr.toInt() as ServerEnums.ChannelType;
            this._context.setUnreadCount(channelId, count);
        }
        FacadeManager.ins().emit(NotificationKey.CHAT_UPDATE_MESSAGE, ServerEnums.ChannelType.WORLD);

    }

    /**
     * 获取世界历史消息
     * 模块号：15	指令号：3
     */
    public recLoadWorldHistory(data: Vo.chat.LoadWorldHistoryS2C): void {
        if (data.code < 0) {
            return;
        }

        const array = data.content || [];
        for (let chatContentVo of array) {
            this._context.addNewMsg(chatContentVo);
        }
        FacadeManager.ins().emit(NotificationKey.CHAT_UPDATE_MESSAGE, ServerEnums.ChannelType.WORLD);

    }

    /**
     * 获取战区频道历史消息
     * 模块号：15	指令号：4O
     */
    public recLoadZoneHistory(data: Vo.chat.LoadZoneHistoryS2C): void {
        if (data.code < 0) {
            return;
        }

        const array = data.content || [];
        for (let chatContentVo of array) {
            this._context.addNewMsg(chatContentVo);
        }
        FacadeManager.ins().emit(NotificationKey.CHAT_UPDATE_MESSAGE, ServerEnums.ChannelType.WAR_ZONE);

    }

    /**
     * 获取本服频道历史消息
     * 模块号：15	指令号：5
     */
    public recLoadLocalHistory(data: Vo.chat.LoadLocalHistoryS2C): void {
        if (data.code < 0) {
            return;
        }

        const array = data.content || [];
        for (let chatContentVo of array) {
            this._context.addNewMsg(chatContentVo);
        }
        FacadeManager.ins().emit(NotificationKey.CHAT_UPDATE_MESSAGE, ServerEnums.ChannelType.LOCAL);


    }

    /**
     * 获取联盟频道历史消息
     * 模块号：15	指令号：6
     */
    public recLoadLeagueHistory(data: Vo.chat.LoadLeagueHistoryS2C): void {
        if (data.code < 0) {
            return;
        }

        const array = data.content || [];
        for (let chatContentVo of array) {
            this._context.addNewMsg(chatContentVo);
        }
        FacadeManager.ins().emit(NotificationKey.CHAT_UPDATE_MESSAGE, ServerEnums.ChannelType.LEAGUE);

    }

    /*********************************协议推送*********************************/

    /**
     * 推送的聊天信息
     * 模块号：15	指令号：-1
     */
    public pushChat(data: Vo.chat.ChatContentVo): void {

        this._context.addNewMsg(data);

    }

    /**
     * 推送公告
     * 模块号：15	指令号：-2
     */
    public pushPost(data: Vo.chat.PostVo): void {
        //TODO 推送消息-在这里处理服务端返回的数据
        this._postContext.addServerPostVo(data)
    }

    /**
     * 推送撤回消息
     * 模块号：15	指令号：-3
     */
    @LogBusiness("[Chat] 聊天消息被撤回 ")
    public pushMsgRetract(data: Vo.chat.MsgRetractVo): void {
        this._context.onRevocationMessage(data);
    }

    /********************************* Me *********************************/

    sendAuto(channelId: ServerEnums.ChannelType, playerId: number, content: string) {
        this.sendSend({
            messageVo: {
                channel: channelId,
                type: ServerEnums.ChannelSendMessageType.TEXT,
                message: content,
                replyPlayerId: playerId,
                voiceVo: null,
            }
        })
    }


    pullMessageByType(type: ServerEnums.ChannelType, timeMs: number) {
        if (type == ServerEnums.ChannelType.WORLD) {
            this.sendLoadWorldHistory({
                time: timeMs.toLongForNet(),
            })
            return;
        }
        if (type == ServerEnums.ChannelType.LOCAL) {
            this.sendLoadLocalHistory({
                time: timeMs.toLongForNet(),
            })
            return;
        }
        if (type == ServerEnums.ChannelType.LEAGUE) {
            this.sendLoadLeagueHistory({
                time: timeMs.toLongForNet(),
            })
            return;
        }
        if (type == ServerEnums.ChannelType.WAR_ZONE) {
            this.sendLoadZoneHistory({
                time: timeMs.toLongForNet(),
            })
            return;
        }
    }
}

import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import { ChatModel } from "db://assets/scripts/game/modules/chat/model/ChatModel";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { UIManager } from "db://assets/scripts/core/mvc/UIManager";
import { ChatUIKeys } from "db://assets/scripts/game/modules/chat/ChatUIKeys";
import { ChatMainViewOpenArgs } from "db://assets/scripts/game/modules/chat/structs/ChatMainViewOpenArgs";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { ChatUtils } from "db://assets/scripts/game/modules/chat/utils/ChatUtils";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import { ChatRowVo } from "db://assets/scripts/game/modules/chat/vo/ChatRowVo";


/**
 * 主界面的任务 button
 */
@bindFguiExtension("ui://comm1/ChatComp")
export class ChatComp extends FGUI.GComponent implements INotification {

    // 只关心的频道
    private _onlyCareChannelType: ServerEnums.ChannelType | null = null;


    private get view(): ui.comm1.chat.ChatComp {
        return this as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.CHAT_ON_NEW_MESSAGE,
            NotificationKey.CHAT_READ
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.CHAT_ON_NEW_MESSAGE: {
                this.reset();
                break;
            }
            case NotificationKey.CHAT_READ: {
                this.reset();
                break;
            }
        }
    }


    protected onConstruct() {
        super.onConstruct();
        this.view.labelMessage.text = "";

        this.view.onClick(this.onClickChat, this);

        FacadeManager.ins().registerNotification(this);

        this.reset();
    }

    /**
     * 设置关心的频道
     * */
    setOnlyCareChannelType(channelType: ServerEnums.ChannelType) {
        this._onlyCareChannelType = channelType;

        this.reset();
    }

    onClickChat() {
        const context = ChatModel.ins().context;

        // 只关心某个频道 | 最高优先度
        let type = this._onlyCareChannelType;
        if (type) {
            const toast = type == ServerEnums.ChannelType.TEAM_INSTANCE?false:true;
            if(!context.checkOpen(type, toast)){
                if(type == ServerEnums.ChannelType.TEAM_INSTANCE){
                    type = ServerEnums.ChannelType.TEAM;
                    if(!context.checkOpen(type, true)){
                        return;
                    }
                }else{
                    return;
                }  
            }
            // 标记已读
            context.markReadForChannel(type);
            UIManager.ins().open(ChatUIKeys.ChatMainView, ChatMainViewOpenArgs.create(
                type,
            ));
            return;
        }
        
        // 没有未读消息 | 又改成走世界频道
        const unreadCount = context.getAllCareUnreadCount();
        if (unreadCount <= 0) {
            const minChannelType: ServerEnums.ChannelType = context.getMinCanOpenChannelType()
            
            UIManager.ins().open(ChatUIKeys.ChatMainView, ChatMainViewOpenArgs.create(
                minChannelType,
            ));
            return;
        }


        // 打开聊天 base on 最近消息
        const openMessage = ChatModel.ins().context.getOpenMessage();
        if (openMessage) {
            // 好友
            const channelType = openMessage.channelType;
            if (channelType == ServerEnums.ChannelType.PRIVATE) {
                const friendPlayerId = openMessage.playerId;
                context.markReadForPlayer(friendPlayerId);

                UIManager.ins().open(ChatUIKeys.ChatMainView, ChatMainViewOpenArgs.create(
                    channelType,
                    friendPlayerId,
                ));
                return;
            }

            context.markReadForChannel(channelType);
            UIManager.ins().open(ChatUIKeys.ChatMainView, ChatMainViewOpenArgs.create(
                channelType,
            ));
            return;
        }

        
        // default 最小频道
        const minChannelType: ServerEnums.ChannelType = context.getMinCanOpenChannelType()
        // 标记已读
        context.markReadForChannel(minChannelType);
        UIManager.ins().open(ChatUIKeys.ChatMainView, ChatMainViewOpenArgs.create(
            minChannelType,
        ));
    }

    onPreDispose() {
        FacadeManager.ins().removeNotification(this);
    }

    private reset() {
        const context = ChatModel.ins().context;

        // count
        let unreadCount = 0;
        if (this._onlyCareChannelType) {
            unreadCount = context.getUnreadCountByChannelId(this._onlyCareChannelType);
        } else {
            unreadCount = context.getAllCareUnreadCount();
        }
        this.view.labelMsgCount.text = unreadCount.toString();

        // red dot
        const isHaveNew = unreadCount > 0;
        this.view.getController("isHaveNew").selectedIndex = isHaveNew ? 1 : 0;

        // 全部已读, 则不显示内容 | TODO 又说改成一定保留最后一条, 又改回去了
        // if (!isHaveNew) {
        //     this.view.labelMessage.text = "";
        //     return;
        // }

        // 最后一条消息
        let lastMessage: ChatRowVo = context.getLastMessage();
        if (this._onlyCareChannelType) {
            lastMessage = context.getLastMessageRowVoByChannelType(this._onlyCareChannelType);
        }
        if (lastMessage) {
            if (lastMessage.isMyPrivateMessage()) {
                return;
            }
            const msgText = lastMessage.toMainPageContent();
            ChatUtils.setUBBTextWithImg(this.view.labelMessage, msgText, true);
            return;
        }

        this.view.labelMessage.text = "";
    }


}
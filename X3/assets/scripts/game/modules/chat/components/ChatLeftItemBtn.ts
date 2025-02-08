import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { ChatLeftTabItemVo } from "db://assets/scripts/game/modules/chat/vo/ChatLeftTabItemVo";
import { EnumLeftTabType } from "db://assets/scripts/game/modules/chat/enums/EnumLeftTabType";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { ChatPlayerAvatarComp } from "db://assets/scripts/game/modules/chat/components/ChatPlayerAvatarComp";
import { ChatTabBtn } from "db://assets/scripts/game/modules/chat/components/ChatTabBtn";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import { ChatModel } from "db://assets/scripts/game/modules/chat/model/ChatModel";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { EventChatChangeTab } from "db://assets/scripts/game/modules/chat/event/EventChatChangeTab";
import { ChatConfigManager } from "db://assets/scripts/game/modules/chat/config/ChatConfigManager";
import { ConditionManager } from "db://assets/scripts/game/modules/condition/ConditionManager";
import { FloatingTextManager } from "db://assets/scripts/game/modules/floatingText/FloatingTextManager";
import GIns from "../../../GIns";

export class ChatLeftItemBtn extends FGUI.GButton implements INotification {
    private _item: ChatLeftTabItemVo;
    private _index: number;
    private _isChoose: boolean = false;
    private _tabType: EnumLeftTabType;

    private get view(): ui.chat.btn.ChatLeftItemBtn {
        return this as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.CHAT_ON_NEW_MESSAGE,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.CHAT_ON_NEW_MESSAGE: {
                this.updateMessageCount();
                break;
            }
        }
    }


    protected onConstruct() {
        super.onConstruct();


        FacadeManager.ins().registerNotification(this);
        this.view.onClick(this.onClick0, this);

    }


    protected onPreDispose() {

        FacadeManager.ins().removeNotification(this);

        super.onPreDispose();
    }

    onClick0() {
        if (!this._item) {
            return;
        }
        const context = ChatModel.ins().context;

        const channelId = this._item.channelType;
        const config = ChatConfigManager.getChannelConfigById(channelId);
        if (config) {
            const isLock = ConditionManager.ins().isLock(config.unlockChannelCondition, true, false);
            if (isLock) {
                GIns.floatingTextMgr.showTips(config.lockTips);
                return;
            }
        }


        const playerId = this._item.playerId || 0;
        let isHaveChannel = true;
        if (this._item.type == EnumLeftTabType.CHANNEL) {
            context.markReadForChannel(channelId);
        } else {
            isHaveChannel = context.isHavePlayerChannel(playerId)
            if (isHaveChannel) {
                
                context.markReadForPlayer(playerId);
            }
        }

        if (!isHaveChannel) {
            console.info("该频道已关闭");
            return;
        }
        
        FacadeManager.ins().emit(NotificationKey.CHAT_CHANGE_TAB_INDEX, EventChatChangeTab.create(
            channelId,
            playerId
        ));
    }

    reset(index: number, item: ChatLeftTabItemVo) {
        if (!item) {
            return;
        }
        this._index = index;
        this._item = item;

        const tabType = item.type;
        this._tabType = tabType;


        this.view.getController("type").selectedIndex = tabType;

        if (tabType == EnumLeftTabType.CHANNEL) {
            const btn = FguiScriptUtils.toMyScriptClass(this.view.tabItem, ChatTabBtn);
            btn.reset(item);

        } else if (tabType == EnumLeftTabType.PLAYER) {
            const avatarComp = FguiScriptUtils.toMyScriptClass(this.view.avatar, ChatPlayerAvatarComp);

            avatarComp.reset(item);
        }

    }

    // 设置选中状态
    refreshChooseState(
        chooseChannelType: ServerEnums.ChannelType,
        choosePlayerId: number
    ) {
        const item = this._item;

        const isChoose = item.channelType == chooseChannelType && item.playerId == choosePlayerId;
        
        const btn = FguiScriptUtils.toMyScriptClass(this.view.tabItem, ChatTabBtn);
        btn.setChoose(isChoose);
        
        const avatarComp = FguiScriptUtils.toMyScriptClass(this.view.avatar, ChatPlayerAvatarComp);
        avatarComp.setChoose(isChoose);
        
        this._isChoose = isChoose;

        this.updateMessageCount();
        
        if (isChoose) {
            FacadeManager.ins().emit(NotificationKey.CHAT_CHOOSE_TAB, this._index);
        }
    }

    private updateMessageCount() {
        const context = ChatModel.ins().context;

        const btn = FguiScriptUtils.toMyScriptClass(this.view.tabItem, ChatTabBtn);
        const avatarComp = FguiScriptUtils.toMyScriptClass(this.view.avatar, ChatPlayerAvatarComp);

        if (this._tabType == EnumLeftTabType.CHANNEL) {
            // 频道
            if (this._isChoose) {
                // 全部已读
                context.markReadForChannel(this._item?.channelType);
                btn.updateMessageCount(0);
            } else {
                // 未读
                const channelId = this._item.channelType;
                const unreadCount = context.getUnreadCountByChannelId(channelId);
                btn.updateMessageCount(unreadCount)
            }
        } else {
// 玩家
            if (this._isChoose) {
                // 全部已读
                context.markReadForPlayer(this._item?.playerId);
                avatarComp.updateMessageCount(0);
            } else {
                // 未读

                const unreadCount = context.getUnreadCountByPlayerId(this._item.playerId);
                avatarComp.updateMessageCount(unreadCount);
            }

        }

    }
}
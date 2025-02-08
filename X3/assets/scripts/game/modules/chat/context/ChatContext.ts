import { LogBusiness } from "db://assets/scripts/core/log/LogBusiness";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { ComparatorBuilder } from "db://assets/scripts/core/utils/ComparatorBuilder";
import { ChatLeftTabItemVo } from "db://assets/scripts/game/modules/chat/vo/ChatLeftTabItemVo";
import { ChatConfigManager } from "db://assets/scripts/game/modules/chat/config/ChatConfigManager";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import { EnumUtils } from "db://assets/scripts/core/utils/EnumUtils";
import { ChatModel } from "db://assets/scripts/game/modules/chat/model/ChatModel";
import { TimeManager } from "db://assets/scripts/core/time/TimeManager";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { EventChatNewMessage } from "db://assets/scripts/game/modules/chat/event/EventChatNewMessage";
import { ChatRowVo } from "db://assets/scripts/game/modules/chat/vo/ChatRowVo";
import { PlayerModel } from "db://assets/scripts/game/modules/player/model/PlayerModel";
import { ConditionManager } from "db://assets/scripts/game/modules/condition/ConditionManager";
import { ChatUtils } from "db://assets/scripts/game/modules/chat/utils/ChatUtils";
import { LocalStorageUtils } from "db://assets/scripts/core/utils/LocalStorageUtils";
import { Logger } from "db://assets/scripts/core/log/Logger";
import { GameUtils } from "db://assets/scripts/core/utils/GameUtils";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import { FriendModel } from "db://assets/scripts/game/modules/friend/model/FriendModel";
import ArrayUtils from "db://assets/scripts/core/utils/ArrayUtils";
import { DateUtils } from "db://assets/scripts/core/utils/DateUtils";
import ChannelType = ServerEnums.ChannelType;
import ChannelSendMessageType = ServerEnums.ChannelSendMessageType;
import GIns from "../../../GIns";
import { DebugUtils } from "db://assets/scripts/core/utils/DebugUtils";

/**
 * 聊天
 */
export class ChatContext implements INotification {

    private static comparatorForMsg = ComparatorBuilder.create<Vo.chat.ChatContentVo>()
        .addComparator((a, b) => a.sendTime - b.sendTime)
        .build();

    // 正在使用的聊天框Id
    private _useBoxId: number;
    // 拥有的聊天框Id列表
    private _chatBoxIds: number[] = [];

    // <playerId, 私聊发的消息> 【好友私聊】 离线未查看的消息 
    private _playerIdToMsgArrayMap: Map<number, Vo.chat.ChatContentVo[]> = new Map<number, Vo.chat.ChatContentVo[]>();
    // <playerId, 未读数量>
    private _playerIdToUnreadCountMap: Map<number, number> = new Map<number, number>();

    // <channelType, 是否关心>
    private _channelTypeToCareFlagMap: Map<ServerEnums.ChannelType, boolean> = new Map<ServerEnums.ChannelType, boolean>();
    // <channelType, 消息[]>
    private _channelTypeToMsgArrayMap: Map<ServerEnums.ChannelType, Vo.chat.ChatContentVo[]> = new Map<ServerEnums.ChannelType, Vo.chat.ChatContentVo[]>();
    // <channelType, 未读数量>
    private _channelTypeToUnreadCountMap: Map<ServerEnums.ChannelType, number> = new Map<ChannelType, number>();
    // <channelType, 最后刷新timeMs>
    private _channelTypeToRefreshLastTimeMsMap: Map<ServerEnums.ChannelType, number> = new Map<ChannelType, number>();
    // <channelType, 最新消息>
    private _channelTypeToLastMessageMap: Map<ServerEnums.ChannelType, Vo.chat.ChatContentVo> = new Map<ChannelType, Vo.chat.ChatContentVo>();

    // 最新的消息
    private _lastNewMessage: ChatRowVo | null;
    // 打开顺序 = 好友 > 其他频道 > 世界 > 本服
    private _openUIMessage: ChatRowVo | null;
    // 当前要发送私聊的部分
    private _sendFriendTabItemVo: ChatLeftTabItemVo;
    // 是否需要保存
    private _isNeedSave: boolean = false;

    listenNotifications(): string[] {
        return [
            NotificationKey.FRIEND_DATA_ID_CHANGE
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.FRIEND_DELETE_COMPLETE: {
                this.deleteChatByPlayerId(args);
                break;
            }
        }
    }

    // 清理玩家消息
    clearPlayerMessage() {
        Logger.game("[Chat] 清空历史聊天消息");
        this._playerIdToMsgArrayMap.clear();
    }


    @LogBusiness("聊天 reset")
    reset(data: Vo.chat.ChatLoginVo) {
        // 先清空消息
        this.clearPlayerMessage();

        // restore history msg
        this.restoreHistoryMessage();

        if (!data) {
            console.warn("[Chat] 后端没有发数据给我");
            return;
        }

        // 离线消息
        const msgObj = data?.offlinePrivateChatMsgMap || {};
        for (let key of Object.keys(msgObj)) {
            const msgArray = msgObj[key] as Vo.chat.ChatContentVo[] || [];
            for (let chatContentVo of msgArray) {
                const playerId = chatContentVo.id;
                this._playerIdToMsgArrayMap.set(playerId, msgArray || []);
                this._playerIdToUnreadCountMap.set(playerId, msgArray.length);
            }
        }

        console.info("[Chat] 玩家消息");

        // friends
        const friendIds: number[] = FriendModel.ins().friendIds || [];
        this.keepMessageWhoIsFriend(friendIds);

        console.info("[Chat] 好友剔除");

        // 撤回
        const channelTypeToRetractIdListObj = data.channel2RetractIds || {};
        for (let channelTypeStr of Object.keys(channelTypeToRetractIdListObj)) {
            const channelType = channelTypeStr.toInt();
            const retractMsgIds = msgObj[channelTypeStr] as string[] || [];
            for (let msgId of retractMsgIds) {
                this.onRevocationMessage({
                    channel: channelType,
                    msgId: msgId,
                    privatePlayerId: 0,
                } as Vo.chat.MsgRetractVo);
            }
        }

        console.info("[Chat] 撤回消息");

        // new msg !
        this.tryGetNewMessageInOfflineAsync();

        console.info("[Chat] 获取新消息");

        // exit 
        GameUtils.onGameExit(() => {
            DebugUtils.isDebugMode() && console.log('检测到返回键，游戏即将退出');
            this.saveMessageToLocal();
        });


        // event
        FacadeManager.ins().removeNotification(this);
        FacadeManager.ins().registerNotification(this);


        GameTimer.ins().clearAll(this);
        GameTimer.ins().loop(5000, this, this.saveMessageToLocal);

    }

    // 保持哪些好友 playerId 消息
    keepMessageWhoIsFriend(playerIds: number[]) {
        // const toDelPlayerIdSet = new Set<number>();
        // for (let [playerId, msgArray] of this._playerIdToMsgArrayMap) {
        //     const isNeed = playerIds.indexOf(playerId)
        //     if (isNeed) {
        //         continue;
        //     }
        //
        //     toDelPlayerIdSet.add(playerId);
        // }
        //
        // for (let playerId of toDelPlayerIdSet) {
        //     console.info(`[聊天] 离线时, 玩家已删除你好友. playerId = ${playerId}`);
        //
        //     this.deleteChatByPlayerId(playerId);
        // }
    }


    /**
     * 删除好友消息
     * @param delPlayerId
     */
    deleteChatByPlayerId(delPlayerId: number) {
        this._playerIdToMsgArrayMap.delete(delPlayerId);
        this._playerIdToUnreadCountMap.delete(delPlayerId);

        // del 最近消息
        const openPlayerId = this._openUIMessage?.playerId || 0;
        if (openPlayerId == delPlayerId) {
            this._openUIMessage = null;
        }

        // del 主动聊天
        if (this._sendFriendTabItemVo) {
            if (this._sendFriendTabItemVo.playerId == delPlayerId) {
                this._sendFriendTabItemVo = null;
            }
        }

        FacadeManager.ins().emit(NotificationKey.CHAT_UPDATE_MESSAGE);
        FacadeManager.ins().emit(NotificationKey.CHAT_TAB_REFRESH);
    }

    /**
     * 删除频道消息
     */
    deleteChatByChannelType(type: ServerEnums.ChannelType) {

        this._channelTypeToMsgArrayMap.delete(type);
        this._channelTypeToUnreadCountMap.delete(type);

        // del 最近消息
        const lastChannelType = this._openUIMessage?.channelType || 0;
        if (lastChannelType == type) {
            this._openUIMessage = null;
        }

        const keyName = ChatUtils.getLocalStorageKeyNameByType(type);
        LocalStorageUtils.set(keyName, null);

        FacadeManager.ins().emit(NotificationKey.CHAT_UPDATE_MESSAGE);
        FacadeManager.ins().emit(NotificationKey.CHAT_TAB_REFRESH);
    }

    // 恢复历史
    restoreHistoryMessage() {
        // 免打扰
        const channelTypeArray = EnumUtils.getAllEnumValues(ServerEnums.ChannelType);
        for (let channelType of channelTypeArray) {
            const key = ChatUtils.getLocalStorageKeyForIsCare(channelType);
            const isCare = LocalStorageUtils.get(key, Boolean, () => true).valueOf();
            this._channelTypeToCareFlagMap.set(channelType, isCare)
        }

        // 恢复 频道消息
        for (let type of channelTypeArray) {
            const array = ChatUtils.getLocalHistoryMessageByType(type)
            for (const channelMsg of array) {
                this.addNewMsg(channelMsg, true);
            }
        }

        const allPlayerHistoryMessage = ChatUtils.getAllPlayerHistoryMessage();
        if (allPlayerHistoryMessage) {
            allPlayerHistoryMessage.forEach(playerMsg => {
                this.addNewMsg(playerMsg, true);
            });
        }

        // console.info(" restore chat message. channelMsg = ", this._channelTypeToMsgArrayMap);
    }


    /**
     * 获取最新消息
     */
    tryGetNewMessageInOfflineAsync() {
        const typeArray = EnumUtils.getAllEnumValues(ServerEnums.ChannelType);
        const curTimeMs = TimeManager.serverNow;
        for (let type of typeArray) {
            // const timeMs = this._channelTypeToRefreshLastTimeMsMap.getOrDefault(type, 0);
            ChatModel.ins().pullMessageByType(type, curTimeMs);

            this._channelTypeToRefreshLastTimeMsMap.set(type, curTimeMs);
        }
    }

    @LogBusiness("[聊天] 收到新消息")
    addNewMsg(data: Vo.chat.ChatContentVo, isHistory: boolean = false) {
        if (!data) {
            return;
        }

        // 保留消息 n 天内
        const sendTimeMs = data.sendTime;
        const curTimeMs = TimeManager.serverNow;
        const diffDays = DateUtils.diffDays(sendTimeMs, curTimeMs);
        if (diffDays > ChatConfigManager.keepMessageDays) {
            Logger.net(`[Chat] 收到的消息已过期. 前端清空掉. msgId = ${data.msgId}`, data);
            return;
        }


        // 频道
        const channelType = data.channel;

        // 是否关心
        const isCare = this.isCareMessageFlagByChannelType(channelType);
        if (!isCare) {
            Logger.game(`[Chat] 丢弃不关心的聊天频道消息. channelType = ${channelType}`, data);
            return;
        }

        // 旧消息时间
        const oldMessageSendTimeMs = this._channelTypeToLastMessageMap.get(channelType)?.sendTime || 0;

        // 记录最新消息
        this._channelTypeToLastMessageMap.merge(channelType, data, (v1, v2) => {
            return v1.sendTime > v2.sendTime ? v1 : v2;
        })

        // unlock 
        const config = ChatConfigManager.getChannelConfigById(channelType);
        if (!config) {
            console.error(`[chat] 后端的消息, 没找到频道 channelType = ${channelType}`);
            return;
        }
        const isUnlock = ConditionManager.ins().checkCondition(config.unlockChannelCondition);
        if (!isUnlock) {
            // lock, no handle
            return;
        }


        const newMsgId = data.msgId;

        let array: Array<Vo.chat.ChatContentVo>;
        let playerId: number = 0;
        if (channelType == ChannelType.PRIVATE) {
            // 好友
            const sendPlayerId = data.id;
            const receiverPlayerId = data.replyPlayerId;
            const isMe = sendPlayerId == PlayerModel.ins().Vo.id;
            if (isMe) {
                playerId = receiverPlayerId;
            } else {
                playerId = sendPlayerId;
            }
            array = this._playerIdToMsgArrayMap.get(playerId);
            if (!array) {
                array = [];
                this._playerIdToMsgArrayMap.set(playerId, array);
            }

            // 收到相同的人
            if (this._sendFriendTabItemVo) {
                if (this._sendFriendTabItemVo.playerId == playerId) {
                    this._sendFriendTabItemVo = null;
                }
            }

        } else {
            // 频道
            array = this._channelTypeToMsgArrayMap.get(channelType);
            if (!array) {
                array = [];
                this._channelTypeToMsgArrayMap.set(channelType, array);
            }
        }

        // 后端说可能会推重复的消息
        const isExists = array.find(it => it.msgId == newMsgId);
        if (isExists) {
            // 后端重复
            return;
        }

        // 全新的消息
        array.push(data);

        // sort and keep 
        array = this.sortAndFilterMsgArray(array, 50);
        if (channelType == ChannelType.PRIVATE) {
            this._playerIdToMsgArrayMap.set(playerId, array);
        } else {
            this._channelTypeToMsgArrayMap.set(channelType, array);
        }

        const newMessage = ChatRowVo.fromMessage(data);

        // 是否关心的最新消息 | 有优先度
        const isCareNewMessage = ChatUtils.isNewCareMessage(newMessage, this._lastNewMessage);
        if (isCareNewMessage) {
            this._lastNewMessage = newMessage;
        }

        // 非历史, 更新打开
        if (!isHistory) {
            this.tryRefreshMyOpenMessage(newMessage);
        }


        const isNewMessage = sendTimeMs >= oldMessageSendTimeMs;
        // 非历史 + 关心的消息
        if (isCare && !isHistory && isNewMessage) {
            const sendPlayerId = data.id;

            // 不是自己说话才算新消息
            if (sendPlayerId != PlayerModel.ins().playerId) {
                if (channelType == ChannelType.PRIVATE) {
                    // unread count
                    this._playerIdToUnreadCountMap.merge(playerId, 1, (v1,
                                                                       v2
                    ) => Math.min(ChatConfigManager.maxTipsMessageCount, v1 + v2));
                } else {
                    // 只关心频道
                    this._channelTypeToUnreadCountMap.merge(channelType, 1,
                        (v1, v2) => Math.min(ChatConfigManager.maxTipsMessageCount, v1 + v2));

                }
            }

        }

        this._isNeedSave = true;

        // event - New Chat msg
        FacadeManager.ins().emit(NotificationKey.CHAT_ON_NEW_MESSAGE, EventChatNewMessage.create(
            channelType,
            data,
        ));
    }

    // 保存消息
    saveMessageToLocal() {
        if (!this._isNeedSave) {
            return;
        }
        this._isNeedSave = false;

        // 免打扰勾选
        if (this._channelTypeToCareFlagMap) {
            for (let [channelType, isCare] of this._channelTypeToCareFlagMap.entries()) {
                const key = ChatUtils.getLocalStorageKeyForIsCare(channelType);
                LocalStorageUtils.set(key, isCare)
            }
        }

        // 公共频道
        for (let [channelType, msgArray] of this._channelTypeToMsgArrayMap) {
            const key = ChatUtils.getLocalStorageKeyNameByType(channelType);
            LocalStorageUtils.set(key, msgArray)
        }

        // 私聊
        const key = ChatUtils.getLocalStorageKeyNameByType(ChannelType.PRIVATE);
        const allPrivateMessageArray = this._playerIdToMsgArrayMap.toDataStream()
            .map(it => it.value)
            .flatMap(it => it)
            .toArray();
        LocalStorageUtils.set(key, allPrivateMessageArray)

        Logger.game("[chat] history message save done! ");
    }

    // 刷新用于打开 UI 的消息
    private tryRefreshMyOpenMessage(newMessage: ChatRowVo) {
        if (newMessage.isMyPrivateMessage() || newMessage.isBlankContent()) {
            return;
        }

        // 不存在
        const oldMessage = this._openUIMessage;
        if (!oldMessage) {
            this._openUIMessage = newMessage;
            return;
        }

        // new friend 
        if (newMessage.channelType == ChannelType.PRIVATE) {
            this._openUIMessage = newMessage;
            return;
        }

        const oldChannelType = oldMessage.channelType;
        if (oldChannelType == ChannelType.PRIVATE) {
            return;
        }

        // 新消息, 时间比旧的消息还晚
        if (oldMessage.timeMs >= newMessage.timeMs) {
            return;
        }

        // 最新消息
        this._openUIMessage = newMessage;
    }


// 频道消息
    getMessageArrayByChannelType(channel: ServerEnums.ChannelType): Vo.chat.ChatContentVo[] {
        return this._channelTypeToMsgArrayMap.get(channel) || [];
    }

    /**
     * 设置是否关心
     * @param channelType
     * @param isCare
     */
    setCareMessageFlagByChannelType(
        channelType: ServerEnums.ChannelType,
        isCare: boolean
    ) {
        this._channelTypeToCareFlagMap.set(channelType, isCare);

        this._isNeedSave = true;
    }

    /**
     * get 是否关心频道
     * @param channelType
     */
    isCareMessageFlagByChannelType(channelType: ServerEnums.ChannelType): boolean {
        return this._channelTypeToCareFlagMap.getOrDefault(channelType, true);

    }

    // 排序消息
    private sortAndFilterMsgArray(array: Vo.chat.ChatContentVo[], keepMsgCount: number): Vo.chat.ChatContentVo[] {
        array.sort(ChatContext.comparatorForMsg);

        // 保留最后 n 条消息，修改原数组
        if (array.length > keepMsgCount) {
            array.splice(0, array.length - keepMsgCount);
        }

        return array;
    }

    // 设置未读数量
    setUnreadCount(channelId: ServerEnums.ChannelType, count: number) {
        if(!this.redIgnore(channelId)){
            this._channelTypeToUnreadCountMap.set(channelId, count);
        }
    }

    getUnreadCountByChannelId(channelId: ServerEnums.ChannelType): number {
        return this._channelTypeToUnreadCountMap.get(channelId) || 0;
    }

    /**
     * 获取左侧栏目
     */
    getLeftTabItemArray(): ChatLeftTabItemVo[] {
        const channelArray = ChatConfigManager.getAllChannelConfigArray();

        // 频道
        const channelTabArray = channelArray
            .map(it => {
                // 条件
                const isOk = ConditionManager.ins().checkCondition(it.unlockChannelCondition);
                if (isOk) {
                    return ChatLeftTabItemVo.fromChannelConfig(it);
                }
                if (it.isCanSeeWhenLock) {
                    return ChatLeftTabItemVo.fromChannelConfig(it);
                }
                return null;
            })
            .filter(it => it != null);

        // friend
        const friendTabArray = this._playerIdToMsgArrayMap.toDataStream()
            .map(it => {
                const playerId = it.key;
                const msgArray = it.value || [];

                // 发送人和好友id一致的
                const msg: Vo.chat.ChatContentVo = msgArray.find(it => {
                    return it.id == playerId;
                });

                if (!msg) {
                    return null;
                }

                return ChatLeftTabItemVo.fromPlayer(msg, msgArray.length);
            })
            .filterNotNull()
            .toArray();

        // 主动发起好友私聊
        if (this._sendFriendTabItemVo) {
            const isHaveSame = friendTabArray.find(it => it.playerId == this._sendFriendTabItemVo.playerId) != null;
            if (isHaveSame) {
                return [...channelTabArray, ...friendTabArray];
            }
            return [
                ...channelTabArray,
                this._sendFriendTabItemVo,
                ...friendTabArray
            ];
        }
        // all
        return [...channelTabArray, ...friendTabArray];
    }

    // 好友消息
    getFriendMessageCountByPlayerId(playerId: number): number {
        return this._playerIdToMsgArrayMap.get(playerId)?.length || 0;
    }

    // 获取私聊消息
    getMessageArrayByPlayerId(playerId: number): Vo.chat.ChatContentVo[] {
        return this._playerIdToMsgArrayMap.get(playerId) || [];
    }

    /**
     * 某个玩家的未读消息
     * @param playerId
     */
    getUnreadCountByPlayerId(playerId: number): number {
        return this._playerIdToUnreadCountMap.getOrDefault(playerId, 0);
    }

    /**
     * 频道已读
     * @param channelId
     */
    markReadForChannel(channelId: ChannelType) {
        this._channelTypeToUnreadCountMap.delete(channelId);

        FacadeManager.ins().emit(NotificationKey.CHAT_READ);
    }

    /**
     * 已读玩家
     * @param playerId
     */
    markReadForPlayer(playerId: number) {
        this._playerIdToUnreadCountMap.delete(playerId);

        FacadeManager.ins().emit(NotificationKey.CHAT_READ);
    }

    /**
     * 获取所有未读数量
     */
    getAllCareUnreadCount(): number {
        const channelCount = this._channelTypeToUnreadCountMap.toDataStream()
            .reduce((sum, it) => {
                const channelType = it.key;
                // 不关心
                if (!this.isCareMessageFlagByChannelType(channelType)) {
                    return sum;
                }
                return sum + it.value;
            }, 0);
        const playerCount = this._playerIdToUnreadCountMap.toDataStream()
            .reduce((sum, it) => Math.min(ChatConfigManager.maxTipsMessageCount, sum + it.value), 0);
        return channelCount + playerCount;
    }

    // 最新的消息
    getLastMessage(): ChatRowVo {
        return this._lastNewMessage;
    }

    /**
     * 添加发送的好友
     * @param otherPersonInfo
     */
    addSendFriend(otherPersonInfo: Vo.player.PlayerPersonInfoVo) {
        const playerBaseVo = otherPersonInfo?.playerBaseVo;
        if (!playerBaseVo) {
            console.error("玩家没有信息")
            return;
        }
        const playerId = playerBaseVo.id;
        const historyMsgArray = this._playerIdToMsgArrayMap.get(playerId);
        if (historyMsgArray) {
            // 已经有历史消息
            return;
        }

        // fiend
        this._sendFriendTabItemVo = ChatLeftTabItemVo.fromSendFriend(playerBaseVo);


        const array = this._playerIdToMsgArrayMap.getOrCreate(playerId, () => new Array<Vo.chat.ChatContentVo>());

        // 已存在
        if (array.find(it => it.id == playerId) != null) {
            return;
        }
        array.push({
            msgId: "",
            channel: ChannelType.PRIVATE,
            id: playerId,
            name: playerBaseVo.name,
            level: playerBaseVo.level,
            title: playerBaseVo.title,
            headIcon: playerBaseVo.headIcon,
            headFrame: playerBaseVo.headFrame,
            message: "",
            voiceVo: null,
            sendTime: TimeManager.serverNow,
            replyPlayerId: PlayerModel.ins().Vo.id,
            replyPlayerName: PlayerModel.ins().Vo.name,
            msgType: ChannelSendMessageType.TEXT,
            templateVo: null
        } as Vo.chat.ChatContentVo)
    }


    /**
     * 获取要打开的消息
     */
    getOpenMessage(): ChatRowVo | null {
        const openUIMessage = this._openUIMessage;
        if (!openUIMessage) {
            return null;
        }

        // cost | TODO 无语, 之前说打开过的消息就不要再停留, 现在又要停留在那里
        // this._openUIMessage = null;
        return openUIMessage;
    }

    // 是否有玩家频道
    isHavePlayerChannel(playerId: number): boolean {
        return this._playerIdToMsgArrayMap.get(playerId) != null;
    }

    /**
     * 撤回消息
     * @param data
     */
    onRevocationMessage(data: Vo.chat.MsgRetractVo) {

        const channelType = data.channel;
        const msgId = data.msgId;


        // to del
        let toDelMsgArray = [];
        let delPlayerId = 0;

        if (channelType == ChannelType.PRIVATE) {
            // friend
            const playerId = data.privatePlayerId;
            if (playerId == 0) {
                this._playerIdToMsgArrayMap.forEach((array, playerId) => {
                    if (array.find(it => it.msgId == msgId)) {
                        toDelMsgArray = array;
                        delPlayerId = playerId;
                    }
                });
            } else {
                delPlayerId = playerId;
                toDelMsgArray = this._playerIdToMsgArrayMap.getOrDefault(playerId, []);
            }
        } else {
            // builtin
            toDelMsgArray = this._channelTypeToMsgArrayMap.getOrDefault(channelType, []);
        }

        // del
        const delArray = ArrayUtils.deleteByConditionReturnDelArray(toDelMsgArray, it => it.msgId == data.msgId);
        const delCount = delArray.length;
        if (delCount <= 0) {
            return;
        }

        console.info(`[Chat] 撤回消息. channelType = ${channelType}, playerId = ${delPlayerId} | `, delArray);

        // unread count
        if (channelType == ChannelType.PRIVATE) {
            // friend
            this._playerIdToUnreadCountMap.merge(delPlayerId, -delCount, (v1, v2) => Math.max(0, v1 - v2));
        } else {
            // builtin
            this._channelTypeToUnreadCountMap.merge(channelType, -delCount, (v1, v2) => Math.max(0, v1 - v2));
        }

        // event
        FacadeManager.ins().emit(NotificationKey.CHAT_UPDATE_MESSAGE);

    }

    /**
     * 最新消息
     * @param type
     */
    getLastMessageRowVoByChannelType(type: ChannelType): ChatRowVo | null {
        const chatContentVo = this._channelTypeToLastMessageMap.get(type);
        if (!chatContentVo) {
            return null;
        }
        return ChatRowVo.fromMessage(chatContentVo);
    }

    /**
     * 最小可开启的聊天频道类型
     */
    getMinCanOpenChannelType(): ServerEnums.ChannelType {
        const chatChannelConfig = ChatConfigManager.getAllChannelConfigArray()
            .filter(it => {
                return ConditionManager.ins().checkCondition(it.unlockChannelCondition)
            })
            .sort((v1, v2) => v1.sort - v2.sort)
            [0];
        if (!chatChannelConfig) {
            return ServerEnums.ChannelType.LOCAL;
        }
        const channelType: ServerEnums.ChannelType = ServerEnums.ChannelType[chatChannelConfig.id];
        return channelType;
    }


    // 清理联盟消息
    clearLeagueMessage() {
        this.markReadForChannel(ServerEnums.ChannelType.LEAGUE);
        this.deleteChatByChannelType(ServerEnums.ChannelType.LEAGUE);

        if (this._lastNewMessage) {
            if (this._lastNewMessage.channelType == ServerEnums.ChannelType.LEAGUE) {
                this._lastNewMessage = null;
            }
        }

        FacadeManager.ins().emit(NotificationKey.CHAT_UNREAD_COUNT_REFRESH);
        FacadeManager.ins().emit(NotificationKey.CHAT_READ);
        FacadeManager.ins().emit(NotificationKey.CHAT_UPDATE_MESSAGE);
    }

    checkOpen(channelType:number, showTips:boolean = false){
        const config = ChatConfigManager.getChannelConfigById(channelType);
        if (config) {
            const isUnlock = ConditionManager.ins().checkCondition(config.unlockChannelCondition);
            if (isUnlock) {
                return true;
            }else{
                if(showTips){
                    GIns.floatingTextMgr.showTips(config.lockTips);
                }
                return false;
            }
         }
    }

    /**该频道是否忽略红点 */
    redIgnore(channel:number):boolean{
        //组队频道，不关心红点
        if(channel == ServerEnums.ChannelType.TEAM){
            return true;
        }
        return false;
    }
}
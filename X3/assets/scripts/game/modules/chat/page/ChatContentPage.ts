import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { ChatLeftTabItemVo } from "db://assets/scripts/game/modules/chat/vo/ChatLeftTabItemVo";
import { EnumLeftTabType } from "db://assets/scripts/game/modules/chat/enums/EnumLeftTabType";
import { ChatConfigManager } from "db://assets/scripts/game/modules/chat/config/ChatConfigManager";
import { ChatOneRowComp } from "db://assets/scripts/game/modules/chat/components/ChatOneRowComp";
import { ChatModel } from "db://assets/scripts/game/modules/chat/model/ChatModel";
import { ChatRowVo } from "db://assets/scripts/game/modules/chat/vo/ChatRowVo";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { EventChatNewMessage } from "db://assets/scripts/game/modules/chat/event/EventChatNewMessage";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import { ChatUtils } from "db://assets/scripts/game/modules/chat/utils/ChatUtils";
import { NodeUtils } from "db://assets/scripts/core/utils/NodeUtils";
import { StringUtils } from "db://assets/scripts/core/utils/StringUtils";
import { ConditionManager } from "db://assets/scripts/game/modules/condition/ConditionManager";
import { CdUtils } from "db://assets/scripts/game/comm/utils/CdUtils";
import { UiTweenMgr } from "../../../../core/comm/UiTweenMgr";
import { ServerEnums } from "../../../../libs/extras/ServerEnums";
import GIns from "../../../GIns";

export class ChatContentPage extends FGUI.GComponent implements INotification {

    private _messageRowArray: ChatRowVo[] = [];
    private _item: ChatLeftTabItemVo;
    // 发送内容
    private _sendContent: string = "";

    listenNotifications(): string[] {
        return [
            NotificationKey.CHAT_ON_NEW_MESSAGE,
            NotificationKey.CHAT_USE_EMOJI,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.CHAT_ON_NEW_MESSAGE: {
                this.onNewMessage(args);
                break;
            }
            case NotificationKey.CHAT_USE_EMOJI: {
                this.onUseEmoji(args);
                break;
            }
        }
    }


    private get view(): ui.chat.page.ChatContentPage {
        return this as any;
    }

    protected onConstruct() {
        super.onConstruct();

        this.view.getController("isShowEmoji").selectedIndex = 0;
        FacadeManager.ins().registerNotification(this);

        // input
        this.view.labelInput.maxLength = ChatConfigManager.maxMessageContentSize;
        this.view.labelInput.on(FGUI.Event.TEXT_CHANGE, this.onInputChange, this);

        this.view.rowList.setVirtual();

        // this.view.rowList.itemRenderer = this.irRow.bind(this);
        UiTweenMgr.ins().removeListItemRendererEffect(this.view.rowList.node.uuid);
        // this.view.rowList.itemRenderer = UiTweenMgr.ins().listItemRendererEffect(
        //     this.view.rowList.node.uuid,
        //     this.irRow,
        //     this,
        //     // {
        //     //     delay: 200
        //     // }
        // );
        this.view.rowList.itemRenderer = this.irRow.bind(this);
        this.view.rowList.itemProvider = this.irProvider.bind(this)

        this.view.btnSend.onClick(this.onClickSend, this);
        this.view.btnEmoji.onClick(this.onClickEmoji, this);

        // UiTweenMgr.ins().listShowEffect(this.view.rowList);
    }


    protected onPreDispose() {

        FacadeManager.ins().removeNotification(this);
        GameTimer.ins().clearAll(this);

        UiTweenMgr.ins().removeTweenEffect(this.view.rowList);

        super.onPreDispose();
    }

    onClickEmoji() {
        const oldIndex = this.view.getController("isShowEmoji").selectedIndex;
        this.view.getController("isShowEmoji").selectedIndex = (oldIndex + 1) % 2;

        GameTimer.ins().once(0.2, this, () => {
            this.view.emojiMask.onceClick(() => {
                if (NodeUtils.isNotValidNode(this.view.node)) {
                    return;
                }
                this.view.getController("isShowEmoji").selectedIndex = 0;
            }, this);
        })
    }

    onInputChange() {
        const inputContent = this.view.labelInput.text || "";
        const ubbText = ChatUtils.decodeChatMessage(inputContent, true);
        ChatUtils.setUBBTextWithImg(this.view.labelShow, ubbText);

        // this.view.labelInput.alpha = 0;
        this._sendContent = inputContent;
    }

    onNewMessage(event: EventChatNewMessage) {

        this.refreshMessage();
    }

    // send
    onClickSend() {
        const channelId = this._item.channelType;
        const playerId = this._item.playerId;

        const content = this._sendContent;

        const config = ChatConfigManager.getChannelConfigById(channelId);
        if (config) {
            const isOk = ConditionManager.ins().checkCondition(config.unlockSpeakCondition, true, true);
            if (!isOk) {
                console.warn("玩家未达到条件. 无法发送消息");
                return;
            }
        }


        // blank
        if (StringUtils.isBlank(content)) {
            GIns.floatingTextMgr.showTips(`发送内容不能为空`);
            return;
        }


        // CD / 每个频道独立
        const cdTimeMs = config.speakCdSecond * 1000;
        const cdName = ChatUtils.createChannelCDName(channelId);
        if (CdUtils.isInCd(cdName, cdTimeMs)) {
            const restSecond = CdUtils.getRestCdSecond(cdName);
            GIns.floatingTextMgr.showTips(`${restSecond}秒后可再次发言`);
            return;
        }


        // 替换
        const message = ChatUtils.encodeChatMessage(content);

        ChatModel.ins().sendAuto(
            channelId,
            playerId,
            message
        );

        this.view.labelInput.text = "";
        this.view.labelShow.text = "";
        this._sendContent = "";
    }

    irRow(index: number, comp: ChatOneRowComp) {
        const rowVo = this._messageRowArray[index];
        comp.reset(rowVo);
    }

    protected irProvider(index: number): string {
        const rowVo = this._messageRowArray[index];
        if (rowVo.msgType == ServerEnums.ChannelSendMessageType.TEMPLATE) {
            const templateId = rowVo.templateVo?.templateId || null;
            if (templateId == ServerEnums.ChatTemplateType.LEAGUE_INVITE) {
                return 'ui://chat/ChatOneRowCompForLeagueInvite'
            }

            // card
            if (templateId == ServerEnums.ChatTemplateType.BUY_MONTH_VIP_CARD
                || templateId == ServerEnums.ChatTemplateType.BUY_FOREVER_VIP_CARD
            ) {
                return 'ui://chat/ChatOneRowCardComp'
            }

            if (templateId == ServerEnums.ChatTemplateType.TEAM_INSTANCE_INVITE) {
                return 'ui://chat/ChatOneRowComTCInvite'
            }

            if (templateId == ServerEnums.ChatTemplateType.TEAM_INSTANCE_JOIN
                || templateId == ServerEnums.ChatTemplateType.TEAM_INSTANCE_LEAVE
                || templateId == ServerEnums.ChatTemplateType.TEAM_INSTANCE_TRANSFER
                || templateId == ServerEnums.ChatTemplateType.TEAM_INSTANCE_WIN
            ) {
                return 'ui://chat/ChatOneRowComTCFail'
            }
            if (templateId == ServerEnums.ChatTemplateType.LEAGUE_EXPLORE_BUILDING) {
                return 'ui://chat/ChatOneRowCompForLeagueExplore';
            }
        }
        return 'ui://chat/ChatOneRowComp'
    }

    // 新消息
    refreshMessage() {
        this.reset(this._item);

        // this.view.rowList.scrollPane.scrollBottom(true);

    }

    onUseEmoji(emojiId: number) {
        this.view.getController("isShowEmoji").selectedIndex = 0;

        const c = ChatConfigManager.getEmojiConfigById(emojiId)
        if (!c) {
            return;
        }
        const id = c.id;
        const icon = c.icon;
        const oldText = this.view.labelInput.text;

        // emoji 格式 = ${emoji:1}
        this.view.labelInput.text = oldText + ChatUtils.getEmojiPlaceHolderById(emojiId);
        // this.view.labelInput.text = oldText + ` [img]${icon}[/img] `;

        this.onInputChange();
    }

    // 刷新内容
    reset(newItem: ChatLeftTabItemVo) {
        this.view.rowList.scrollPane.cancelDragging();
        // this.view.rowList.alpha = 0;

        const oldItem = this._item;
        this._item = newItem;
        const context = ChatModel.ins().context;

        const type = newItem.type;
        const playerId = newItem.playerId;

        let msgArray: Vo.chat.ChatContentVo[];
        if (type == EnumLeftTabType.CHANNEL) {
            // 频道
            const channelId = newItem.channelType;
            const config = ChatConfigManager.getChannelConfigById(channelId);
            this.view.labelTabName.text = config.name;

            msgArray = context.getMessageArrayByChannelType(channelId);

            if (config.chatBan) {
                //频道禁言
                this.view.labelInput.touchable = false;
                this.view.labelInput.promptText = '该频道无法发言';
                this.view.btnSend.grayed = true;
                this.view.btnSend.touchable = false;
                this.view.btnEmoji.grayed = true;
                this.view.btnEmoji.touchable = false;

            } else {
                this.view.labelInput.touchable = true;
                this.view.labelInput.promptText = '点击输入';
                this.view.btnSend.grayed = false;
                this.view.btnSend.touchable = true;
                this.view.btnEmoji.grayed = false;
                this.view.btnEmoji.touchable = true;
            }

        } else {
            // 私聊
            this.view.labelInput.touchable = true;
            this.view.labelInput.promptText = '点击输入';
            this.view.btnSend.grayed = false;
            this.view.btnSend.touchable = true;
            this.view.btnEmoji.grayed = false;
            this.view.btnEmoji.touchable = true;

            // name
            this.view.labelTabName.text = newItem.playerName;

            msgArray = context.getMessageArrayByPlayerId(playerId);
        }

        // 转为实际要显示的聊天内容
        let lastTimeMs: number = 0;

        // 要显示的聊天行
        const rowVoArray: ChatRowVo[] = [];
        let isFirst = true;
        for (let it of msgArray) {
            const channelType = it.channel;
            const sendTimeMs = it.sendTime;
            if (isFirst) {
                // add tips for time
                const timeRowVo = ChatRowVo.fromTimeMs(sendTimeMs, channelType);
                rowVoArray.push(timeRowVo);
            }
            isFirst = false;


            const rowVo = ChatRowVo.fromMessage(it);
            const newTimeMs = rowVo.timeMs;
            if (lastTimeMs == 0) {
                lastTimeMs = newTimeMs;
            }
            // 超过 5min
            const diffTimeMs = newTimeMs - lastTimeMs;
            if (diffTimeMs >= 5 * 60 * 1000) {
                // add tips for time
                const timeRowVo = ChatRowVo.fromTimeMs(newTimeMs, channelType);
                rowVoArray.push(timeRowVo);
            }
            lastTimeMs = newTimeMs;

            // 非模板
            if (rowVo.templateVo == null) {
                // skip blank msg
                if (StringUtils.isBlank(rowVo.content)) {
                    continue;
                }
            }
            // chat
            rowVoArray.push(rowVo);
        }
        this._messageRowArray = rowVoArray;
        this.view.rowList.numItems = this._messageRowArray.length;

        this.view.rowList.scrollPane.scrollBottom(false);
        // GameTimer.ins().frameOnce(0, this, () => {
        //     this.view.rowList.scrollPane.scrollBottom(false);

        // });

        // GameTimer.ins().frameOnce(5, this, () => {
        //     this.view.rowList.alpha = 255;
        // })
    }
}
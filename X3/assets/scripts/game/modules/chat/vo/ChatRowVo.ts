import { I18nManager } from "db://assets/scripts/core/i18n/I18nManager";
import { StringUtils } from "db://assets/scripts/core/utils/StringUtils";
import { ChatConfigManager } from "db://assets/scripts/game/modules/chat/config/ChatConfigManager";
import { EnumChatSendType } from "db://assets/scripts/game/modules/chat/enums/EnumChatSendType";
import { ChatUtils } from "db://assets/scripts/game/modules/chat/utils/ChatUtils";
import { PlayerModel } from "db://assets/scripts/game/modules/player/model/PlayerModel";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { VipModel } from "../../vip/model/VipModel";
import { SettingsConfigManager } from "db://assets/scripts/game/modules/settings/config/SettingsConfigManager";
import ChannelType = ServerEnums.ChannelType;
import ChatTemplateType = ServerEnums.ChatTemplateType;
import G from "../../../../core/comm/G";
import { TeamChallengeConfigManager } from "../../teamChallenge/config/TeamChallengeConfigManager";
import { TeamChallengeModel } from "../../teamChallenge/model/TeamChallengeModel";

/**
 * 一行聊天内容
 */
export class ChatRowVo {

    private msgId: string;
    type: EnumChatSendType = EnumChatSendType.OTHER;
    isCanSee: boolean = true;
    content: string = "";
    timeMs: number = 0;
    vipLv: number = 0

    playerId: number = 0;
    playerName: string;
    headFrameId: number;
    headIconId: number;
    channelType: ServerEnums.ChannelType;
    msgType: ServerEnums.ChannelSendMessageType;
    templateVo: Vo.chat.ChatTemplateVo;

    // skin
    chatBoxId: number = 0;
    chatFontId: number = 0;

    // 后端消息
    static fromMessage(
        msg: Vo.chat.ChatContentVo
    ): ChatRowVo {
        const item = new ChatRowVo();
        item.msgId = msg.msgId;
        item.channelType = msg.channel;
        item.timeMs = msg.sendTime;

        // who
        const playerId = msg.id;
        const isMe = playerId == PlayerModel.ins().Vo.id;
        item.type = isMe ? EnumChatSendType.ME : EnumChatSendType.OTHER;

        item.playerId = playerId;
        item.playerName = msg.name;
        item.headIconId = msg.headIcon || 0;
        item.headFrameId = msg.headFrame || 0;
        item.content = msg.message;
        item.vipLv = VipModel.ins().getVipLvByExp(msg.vipExp);
        item.msgType = msg.msgType;
        item.templateVo = msg.templateVo

        // skin
        item.chatBoxId = msg.chatBoxId || SettingsConfigManager.defaultChatBoxId;
        item.chatFontId = msg.chatWordColorId || SettingsConfigManager.defaultChatColorId;

        if (item.msgType == ServerEnums.ChannelSendMessageType.TEMPLATE) {
            //模板消息
            if (msg.templateVo.termVo?.content) {
                item.content = msg.templateVo.termVo?.content
            }
        }
        return item;
    }

    static fromTimeMs(
        timeMs: number,
        channelType: ServerEnums.ChannelType
    ): ChatRowVo {
        const item = new ChatRowVo();
        
        item.channelType = channelType;
        item.type = EnumChatSendType.TIME;
        item.timeMs = timeMs;

        // no skin

        return item;
    }


    // static createForSendFriend(playerBaseVo: Vo.player.PlayerBaseVo) {
    //     const item = new ChatRowVo();
    //     item.isCanSee = false;
    //     item.channelType = ChannelType.PRIVATE;
    //     item.timeMs = TimeManager.serverNow;
    //
    //     // who
    //     const playerId = playerBaseVo.id;
    //     const isMe = playerId == PlayerModel.ins().Vo.id;
    //     item.type = isMe ? EnumChatSendType.ME : EnumChatSendType.OTHER;
    //     item.playerId = playerId;
    //     item.playerName = playerBaseVo.name;
    //     item.headIconId = playerBaseVo.headIcon;
    //     item.headFrameId = playerBaseVo.headFrame;
    //     item.content = "";
    //
    //     return item;
    // }

    /**
     * to 主界面内容
     */
    toMainPageContent(): string {


        // 常规玩家消息
        let content = ChatUtils.decodeChatMessage(this.content);
        // 模板消息
        if (this.isTemplateCard()) {
            content = this.getTemplateSmallTipsContent();
        } else {
            content = ChatUtils.decodeChatMessage(this.content);
        }
        const config = ChatConfigManager.getChannelConfigById(this.channelType);
        if (!config) {
            return content;
        }
        const channelName = I18nManager.ins().translateOrBlank(config.settingName);
        if(this.isHide(this.templateVo?.templateId)){
            return `[color=#0099ff][${channelName}][/color]` + content;
        }

        let vipColor = VipModel.ins().getChatColors(this.vipLv)
        let playerNameStr: string = this.playerName
        if (vipColor) {
            playerNameStr = `<color=${vipColor.colors[0].color}>[${this.playerName}]</color>`
            if (vipColor.colors[0].outline) {
                playerNameStr = `<outline color=${vipColor.colors[0].outline} width=2>${playerNameStr}</outline>`
            }
        }
        return `[color=#0099ff][${channelName}][/color] ${playerNameStr}: ` + content;
    }

    getMsgId(): string {
        return this.msgId;
    }

    /**
     * 是否我的私人消息
     */
    isMyPrivateMessage() {
        return this.playerId == PlayerModel.ins().playerId
            && this.channelType == ChannelType.PRIVATE;
    }

    // 非空内容
    isNotBlankContent(): boolean {
        return StringUtils.isNotBlank(this.content);
    }

    /**是否隐藏名字 */
    isHide(templateId){
        if(templateId == ServerEnums.ChatTemplateType.TEAM_INSTANCE_JOIN 
            ||templateId == ServerEnums.ChatTemplateType.TEAM_INSTANCE_LEAVE 
            ||templateId == ServerEnums.ChatTemplateType.TEAM_INSTANCE_TRANSFER
            ||templateId == ServerEnums.ChatTemplateType.TEAM_INSTANCE_WIN){
                return true;
        }
        return false
    }

    // 空内容
    isBlankContent(): boolean {
        return StringUtils.isBlank(this.content);
    }

    isTemplateCard(): boolean {
        return this.msgType == ServerEnums.ChannelSendMessageType.TEMPLATE
    }

    /**
     * 模板在主界面的小提示内容
     * @private
     */
    private getTemplateSmallTipsContent(): string {
        const templateVo = this.templateVo
        const templateId = templateVo.templateId;
        if (templateId == ChatTemplateType.BUY_MONTH_VIP_CARD) {
            return "激活了月卡"
        }
        if (templateId == ChatTemplateType.BUY_FOREVER_VIP_CARD) {
            return "激活了终身卡"
        }
        if (templateId == ChatTemplateType.TEAM_INSTANCE_INVITE){

        }
        const content = ChatUtils.getTemplateContent(templateId);
        if(templateId == ServerEnums.ChatTemplateType.TEAM_INSTANCE_JOIN ||
            templateId == ServerEnums.ChatTemplateType.TEAM_INSTANCE_LEAVE ||
            templateId == ServerEnums.ChatTemplateType.TEAM_INSTANCE_TRANSFER
        ){
            return G.I18nManager.lang(content,[templateVo.termVo.playerName]);

        }else if(templateId == ServerEnums.ChatTemplateType.TEAM_INSTANCE_WIN){
            const tid = templateVo.termVo?.teamInstanceConfigId
            if(tid){
                const info = TeamChallengeModel.ins().getFloorInfo(tid);
                const cCfg = TeamChallengeConfigManager.getChapterCfg(tid)
                return G.I18nManager.lang(content,[cCfg.chapterName+`第${info.cur}关`]);
            }
           
        }

        if (templateId == ChatTemplateType.TEAM_INSTANCE_INVITE){
            const vo = templateVo?.termVo?.teamBriefVo;
            let des=''
            if(vo){
                const cfg = TeamChallengeConfigManager.getChapterCfg(vo.teamInstanceConfigId);
                const cur = TeamChallengeModel.ins().getFloorInfo();
                des = cfg.chapterName+`第${cur?.cur}关`;
            }
            return '组队邀请-异星合击'+des
            // “”+玩法名+队伍目标关卡
        }

        return "";
    }

    isMySend(): boolean {
        return PlayerModel.ins().playerId == this.playerId
    }
}
import { Vec3 } from "cc";
import G from "db://assets/scripts/core/comm/G";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { EnumChatSendType } from "db://assets/scripts/game/modules/chat/enums/EnumChatSendType";
import { ChatSkinUtils } from "db://assets/scripts/game/modules/chat/utils/ChatSkinUtils";
import { ChatUtils } from "db://assets/scripts/game/modules/chat/utils/ChatUtils";
import { ChatRowVo } from "db://assets/scripts/game/modules/chat/vo/ChatRowVo";
import { PlayerAvatar } from "db://assets/scripts/game/modules/common/playerInfo/PlayerAvatar";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { ChatConfigManager } from "../config/ChatConfigManager";
import { ChatLeagueExploreClickBuildingComp } from "./ChatLeagueExploreClickBuildingComp";
import { ChatOneRowContentBaseComp } from "./ChatOneRowContentBaseComp";

@bindFguiExtension("ui://chat/ChatOneRowContentComp")
export class ChatOneRowContentComp extends ChatOneRowContentBaseComp {

    private _posForBgR: Readonly<Vec3>;
    private _posForBgL: Readonly<Vec3>;

    private get view(): ui.chat.components.ChatOneRowContentComp {
        return this as any;
    }

    protected onInit() {
        this._posForBgR = this.view.bgContentR.node.position;
        this._posForBgL = this.view.bgContentL.node.position;

        //记录默认颜色
        this._defaultColor.set(this.view.textPlayerNameL.color)
        this._defaultOutlineWidth = this.view.textContentL.stroke
        if (this._defaultOutlineWidth > 0 && this.view.textPlayerNameL.strokeColor) {
            this._defaultOutlineColor = this.view.textPlayerNameL.strokeColor.clone()
        }
    }


    protected onPreDispose() {
        GameTimer.ins().clearAll(this);
        super.onPreDispose();
    }

    protected getLbNames(): FGUI.GTextField[] {
        return [this.view.textPlayerNameL, this.view.textPlayerNameR]
    }

    protected getAvatar(): PlayerAvatar {
        return FguiScriptUtils.toMyScriptClass(this.view.playerAvatar, PlayerAvatar);
    }

    reset(rowVo: ChatRowVo) {
        this.setRowVo(rowVo);
        const showType = rowVo.type;
        // skin msg bg
        this.view.bgContentL.icon = ChatSkinUtils.getChatBgIconPath(rowVo?.chatBoxId);
        this.view.bgContentR.icon = ChatSkinUtils.getChatBgIconPath(rowVo?.chatBoxId);
        // skin msg font
        this.view.textContentL.color = ChatSkinUtils.getChatFontColor(rowVo?.chatFontId);
        this.view.textContentR.color = ChatSkinUtils.getChatFontColor(rowVo?.chatFontId);

        this.view.getController("type").selectedIndex = showType;

        const sendTimeMs = rowVo.timeMs;
        if (sendTimeMs) {

            this.view.textTime.text = ChatUtils.getRowTimeTips(sendTimeMs);

        } else {
            this.view.textTime.text = "";
        }


        // 解码消息
        const messageTemplate = rowVo?.content || "";
        let msg = '';
        if (rowVo.templateVo?.templateId == ServerEnums.ChatTemplateType.LEAGUE_EXPLORE_BUILDING_BE_OCCUPY) {
            let templateConfig = ChatConfigManager.getTemplateConfigById(rowVo.templateVo?.templateId);
            let buildingConfigId: number = rowVo.templateVo.termVo.leagueExploreBuildingConfigId;
            let buildingCfg = G.TableManager.getDataById(table.map.MapBuildingConfig, buildingConfigId);
            let buildingName: string = buildingCfg ? buildingCfg.name : '';
            msg = G.I18nManager.lang(templateConfig.content, buildingConfigId, buildingName);
        } else {
            msg = ChatUtils.decodeChatMessage(messageTemplate, true);
        }

        // content
        this.view.textContentL.ubbEnabled = true;
        this.view.textContentR.ubbEnabled = true;

        // who
        if (showType == EnumChatSendType.ME) {
            ChatUtils.setUBBTextWithImg(this.view.textContentR, msg);
        } else if (showType == EnumChatSendType.OTHER) {
            ChatUtils.setUBBTextWithImg(this.view.textContentL, msg);
        }


        this.view.bgContentL.alpha = 0;
        this.view.bgContentR.alpha = 0;

        this.updateItemSize(showType);
        // GameTimer.ins().clearAll(this);
        // GameTimer.ins().once(2, this, () => {
        //     if (!this.view.node.isValid) {
        //         return;
        //     }
        //     this.updateItemSize(showType);
        // });

        if (rowVo.templateVo?.templateId == ServerEnums.ChatTemplateType.LEAGUE_EXPLORE_BUILDING_BE_OCCUPY) {
            //添加点击组件
            if (this.view.textContentL.node.getComponent(ChatLeagueExploreClickBuildingComp) == null) {
                this.view.textContentL.node.addComponent(ChatLeagueExploreClickBuildingComp)
            }
            if (this.view.textContentR.node.getComponent(ChatLeagueExploreClickBuildingComp) == null) {
                this.view.textContentR.node.addComponent(ChatLeagueExploreClickBuildingComp)
            }
        }
    }

    private updateItemSize(showType: EnumChatSendType) {
        // 有问题
        if (showType == EnumChatSendType.ME) {
            this.view.textContentR.autoSize = FGUI.AutoSizeType.Both;
            if (this.view.textContentR.textWidth >= 300) {
                this.view.textContentR.autoSize = FGUI.AutoSizeType.Height;
                this.view.textContentR.width = 300;
            }
        } else if (showType == EnumChatSendType.OTHER) {
            this.view.textContentL.autoSize = FGUI.AutoSizeType.Both;
            if (this.view.textContentL.textWidth >= 300) {
                this.view.textContentL.autoSize = FGUI.AutoSizeType.Height;
                this.view.textContentL.width = 300;
            }

        }

        // ensure pos again
        this.view.bgContentL.node.position = this._posForBgL.clone();
        this.view.bgContentR.node.position = this._posForBgR.clone();

        this.view.bgContentR.alpha = 255;
        this.view.bgContentL.alpha = 255;

    }
}
import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { EnumChatSendType } from "db://assets/scripts/game/modules/chat/enums/EnumChatSendType";
import { ChatUtils } from "db://assets/scripts/game/modules/chat/utils/ChatUtils";
import { ChatRowVo } from "db://assets/scripts/game/modules/chat/vo/ChatRowVo";
import { PlayerAvatar } from "db://assets/scripts/game/modules/common/playerInfo/PlayerAvatar";
import G from "../../../../core/comm/G";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import { LeagueModel } from "../../league/LeagueModel";
import { ChatOneRowContentBaseComp } from "./ChatOneRowContentBaseComp";

@bindFguiExtension('ui://chat/ChatOneRowCompForLeagueInvite')
export class ChatOneRowCompForLeagueInvite extends ChatOneRowContentBaseComp {
    protected _rowVo: ChatRowVo = null;

    protected _defaultContentH: number = 0
    protected _defaultBgH: number = 0
    protected _defaultH: number = 0

    private get view(): ui.chat.components.ChatOneRowCompForLeagueInvite {
        return this as any;
    }

    protected onInit() {
        //记录默认颜色
        this._defaultColor.set(this.view.textPlayerNameL.color)
        this._defaultOutlineWidth = this.view.textContentL.stroke
        if (this._defaultOutlineWidth > 0 && this.view.textPlayerNameL.strokeColor) {
            this._defaultOutlineColor = this.view.textPlayerNameL.strokeColor.clone()
        }

        this.view.btnJoinL.onClick(this.onClickJoin, this)
        this.view.btnJoinR.onClick(this.onClickJoin, this)

        this._defaultContentH = this.view.textContentL.height
        this._defaultBgH = this.view.bgContentL.height
        this._defaultH = this.view.height
    }

    protected getLbNames(): FGUI.GTextField[] {
        return [this.view.textPlayerNameL, this.view.textPlayerNameR]
    }

    protected getAvatar(): PlayerAvatar {
        return FguiScriptUtils.toMyScriptClass(this.view.playerAvatar, PlayerAvatar);
    }

    protected onClickJoin(): void {
        LeagueModel.ins().applyJoinLeague(1, this._rowVo.templateVo?.termVo.id);
    }

    reset(rowVo: ChatRowVo) {
        this._rowVo = rowVo;
        this.setRowVo(rowVo);
        const showType = rowVo.type;

        this.view.getController("type").selectedIndex = showType;

        // 解码消息
        const messageTemplate = rowVo?.content || "";
        const msg = ChatUtils.decodeChatMessage(messageTemplate, true);

        // content
        this.view.textContentL.ubbEnabled = true;
        this.view.textContentR.ubbEnabled = true;

        // who
        if (showType == EnumChatSendType.ME) {
            ChatUtils.setUBBTextWithImg(this.view.textContentR, msg);
        } else if (showType == EnumChatSendType.OTHER) {
            ChatUtils.setUBBTextWithImg(this.view.textContentL, msg);
        }

        let leagueMaxNum: number = rowVo.templateVo?.termVo.amount;
        let leagueLvCfg = G.TableManager.getDataById(table.league.LeagueLevelConfig, rowVo.templateVo?.termVo.level);
        if (leagueLvCfg) {
            leagueMaxNum = leagueLvCfg.memberCount;
        }
        this.view.textLeagueIdL.text = this.view.textLeagueIdR.text = 'ID:' + rowVo.templateVo?.termVo.id;
        this.view.textLeagueNameL.text = this.view.textLeagueNameR.text = rowVo.templateVo?.termVo.name + ' ' + rowVo.templateVo?.termVo.amount + '/' + leagueMaxNum;
        this.view.textLeagueLvL.text = this.view.textLeagueLvR.text = 'Lv.' + rowVo.templateVo?.termVo.level;

        this.resizeItem();

    }

    protected resizeItem(): void {
        if (this.view?.node?.isValid) {
            //刷新大小
            let offset = 0
            if (this._rowVo.type == EnumChatSendType.ME) {
                offset = this.view.textContentR.height - this._defaultContentH
            } else if (this._rowVo.type == EnumChatSendType.OTHER) {
                offset = this.view.textContentL.height - this._defaultContentH
            }
            this.view.bgContentL.height = this.view.bgContentR.height = this._defaultBgH + offset
            this.view.height = this._defaultH + offset
        }
    }
}
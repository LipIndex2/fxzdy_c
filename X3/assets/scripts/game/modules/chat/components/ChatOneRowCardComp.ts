import { Color, Vec3 } from "cc";
import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { GameTimer } from "db://assets/scripts/core/timer/GameTimer";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { EnumChatSendType } from "db://assets/scripts/game/modules/chat/enums/EnumChatSendType";
import { ChatUtils } from "db://assets/scripts/game/modules/chat/utils/ChatUtils";
import { ChatRowVo } from "db://assets/scripts/game/modules/chat/vo/ChatRowVo";
import { PlayerAvatar } from "db://assets/scripts/game/modules/common/playerInfo/PlayerAvatar";
import { VipModel } from "../../vip/model/VipModel";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import { ChatConfigManager } from "db://assets/scripts/game/modules/chat/config/ChatConfigManager";
import { JumpManager } from "db://assets/scripts/game/modules/jump/JumpManager";

@bindFguiExtension("ui://chat/ChatOneRowCardComp")
export class ChatOneRowCardComp extends FGUI.GComponent {

    // 最大宽度
    private _maxWidth: number = 0;
    // 背景高度
    private _bgH: number = 0;
    private _bgW: number = 0;
    // 原始高度
    private _originalViewH: number = 0;

    protected _defaultColor: Color = new Color('#ADC8F8')
    protected _defaultOutlineColor: Color = null
    protected _defaultOutlineWidth: number = 0
    protected _vipColor: Color = new Color('#ADC8F8')
    protected _vipOutlineColor: Color = new Color('#FFFFFF')
    protected _vipOutlineWidth: number = 2

    private _posForBgR: Readonly<Vec3>;
    private _posForBgL: Readonly<Vec3>;
    // 模板消息
    private _templateConfig: table.chat.ChatTemplateConfig;

    private get view(): ui.chat.components.ChatOneRowCardComp {
        return this as any;
    }


    protected onConstruct() {
        super.onConstruct();

        this.view.btnJumpL.onClick(this.onClickJump, this);
        this.view.btnJumpR.onClick(this.onClickJump, this);

        this._posForBgR = this.view.bgContentR.node.position;
        this._posForBgL = this.view.bgContentL.node.position;

        this._maxWidth = this.view.textContentL.maxWidth;
        this._bgH = this.view.bgContentL.height;
        this._bgW = this.view.bgContentL.width;
        this._originalViewH = this.view.height;

        //记录默认颜色
        this._defaultColor.set(this.view.textPlayerNameL.color)
        this._defaultOutlineWidth = this.view.textContentL.stroke
        if (this._defaultOutlineWidth > 0 && this.view.textPlayerNameL.strokeColor) {
            this._defaultOutlineColor = this.view.textPlayerNameL.strokeColor.clone()
        }
    }

    onClickJump() {
        JumpManager.ins().jumpById(this._templateConfig.btnJumpId)
    }

    protected onPreDispose() {
        GameTimer.ins().clearAll(this);

        super.onPreDispose();
    }

    reset(rowVo: ChatRowVo) {
        const showType = rowVo.type;

        // 解码消息
        const templateId = rowVo?.templateVo.templateId || 0;
        this._templateConfig = ChatConfigManager.getTemplateConfigById(templateId);

        this.view.getController("type").selectedIndex = showType;

        const avatar = FguiScriptUtils.toMyScriptClass(this.view.playerAvatar, PlayerAvatar);
        const playerName = rowVo.playerName;
        avatar.reset(
            rowVo.playerId,
            rowVo.headIconId,
            0,
            0
        );

        // VIP name
        this.setVipPlayerName(rowVo);

        this.view.textPlayerNameL.text = playerName;
        this.view.textPlayerNameR.text = playerName;
        const sendTimeMs = rowVo.timeMs;
        if (sendTimeMs) {
            this.view.textTime.text = ChatUtils.getRowTimeTips(sendTimeMs);

        } else {
            this.view.textTime.text = "";
        }


        const msg = ChatUtils.getTemplateContent(templateId);

        // content
        this.view.textContentL.ubbEnabled = true;
        this.view.textContentR.ubbEnabled = true;

        // who
        if (showType == EnumChatSendType.ME) {
            this.view.imageR.icon = this._templateConfig.imageLogo;
            this.view.textContentR.text = msg;
        } else if (showType == EnumChatSendType.OTHER) {
            this.view.imageL.icon = this._templateConfig.imageLogo;
            this.view.textContentL.text = msg;
        }

    }

    private setVipPlayerName(rowVo: ChatRowVo) {
        let vipColor = null;
        if (rowVo.vipLv > 0) {
            vipColor = VipModel.ins().getChatColors(rowVo.vipLv)
        }
        let outline: string = null
        if (vipColor) {
            this._vipColor.fromHEX(vipColor.colors[0].color)
            outline = vipColor.colors[0].outline
            if (outline) {
                this._vipOutlineColor.fromHEX(outline)
                this.setTextPlayerNameColor(this._vipColor, this._vipOutlineColor, this._vipOutlineWidth)
            } else {
                this.setTextPlayerNameColor(this._vipColor, null, 0)
            }
        } else {
            this.setTextPlayerNameColor(this._defaultColor, this._defaultOutlineColor, this._defaultOutlineWidth)
        }
    }

// vip name
    protected setTextPlayerNameColor(color: Color, outline: Color, outlineWidth: number): void {
        this.view.textPlayerNameL.stroke = this.view.textPlayerNameR.stroke = outlineWidth
        if (outlineWidth > 0 && outline) {
            //没有描边
            this.view.textPlayerNameL.strokeColor = this.view.textPlayerNameR.strokeColor = outline
        }
        this.view.textPlayerNameL.color = this.view.textPlayerNameR.color = color
    }
}
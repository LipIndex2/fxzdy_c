import { Color } from "cc";
import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { ChatRowVo } from "db://assets/scripts/game/modules/chat/vo/ChatRowVo";
import { PlayerAvatar } from "db://assets/scripts/game/modules/common/playerInfo/PlayerAvatar";
import { VipModel } from "../../vip/model/VipModel";

/**
 * 聊天信息显示基类 用于处理公共的头像昵称等
*/
export abstract class ChatOneRowContentBaseComp extends FGUI.GComponent {

    protected _defaultColor: Color = new Color('#ADC8F8')
    protected _defaultOutlineColor: Color = null
    protected _defaultOutlineWidth: number = 0
    protected _vipColor: Color = new Color('#ADC8F8')
    protected _vipOutlineColor: Color = new Color('#FFFFFF')
    protected _vipOutlineWidth: number = 2

    protected getLbNames(): FGUI.GTextField[] {
        return []
    }

    protected getAvatar(): PlayerAvatar {
        return null;
    }

    protected setRowVo(rowVo: ChatRowVo): void {
        const avatar = this.getAvatar();
        if (avatar) {
            const isMySend = rowVo.isMySend();
            if (isMySend) {
                avatar.resetMe();
            } else {
                avatar.reset(
                    rowVo.playerId,
                    rowVo.headIconId,
                    rowVo.headFrameId,
                    0
                );
            }
        }

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
                this.updateLbName(this._vipColor, this._vipOutlineColor, this._vipOutlineWidth, rowVo.playerName)
            } else {
                this.updateLbName(this._vipColor, null, 0, rowVo.playerName)
            }
        } else {
            this.updateLbName(this._defaultColor, this._defaultOutlineColor, this._defaultOutlineWidth, rowVo.playerName)
        }

    }

    protected updateLbName(color: Color, outline: Color, outlineWidth: number, playerName: string): void {
        let lbNames = this.getLbNames();
        if (lbNames?.length > 0) {
            lbNames.forEach((lbName) => {
                lbName.stroke = outlineWidth
                if (outlineWidth > 0 && outline) {
                    //没有描边
                    lbName.strokeColor = outline
                }
                lbName.color = color;
                lbName.text = playerName;
            })
        }

    }
}
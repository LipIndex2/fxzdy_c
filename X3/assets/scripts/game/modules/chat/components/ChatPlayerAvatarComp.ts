import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { ChatLeftTabItemVo } from "db://assets/scripts/game/modules/chat/vo/ChatLeftTabItemVo";
import { ChatModel } from "db://assets/scripts/game/modules/chat/model/ChatModel";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { PlayerAvatar } from "db://assets/scripts/game/modules/common/playerInfo/PlayerAvatar";
import { ColorUtils } from "db://assets/scripts/core/utils/ColorUtils";

export class ChatPlayerAvatarComp extends FGUI.GComponent {
    private _item: ChatLeftTabItemVo;

    private get view(): ui.chat.components.ChatPlayerAvatarComp {
        return this as any;
    }

    protected onConstruct() {
        super.onConstruct();


        this.view.btnDel.onClick(this.onClickDel, this);
    }

    onClickDel() {
        const context = ChatModel.ins().context;

        if (!this._item) {
            return;
        }
        const playerId = this._item?.playerId || 0;
        context.deleteChatByPlayerId(playerId);
    }

    reset(item: ChatLeftTabItemVo) {
        if (!item) {
            return;
        }
        this._item = item;
        const context = ChatModel.ins().context;

        const playerId = item.playerId;

        
        const isHaveNew = context.getFriendMessageCountByPlayerId(playerId) > 0;
        this.view.getController("isHaveNewMsg").selectedIndex = isHaveNew ? 1 : 0;


        const playerAvatar = FguiScriptUtils.toMyScriptClass(this.view.player, PlayerAvatar);
        playerAvatar.reset(
            playerId,
            item.headIconId,
            0,
            0,
        )

        this.view.textPlayerName.text = item.playerName;
    }

    updateMessageCount(count: number) {
        if (count <= 0) {
            this.view.getController("isHaveNewMsg").selectedIndex = 0;
            return;
        }
        this.view.getController("isHaveNewMsg").selectedIndex = 1;
        this.view.textCount.text = count?.toString() || "0";
    }

    setChoose(isChoose: boolean) {
        this.view.getController("isChoose").selectedIndex = isChoose ? 1 : 0;

        if (isChoose) {
            this.view.textPlayerName.color = ColorUtils.createColor("#FDFBD8");
            this.view.textPlayerName.strokeColor = ColorUtils.createColor("#914101");
            this.view.textPlayerName.stroke = 2;
        } else {
            this.view.textPlayerName.color = ColorUtils.createColor("#93CBFF");
            this.view.textPlayerName.strokeColor = ColorUtils.createColor("#10214C");
            this.view.textPlayerName.stroke = 2;
        }
    }
}
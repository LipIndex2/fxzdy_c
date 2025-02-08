import FGUI from "db://assets/scripts/core/fgui/FGUI";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";

/**
 * emoji
 */
export class ChatEmojiBtn extends FGUI.GButton {
    private _config: table.chat.EmojiConfig;

    private get view(): ui.chat.btn.ChatEmojiBtn {
        return this as any;
    }


    protected onConstruct() {
        super.onConstruct();


        this.view.onClick(this.onClick0, this);

    }

    onClick0() {
        const id = this._config?.id;
        if (!id) {
            return;
        }
        FacadeManager.ins().emit(NotificationKey.CHAT_USE_EMOJI, id);
    }

    reset(config: table.chat.EmojiConfig) {
        this._config = config;
        this.view.imageEmoji.icon = config.atlasPath + "/" + config.icon;


    }
}
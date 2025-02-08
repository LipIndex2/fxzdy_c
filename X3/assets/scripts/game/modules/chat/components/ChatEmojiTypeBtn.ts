import FGUI from "db://assets/scripts/core/fgui/FGUI";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";

/**
 * emoji 类型
 */
export class ChatEmojiTypeBtn extends FGUI.GButton {


    private _config: table.chat.EmojiTypeConfig;
    private _index: number;

    private get view(): ui.chat.btn.ChatEmojiTypeBtn {
        return this as any;
    }


    protected onConstruct() {
        super.onConstruct();


        this.view.onClick(this.onClick0, this);

    }

    onClick0() {
        FacadeManager.ins().emit(NotificationKey.CHAT_CHANGE_EMOJI_TYPE, this._index);
    }

    reset(index: number,
          config: table.chat.EmojiTypeConfig,
          curIndex: number = 0
    ) {
        this._index = index;
        this._config = config;

        const isChoose = this._index == curIndex;
        this.view.getController("isChoose").selectedIndex = isChoose ? 1 : 0;

    }
}
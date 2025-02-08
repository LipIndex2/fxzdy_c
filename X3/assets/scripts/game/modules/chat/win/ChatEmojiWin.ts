import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { ChatLeftTabItemVo } from "db://assets/scripts/game/modules/chat/vo/ChatLeftTabItemVo";
import { ChatEmojiBtn } from "db://assets/scripts/game/modules/chat/components/ChatEmojiBtn";
import { ChatEmojiTypeBtn } from "db://assets/scripts/game/modules/chat/components/ChatEmojiTypeBtn";
import { ChatConfigManager } from "db://assets/scripts/game/modules/chat/config/ChatConfigManager";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";

/**
 * emoji
 */
export class ChatEmojiWin extends FGUI.GComponent implements INotification {

    private _item: ChatLeftTabItemVo;
    private _curTypeIndex: number = 0;

    private _emojiTypeConfigArray: table.chat.EmojiTypeConfig[] = [];
    private _emojiConfigArray: table.chat.EmojiConfig[] = [];
    private _curTypeConfig: table.chat.EmojiTypeConfig;

    private get view(): ui.chat.ChatEmojiWin {
        return this as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.CHAT_CHANGE_EMOJI_TYPE
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.CHAT_CHANGE_EMOJI_TYPE: {
                this.setTabIndex(args);
                break;
            }
        }
    }


    protected onConstruct() {
        super.onConstruct();

        this.view.typeList.setVirtual();
        this.view.typeList.itemRenderer = this.irType.bind(this);
        this.view.emojiList.itemRenderer = this.irEmoji.bind(this);

        this.reset();
        FacadeManager.ins().registerNotification(this);
    }


    protected onPreDispose() {
        FacadeManager.ins().removeNotification(this);

        super.onPreDispose();
    }

    irType(index: number, btn: ChatEmojiTypeBtn) {
        btn.reset(index, this._emojiTypeConfigArray[index], this._curTypeIndex);
    }

    irEmoji(index: number, btn: ChatEmojiBtn) {
        btn.reset(this._emojiConfigArray[index])


    }

    private reset() {

        this._emojiTypeConfigArray = ChatConfigManager.getAllEmojiTypeConfigArray();
        const curTypeConfig = this._emojiTypeConfigArray[this._curTypeIndex];
        if (!curTypeConfig) {
            return;
        }
        this._curTypeConfig = curTypeConfig;
        const type = curTypeConfig.id;
        this._emojiConfigArray = ChatConfigManager.getEmojiConfigArrayByType(type);

        this.view.typeList.numItems = this._emojiTypeConfigArray.length;
        this.view.typeList.refreshVirtualList();
        this.view.emojiList.numItems = this._emojiConfigArray.length;
    }

    private setTabIndex(index: number) {
        this._curTypeIndex = index;
        this.reset();
    }
}
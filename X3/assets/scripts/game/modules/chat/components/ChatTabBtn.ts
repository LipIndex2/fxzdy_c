import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { ChatLeftTabItemVo } from "db://assets/scripts/game/modules/chat/vo/ChatLeftTabItemVo";
import { ChatConfigManager } from "db://assets/scripts/game/modules/chat/config/ChatConfigManager";
import { ChatModel } from "db://assets/scripts/game/modules/chat/model/ChatModel";
import { ConditionManager } from "db://assets/scripts/game/modules/condition/ConditionManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import ChannelType = ServerEnums.ChannelType;
import { FloatingTextManager } from "db://assets/scripts/game/modules/floatingText/FloatingTextManager";

/**
 * tab
 */
export class ChatTabBtn extends FGUI.GButton {
    private _config: table.chat.ChatChannelConfig;
    private _isLock: boolean = false;

    private get view(): ui.chat.btn.ChatTabBtn {
        return this as any;
    }

    protected onConstruct() {
        super.onConstruct();


    }

    reset(item: ChatLeftTabItemVo) {
        const context = ChatModel.ins().context;

        const channelId = item.channelType;
        const channelConfig = ChatConfigManager.getChannelConfigById(channelId);
        if (!channelConfig) {
            console.error(`没找到频道配置. channelId = ${channelId}`);
            return;
        }
        this._config = channelConfig;

        // img
        this.view.imageTab.icon = channelConfig.upImagePath;
        this.view.imageTabChoose.icon = channelConfig.downImagePath;
        // text
        this.view.labelNameUp.text = channelConfig.name;
        this.view.labelNameDown.text = channelConfig.name;

        const unreadCount = context.getUnreadCountByChannelId(channelId) || 0;

        const isHaveNew = unreadCount > 0;
        this.view.getController("isHaveNewMsg").selectedIndex = isHaveNew ? 1 : 0;

        this.view.labelCount.text = unreadCount.toString();

        const isLock = ConditionManager.ins().isLock(channelConfig.unlockChannelCondition);
        this.view.imageTab.grayed = isLock;
        this._isLock = isLock;
    }

    updateMessageCount(count: number) {
        if (count <= 0) {
            this.view.getController("isHaveNewMsg").selectedIndex = 0;
            return;
        }
        this.view.getController("isHaveNewMsg").selectedIndex = 1;
        this.view.labelCount.text = count?.toString() || "0";
    }

    setChoose(isChoose: boolean) {
        this.view.getController("isChoose").selectedIndex = isChoose ? 1 : 0;

    }
}
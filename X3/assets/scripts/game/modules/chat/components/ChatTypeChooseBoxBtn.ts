import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { ChatModel } from "db://assets/scripts/game/modules/chat/model/ChatModel";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";

export class ChatTypeChooseBoxBtn extends FGUI.GButton {
    private _config: table.chat.ChatChannelConfig;
    private _channelType: ServerEnums.ChannelType;

    protected _initItemW:number = 120;
    private get view(): ui.chat.btn.ChatTypeChooseBoxBtn {
        return this as any;
    }

    protected onConstruct() {
        super.onConstruct();

        this.view.onClick(this.onClick0, this);
        this._initItemW = this.view.width;
    }

    onClick0() {
        const context = ChatModel.ins().context;


        const oldIndex = this.view.getController("isChoose").selectedIndex;
        const newIndex = (oldIndex + 1) % 2;
        this.view.getController("isChoose").selectedIndex = newIndex
        const isCare = newIndex == 0;
        context.setCareMessageFlagByChannelType(this._channelType, isCare);
    }

    reset(config: table.chat.ChatChannelConfig) {
        const context = ChatModel.ins().context;

        this._config = config;
        const channelType = ServerEnums.ChannelType[config.id];
        this._channelType = channelType;
        this.view.labelName.text = config.settingName;

        // 是否关心
        const isCare = context.isCareMessageFlagByChannelType(channelType);
        this.view.getController("isChoose").selectedIndex = isCare ? 0 : 1;
        this.view.labelName.ensureSizeCorrect();
        if (this.view.labelName.width + this.view.labelName.x > this._initItemW - 10) {
            this.view.width = this.view.labelName.width + this.view.labelName.x + 10;
        } else {
            this.view.width = this._initItemW;
        }
    }
}
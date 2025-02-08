import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import { PlayerInfoConfigManager } from "db://assets/scripts/game/modules/player/config/PlayerInfoConfigManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { SettingsModel } from "db://assets/scripts/game/modules/settings/model/SettingsModel";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import { SettingsConfigManager } from "db://assets/scripts/game/modules/settings/config/SettingsConfigManager";
import { PlayerInfoRoleItemComp } from "db://assets/scripts/game/modules/player/item/PlayerInfoRoleItemComp";
import { ConditionManager } from "db://assets/scripts/game/modules/condition/ConditionManager";
import { PlayerModel } from "db://assets/scripts/game/modules/player/model/PlayerModel";
import { Color } from "cc";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { PlayerAvatar } from "db://assets/scripts/game/modules/common/playerInfo/PlayerAvatar";

@bindFguiExtension("ui://playerInfo/PlayerInfoChangeChatBgSubView")
export class PlayerInfoChangeChatBgSubView extends FGUI.GComponent implements INotification {

    private _configs: table.set.SetShowConfig[];

    get view(): ui.playerInfo.subView.PlayerInfoChangeChatBgSubView {
        return this as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.SETTINGS_CHOOSE_REFRESH
        ]
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case  NotificationKey.SETTINGS_CHOOSE_REFRESH: {
                this.reset();
                break;
            }
        }
    }


    protected onConstruct() {
        super.onConstruct();

        this.view.itemList.setVirtual();
        this.view.itemList.itemRenderer = this.irItem.bind(this);

        this.view.changeComp.btnWearOff.onClick(this.onClickWearOff, this);
        this.view.changeComp.btnWearOn.onClick(this.onClickWearOn, this);

        this.reset();

        FacadeManager.ins().registerNotification(this);
    }

    protected onPreDispose() {
        FacadeManager.ins().removeNotification(this);
        super.onPreDispose();
    }

    // wear off
    onClickWearOff() {
        SettingsModel.ins().sendSetUpChatBox({
            boxId: 0
        } as Vo.set.SetUpChatBoxC2S);
    }

    // wear on
    onClickWearOn() {
        const context = SettingsModel.ins().context;
        SettingsModel.ins().sendSetUpChatBox({
            boxId: context.chooseCache.chatBoxId
        } as Vo.set.SetUpChatBoxC2S);
    }

    irItem(index: number, comp: PlayerInfoRoleItemComp) {
        comp.reset(this._configs[index]);
    }

    private reset() {
        const context = SettingsModel.ins().context;

        this._configs = PlayerInfoConfigManager.getConfigArrayInSortByType(ServerEnums.ShowInfoType.CHAT_BOX);
        this.view.itemList.numItems = this._configs.length;

        FguiScriptUtils.toMyScriptClass(this.view.avatar, PlayerAvatar)
            .resetMe();

        // 显示内容
        const chooseSettingId = context.chooseCache.chatBoxId;

        this.view.labelPlayerName.text = PlayerModel.ins().playerName;

        let isUnlock = false;
        const config = SettingsConfigManager.getShowConfigById(chooseSettingId)
        if (config) {
            this.view.labelDesc.text = config.desc;
            isUnlock = context.isUnlock(chooseSettingId);
        } else {
            this.view.labelDesc.text = "";
        }

        const myChatBoxId = context.getChatBoxId();

        // bg | 选中的
        const configForBg = SettingsConfigManager.getShowConfigById(chooseSettingId);
        this.view.bgMsg.icon = configForBg?.assetPath;

        // font
        const curChatFontId = context.getChatFontId();
        const configForFont = SettingsConfigManager.getShowConfigById(curChatFontId);
        this.view.labelMsg.color = new Color(configForFont.fontColor);


        // 下面的保存按钮
        this.view.changeComp.getController("state").selectedIndex = isUnlock ? 1 : 0;
        const isWear = myChatBoxId == chooseSettingId;
        if (isWear) {
            this.view.changeComp.getController("state").selectedIndex = 3;
        }

        // TODO 红点
        // if (SettingsConfigManager.isSkinImageId(config.id)) {
        //     //是皮肤形象 标记红点已读
        //     let showType = GIns.redDotMgr.getShowType(RedDotKeys.Set_skin_image_item, [config.id])
        //     if (showType != EnumRedDotShowType.NULL) {
        //         GIns.redDotMgr.markRedDotForeverRead(RedDotKeys.Set_skin_image_item, [config.id])
        //     }
        // }
        
        
    }


}
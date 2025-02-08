import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import { PlayerInfoConfigManager } from "db://assets/scripts/game/modules/player/config/PlayerInfoConfigManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { SettingsModel } from "db://assets/scripts/game/modules/settings/model/SettingsModel";
import { StringUtils } from "db://assets/scripts/core/utils/StringUtils";
import { SettingsConfigManager } from "db://assets/scripts/game/modules/settings/config/SettingsConfigManager";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { PlayerAvatar } from "db://assets/scripts/game/modules/common/playerInfo/PlayerAvatar";
import { PlayerInfoHeadIconComp } from "db://assets/scripts/game/modules/player/item/PlayerInfoHeadIconComp";
import { HeroManager } from "db://assets/scripts/game/modules/hero/HeroManager";
import GIns from "../../../GIns";
import { EnumRedDotShowType } from "../../common/redDot/enums/EnumRedDotShowType";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { ItemConfigManager } from "../../item/config/ItemConfigManager";

@bindFguiExtension("ui://playerInfo/PlayerInfoHeadIconSubView")
export class PlayerInfoHeadIconSubView extends FGUI.GComponent implements INotification {

    private _configs: table.set.SetShowConfig[];

    get view(): ui.playerInfo.subView.PlayerInfoHeadIconSubView {
        return this as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.SETTINGS_CHOOSE_REFRESH,
            NotificationKey.PLAYER_INFO_CHANGE,
        ]
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.PLAYER_INFO_CHANGE:
                this.reset();
                break;
            case NotificationKey.SETTINGS_CHOOSE_REFRESH: {
                this.reset(true);
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

    onClickWearOff() {
        const context = SettingsModel.ins().context;
        SettingsModel.ins().sendSetUpHeadIcon({
            headIconId: 0
        });
    }

    onClickWearOn() {
        const context = SettingsModel.ins().context;
        SettingsModel.ins().sendSetUpHeadIcon({
            headIconId: context.chooseCache.headIconId
        });
    }

    irItem(index: number, comp: PlayerInfoHeadIconComp) {
        comp.reset(this._configs[index]);
    }

    private reset(isChoose: boolean = false) {
        const context = SettingsModel.ins().context;

        this._configs = PlayerInfoConfigManager.getConfigByHeroShowOnlyActive(ServerEnums.ShowInfoType.HEAD_ICON)
        this.view.itemList.numItems = this._configs.length;

        // 显示内容
        const settingId = context.chooseCache.headIconId;
        const timeText = context.getRestTimeText(settingId);
        this.view.timeComp.visible = StringUtils.isNotBlank(timeText);

        const playerAvatar = FguiScriptUtils.toMyScriptClass(this.view.avatar, PlayerAvatar);
        const myHfId = context.getHeadFrameId();
        playerAvatar.resetForPreview(settingId, myHfId);

        let isHave = false;
        const config = SettingsConfigManager.getShowConfigById(settingId)
        if (config) {
            this.view.labelName.text = config.name;
            this.view.labelDesc.text = config.desc;
            this.view.timeComp.labelTime.text = timeText;

            if (config.heroId) {
                isHave = HeroManager.ins().isHaveHero(config.heroId);
            } else if (config.itemId) {
                isHave = ItemConfigManager.getItemConfigByItemId(config.itemId) != null;
            }

            if (isChoose) {
                //是皮肤形象 标记红点已读
                let showType = GIns.redDotMgr.getShowType(RedDotKeys.Set_skin_head_item, [config.id])
                if (showType != EnumRedDotShowType.NULL) {
                    GIns.redDotMgr.markRedDotForeverRead(RedDotKeys.Set_skin_head_item, [config.id])
                }
            }

        } else {
            this.view.labelName.text = "nothing";
            this.view.labelDesc.text = "";
            this.view.timeComp.labelTime.text = timeText;
        }


        // 下面按钮
        const isExpire = context.isExpire(settingId);
        this.view.changeComp.getController("state").selectedIndex = (isExpire || !isHave) ? 0 : 1;
        const isWear = context.getHeadIconId() == settingId;
        if (isWear) {
            this.view.changeComp.getController("state").selectedIndex = 3;
        }

    }

    protected onDisable(): void {
        this._configs = PlayerInfoConfigManager.getConfigByHeroShowOnlyActive(ServerEnums.ShowInfoType.HEAD_ICON)
        for (let i = 0; i < this._configs.length; i++) {
            let showType = GIns.redDotMgr.getShowType(RedDotKeys.Set_skin_head_item, [this._configs[i].id])
            if (showType != EnumRedDotShowType.NULL) {
                GIns.redDotMgr.markRedDotForeverRead(RedDotKeys.Set_skin_head_item, [this._configs[i].id])
            }
        }
        super.onDisable()
    }
}
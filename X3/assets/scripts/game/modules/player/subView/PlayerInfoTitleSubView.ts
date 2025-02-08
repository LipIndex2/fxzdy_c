import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import { PlayerInfoConfigManager } from "db://assets/scripts/game/modules/player/config/PlayerInfoConfigManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { SettingsModel } from "db://assets/scripts/game/modules/settings/model/SettingsModel";
import { PlayerInfoHeadFrameComp } from "db://assets/scripts/game/modules/player/item/PlayerInfoHeadFrameComp";
import { StringUtils } from "db://assets/scripts/core/utils/StringUtils";
import { SettingsConfigManager } from "db://assets/scripts/game/modules/settings/config/SettingsConfigManager";
import GIns from "../../../GIns";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { EnumRedDotShowType } from "../../common/redDot/enums/EnumRedDotShowType";

@bindFguiExtension("ui://playerInfo/PlayerInfoTitleSubView")
export class PlayerInfoTitleSubView extends FGUI.GComponent implements INotification {

    private _configs: table.set.SetShowConfig[];

    get view(): ui.playerInfo.subView.PlayerInfoTitleSubView {
        return this as any;
    }

    listenNotifications(): string[] {
        return [
            NotificationKey.SETTINGS_CHOOSE_REFRESH
        ]
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
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
        SettingsModel.ins().sendSetUpTitle({
            titleId: 0
        });
    }

    onClickWearOn() {
        const context = SettingsModel.ins().context;
        SettingsModel.ins().sendSetUpTitle({
            titleId: context.chooseCache.titleId
        });
    }

    irItem(index: number, comp: PlayerInfoHeadFrameComp) {
        comp.reset(this._configs[index]);
    }

    private reset(isChoose: boolean = false) {
        const context = SettingsModel.ins().context;

        this._configs = PlayerInfoConfigManager.getConfigArrayInSortByType(ServerEnums.ShowInfoType.TITLE);
        this.view.itemList.numItems = this._configs.length;


        // 显示内容
        const settingId = context.chooseCache.titleId;
        const timeText = context.getRestTimeText(settingId);
        this.view.timeComp.visible = StringUtils.isNotBlank(timeText);

        const config = SettingsConfigManager.getShowConfigById(settingId)
        this.view.imageTitle.icon = config?.assetPath;
        if (config) {
            this.view.labelDesc.text = config.desc;
            this.view.timeComp.labelTime.text = timeText;

            if (isChoose) {
                //是皮肤形象 标记红点已读
                let showType = GIns.redDotMgr.getShowType(RedDotKeys.Set_skin_title_item, [config.id])
                if (showType != EnumRedDotShowType.NULL) {
                    GIns.redDotMgr.markRedDotForeverRead(RedDotKeys.Set_skin_title_item, [config.id])
                }
            }

        } else {
            this.view.labelDesc.text = "";
            this.view.timeComp.labelTime.text = timeText;
        }

        // 下面按钮
        const isExpire = context.isExpire(settingId);
        this.view.changeComp.getController("state").selectedIndex = isExpire ? 0 : 1;
        const isWear = context.getTitleId() == settingId;
        if (isWear) {
            this.view.changeComp.getController("state").selectedIndex = 2;
        }

    }

    protected onDisable(): void {
        this._configs = PlayerInfoConfigManager.getConfigByHeroShowOnlyActive(ServerEnums.ShowInfoType.TITLE)
        for (let i = 0; i < this._configs.length; i++) {
            let showType = GIns.redDotMgr.getShowType(RedDotKeys.Set_skin_title_item, [this._configs[i].id])
            if (showType != EnumRedDotShowType.NULL) {
                GIns.redDotMgr.markRedDotForeverRead(RedDotKeys.Set_skin_title_item, [this._configs[i].id])
            }
        }
        super.onDisable()
    }
}
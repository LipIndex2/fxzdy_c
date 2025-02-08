import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import { PlayerInfoConfigManager } from "db://assets/scripts/game/modules/player/config/PlayerInfoConfigManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { SettingsModel } from "db://assets/scripts/game/modules/settings/model/SettingsModel";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import { SettingsConfigManager } from "db://assets/scripts/game/modules/settings/config/SettingsConfigManager";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { ModelNode } from "db://assets/scripts/game/modules/common/node/ModelNode";
import { PlayerInfoRoleItemComp } from "db://assets/scripts/game/modules/player/item/PlayerInfoRoleItemComp";
import { ConditionManager } from "db://assets/scripts/game/modules/condition/ConditionManager";
import GIns from "../../../GIns";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { EnumRedDotShowType } from "../../common/redDot/enums/EnumRedDotShowType";

@bindFguiExtension("ui://playerInfo/PlayerInfoChangeRoleSubView")
export class PlayerInfoChangeRoleSubView extends FGUI.GComponent implements INotification {

    private _configs: table.set.SetShowConfig[];

    get view(): ui.playerInfo.subView.PlayerInfoChangeRoleSubView {
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
        SettingsModel.ins().sendSetUpImage({
            imageId: 0
        });
    }

    onClickWearOn() {
        const context = SettingsModel.ins().context;
        SettingsModel.ins().sendSetUpImage({
            imageId: context.chooseCache.imageId
        });
    }

    irItem(index: number, comp: PlayerInfoRoleItemComp) {
        comp.reset(this._configs[index]);
    }

    private reset(isChoose: boolean = false) {
        const context = SettingsModel.ins().context;

        this._configs = PlayerInfoConfigManager.getConfigByHeroShowOnlyActive(ServerEnums.ShowInfoType.IMAGE)
        this.view.itemList.numItems = this._configs.length;
        // 显示内容
        const chooseSettingId = context.chooseCache.imageId;


        let isCanUse = false;
        const config = SettingsConfigManager.getShowConfigById(chooseSettingId)
        if (config) {
            this.view.labelName.text = config.name;
            this.view.labelDesc.text = config.desc;
            isCanUse = ConditionManager.ins().checkCondition(config.unlockCondition, true, false);

            if (isChoose) {
                //是皮肤形象 标记红点已读
                let showType = GIns.redDotMgr.getShowType(RedDotKeys.Set_skin_image_item, [config.id])
                if (showType != EnumRedDotShowType.NULL) {
                    GIns.redDotMgr.markRedDotForeverRead(RedDotKeys.Set_skin_image_item, [config.id])
                }
            }
        } else {
            this.view.labelName.text = "nothing";
            this.view.labelDesc.text = "";
        }

        // 显示的模型
        const model = FguiScriptUtils.toMyScriptClass(this.view.hero, ModelNode);
        model.clear();
        model.setScale(2, 2);
        model.loadByModelId(config.heroModelId);

        // 下面按钮
        this.view.changeComp.getController("state").selectedIndex = isCanUse ? 1 : 0;
        const isWear = context.getImageId() == chooseSettingId;
        if (isWear) {
            this.view.changeComp.getController("state").selectedIndex = 3;
        }

        // if (SettingsConfigManager.isSkinImageId(config.id)) {
        //     //是皮肤形象 标记红点已读
        //     let showType = GIns.redDotMgr.getShowType(RedDotKeys.Set_skin_image_item, [config.id])
        //     if (showType != EnumRedDotShowType.NULL) {
        //         GIns.redDotMgr.markRedDotForeverRead(RedDotKeys.Set_skin_image_item, [config.id])
        //     }
        // }
    }

    protected onDisable(): void {
        this._configs = PlayerInfoConfigManager.getConfigByHeroShowOnlyActive(ServerEnums.ShowInfoType.IMAGE)
        for (let i = 0; i < this._configs.length; i++) {
            let showType = GIns.redDotMgr.getShowType(RedDotKeys.Set_skin_image_item, [this._configs[i].id])
            if (showType != EnumRedDotShowType.NULL) {
                GIns.redDotMgr.markRedDotForeverRead(RedDotKeys.Set_skin_image_item, [this._configs[i].id])
            }
        }
        super.onDisable()
    }
}
import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import { PlayerInfoConfigManager } from "db://assets/scripts/game/modules/player/config/PlayerInfoConfigManager";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import { PlayerInfoHeadFrameComp } from "db://assets/scripts/game/modules/player/item/PlayerInfoHeadFrameComp";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { SettingsModel } from "db://assets/scripts/game/modules/settings/model/SettingsModel";
import FacadeManager from "db://assets/scripts/core/mvc/FacadeManager";
import { SettingsConfigManager } from "db://assets/scripts/game/modules/settings/config/SettingsConfigManager";
import { StringUtils } from "db://assets/scripts/core/utils/StringUtils";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { PlayerAvatar } from "db://assets/scripts/game/modules/common/playerInfo/PlayerAvatar";
import { TeamChallengeModel } from "../../teamChallenge/model/TeamChallengeModel";
import { I18nLanguage } from "../../../../core/i18n/ConstantI18n";
import G from "../../../../core/comm/G";
import GIns from "../../../GIns";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import { EnumRedDotShowType } from "../../common/redDot/enums/EnumRedDotShowType";

@bindFguiExtension("ui://playerInfo/PlayerInfoHeadFrameSubView")
export class PlayerInfoHeadFrameSubView extends FGUI.GComponent implements INotification {

    private _configs: table.set.SetShowConfig[];

    get view(): ui.playerInfo.subView.PlayerInfoHeadFrameSubView {
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
        SettingsModel.ins().sendSetUpHeadFrame({
            headFrameId: 0
        });
    }

    onClickWearOn() {
        const context = SettingsModel.ins().context;
        SettingsModel.ins().sendSetUpHeadFrame({
            headFrameId: context.chooseCache.headFrameId
        });
    }

    irItem(index: number, comp: PlayerInfoHeadFrameComp) {
        comp.reset(this._configs[index]);
    }

    private reset(isChoose: boolean = false) {
        const context = SettingsModel.ins().context;

        this._configs = PlayerInfoConfigManager.getConfigArrayInSortByType(ServerEnums.ShowInfoType.HEAD_FRAME);
        this.view.itemList.numItems = this._configs.length;


        // 显示内容
        const chooseSettingId = context.chooseCache.headFrameId;
        const timeText = context.getRestTimeText(chooseSettingId);
        this.view.timeComp.visible = StringUtils.isNotBlank(timeText);

        const playerAvatar = FguiScriptUtils.toMyScriptClass(this.view.avatar, PlayerAvatar);
        playerAvatar.resetForPreview(context.getHeadIconId(), chooseSettingId);

        const config = SettingsConfigManager.getShowConfigById(chooseSettingId)
        if (config) {
            this.view.labelName.text = config.name;
            this.view.labelDesc.text = config.desc;
            this.view.timeComp.labelTime.text = timeText;
            if (SettingsConfigManager.isTcFrame(config.id)) {
                this.view.labelDesc.text = G.I18nManager.lang(config.desc) + `(当前助战积分:${TeamChallengeModel.ins().getValue()})`;
            } else {
                this.view.labelDesc.text = config.desc;
            }

            //是皮肤形象 标记红点已读
            if (isChoose) {
                let showType = GIns.redDotMgr.getShowType(RedDotKeys.Set_skin_head_frame_item, [config.id])
                if (showType != EnumRedDotShowType.NULL) {
                    GIns.redDotMgr.markRedDotForeverRead(RedDotKeys.Set_skin_head_frame_item, [config.id])
                }
            }

        } else {
            this.view.labelName.text = "nothing";
            this.view.labelDesc.text = "";
            this.view.timeComp.labelTime.text = timeText;
        }

        // 下面按钮
        const isExpire = context.isExpire(chooseSettingId);
        this.view.changeComp.getController("state").selectedIndex = isExpire ? 0 : 1;
        const isWear = context.getHeadFrameId() == chooseSettingId;
        if (isWear) {
            this.view.changeComp.getController("state").selectedIndex = 3;
        }


    }

    protected onDisable(): void {
        this._configs = PlayerInfoConfigManager.getConfigByHeroShowOnlyActive(ServerEnums.ShowInfoType.HEAD_FRAME)
        for (let i = 0; i < this._configs.length; i++) {
            let showType = GIns.redDotMgr.getShowType(RedDotKeys.Set_skin_head_frame_item, [this._configs[i].id])
            if (showType != EnumRedDotShowType.NULL) {
                GIns.redDotMgr.markRedDotForeverRead(RedDotKeys.Set_skin_head_frame_item, [this._configs[i].id])
            }
        }
        super.onDisable()
    }
}
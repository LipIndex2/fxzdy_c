import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import FGUINotificationComponent from "../../../../core/fgui/com/FGUINotificationComponent";
import { FguiScriptUtils } from "../../../../core/utils/FguiScriptUtils";
import { StringUtils } from "../../../../core/utils/StringUtils";
import NotificationKey from "../../../event/NotificationKey";
import GIns from "../../../GIns";
import { PlayerAvatar } from "../../../modules/common/playerInfo/PlayerAvatar";
import { RedDotCom } from "../../../modules/common/redDot/redDotCom";
import { RedDotKeys } from "../../../modules/common/redDot/RedDotKeys";
import { FightManager } from "../../../modules/fight/FightManager";
import { FormationManager } from "../../../modules/formation/FormationManager";

@bindFguiExtension('ui://comm/PlayerCom')
export class PlayerCom extends FGUINotificationComponent {
    static pkgName: string = "comm";
    static viewName: string = "PlayerCom";

    protected _isMe: boolean = true;
    protected _isShowName: boolean = false;

    private get view(): ui.comm.view.PlayerCom {
        return this as any;
    }

    listenNotifications(): string[] | null {
        return [
            NotificationKey.FIGHT_UPDATE_ONE_HERO,
            NotificationKey.FIGHT_UPDATE_ALL_HERO,
            NotificationKey.HERO_UP_LEVEL,
            NotificationKey.PLAYER_INFO_CHANGE,
        ];
    }
    notificationHandler(eventName: string, args?: any): void {
        if (!this._isMe) {
            //不是我 就不需要监听我的数据变化
            return
        }
        switch (eventName) {
            case NotificationKey.FIGHT_UPDATE_ONE_HERO:
            case NotificationKey.FIGHT_UPDATE_ALL_HERO:
                this.resetFightPowerForMe();
                break;
            case NotificationKey.HERO_UP_LEVEL:
                this.resetLvForMe();
                break;
            case NotificationKey.PLAYER_INFO_CHANGE:
                this.resetInfoForMe();
                break;
        }
    }

    protected onInit(): void {
        //默认不显示昵称
        this.view.lbName.visible = false;
    }

    /**是否显示昵称 默认不显示*/
    public isShowName(value: boolean): void {
        if (this._isShowName != value) {
            this._isShowName = value;
            this.view.lbName.visible = value;
        }
    }

    // 等级
    private resetLvForMe() {
        this.view.lvContent.text = FormationManager.ins().getCommonLevel() + "";
    }

    // 战斗力
    private resetFightPowerForMe() {
        let powerValue = FightManager.ins().getFightByDefault();
        this.view.T_power.text = StringUtils.getFightStr(powerValue);
    }

    private resetInfoForMe() {
        FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom).reset(RedDotKeys.Set_avatar)
        const avatar = FguiScriptUtils.toMyScriptClass(this.view.avatar, PlayerAvatar);
        avatar.setCanShowMe(true);
        avatar.resetMe();

        this.view.lbName.text = GIns.playerModel.playerName;
    }

    /**更新自己的信息*/
    public resetForMe() {
        this._isMe = true;
        this.resetInfoForMe();
        this.resetLvForMe();
        this.resetFightPowerForMe();
    }

    /**更新其他人信息*/
    public resetByPlayerInfo(baseInfo: Vo.player.PlayerBaseVo): void {
        if (!baseInfo) {
            return
        }
        if (baseInfo?.id == GIns.playerModel.playerId) {
            //是我
            this._isMe = true
            this.resetForMe();
            return
        }
        this._isMe = false;
        this.view.lvContent.text = baseInfo.level + "";
        this.view.T_power.text = StringUtils.getFightStr(baseInfo.fight);
        this.view.lbName.text = baseInfo.name;

        const avatar = FguiScriptUtils.toMyScriptClass(this.view.avatar, PlayerAvatar);
        avatar.resetByPlayerInfo(baseInfo);
    }
}
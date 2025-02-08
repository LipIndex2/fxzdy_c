import { UIManager } from "db://assets/scripts/core/mvc/UIManager";
import { PlayerUIKeys } from "db://assets/scripts/game/modules/player/PlayerUIKeys";
import { PlayerInfoMainViewOpenArgs } from "db://assets/scripts/game/modules/player/structs/PlayerInfoMainViewOpenArgs";
import { PlayerModel } from "db://assets/scripts/game/modules/player/model/PlayerModel";
import { PlayerInfoConfigManager } from "db://assets/scripts/game/modules/player/config/PlayerInfoConfigManager";
import ObjectUtils from "../../../../core/utils/ObjectUtils";
import { ItemUtils } from "../../item/utils/ItemUtils";
import { SettingsModel } from "db://assets/scripts/game/modules/settings/model/SettingsModel";
import { RobotConfigManager } from "../../../table/robot/RobotConfigManager";
import { PlayerAvatarData } from "db://assets/scripts/game/modules/common/playerInfo/structs/PlayerAvatarData";
import { Logger } from "db://assets/scripts/core/log/Logger";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import FGUI from "db://assets/scripts/core/fgui/FGUI";


@bindFguiExtension("ui://comm/PlayerAvatar")
export class PlayerAvatar extends FGUI.GButton {

    private _playerId: number;
    // 是否可以显示自己信息 | 部分界面奇怪的逻辑, 点击自己头像不允许弹出..
    private _isMeCanShow: boolean = false;

    //自定义点击回调
    public customClickFunc: () => void = null

    private get view(): ui.comm.playerInfo.PlayerAvatar {
        return this as any;
    }


    protected onConstruct() {
        super.onConstruct();

        this.view.lvLab.visible = false;
        this.view.onClick(this.onClickPlayer, this);
    }


    reset(playerId: number,
        headIconId: number | string,
        headFrameId: number,
        imageId: number
    ) {
        this._playerId = playerId;
        // 机器人不允许点
        const isRobot = playerId <= 0;
        this.view.touchable = !isRobot;

        // 头像 | string 是直接给整个路径
        if (ObjectUtils.isNumber(headIconId)) {
            const headIconConfig = PlayerInfoConfigManager.getHeadIconConfigById(+headIconId);
            if (headIconConfig) {
                this.view.imagePlayerAvatar.icon = headIconConfig.assetPath;
            }
        } else if (ObjectUtils.isString(headIconId)) {
            this.view.imagePlayerAvatar.icon = ItemUtils.getNormaHeadByPath(headIconId + "");
        }

        // 头像框
        const frameConfig = PlayerInfoConfigManager.getHeadFrameConfigById(headFrameId);
        if (frameConfig) {
            this.view.imageFrame.icon = frameConfig.assetPath;
        }

    }

    resetMe() {
        const playerId = PlayerModel.ins().Vo.id;

        const headIconId = SettingsModel.ins().context.getHeadIconId();
        const headFrameId = SettingsModel.ins().context.getHeadFrameId();
        const imageId = SettingsModel.ins().context.getImageId();

        this.reset(
            playerId,
            headIconId,
            headFrameId,
            imageId,
        );
    }

    resetByPlayerInfo(playerBaseInfo: Vo.player.PlayerBaseVo) {
        if (!playerBaseInfo) {
            console.warn("这个玩家没有玩家信息");
            return;
        }

        this.reset(
            playerBaseInfo.id,
            playerBaseInfo.headIcon,
            playerBaseInfo.headFrame,
            playerBaseInfo.imageId
        );

    }

    public setLv(lv: number): void {
        this.view.lvLab.visible = true;
        this.view.lvLab.text = "Lv." + lv;
    }

    setCanShowMe(canShow: boolean) {
        this._isMeCanShow = canShow;
    }

    onClickPlayer() {
        if (this.customClickFunc) {
            this.customClickFunc()
            return
        }

        if (!this._playerId) {
            return;
        }

        if (this._playerId < 0) {
            Logger.game("点击了机器人信息, 不应该弹出", this._playerId);
            return;
        }

        if (this._playerId) {
            const isMe = this._playerId == PlayerModel.ins().Vo.id;

            // 不允许弹出自己的信息 | 奇怪的需求
            if (!this._isMeCanShow) {
                if (isMe) {
                    console.info("这个界面下点击自己头像不允许打开...");
                    return;
                }

            }

            // my player info
            UIManager.ins().open(PlayerUIKeys.PlayerInfoMainView, PlayerInfoMainViewOpenArgs.create(
                this._playerId
            ));
        }
    }

    resetForPreview(headIconId: number,
        headFrameId: number,
    ) {

        const headIconConfig = PlayerInfoConfigManager.getHeadIconConfigById(headIconId);
        this.view.imagePlayerAvatar.icon = headIconConfig?.assetPath;

        const frameConfig = PlayerInfoConfigManager.getHeadFrameConfigById(headFrameId);
        this.view.imageFrame.icon = frameConfig?.assetPath;

    }

    resetByRobotJJC(robotBaseVo: Vo.arena.ArenaRobotBaseVo) {
        if (!robotBaseVo) {
            // 没有这个机器人
            return;
        }

        const robotConfigId = robotBaseVo.robotConfigId;
        const robotShowConfig = RobotConfigManager.getRobotShowConfigById(robotConfigId);
        if (!robotShowConfig) {
            console.error(`没找到机器人显示配置. robotConfigId = ${robotConfigId}`);
            return;
        }

        const fakePlayerId = robotBaseVo.id;
        this.reset(
            fakePlayerId,
            robotShowConfig.headIconId,
            robotShowConfig.headFrameId,
            robotShowConfig.showRoleId
        );
    }

    resetByData(data: PlayerAvatarData) {
        if (!data) {
            return;
        }
        this.reset(
            data.playerId,
            data.headIconId,
            data.headFrameId,
            data.imageId
        );
    }
}
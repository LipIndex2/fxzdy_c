import * as fgui from "fairygui-cc";
import { Logger } from "db://assets/scripts/core/log/Logger";
import { PlayerInfoConfigManager } from "db://assets/scripts/game/modules/player/config/PlayerInfoConfigManager";
import GIns from "db://assets/scripts/game/GIns";
import { ChooseServerWin } from "db://assets/scripts/main/modules/chooseServer/ChooseServerWin";
import { IRoleVo, IServerVo } from "db://assets/scripts/main/modules/login/vo/ILoginVo";
import { ChooseServerModel } from "db://assets/scripts/main/modules/login/model/ChooseServerModel";
import { NumberFormatter } from "db://assets/scripts/core/utils/NumberFormatter";
import { bindScript } from "db://assets/scripts/core/comm/UIScriptManager";
import { SystemSettingUIKeys } from "../SystemSettingUIKeys";
import { UICommonKey } from "../../common/const/UICommonConfig";
import { UIManager } from "db://assets/scripts/core/mvc/UIManager";
import { LocalStorageUtils } from "db://assets/scripts/core/utils/LocalStorageUtils";
import G from "db://assets/scripts/core/comm/G";
import { BtnConfirmViewOpenArgs } from "../../common/confirm/BtnConfirmView";

/**
 * 游戏内选服
 */
@bindScript(SystemSettingUIKeys.ChooseServerInGameWin)
export class ChooseServerInGameWin extends ChooseServerWin {
    static pkgName: string = "server";
    static viewName: string = "ChooseServerWin";

    protected _isInGame: boolean = true;

    listenNotifications(): string[] {
        return [];
    }

    notificationHandler(event: string, args?: any): void {
    }


    protected onPlayerRender(index: number, item: ui.server.item.PlayerItem) {
        let data = this._MyItems[index];
        const serverId = data.id;
        let roleVo: IRoleVo = ChooseServerModel.ins().getRoleVoByServerId(serverId);

        item.serverName.text = data.name;
        item.roleName.text = roleVo.name;
        item.fightTxt.text = NumberFormatter.formatNumberToString(roleVo.fight);

        const isSameServer = ChooseServerModel.ins().serverVo?.id == serverId;
        if (isSameServer) {
            item.headIcon.icon = GIns.settingsModel.context.getHeadIconAssetPath();
        } else {
            item.headIcon.icon = PlayerInfoConfigManager.getHeadIconConfigById(roleVo.headIcon)?.assetPath;
        }
    }

    protected onChooseServer(serverVo: IServerVo) {
        Logger.game(`选择了服务器 serverId = ${serverVo.id}`);

        let ret = ChooseServerModel.ins().checkServerState(serverVo, true);
        if (ret) {
            const oldServer = ChooseServerModel.ins().serverVo;

            // 相同
            if (oldServer?.id == serverVo?.id) {
                return;
            }

            this.confrimChooseServer(serverVo.id);
        }
    }

    private confrimChooseServer(serverId: number) {
        UIManager.ins().open(UICommonKey.BtnConfirmView, {
            title: "提示",
            titleConfirm: "确认",
            titleCancel: "取消",
            content: "切换服务器将退出游戏,\n重新进入游戏后切换成功",
            onBtnYes: () => {
                // 进入游戏后的选择, 改为 临时保存
                LocalStorageUtils.set("tempChooseServerId", serverId);
                G.reload();
            },

        } as BtnConfirmViewOpenArgs);
    }
}
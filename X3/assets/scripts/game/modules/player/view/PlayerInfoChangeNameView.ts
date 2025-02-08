import UIScriptManager, { bindScript } from "db://assets/scripts/core/comm/UIScriptManager";
import { PlayerUIKeys } from "db://assets/scripts/game/modules/player/PlayerUIKeys";
import { UICommWin } from "db://assets/scripts/core/mvc/view/UICommWin";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { StringUtils } from "db://assets/scripts/core/utils/StringUtils";
import { FloatingTextManager } from "db://assets/scripts/game/modules/floatingText/FloatingTextManager";
import { SettingsModel } from "db://assets/scripts/game/modules/settings/model/SettingsModel";
import { SettingsConfigManager } from "db://assets/scripts/game/modules/settings/config/SettingsConfigManager";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { BtnChangGui1WithItem } from "db://assets/scripts/game/modules/common/btn/BtnChangGui1WithItem";
import { PlayerInfoConfigManager } from "db://assets/scripts/game/modules/player/config/PlayerInfoConfigManager";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";
import GIns from "../../../GIns";
import { ForbiddenManager } from "db://assets/scripts/core/comm/ForbiddenManager";

/**
 * 玩家信息
 */
@bindScript(PlayerUIKeys.PlayerInfoChangeNameView)
export class PlayerInfoChangeNameView extends UICommWin {

    static pkgName: string = "playerInfo";
    static viewName: string = "PlayerInfoChangeNameView";


    private get view(): ui.playerInfo.PlayerInfoChangeNameView {
        return this._view as any;
    }


    listenNotifications(): string[] {
        return [
            NotificationKey.CHANGE_NAME,
        ];
    }


    notificationHandler(event: string, args?: any) {
        switch (event) {
            case NotificationKey.CHANGE_NAME:
                this.reset();
                break;
        }
    }

    public onInit(): void {
        this.view.btnOk.onClick(this.onClickChangeName, this);
        this.view.btnFree.onClick(this.onClickChangeName, this);
        const btn = FguiScriptUtils.toMyScriptClass(this.view.btnOk, BtnChangGui1WithItem);
        btn.reset("修改", SettingsConfigManager.costItemForChangeName);

        this.view.btnFree.title = '免费修改'
        FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom).reset(RedDotKeys.Set_changename_free)
    }

    onClickChangeName() {
        // isCanPay
        const isCanFree = SettingsModel.ins().context.isCanFreeChangeName();
        if (!isCanFree) {
            // cost
            const costItemForChangeName = SettingsConfigManager.costItemForChangeName;
            if (costItemForChangeName) {
                const isCanPay = costItemForChangeName.isCanPay();
                if (!isCanPay) {
                    GIns.floatingTextMgr.showTips("消耗品不足");
                    return;
                }
            }
        }

        const newPlayerName = this.view.labelInput.text;

        if (StringUtils.isBlank(newPlayerName)) {
            GIns.floatingTextMgr.showTips("名字不能为空");
            return;
        }
        const nameMaxLength = PlayerInfoConfigManager.nameMaxLength;
        if (newPlayerName.length > nameMaxLength) {
            GIns.floatingTextMgr.showTips(`名字长度不允许超过${nameMaxLength}个字符`);
            return;
        }
        const nameMinLength = PlayerInfoConfigManager.nameMinLength;
        if (newPlayerName.length < nameMinLength) {
            GIns.floatingTextMgr.showTips(`名字长度不允许少于${nameMinLength}个字符`);
            return;
        }

        ForbiddenManager.isForbidden(newPlayerName, (content: string) => {
            if (!content) {
                GIns.floatingTextMgr.showTips(`名字中含有敏感字`);
                return;
            }

            SettingsModel.ins().sendChangeName({
                name: content
            });

            this.closeSelf();
        });
    }

    public onOpen(): void {
        this.reset();

    }

    public reset() {
        const isCanFree = SettingsModel.ins().context.isCanFreeChangeName();
        this.view.getController('c1').selectedIndex = isCanFree ? 0 : 1
    }

    public onClose() {


    }
}

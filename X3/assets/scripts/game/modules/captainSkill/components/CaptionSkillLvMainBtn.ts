import G from "db://assets/scripts/core/comm/G";
import NotificationKey from "db://assets/scripts/game/event/NotificationKey";
import { ServerEnums } from "db://assets/scripts/libs/extras/ServerEnums";
import * as fgui from "fairygui-cc";
import { bindFguiExtension } from "../../../../core/comm/UIScriptManager";
import GIns from "../../../GIns";
import { UICaptainSkillKeys } from "../UICaptainSkillKeys";
import { FguiScriptUtils } from "db://assets/scripts/core/utils/FguiScriptUtils";
import { RedDotCom } from "../../common/redDot/redDotCom";
import { RedDotKeys } from "../../common/redDot/RedDotKeys";

/**
 * 战队科技按钮
 */
@bindFguiExtension('ui://captainSkill/CaptionSkillLvMainBtn')
export class CaptionSkillLvMainBtn extends fgui.GButton {
    static pkgName: string = "captainSkill";
    static viewName: string = "CaptionSkillLvMainBtn";

    protected _captainId: number = 0;

    listenNotifications(): string[] | null {
        return [
            NotificationKey.CAPTAIN_SKILL_LV_UPDATE,
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {
            case NotificationKey.CAPTAIN_SKILL_LV_UPDATE:
                if (args == 0 || args == this._captainId) {
                    this.updateUI();
                }
                break;
        }
    }

    private get view(): ui.captainSkill.main.CaptionSkillLvMainBtn {
        return this as any;
    }

    protected onInit(): void {
        G.FacadeManager.registerNotification(this);
        this.onClick(this.onClickItem, this);
    }

    protected onPreDispose(): void {
        G.FacadeManager.removeNotification(this);
    }

    protected onClickItem(event): void {
        if (GIns.moduleOpenMgr.isCanOpenModule(ServerEnums.SystemType.CAPTAIN, false)) {
            //开启了
            G.UIManager.open(UICaptainSkillKeys.CaptionSkillLvUpView, this._captainId);
        } else {
            GIns.floatingTextMgr.showTips('职业专精未开启');
        }
    }

    protected updateUI(): void {
        let isOpen: boolean = GIns.moduleOpenMgr.isCanOpenModuleWithoutTips(ServerEnums.SystemType.CAPTAIN);
        if (isOpen) {
            //开启了
            this.view.getController('state').selectedIndex = 0;
            let lv = GIns.captainSkillModel.getLvBySkillId(this._captainId);
            this.view.lbLv.text = `Lv.${lv}`;
        } else {
            this.view.getController('state').selectedIndex = 1;
        }
    }

    public setCaptainCfg(cfg: table.captain.CaptainConfig) {
        if (this._captainId != cfg?.id) {
            this._captainId = cfg?.id;
            this.view.iconLoader.icon = cfg.iconPathForBig;
            this.updateUI();
            FguiScriptUtils.toMyScriptClass(this.view.redDot, RedDotCom).reset(RedDotKeys.captainSkill_lvUp, [this._captainId]);
        }
    }
}
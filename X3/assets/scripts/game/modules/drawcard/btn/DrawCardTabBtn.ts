import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import { RedDotKeys } from "db://assets/scripts/game/modules/common/redDot/RedDotKeys";
import { RedDotManager } from "db://assets/scripts/game/modules/common/redDot/RedDotManager";
import { EnumRedDotReadType } from "db://assets/scripts/game/modules/common/redDot/enums/EnumRedDotReadType";
import { RedDotUtils } from "db://assets/scripts/game/modules/common/redDot/utils/RedDotUtils";
import { EnumDrawCardTabType } from "db://assets/scripts/game/modules/drawcard/enums/EnumDrawCardTabType";
import { RuleController } from "../../rule/RuleController";
import { EnumRuleKeys } from "../../rule/enums/EnumRuleKeys";

/**
 * 抽卡 tab
 */
@bindFguiExtension("ui://drawCard/DrawCardTabBtn")
export class DrawCardTabBtn extends FGUI.GButton implements INotification {


    private _tabIndex: EnumDrawCardTabType;

    listenNotifications(): string[] {
        return [
            RedDotKeys.drawCard_normalHero.toEventName(),
            RedDotKeys.drawCard_chooseHero.toEventName(),
            RedDotKeys.drawCard_equip.toEventName(),
        ];
    }

    notificationHandler(eventName: string, args?: any): void {
        switch (eventName) {

            case RedDotKeys.drawCard_normalHero.toEventName():
            case RedDotKeys.drawCard_chooseHero.toEventName():
            case RedDotKeys.drawCard_equip.toEventName(): {
                this.refreshRedDot();
                break;
            }
        }
    }

    protected onConstruct() {
        super.onConstruct();

        this.view.onClick(this.onClick0, this);
        this.view.btnRule.onClick(this.onClickRule, this)
    }

    private get view(): ui.drawCard.btn.DrawCardTabBtn {
        return this as any;
    }

    reset(tabIndex: EnumDrawCardTabType, isChoose: boolean) {
        this._tabIndex = tabIndex;
        this.view.visible = true;


        this.view.getController("tabIndex").selectedIndex = tabIndex;

        this.view.selected = isChoose;

        if (isChoose) {
            this.onClick0();
        }

        this.refreshRedDot();
    }

    onClick0() {
        if (this._tabIndex == EnumDrawCardTabType.NORMAL) {
            RedDotManager.ins().markReadAll(EnumRedDotReadType.ONCE, RedDotKeys.drawCard_normalHero);
            RedDotManager.ins().markReadAll(EnumRedDotReadType.TODAY_ONCE, RedDotKeys.drawCard_normalHero_ad);
        } else if (this._tabIndex == EnumDrawCardTabType.SPECIAL_HERO) {
            RedDotManager.ins().markReadAll(EnumRedDotReadType.ONCE, RedDotKeys.drawCard_chooseHero);
        } else if (this._tabIndex == EnumDrawCardTabType.WEAPON) {
            RedDotManager.ins().markReadAll(EnumRedDotReadType.ONCE, RedDotKeys.drawCard_equip);
            RedDotManager.ins().markReadAll(EnumRedDotReadType.TODAY_ONCE, RedDotKeys.drawCard_equip_ad);
        }
    }

    protected onClickRule(): void {
        if (this._tabIndex == EnumDrawCardTabType.NORMAL) {
            RuleController.ins().openRule(EnumRuleKeys.DRAWCARD_NORMAL, this.view.btnRule)
        } else if (this._tabIndex == EnumDrawCardTabType.SPECIAL_HERO) {
            RuleController.ins().openRule(EnumRuleKeys.DRAWCARD_SPECIAL_HERO, this.view.btnRule)
        } else if (this._tabIndex == EnumDrawCardTabType.WEAPON) {
            RuleController.ins().openRule(EnumRuleKeys.DRAWCARD_WEAPON, this.view.btnRule)
        }
    }

    private refreshRedDot() {
        const redDotCom = RedDotUtils.castComp(this.view.redDot);
        if (this._tabIndex == EnumDrawCardTabType.NORMAL) {
            redDotCom.reset(RedDotKeys.drawCard_normalHero);
        } else if (this._tabIndex == EnumDrawCardTabType.SPECIAL_HERO) {
            redDotCom.reset(RedDotKeys.drawCard_chooseHero);
        } else if (this._tabIndex == EnumDrawCardTabType.WEAPON) {
            redDotCom.reset(RedDotKeys.drawCard_equip);
        } else {
            redDotCom.reset(RedDotKeys.Null);
        }
    }
}
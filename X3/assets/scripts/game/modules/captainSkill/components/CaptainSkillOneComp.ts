import G from "db://assets/scripts/core/comm/G";
import { bindFguiExtension } from "db://assets/scripts/core/comm/UIScriptManager";
import FGUI from "db://assets/scripts/core/fgui/FGUI";
import { INotification } from "db://assets/scripts/core/mvc/interface/INotification";
import { CaptainSkillModel } from "db://assets/scripts/game/modules/captainSkill/model/CaptainSkillModel";
import { CaptainSkillUtils } from "db://assets/scripts/game/modules/captainSkill/utils/CaptainSkillUtils";
import { CaptionSkillLvUpView } from "db://assets/scripts/game/modules/captainSkill/view/CaptionSkillLvUpView";
import { EnumRedDotShowType } from "db://assets/scripts/game/modules/common/redDot/enums/EnumRedDotShowType";
import { RedDotKeys } from "db://assets/scripts/game/modules/common/redDot/RedDotKeys";
import { RedDotUtils } from "db://assets/scripts/game/modules/common/redDot/utils/RedDotUtils";
import * as fgui from "fairygui-cc";


const { GObject } = fgui;

/**
 * 描述面板
 */
@bindFguiExtension("ui://captainSkill/CaptainSkillOneComp")
export class CaptainSkillOneComp extends FGUI.GComponent implements INotification {
    private _parentView: CaptionSkillLvUpView;
    private _index: number;
    private _config: table.captain.CaptainConfig;


    private get view(): ui.captainSkill.components.CaptainSkillOneComp {
        return this as any;
    }

    listenNotifications(): string[] {
        return [];
    }

    notificationHandler(event: string, args?: any): void {
        switch (event) {
        }
    }


    protected onPreDispose() {
        G.FacadeManager.removeNotification(this);
    }

    protected onConstruct() {
        super.onConstruct();
        G.FacadeManager.registerNotification(this);

        // click
        this.view.clearClick();
        this.view.onClick(this.onClick0, this);
    }

    onClick0() {
        this._parentView?.choose(this._index);

    }

    reset(parent: CaptionSkillLvUpView,
        index: number,
        config: table.captain.CaptainConfig,
        isChoose: boolean
    ) {
        this._parentView = parent;
        this._index = index;

        const redDotCom = RedDotUtils.castComp(this.view.redDot);
        if (!config) {
            redDotCom.showByType(EnumRedDotShowType.NULL);
            return;
        }
        this._config = config;


        const skillId = config.id;

        this.view.imageSkill.icon = config.iconPathForSmall;

        // 未解锁 = 0
        const lv = CaptainSkillModel.ins().getLvBySkillId(skillId);
        const isMaxLv = CaptainSkillUtils.isMaxLv(skillId, lv)

        const isUnlock = lv >= 0;
        this.view.getController("lockFlag").selectedIndex = isUnlock ? 0 : 1;
        this.view.getController("maxLvFlag").selectedIndex = isMaxLv ? 1 : 0;

        // 是否选中
        this.view.getController("chooseFlag").selectedIndex = isChoose ? 1 : 0;

        if (isUnlock) {
            this.view.labelLv.text = `+${lv}`;
        } else {
            // 未解锁

        }

        redDotCom.reset(RedDotKeys.captainSkill_lvUp, [skillId])

        // // 红点
        // if (isUnlock) {
        //     redDotCom.reset(RedDotKeys.captainSkill_lvUp, [skillId])
        // } else {
        //     redDotCom.reset(RedDotKeys.captainSkill_unlock, [skillId])
        // }

        // let targetY = this.view.mc.y;
        // this.view.mc.y += 50
        // tween(this.view.mc).delay(index * 0.1).to(0.1, { y: targetY }).start()
    }
}
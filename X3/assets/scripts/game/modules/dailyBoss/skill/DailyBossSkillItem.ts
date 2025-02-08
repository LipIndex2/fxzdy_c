import * as fgui from "fairygui-cc";
import G from "db://assets/scripts/core/comm/G";
import { UIHeroKey } from "db://assets/scripts/game/modules/hero/const/UIHeroConfig";
import { SkillInfoWinOpenArgs } from "db://assets/scripts/game/modules/hero/view/SkillInfoWin";
import { SkillConfigManager } from "db://assets/scripts/game/comm/battle/skill/config/SkillConfigManager";

/**
 * 每日boss 技能
 */
export class DailyBossSkillItem extends fgui.GComponent {
    
    private _skillId: string;


    protected onConstruct() {
        super.onConstruct();

        this.view.onClick(this.onClickSkill, this)

    }

    private get view(): ui.dailyBoss.skill.DailyBossSkillItem {
        return this as any;
    }

    reset(skillId: string) {

        this._skillId = skillId;
        
        const skillConfigById = SkillConfigManager.getSkillConfigById(skillId);
        if (!skillConfigById) {
            return;
        }

        this.view.img_skill.img_skill.icon = skillConfigById.icon;
    }


    onClickSkill() {

        G.UIManager.open(UIHeroKey.SkillInfoWin, {
            skillId: this._skillId,
            isTop: true,
            isNeedLv: false,
        } as SkillInfoWinOpenArgs);
    }
}
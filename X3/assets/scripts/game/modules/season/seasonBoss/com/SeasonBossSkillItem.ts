import * as fgui from "fairygui-cc";
import { SkillConfigManager } from "../../../../comm/battle/skill/config/SkillConfigManager";
import G from "../../../../../core/comm/G";
import { UIHeroKey } from "../../../hero/const/UIHeroConfig";
import { SkillInfoWinOpenArgs } from "../../../hero/view/SkillInfoWin";

export class SeasonBossSkillItem extends fgui.GComponent {
  private _skillId: string;

  private get view(): ui.seasonBoss.com.SeasonBossSkillItem {
    return this as any;
  }

  onConstruct() {
    super.onConstruct();

    this.view.onClick(this.onClickSkill, this)
  }

  private onClickSkill() {
    G.UIManager.open(UIHeroKey.SkillInfoWin, {
      skillId: this._skillId,
      isTop: true,
      isNeedLv: false,
    } as SkillInfoWinOpenArgs);
  }

  reset(skillId: string) {
    const t = this;

    t._skillId = skillId;

    const skillConfigById = SkillConfigManager.getSkillConfigById(skillId);
    if (!skillConfigById) {
      return;
    }

    this.view.img.img_skill.icon = skillConfigById.icon;
  }
}

import { UIBindingKey } from "db://assets/scripts/core/mvc/ui/UIBindingKey";
import { CaptainSkillResetWin } from "./view/CaptainSkillResetWin";
import { CaptionSkillLvUpView } from "./view/CaptionSkillLvUpView";
import { CaptionSkillMainView } from "./view/CaptionSkillMainView";

/**
 * 战队技能
 */
export class UICaptainSkillKeys {
    // 战队技能升级
    static readonly CaptionSkillLvUpView = UIBindingKey.create("CaptionSkillLvUpView", CaptionSkillLvUpView);
    // 战队技能重置
    static readonly CaptainSkillResetWin = UIBindingKey.create("CaptainSkillResetWin", CaptainSkillResetWin);
    // 战队技能主界面
    static readonly CaptionSkillMainView = UIBindingKey.create("CaptionSkillMainView", CaptionSkillMainView);
}

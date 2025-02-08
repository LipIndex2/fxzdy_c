import { DirctionType } from "../../enum/BattleEnum";
import { FightSkillInfo } from "../FightSkillInfo";

export class ChuiXieSkill3 extends FightSkillInfo {
    /***开始触发行为 */
    public beginSkillHandler(): void {
        super.beginSkillHandler()
        if (this.skill.owner.dirction == DirctionType.Left)
            this.skill.owner.setDirction(DirctionType.Rigth)
        else
            this.skill.owner.setDirction(DirctionType.Left)
    }
}
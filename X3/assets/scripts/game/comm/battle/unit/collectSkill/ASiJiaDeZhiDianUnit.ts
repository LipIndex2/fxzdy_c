import BattleConstantConfig from "../../config/BattleConstantConfig";
import { FightSkillInfo } from "../../skill/FightSkillInfo";
import { ICaster } from "../../skill/ICaster";
import { SkillBehavior } from "../../skill/SkillBehavior";

export class ASiJiaDeZhiDianSkill extends FightSkillInfo {

    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner)
        let param: { cd: number, skills: string[] } = behavior.cfg.param;
        if (param?.skills) {
            let collectSkillList = owner.battleLogic.collectSkillList;
            if (collectSkillList?.length) {
                for (let i = 0; i < collectSkillList.length; i++) {
                    if (param.skills.indexOf(collectSkillList[i].skillId) != -1 && collectSkillList[i].cfg.cd) {
                        let cd = Math.ceil(collectSkillList[i].cfg.cd * (10000 - param.cd) / BattleConstantConfig.getRandBase);
                        collectSkillList[i].updateMaxCd(cd)
                    }
                }
            }
        }
    }
}
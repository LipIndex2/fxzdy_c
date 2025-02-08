import { SkillBehavior } from "../skill/SkillBehavior";
import { SkillBuff } from "../skill/SkillBuff";
/***
 * 添加被动的BUFF
 * skillId 被动技能ID
 */
export class AddPassivityFlagBuff extends SkillBuff {
    private flag: string;
    protected buffHandler(): void {
        let effectParam: { flag: string, behavior: string } = this.effectParm1;
        if (effectParam) {
            this.flag = effectParam.flag;
            this.target.attr.addPassiveSkillFlag(effectParam.flag, SkillBehavior.createBehavior(effectParam.behavior))
        }
    }

    public remove(): void {
        this.target.attr.removePassiveSkillFlag(this.flag)
        super.remove()
    }
}
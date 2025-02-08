import { SkillBuff } from "../skill/SkillBuff";
/***
 * 添加被动的BUFF
 * skillId 被动技能ID
 */
export class PushPassivityBuff extends SkillBuff {
    private skillId: string;
    protected buffHandler(): void {
        let effectParam: { skillId: string } = this.effectParm1;
        if (effectParam) {
            this.skillId = effectParam.skillId
            this.target.attr.addOtherPassiveSkill(effectParam.skillId)
        }
    }

    public remove(): void {
        this.target.attr.removePassiveSkill(this.skillId)
        super.remove()
    }
}
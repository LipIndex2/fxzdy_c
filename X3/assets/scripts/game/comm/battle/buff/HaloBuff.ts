import { SkillBuff } from "../skill/SkillBuff";
import { SkillUtils } from "../skill/SkillUtils";
/***
 * 光环BUFF，为附近目标持续添加BUFF
 */
export class HaloBuff extends SkillBuff {

    protected buffHandler(): void {
        let effectParam: { buff: string } = this.effectParm1;
        if (effectParam) {
            let targets = SkillUtils.skillTarget(this.cfg.targetType, this.cfg.targetFaction, this.caster, this.target, this.cfg.range, this.cfg.num)
            if (targets) {
                for (let i = 0; i < targets.length; i++) {
                    if (targets[i].isActive) {
                        this.battleLogic.buffMgr.buffControlByGroup(effectParam.buff, this.caster, targets[i], this.skillBehavior)
                    }
                }
            }
        }
    }
}
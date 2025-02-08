import { SkillBehavior } from "../skill/SkillBehavior";
import { SkillBuff } from "../skill/SkillBuff";

export class BehaviorBuff extends SkillBuff {
    protected buffHandler(): void {
        let effectParam: { id: string, from: number } = this.effectParm1;
        if (effectParam) {
            if (!this.caster) {
                return;
            }

            const newBehavior = SkillBehavior.createBehavior(effectParam.id, 0, this.skillBehavior?.skill);
            if (newBehavior) {
                newBehavior.index = 0;
                if (effectParam.from)
                    newBehavior.setCaster(this.caster)
                else
                    newBehavior.setCaster(this.target)
                newBehavior.skillTarget = this.target;
                newBehavior.skillTargetUid = this.target.uid
                newBehavior.actionEffect();
            }
        }
    }
}
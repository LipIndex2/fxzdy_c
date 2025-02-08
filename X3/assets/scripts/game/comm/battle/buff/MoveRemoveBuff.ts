import { Vec2 } from "cc";
import { SkillBehavior } from "../skill/SkillBehavior";
import { SkillBuff } from "../skill/SkillBuff";
import { v2 } from "cc";
import { MathUtils } from "../../../../core/utils/MathUtils";
import { DamageVo } from "../DamageVo";
import { FightFormula } from "../FightFormula";

export class MoveRemoveBuff extends SkillBuff {
    protected buffHandler(): void {
        let effectParam: { amount: number } = this.effectParm1;
        if (effectParam) {
            let damageVo: DamageVo = FightFormula.buffHurt(this.skillBehavior, this, this.caster, this.target, effectParam.amount * this.layer, this.distance)
            damageVo.buffInfo = this;
            this.caster.battleLogic.hurt(damageVo)
        }
    }

    public remove(): void {
        if (!this.skillBuffGroup.isAddToRemove && !this.isStop) {
            let effectParam: { behavior: string, dis: number } = this.effectParm1;
            if (effectParam) {
                if (!this.caster) {
                    return;
                }

                const newBehavior = SkillBehavior.createBehavior(effectParam.behavior, 0, this.skillBehavior?.skill);
                if (newBehavior) {
                    newBehavior.index = 0;
                    newBehavior.setCaster(this.caster)
                    newBehavior.skillTarget = this.target;
                    newBehavior.skillTargetUid = this.target.uid
                    newBehavior.actionEffect();
                }
            }
        }
        super.remove();
    }

    private isStop: boolean = false
    private lastMovePos: Vec2;
    private addMoveDis: number = 0;
    public updatePos(pos: Vec2): void {
        if (!this.lastMovePos)
            this.lastMovePos = v2(pos.x, pos.y)

        this.addMoveDis += MathUtils.distance(this.lastMovePos, pos)
        this.lastMovePos.x = pos.x;
        this.lastMovePos.y = pos.y;

        let effectParam: { behavior: string, dis: number } = this.effectParm1;
        if (this.addMoveDis >= effectParam.dis) {
            this.isStop = true;
            this.isReadyToRemove = true;
        }
    }
}
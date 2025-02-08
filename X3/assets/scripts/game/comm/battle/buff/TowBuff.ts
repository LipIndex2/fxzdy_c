import { MathUtils } from "../../../../core/utils/MathUtils";
import { SkillBuff } from "../skill/SkillBuff";
import { BuffEffectPos } from "../skill/SkillEnum";

export class TowBuff extends SkillBuff {
    private isShowEffect: boolean = false

    public onAddBuff(): void {
        super.onAddBuff()
        if (!this.target.attr.canForceMove()) {
            this.target.showUnit()?.showOtherNum("bati")
            this.isReadyToRemove = true;
        }
    }

    protected buffHandler(): void {
        let effectParam: { dis: number, effect: number, effectDis: number } = this.effectParm1;
        if (effectParam) {
            if (!this.caster.caster || !this.caster.caster.isActive) {
                if (this.target && this.target.showUnit()) {
                    this.target.showUnit().clearBuffEff([effectParam.effect])
                }
                return
            }
            const maxDistance = effectParam.dis;
            let distance = Math.floor(MathUtils.distance(this.caster.pos, this.target.pos));
            if (distance > maxDistance) {
                // 当两物体间的距离超过最大长度时，调整位置
                let radians = MathUtils.radian(this.target.pos, this.caster.pos);
                let moveDistance = distance - maxDistance;
                let tempVec = MathUtils.tempVec2(moveDistance * Math.cos(radians), moveDistance * Math.sin(radians))
                this.battleLogic.unitCollisionsManager.tryMove(this.target.pos, tempVec);//路径移动忽略碰撞
            }
            if (!this.isShowEffect) {
                this.isShowEffect = true;
                this.target.showUnit()?.addBuffEff([effectParam.effect], ["up"], BuffEffectPos.Link_Fight_And_Target, this.caster.caster, effectParam.effectDis)
            }
        }
    }

    public remove(): void {
        let effectParam: { dis: number, effect: number, effectDis: number } = this.effectParm1;
        if (effectParam) {
            if (this.target && this.target.showUnit()) {
                this.target.showUnit().clearBuffEff([effectParam.effect])
            }
        }
        super.remove()
    }
}
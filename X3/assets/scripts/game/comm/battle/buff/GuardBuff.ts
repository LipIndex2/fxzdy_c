import ArrayUtils from "../../../../core/utils/ArrayUtils";
import { SkillBuff } from "../skill/SkillBuff";
import { BuffEffectPos } from "../skill/SkillEnum";
import { BattleUnit } from "../unit/battle/BattleUnit";

export class GuardBuff extends SkillBuff {
    //同类型的BUFFID，会添加不同的单位
    public casters: BattleUnit[] = [];
    private isShowEffect: boolean = false

    public addCaster(caster: BattleUnit): void {
        ArrayUtils.iPush(this.casters, caster)
    }

    protected buffHandler(): void {
        let effectParam: { dis: number, effect: number, effectDis: number } = this.effectParm1;
        if (!this.isShowEffect && effectParam?.effect) {
            this.isShowEffect = true;
            this.target.showUnit()?.addBuffEff([effectParam.effect], ["up"], BuffEffectPos.Link_Fight_And_Target, this.caster.caster, effectParam.effectDis)
        }
    }

    public remove(): void {
        let effectParam: { effect: number } = this.effectParm1;
        if (effectParam) {
            if (this.target && this.target.showUnit()) {
                this.target.showUnit().clearBuffEff([effectParam.effect])
            }
        }
        super.remove()
    }
}
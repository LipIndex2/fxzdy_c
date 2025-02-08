import { GameTimer } from "../../../../core/timer/GameTimer";
import { DamageVo } from "../DamageVo";
import { EffectLayer, SkillEffectPos } from "../skill/SkillEnum";
import { PetUnit } from "../unit/battle/PetUnit";
import { BattleShowUnit } from "./BattleShowUnit";

export class PetShowUnit extends BattleShowUnit {
    public unitData: PetUnit;

    public onInitData(): void {
        super.onInitData()
        this.showPetEffect()
    }

    private showPetEffect(): void {
        this.createFightEffect(10010001, SkillEffectPos.Player_Move, this.unitData, EffectLayer.BgLayer, false, this.unitData.dirction)
        this.createFightEffect(10010002, SkillEffectPos.Player_Move, this.unitData, EffectLayer.RoleLayer, false, this.unitData.dirction)
    }

    /***死亡动作后的特效计时器key */
    private dieActionTimer1: string
    protected onDie(damageVo?: DamageVo) {
        if (damageVo)
            super.onDie(damageVo)
        else {
            if (!this.isDisposed) {
                this.node.fadeOut(1000)
                this.dieActionTimer1 = GameTimer.ins().once(1000, this, () => {
                    if (!this.isDisposed)
                        this.visible = false;
                })
            }
        }
    }

    protected updateHpBar(): void {
    }

    /***死亡动作播放完回调 */
    protected onDieActionComplete(): void {
        this.dieActionTimer1 = GameTimer.ins().once(this.delayToDispose, this, () => {
            if (!this.isDisposed) {
                this.node.fadeOut(1000)
                this.dieActionTimer1 = GameTimer.ins().once(850, this, () => {
                    if (!this.isDisposed)
                        this.visible = false;
                })
            }
        })
    }

    /**销毁 */
    dispose() {
        if (this.dieActionTimer1)
            GameTimer.ins().clearByKey(this.dieActionTimer1)
        super.dispose();
    }
}
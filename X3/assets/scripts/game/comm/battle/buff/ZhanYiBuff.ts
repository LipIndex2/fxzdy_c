import { BattleCommandType } from "../BattleCommand";
import { SkillBuff } from "../skill/SkillBuff";

export class ZhanYiBuff extends SkillBuff {
    protected buffHandler(): void {
        let effectParam: { effect: number[], effect2: number } = this.effectParm1;
        if (effectParam) {
            this.battleLogic.command.send(BattleCommandType.addBuffEff, this.target.uid, [+effectParam.effect[this.layer - 1]], null, 2);
            this.battleLogic.command.send(BattleCommandType.addBuffEff, this.target.uid, [+effectParam.effect2], null, 1)
        }
    }

    private removeAllEffect(): void {
        let effectParam: { effect: number[], effect2: number } = this.effectParm1;
        if (effectParam) {
            for (let i = 0; i < effectParam.effect.length; i++) {
                this.battleLogic.command.send(BattleCommandType.clearBuffEff, this.target.uid, [effectParam.effect[i]])
            }
            this.battleLogic.command.send(BattleCommandType.clearBuffEff, this.target.uid, [effectParam.effect2])
        }
    }

    public remove(): void {
        this.removeAllEffect()
        super.remove();
    }
}
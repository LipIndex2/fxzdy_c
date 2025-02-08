import GIns from "../../../../GIns";
import { ActorState } from "../../enum/BattleEnum";
import { PetShowUnit } from "../../show/PetShowUnit";
import { PetUnit } from "../../unit/battle/PetUnit";

export class JieFuShow extends PetShowUnit {
    protected setStateHandler(actionName: string, loop: boolean, timeScaler?: number): void {
        if (!GIns.mapMgr.isInMainCity() && (!(this.unitData as JieFu).isChangeAtk && (this._state == ActorState.Idle || this._state == ActorState.Running))) {
            actionName = "move2";
        }
        if (this._state == ActorState.Attack && this.unitData.skillInfo?.skillIndex == 1) {
            if (!(this.unitData as JieFu).isChangeAtk) {
                actionName = "leave"
            }
            else {
                actionName = "appear"
            }
        }
        super.setStateHandler(actionName, loop, timeScaler)
    }
}

export class JieFu extends PetUnit {
    /***是否转换为攻击阶段 */
    public isChangeAtk: boolean = false;

    /**是否能攻击 */
    protected canAttack(): boolean {
        if (!this.isChangeAtk && this.skillInfo?.skillIndex != 1)
            return false;
        return super.canAttack()
    }

    /**修正移动位置 */
    onBeforUpdatePos(): void {
        if (!this.isChangeAtk) {
            if (this.teamUnit.isMoving || !this._moveVec.isMoving) {
                this.clearMainTarget()
                this.clearHatredTarget();
                this.moveToFormation();
            }
        }
        else
            super.onBeforUpdatePos();
    }

    protected doOther() {
        if (this.isBeginToFight && !this.isChangeAtk)
            return;
        super.doOther()
    }
}
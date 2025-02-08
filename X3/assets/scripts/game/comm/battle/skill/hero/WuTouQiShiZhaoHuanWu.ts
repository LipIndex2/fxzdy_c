import { MonsterUnit } from "../../unit/battle/MonsterUnit";

export class WuTouQiShiZhaoHuanWu extends MonsterUnit {
    /**修正移动位置 */
    onBeforUpdatePos(): void {
        let b = false
        if (this.summon) {
            //召唤物要判断主人是否进战
            let unit = this.battleLogic.getBatteUintByUid(this.summon.byUid)
            if (unit) {
                if (!unit.isBeginToFight || unit.getMoveVec().isCrtl) {
                    b = true;
                }
            }
        }

        if (b || !this._moveVec.isMoving && !this.isBeginToFight) {
            this.clearMainTarget()
            this.clearHatredTarget();
            this.moveToFormation();
        }
    }

    /**向阵位移动 */
    moveToFormation(force: boolean = false): void {
        let unit = this.battleLogic.getBatteUintByUid(this.summon.byUid)
        if (!unit)
            return;
        this.setDirction(unit.dirction)
        this.pos.set(unit.pos.x, unit.pos.y);
    }

    /****判断能否发动技能 */
    protected checkCanActivateSkills(): boolean {
        if (this.summon) {
            let unit = this.battleLogic.getBatteUintByUid(this.summon.byUid)
            if (unit && (unit.getMoveVec().isCrtl || !unit.isBeginToFight)) {
                return false;
            }
        }
        return this.isBeginToFight && !this.battleLogic.isSafe && !this.isAttacking && (!this._moveVec.isCrtl || this.canMoveAttack())
    }
}
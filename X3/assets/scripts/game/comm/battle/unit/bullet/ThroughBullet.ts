import { Vec2 } from "cc";
import { MathUtils } from "../../../../../core/utils/MathUtils";
import UnitSearchUtils from "../../collisions/UnitSearchUtils";
import { ICaster } from "../../skill/ICaster";
import { ITarget } from "../../skill/ITarget";
import { BattleUnit } from "../battle/BattleUnit";
import { PhysicalBulletUnit } from "./PhysicalBulletUnit";
import { BattleCommandType } from "../../BattleCommand";
import { SkillUtils } from "../../skill/SkillUtils";
import { TargetFaction } from "../../skill/SkillEnum";

/**穿透子弹 （碰撞子弹） */
export class ThroughBullet extends PhysicalBulletUnit {
    private hitMap: { [uid: number]: boolean } = {}

    initParam(atk: number, targetPos: { x: number, y: number }, atkPoint: { x: number, y: number }, from: ICaster, target: ITarget) {
        this.hitMap = {}
        super.initParam(atk, targetPos, atkPoint, from, target)
    }

    /**检测是否触发 */
    checkTrigger() {

        let units: BattleUnit[]
        let parameter: { width: number, height: number } = this._cfg.parameter;
        let isRect: boolean = false
        if (parameter?.width && parameter?.height) {
            isRect = true
            units = UnitSearchUtils.getUnitsByRectAndRectParam(this.battleLogic.unitCollisionsManager, this.pos, SkillUtils.getTeamIdByFaction(this.teamId, TargetFaction.EnemySide), this.angle, parameter);
        }
        else
            units = UnitSearchUtils.getUnitsByCircle(this, this.targetTeamId, 100);

        if (units?.length) {
            for (let i = 0; i < units.length; i++) {
                let unit = units[i];
                if (!this.hitMap[unit.uid]) {
                    if (isRect) {
                        this.targetUid = unit.uid; //修改目标
                        this.hit(unit)
                    }
                    else {
                        let dis = MathUtils.distance(unit.hurtPoint as Vec2, this.pos);
                        if (unit.attr.getSize() >= dis) {
                            this.targetUid = unit.uid; //修改目标
                            this.hit(unit)
                        }
                    }
                }
            }

            // if (hurtTarget) {
            //     this.targetUid = hurtTarget.uid; //修改目标
            //     this.hit(hurtTarget)
            // }
        }

        if (this._runTime >= this._maxTime) {
            this._isActive = false;
        }
        this.checkDis();
    }

    hit(hurtTarget: BattleUnit) {
        if (hurtTarget) {
            this.hitMap[hurtTarget.uid] = true
            this.battleLogic.command.send(BattleCommandType.hit, this.uid, hurtTarget)
        }
        this.action();
        this.showBulletEffect(hurtTarget)
    }

    action() {
        this.actionBehavior();
    }
}
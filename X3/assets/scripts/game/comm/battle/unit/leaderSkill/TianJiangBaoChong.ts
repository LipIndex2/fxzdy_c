import { SkillBehavior } from "../../skill/SkillBehavior";
import { BaseLeaderSkillUnit } from "./BaseLeaderSkillUnit";
import { Bezier2Tween } from "../../../../../core/comp/Bezier2Tween";
import { MathUtils } from "../../../../../core/utils/MathUtils";
import UnitSearchUtils from "../../collisions/UnitSearchUtils";
import { BattleUnit } from "../battle/BattleUnit";
import { SkillUtils } from "../../skill/SkillUtils";
import { SkillTargetType, TargetFaction } from "../../skill/SkillEnum";
import BattleTimer from "../../../../../core/timer/BattleTimer";

export class TianJiangBaoChong extends BaseLeaderSkillUnit {

    protected factor: number = 0;
    protected bezier2Tween: Bezier2Tween
    protected isAngle: boolean = true;
    private moveSpeed: number = 0;
    initParam(): void {
        let param: { startX: number, startY: number, speed: number, distance: number, isAngle: number } = this._cfg.param;

        this.factor = 0;
        if (!this.bezier2Tween)
            this.bezier2Tween = new Bezier2Tween()

        this.isAngle = param.isAngle == 1 ? true : false;
        this.moveSpeed = param.speed / 1000;

        let team = this.battleLogic.getTeamByTeamId(this.teamId)
        // this.setPosXY(team.pos.x + +param.startX, team.pos.y + +param.startY)
        this.pos.set(team.pos.x + +param.startX, team.pos.y + +param.startY);

        let targets = SkillUtils.skillTarget(SkillTargetType.LOWEST_HP, TargetFaction.EnemySide, this, null, 999, 1)
        if (targets && targets.length > 0) {
            this.bezier2Tween.setPoint(this.pos.x, this.pos.y,
                this.pos.x + (targets[0].pos.x - this.pos.x) / 2, this.pos.y + param.distance,
                targets[0].pos.x, targets[0].pos.y - targets[0].attr.getSize() * 0.5)
        }
    }

    update(): boolean {
        this._runTime++
        var x = this.pos.x;
        var y = this.pos.y;
        var xy: { x: number, y: number } = this.bezier2Tween.getPosByFactor(this.factor)
        this.pos.set(xy.x, xy.y);
        // var angle: number = MathUtils.getAngle(x, y, xy.x, xy.y)
        // if (this.isAngle) {
        //     this.battleLogic.showMgr.setStatue(this.uid, { addAngle: 1 });
        // }
        this.battleLogic.showMgr.setStatue(this.uid, { addAngle: -10 });
        this.factor += this.moveSpeed / 50 * BattleTimer.battleTickFrame;
        this.checkTrigger();
        return true
    }

    /**检测是否触发 */
    checkTrigger() {
        if (this.factor > 1) {
            this._isActive = false;
            let units = UnitSearchUtils.getUnitsByCircle(this, this.targetTeamId, 200);
            if (units?.length) {
                let hurtTarget: BattleUnit;
                let minDis = 9999999;
                for (let i = 0; i < units.length; i++) {
                    let unit = units[i];
                    let dis = MathUtils.distance(unit.pos, this.pos);
                    hurtTarget = unit;
                    minDis = dis;
                }

                if (hurtTarget) {
                    let behaviorTimings = this.skill.behaviorsTiming;
                    for (let i = 0; i < behaviorTimings.length; i++) {
                        let trigger = behaviorTimings[i].delay || 0
                        const behavior = SkillBehavior.createBehavior(behaviorTimings[i].behaviorId, trigger, this.skill);
                        if (!behavior) {
                            continue;
                        }
                        behavior.skillTargetUid = hurtTarget.uid;
                        behavior.skillTarget = hurtTarget;
                        behavior.index = 0;
                        behavior.setCaster(this)
                        behavior.actionEffect()
                    }
                    return;
                }
            }
        }

        if (this._runTime >= this._maxTime) {
            this._isActive = false;
        }
    }
}
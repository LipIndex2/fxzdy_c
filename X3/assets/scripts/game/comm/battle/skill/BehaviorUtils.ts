import { BattleUnit } from "../unit/battle/BattleUnit";
import { ICaster } from "./ICaster";
import { SkillBehavior } from "./SkillBehavior";
import { SkillUtils } from "./SkillUtils";
import { ITarget } from "./ITarget";
import { Handler } from "../../../../core/utils/Handler";
import { FightTimeCheck } from "../FightTimeCheck";
import { MonsterUnit } from "../unit/battle/MonsterUnit";
import { BattleUtils } from "../BattleUtils";
import { MathUtils } from "../../../../core/utils/MathUtils";
import { CollisionUtils } from "../../math/CollisionUtils";
import { Bezier2Tween } from "../../../../core/comp/Bezier2Tween";
import { AbnormalType, TargetFaction } from "./SkillEnum";
import { ActorUnitNode } from "../node/ActorUnitNode";
import { v2 } from "cc";

/**behavior 效果 */
export class BehaviorUtils {

    /**获取行为目标 */
    static getBehaviorTargets(behavior: SkillBehavior, caster: ICaster, num: number = -1, targetType: number = -1) {
        let skillTarget: ITarget;
        if (behavior.skillTarget && !behavior.skillTarget.unit)
            skillTarget = behavior.skillTarget;
        else {
            skillTarget = caster.battleLogic.getBatteUintByUid(behavior.skillTargetUid);
            if (!skillTarget)
                skillTarget = behavior.skillTarget?.unit
        }

        // if (!skillTarget) return; //目标不存在

        let behaviorTargets = SkillUtils.behaviorRangeTargerts(behavior, caster, skillTarget);
        // if (skillTarget && skillTarget.unit instanceof BattleUnit && skillTarget.unit.attr.buffStatueByType(BuffType.Tie)) {
        //     //假如目标有束缚BUFF，且是自己队友，则优先被选择
        //     if (behaviorTargets.indexOf(skillTarget.unit) == -1) {
        //         behaviorTargets.unshift(skillTarget.unit)
        //     }
        // }
        let notSelf = behavior.cfg.notSelf
        let isCharm = caster.battleLogic.buffMgr.checkIsCharm(caster.caster);
        if (isCharm) {
            //魅惑中，假如目标是敌人，则排除自己
            if (behavior.cfg.targetFaction == TargetFaction.EnemySide) {
                notSelf = 1;
            }
            else {
                isCharm = false;
            }
        }

        if (behaviorTargets?.length) {
            behaviorTargets = SkillUtils.behaviorFilterTargertsByTargetType(caster, behaviorTargets, targetType == -1 ? behavior.cfg.targetType : targetType, behavior.cfg.targetParam, num == -1 ? (behavior.cfg.num || 999) : num, skillTarget, isCharm);
            if (behaviorTargets?.length) {
                for (let i = 0; i < behaviorTargets.length; i++) {
                    if (!behaviorTargets[i] || (behaviorTargets[i].uid == caster.casterUid && notSelf)) {
                        behaviorTargets.splice(i, 1)//排除自己
                        i--;
                    }
                }
            }
        }

        return behaviorTargets;
    }

    /***牵引 */
    static pull(x: number, y: number, speed: number, interval: number, addAngleValue: number, target: BattleUnit, loopTime: number = -1): FightTimeCheck {
        if (!target.isActive || !target.canBeHurt()) {
            return null;
        }

        if (target instanceof MonsterUnit && target.isBoss) {
            return null;
        }

        if (!target.attr.canForceMove()) {
            return null;
        }

        let fightTimeCheck: FightTimeCheck = target.battleLogic.createTimeCheck(interval, new Handler(this, () => {
            if (!target.isActive)
                return
            let v_scale = speed / 1000 * BattleUtils.frameDeltaMs;
            let dis = MathUtils.getDistance(x, y, target.pos.x, target.pos.y);
            if (dis > 20) {
                let radian = MathUtils.getRadians(target.pos.x, target.pos.y, x, y);
                let v = Math.min(dis, v_scale);
                CollisionUtils.tempVec.set(v * Math.cos(radian), v * Math.sin(radian));
                target.forceMove(CollisionUtils.tempVec);
            }
            target.battleLogic.showMgr.setStatue(target.uid, { addAngle: addAngleValue });
        }), loopTime)

        return fightTimeCheck
    }

    /***跳跃 */
    static jump(x: number, y: number, height: number, time: number, delay: number, target: BattleUnit, callback: Handler): FightTimeCheck {
        if (!target.isActive) {
            return null;
        }

        if (!target.attr.canJumpMove()) {
            return null;
        }

        let newPos = BattleUtils.setPosNotBlockPos(target.battleLogic.fightType, v2(x, y))

        let bezier2Tween: Bezier2Tween = new Bezier2Tween()
        bezier2Tween.setPoint(target.pos.x, target.pos.y,
            target.pos.x + (x - target.pos.x) / 2, Math.max(target.pos.y, y) + height,
            newPos.x, newPos.y)
        let factor: number = 0;

        let speed = time / BattleUtils.frameDeltaMs;

        let envActive = target.envActive;
        target.envActive = false;

        target.setAbnormalStatus(AbnormalType.ImmuneControl)
        let step: number = 0;//0上升阶段，1下降阶段
        let fightTimeCheck: FightTimeCheck = target.battleLogic.createTimeCheck(BattleUtils.frameDeltaMs, new Handler(this, () => {
            if (!target.isActive) {
                fightTimeCheck.isReadyToRemove = true;
                return
            }

            delay -= BattleUtils.frameDeltaMs;
            if (delay <= 0) {
                let v_scale = 1 / speed;
                var xy: { x: number, y: number } = bezier2Tween.getPosByFactor(factor)
                target.setPosXY(xy.x, xy.y);
                factor += v_scale;

                if (factor >= 0.5 && step == 0) {
                    let node = target.showUnit()?.node;
                    if (node instanceof ActorUnitNode) {
                        let event = node.getEventByName("loopStop1")
                        if (event && event.intValue) {
                            node.gotoAndPlay(event.intValue + 1)
                        }
                    }
                    step++;
                }

                if (factor >= 1) {
                    fightTimeCheck.isReadyToRemove = true;
                    target.envActive = envActive;
                    let node = target.showUnit()?.node;
                    if (node instanceof ActorUnitNode) {
                        let event = node.getEventByName("loopStop2")
                        if (event && event.intValue) {
                            node.gotoAndPlay(event.intValue + 1)
                        }
                    }
                    target.clearAbnormalStatus(AbnormalType.ImmuneControl)
                    callback.run()
                }
            }
        }), -1)
        return fightTimeCheck
    }
}
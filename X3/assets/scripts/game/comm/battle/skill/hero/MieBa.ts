import { v2, Vec2 } from "cc";
import { Handler } from "../../../../../core/utils/Handler";
import { MathUtils } from "../../../../../core/utils/MathUtils";
import { CollisionUtils } from "../../../math/CollisionUtils";
import { BattleUtils } from "../../BattleUtils";
import { FightTimeCheck } from "../../FightTimeCheck";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";
import { SkillUtils } from "../SkillUtils";
import { DamageVo } from "../../DamageVo";
import BattleConstantConfig from "../../config/BattleConstantConfig";
import { BehaviorUtils } from "../BehaviorUtils";
import { EffectLayer, PassivitySkillFlag, SkillEffectPos, SkillTargetType, TargetFaction } from "../SkillEnum";
import { PoolManager } from "../../../../../core/pool/PoolManager";

export class MieBaSkill2 extends FightSkillInfo {
    private damageValue: number = 0;
    private moveTimeCheck: FightTimeCheck;
    private hitTimeCheck: FightTimeCheck;
    /***技能开始 */
    public beginSkillHandler(): void {
        this.damageValue = 0;
    }

    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        let param: { speed: number, behavior: string, shieldAmount: number; shieldBuff: string } = behavior.cfg.param;
        if (param?.speed) {
            super.beginBehaviorEffect(behavior, owner);
            if (behavior.selectUnits?.length) {
                let target = behavior.selectUnits[0]
                let dis = MathUtils.distance(target.pos, this.skill.owner.pos)
                if (dis <= target.attr.size) {
                    // this.onMoveHandler(v2(0, 0), target, behavior);
                    this.hitTarget(param.behavior, behavior, target, 495);
                }
                else {
                    let moveDistance = param.speed / 1000 * BattleUtils.frameDeltaMs;
                    let vec = CollisionUtils.calVecTemp(owner.pos, target.pos, moveDistance);
                    this.moveTimeCheck = this.skill.battleLogic.createTimeCheck(16, new Handler(this, this.onMoveHandler, [v2(vec.x, vec.y), target, behavior]), -1)
                }
            }
        }
        else {
            super.beginBehaviorEffect(behavior, owner);
            if (param?.shieldBuff) {
                owner.battleLogic.buffMgr.buffControlByGroup(param.shieldBuff, owner, owner as BattleUnit, behavior, null, Math.ceil(this.damageValue * param.shieldAmount / BattleConstantConfig.getRandBase))
            }
        }
    }

    private onMoveHandler(moveVec: Vec2, target: BattleUnit, behavior: SkillBehavior): void {
        if (target?.isActive) {
            let dis = MathUtils.distance(target.pos, this.skill.owner.pos)
            if (dis <= (target.attr.getSize() + behavior.owner.caster.attr.getSize())) {
                let param: { speed: number, behavior: string } = behavior.cfg.param;
                if (param?.behavior) {
                    if (this.moveTimeCheck)
                        this.moveTimeCheck.isReadyToRemove = true;
                    // this.onNewBehaviorHandler(param.behavior, behavior, this.skill.owner, this.skill, target);
                    // this.skill.owner.stopAction();
                    // this.skill.owner.showUnit()?.spineGoToAndPlayByFrameName("loopEnd")
                    this.hitTarget(param.behavior, behavior, target, 495);
                }
            }
            else
                this.skill.owner.forceMove(moveVec)
        }
        else {
            if (this.moveTimeCheck)
                this.moveTimeCheck.isReadyToRemove = true;
            // this.skill.owner.stopAction();
        }
    }

    private hitTarget(behaviorId: string, behavior: SkillBehavior, target: BattleUnit, delayTime: number): void {
        this.hitTimeCheck = this.skill.battleLogic.createTimeCheck(delayTime, new Handler(this, this.onNewBehaviorHandler, [behaviorId, behavior, this.skill.owner, this.skill, target], false))
        // this.onNewBehaviorHandler(behaviorId, behavior, this.skill.owner, this.skill, target);
        this.skill.owner.showUnit()?.spineGoToAndPlayByFrameName("loopEnd")
    }

    protected hurtHandler(behavior: SkillBehavior, taker: BattleUnit, damageVo: DamageVo): void {
        super.hurtHandler(behavior, taker, damageVo);
        this.damageValue += damageVo.value;
    }

    /***技能动作播放完毕 */
    public skillCompleteHandler(): void {
        this.skill.owner.showUnit()?.stopSkillMoveEffect()
        if (this.moveTimeCheck)
            this.moveTimeCheck.isReadyToRemove = true;
        if (this.hitTimeCheck)
            this.hitTimeCheck.isReadyToRemove = true;
    }
}

export class MieBaSkill3 extends FightSkillInfo {
    private tempUnits: BattleUnit[]
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner);
        let param: { amount: number, buff: string, buff2: string } = behavior.cfg.param;
        if (param?.buff) {
            let allUnits = behavior.selectUnits;
            if (allUnits?.length) {
                let P3440_x101Parm = owner.caster.attr.getPassiveSkillFlag(PassivitySkillFlag.P3440_x101)
                let halfValue = Math.ceil(allUnits.length * 0.5)
                let hurtUnits: BattleUnit[] = [];
                behavior.changeDamageValue = param.amount;
                for (let i = 0; i < halfValue; i++) {
                    //每个人添加时间静止的BUFF
                    if (allUnits[i].isActive) {
                        if (allUnits[i].teamId != owner.teamId) {
                            owner.battleLogic.buffMgr.buffControlByGroup(param.buff, owner, allUnits[i], behavior);
                            hurtUnits.push(allUnits[i])
                        }
                        else {
                            if (!P3440_x101Parm)
                                owner.battleLogic.buffMgr.buffControlByGroup(param.buff, owner, allUnits[i], behavior);
                        }
                    }
                }
                this.tempUnits = hurtUnits.concat()

                for (let j = halfValue; j < allUnits.length; j++) {
                    if (allUnits[j].isActive) {
                        //每个人添加时间静止的BUFF
                        if (param.buff2) {
                            //额外的敌人的时间静止BUFF持续时间不同
                            if (allUnits[j].teamId != owner.teamId)
                                owner.battleLogic.buffMgr.buffControlByGroup(param.buff2, owner, allUnits[j], behavior);
                            else {
                                if (!P3440_x101Parm)
                                    owner.battleLogic.buffMgr.buffControlByGroup(param.buff, owner, allUnits[j], behavior);
                            }
                        }
                        else {
                            if (allUnits[j].teamId != owner.teamId || !P3440_x101Parm)
                                owner.battleLogic.buffMgr.buffControlByGroup(param.buff, owner, allUnits[j], behavior);
                        }
                    }
                }
            }
        }
        else if (param?.amount) {
            if (this.tempUnits)
                this.hurt(behavior, { amount: param.amount }, owner, this.tempUnits)
        }
    }

    /***目标被选取 */
    protected onBehaviorSelectTargets(behavior: SkillBehavior, owner: ICaster, num: number = -1): BattleUnit[] {
        let param: { amount: number, radius: number } = behavior.cfg.param;
        if (param?.radius) {
            let enemys = SkillUtils.skillTarget(SkillTargetType.Nearset, TargetFaction.EnemySide, owner, owner as BattleUnit, param.radius, 0, { notSelf: 1 })
            let heros = SkillUtils.skillTarget(SkillTargetType.Nearset, TargetFaction.OurSide, owner, owner as BattleUnit, param.radius, 0, { notSelf: 1 })
            let allUnits = owner.battleLogic.randomMgr.randomAry(enemys.concat(heros))
            behavior.selectUnits = allUnits
            return allUnits;
        }
        else
            return BehaviorUtils.getBehaviorTargets(behavior, owner, num);
    }
}

export class MieBaPassivitySkill1 extends FightSkillInfo {
    private timerCheck: FightTimeCheck;
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner);
        let param: { buff: string, maxBuff: string, heroNum: number, hp: number, effectUp: number, effectLow: number, size: number } = behavior.cfg.param;
        if (param?.hp) {
            let heros = SkillUtils.skillTarget(SkillTargetType.Nearset, TargetFaction.OurSide, owner, owner as BattleUnit, 2000, 0, { notSelf: 1 });
            if (heros?.length) {
                for (let i = 0; i < heros.length; i++) {
                    let damageVo = PoolManager.getItem(DamageVo)
                    damageVo.caster = this.skill.owner
                    damageVo.target = heros[i];
                    damageVo.skillInfo = this.skill;
                    damageVo.value = Math.ceil(heros[i].attr.maxHp * param.hp / BattleConstantConfig.getRandBase);
                    heros[i].hurt(damageVo);
                }

                this.timerCheck = this.skill.battleLogic.createTimeCheck(500, new Handler(this, this.delayShowEffect, [heros, param.effectUp, param.effectLow], null))

                let heroNum = param.heroNum * heros.length;
                for (let i = 0; i < heroNum; i++) {
                    owner.battleLogic.buffMgr.buffControlByGroup(param.buff, owner, owner as BattleUnit, behavior, null, owner);
                }

                let buffs = owner.caster.attr.getBuffsByBuffGroup(param.buff)
                if (buffs?.length) {
                    if (buffs[0].layer >= buffs[0].cfgLayer) {
                        //满层
                        owner.battleLogic.buffMgr.buffControlByGroup(param.maxBuff, owner, owner as BattleUnit, behavior, null, owner);
                    }
                    owner.caster.attr.setSizeScale(1 + buffs[0].layer * 0.01)
                    owner.caster.showUnit()?.fadeScale(1 + buffs[0].layer * 0.01)
                }
            }
        }
        else if (param) {
            if (behavior.skillTarget?.unit.summon)
                return;
            owner.battleLogic.buffMgr.buffControlByGroup(param.buff, owner, owner as BattleUnit, behavior, null, owner);
            let addNum = param.heroNum - 1;
            if (behavior.skillTarget instanceof BattleUnit && (behavior.skillTarget.isHero())) {
                for (let i = 0; i < addNum; i++) {
                    owner.battleLogic.buffMgr.buffControlByGroup(param.buff, owner, owner as BattleUnit, behavior, null, owner);
                }
            }

            let buffs2 = owner.caster.attr.getBuffsByBuffGroup(param.buff)
            if (buffs2?.length) {
                if (buffs2[0].layer >= buffs2[0].cfgLayer) {
                    //满层
                    owner.battleLogic.buffMgr.buffControlByGroup(param.maxBuff, owner, owner as BattleUnit, behavior, null, owner);
                }
                let size = param.size / BattleConstantConfig.getRandBase;
                owner.caster.attr.setSizeScale(1 + buffs2[0].layer * size)
                owner.caster.showUnit()?.fadeScale(1 + buffs2[0].layer * size)
            }
        }
    }

    private delayShowEffect(heros: BattleUnit[], effectUp: number, effectLow: number): void {
        for (let i = 0; i < heros.length; i++) {
            heros[i].createFightEffect(effectUp, SkillEffectPos.Player_Move, heros[i], EffectLayer.RoleLayer, false, heros[i].dirction)
            heros[i].createFightEffect(effectLow, SkillEffectPos.Player_Move, heros[i], EffectLayer.RoleLayer, false, heros[i].dirction)
        }
    }

    public resetSkill(): void {
        super.resetSkill()
        this.skill.owner.attr.setSizeScale(1)
        this.skill.owner.showUnit()?.fadeScale(1)
    }

    /***技能动作播放完毕 */
    public skillCompleteHandler(): void {
        if (this.timerCheck)
            this.timerCheck.isReadyToRemove = true;
        super.skillCompleteHandler()
    }
}
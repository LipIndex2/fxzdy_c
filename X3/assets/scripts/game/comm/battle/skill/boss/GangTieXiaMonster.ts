import { Handler } from "../../../../../core/utils/Handler";
import { BattleUtils } from "../../BattleUtils";
import { DamageVo } from "../../DamageVo";
import { FightTimeCheck } from "../../FightTimeCheck";
import { FightTimeLoop } from "../../FightTimeLoop";
import { MonsterShowUnit } from "../../show/MonsterShowUnit";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { PassivitySkillUtils } from "../PassivitySkillUtils";
import { SkillBehavior } from "../SkillBehavior";
import { PassivitySkillFlag, PassivitySkillType } from "../SkillEnum";

export class GangTieXiaMonsterShow extends MonsterShowUnit {
    protected setStateHandler(actionName: string, loop: boolean, timeScaler?: number): void {
        let lastActionName = this.lastActionName
        if (actionName == "idle" && lastActionName != "move") {
            super.setStateHandler("idle2", loop, timeScaler)
        }
        else {
            super.setStateHandler(actionName, loop, timeScaler)
        }
    }
}

export class GangTieXiaMonsterSkill1 extends FightSkillInfo {
    private fightTimeCheck: FightTimeCheck
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner);

        let P4330_p101Parm: { doubleRate: number[], doubleDelay: number, num: number[] } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P4330_p101)
        if (P4330_p101Parm?.doubleRate) {
            //触发额外1次的概率
            let num = 0;
            for (let i = 0; i < P4330_p101Parm.doubleRate.length; i++) {
                let b = owner.battleLogic.randomMgr.isRandTrue(+P4330_p101Parm.doubleRate[i])
                if (b) {
                    num += +P4330_p101Parm.num[i];
                }
            }
            if (num) {
                this.fightTimeCheck = this.skill.battleLogic.createTimeCheck(P4330_p101Parm.doubleDelay, Handler.create(this, this.onDoubleBehaviorEffect, [behavior, owner], false), num, false)
            }
        }
    }

    private onDoubleBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        this.selectUnits = this.onBehaviorSelectTargets(behavior, owner);
        this.actionBehavior(behavior, owner, this.selectUnits)
    }

    /***技能动作播放完毕 */
    public skillCompleteHandler(): void {
        if (this.fightTimeCheck) {
            this.fightTimeCheck.destoryTimeCheck();
            this.fightTimeCheck = null;
        }
    }
}

export class GangTieXiaMonsterSkill2 extends FightSkillInfo {
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        let param: { missileId: string, missileId2: string, missileId3: string, rate: number, effect: number } = behavior.cfg.param;
        let isRand: boolean = false;
        if (param?.missileId) {
            if (owner.battleLogic.randomMgr.isRandTrue(param.rate)) {
                let P4330_x101Parm: { missileId2: string, effect: number } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P4330_x101)
                if (P4330_x101Parm?.effect) {
                    behavior.animModelId = { up: [param.effect] };
                }
                else if (param?.effect)
                    behavior.animModelId = { up: [param.effect] };
                isRand = true;
            }
        }
        super.beginBehaviorEffect(behavior, owner)
        if (param?.missileId) {
            let missileId = param.missileId;
            if (param.missileId2 && isRand) {
                missileId = (owner as BattleUnit).skillInfo?.skillIndex == 2 ? param.missileId3 : param.missileId2;
                let P4330_x101Parm: { missileId2: string, effect: number, missileId3: string, } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P4330_x101)
                if (P4330_x101Parm?.missileId2)
                    missileId = (owner as BattleUnit).skillInfo?.skillIndex == 2 ? P4330_x101Parm.missileId3 : P4330_x101Parm.missileId2;
            }
            for (let i = 0; i < this.selectUnits.length; i++) {
                if (this.selectUnits[i].isActive)
                    this.missile(behavior, { missileId: missileId }, owner, this.selectUnits[i])
            }
        }
    }
}

export class GangTieXiaMonsterSkill3 extends FightSkillInfo {
    private fightTimeCheck: FightTimeCheck
    private fightTimeCheck2: FightTimeLoop
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        let param: { hurtInterval: number, times: number, delay: number, times2: number } = behavior.cfg.param;
        if (param?.hurtInterval) {
            //hurtInterval每波间隔
            //times一共多少波
            this.fightTimeCheck = this.skill.battleLogic.createTimeCheck(param.hurtInterval, Handler.create(this, this.checkNextTime, [behavior, owner], null), param.times)
            this.fightTimeCheck2 = this.skill.battleLogic.createTimeCheck(param.hurtInterval, Handler.create(this, this.checkNextTime2, [behavior, owner], null), param.times2)
            this.fightTimeCheck2.delay = BattleUtils.getFrameByTime(param.delay);
        }
        else {
            super.beginBehaviorEffect(behavior, owner)
        }
    }

    private checkNextTime(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner)
        let param: { num: number } = behavior.cfg.param;
        //num每间隔发射的子弹数
        let P4330_p101Parm: { s1MissileId: string } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P4330_p101)
        if (P4330_p101Parm?.s1MissileId && owner.caster) {
            PassivitySkillUtils.updatePassSkillFunction(owner.caster, PassivitySkillType.ConType_16, "setMissileNum", param.num, P4330_p101Parm.s1MissileId);
            PassivitySkillUtils.checkPassSkillCon(PassivitySkillType.ConType_16, owner.caster, owner.caster);
        }
    }

    private checkNextTime2(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner)
    }

    /***持续伤害有错落 */
    protected hurtHandler(behavior: SkillBehavior, taker: BattleUnit, damageVo: DamageVo): void {
        let delay = this.skill.owner.battleLogic.randomMgr.randomInt(0, 30)
        this.skill.battleLogic.createTimeCheck(delay, Handler.create(this, super.hurtHandler, [behavior, taker, damageVo]))
    }

    /***技能动作播放完毕 */
    public skillCompleteHandler(): void {
        if (this.fightTimeCheck) {
            this.fightTimeCheck.isReadyToRemove = true;
        }

        if (this.fightTimeCheck2)
            this.fightTimeCheck2.isReadyToRemove = true;
    }
}

export class GangTieXiaMonsterPassivitySkill1 extends FightSkillInfo {
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner)
        let param: { formation: number, buff: string } = behavior.cfg.param;
        if (param?.formation) {
            let data = owner.battleLogic.getFormationByTeamAndId(owner.teamId, param.formation)
            if (data) {
                owner.battleLogic.buffMgr.buffControlByGroup(param.buff, owner, owner as BattleUnit, behavior)
            }
        }
    }
}
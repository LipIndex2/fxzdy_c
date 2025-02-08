import { Handler } from "../../../../../core/utils/Handler";
import { BattleUtils } from "../../BattleUtils";
import { DamageVo } from "../../DamageVo";
import { FightTimeCheck } from "../../FightTimeCheck";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { BulletUnit } from "../../unit/bullet/BulletUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { ITarget } from "../ITarget";
import { PassivitySkillData } from "../PassivitySkillData";
import { SkillBehavior } from "../SkillBehavior";
import { SkillBuff } from "../SkillBuff";
import { PassivitySkillFlag, SkillTargetType, TargetFaction } from "../SkillEnum";
import { SkillUtils } from "../SkillUtils";

export class XingJueSkill1 extends FightSkillInfo {
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner);
        if (behavior.cfg.effectType == "missile") {
            let P4311_s201Parm: { same: number } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P4311_s201);
            if (P4311_s201Parm) {
                let missiles: string[] = this.onGetMissile(behavior)
                if (missiles?.length) {
                    let index1 = owner.battleLogic.randomMgr.randomInt(0, missiles.length - 1)
                    let missileId1 = missiles[index1];
                    let index2 = owner.battleLogic.randomMgr.randomInt(0, missiles.length - 1)
                    let missileId2 = missiles[index2];
                    for (let i = 0; i < this.selectUnits.length; i++) {
                        super.missile(behavior, { missileId: missileId1, exData: { type: index1 } }, owner, this.selectUnits[i])
                        let isCrit: boolean = false
                        if (P4311_s201Parm.same == 1 && missileId1 == missileId2) {
                            isCrit = true
                        }
                        this.skill.battleLogic.createTimeCheck(100, Handler.create(this, super.missile, [behavior, { missileId: missileId2, fix: -10, fiy: -10, exData: { isCrit: isCrit, type: index2 } }, owner, this.selectUnits[i]]))
                        // super.missile(behavior, { missileId: missileId2, fix: -10, fiy: -10, exData: { isCrit: isCrit, type: index2 } }, owner, this.selectUnits[i])
                    }
                }
            }
        }
    }

    protected onGetMissile(behavior: SkillBehavior): string[] {
        let P4311_s201Parm: { missile: string[], same: number } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P4311_s201);
        return P4311_s201Parm.missile;
    }

    /***公式计算的处理 */
    protected fightFormulaHandler(behavior: SkillBehavior, caster: ICaster, taker: BattleUnit, isReal: boolean = false, damgeValue: number = 0, exData?: any): void {
        if (caster instanceof BulletUnit && caster.exData?.isCrit) {
            super.fightFormulaHandler(behavior, caster, taker, isReal, damgeValue, { isCrit: true });
        }
        else
            super.fightFormulaHandler(behavior, caster, taker, isReal, damgeValue, exData);
    }

    /**发射子弹 */
    public missile(behavior: SkillBehavior, effectParam: { missileId: string }, caster: ICaster, takers: ITarget[] | ITarget) {
        let P4311_s201Parm: { missile: string[], same: number } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P4311_s201);
        if (P4311_s201Parm?.missile) {
            return
        }
        super.missile(behavior, effectParam, caster, takers);
    }

    protected hurtHandler(behavior: SkillBehavior, taker: BattleUnit, damageVo: DamageVo): void {
        if (damageVo.caster instanceof BulletUnit) {
            let exData: { type: number } = damageVo.caster.exData;
            if (exData) {
                let P4311_p101Parm: { flag: string[] } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P4311_p101);
                if (P4311_p101Parm?.flag) {
                    if (taker.isActive) {
                        //添加印记
                        let buffId = P4311_p101Parm.flag[exData.type];
                        let passSkillData = behavior.skill.owner.attr.getSkillByBeLongType("4311_p101") as PassivitySkillData;
                        let p = passSkillData.actionSkill()
                        taker.battleLogic.buffMgr.buffControlByGroup(buffId, behavior.owner, taker, p[0])
                    }
                }
            }
        }
        super.hurtHandler(behavior, taker, damageVo)
    }

    /***buff执行某行为后 */
    public buffAfterExData(buff: SkillBuff, data: { elementRecursionBoom: boolean }): void {
        if (data?.elementRecursionBoom) {
            let P4311_x101Parm: { buff: string, num: number } = this.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P4311_x101);
            if (P4311_x101Parm?.buff) {
                let randomUnits = SkillUtils.skillTarget(SkillTargetType.Random, TargetFaction.OurSide, this.skill.owner, this.skill.owner, 1000, P4311_x101Parm.num, { attackRange: "RANGED" })
                if (randomUnits?.length) {
                    for (let i = 0; i < randomUnits.length; i++) {
                        randomUnits[i].battleLogic.buffMgr.buffControlByGroup(P4311_x101Parm.buff, this.skill.owner, randomUnits[i], buff.skillBehavior)
                    }
                }
            }
        }
    }
}

export class XingJuePassivitySkill1 extends FightSkillInfo {
    /***buff执行某行为后 */
    public buffAfterExData(buff: SkillBuff, data: { elementRecursionBoom: boolean }): void {
        if (data?.elementRecursionBoom) {
            let P4311_x101Parm: { buff: string, num: number } = this.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P4311_x101);
            if (P4311_x101Parm?.buff) {
                let randomUnits = SkillUtils.skillTarget(SkillTargetType.Random, TargetFaction.OurSide, this.skill.owner, this.skill.owner, 1000, P4311_x101Parm.num, { attackRange: "RANGED" })
                if (randomUnits?.length) {
                    for (let i = 0; i < randomUnits.length; i++) {
                        randomUnits[i].battleLogic.buffMgr.buffControlByGroup(P4311_x101Parm.buff, this.skill.owner, randomUnits[i], buff.skillBehavior)
                    }
                }
            }
        }
    }
}

export class XingJueSkill3 extends XingJueSkill1 {
    private interval: number = 0;
    private fightTimeCheck: FightTimeCheck
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        let param: { interval: number } = behavior.cfg.param;
        if (param?.interval) {
            this.interval = param.interval
            if (owner instanceof BattleUnit) {
                this.checkNextTime(behavior, owner)
                // this.fightTimeCheck = this.skill.battleLogic.createTimeCheck(param.interval / owner.atkTimeScale, Handler.create(this, this.checkNextTime, [behavior, owner]))
            }

        }
        else {
            super.beginBehaviorEffect(behavior, owner)
        }
    }

    protected onGetMissile(behavior: SkillBehavior): string[] {
        let P4311_s201Parm: { missile: string[] } = behavior.cfg.param
        return P4311_s201Parm.missile;
    }

    private checkNextTime(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner)
        if (this.selectUnits?.length) {
            if (owner instanceof BattleUnit) {
                this.fightTimeCheck = this.skill.battleLogic.createTimeCheck(this.interval / owner.atkTimeScale, Handler.create(this, this.checkNextTime, [behavior, owner]))
            }
        }
        else {
            if (owner instanceof BattleUnit) {
                owner.stopAction()
            }
        }
    }

    /***技能动作播放完毕 */
    public skillCompleteHandler(): void {
        if (this.fightTimeCheck) {
            this.fightTimeCheck.destoryTimeCheck();
            this.fightTimeCheck = null;
        }
    }

    /***buff执行某行为后 */
    public buffAfterExData(buff: SkillBuff, data: { elementRecursionBoom: boolean }): void {
        super.buffAfterExData(buff, data)
        if (data?.elementRecursionBoom) {
            let P4311_s305Parm: { time: number } = this.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P4311_s305);
            if (P4311_s305Parm?.time) {
                let addFrame = BattleUtils.getFrameByTime(P4311_s305Parm.time)
                this.skill.owner.addAttackEndTime(addFrame)
                this.skill.owner.showUnit()?.addLoopSkillTime(addFrame)
            }
        }
    }
}
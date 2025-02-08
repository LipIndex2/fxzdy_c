import { Handler } from "../../../../../core/utils/Handler";
import { FightTimeCheck } from "../../FightTimeCheck";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";
import { PassivitySkillFlag } from "../SkillEnum";

export class MeiDuShaMonsterSkill2 extends FightSkillInfo {
    private hitIndex: number = 0;
    private fightTimeCheck: FightTimeCheck;
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        let param: { interval: number } = behavior.cfg.param;
        if (param?.interval) {
            this.hitIndex = 0;
        }
        super.beginBehaviorEffect(behavior, owner)
    }

    /***执行行为 */
    protected actionBehavior(behavior: SkillBehavior, caster: ICaster, takers: BattleUnit[]): void {
        let param: { interval: number } = behavior.cfg.param;
        if (param && param.interval) {
            this.fightTimeCheck = this.skill.battleLogic.createTimeCheck(param.interval, Handler.create(this, this.onActionBehaviorDelay, [behavior, caster, takers], false), behavior.cfg.num - 1, true)
        }
        else {
            super.actionBehavior(behavior, caster, takers)
            let P4240_p104Parm: { rate: number, buff: string[] } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P4240_p104)
            let P4240_x101Parm: { buff: string[] } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P4240_x101)
            if (P4240_p104Parm?.buff && takers) {
                for (let i = 0; i < takers.length; i++) {
                    if (caster.battleLogic.randomMgr.isRandTrue(P4240_p104Parm.rate)) {
                        for (let j = 0; j < P4240_p104Parm.buff.length; j++) {
                            caster.battleLogic.buffMgr.buffControlByGroup(P4240_p104Parm.buff[j], caster, takers[i], behavior)
                        }

                        if (P4240_x101Parm?.buff) {
                            for (let j = 0; j < P4240_x101Parm.buff.length; j++) {
                                caster.battleLogic.buffMgr.buffControlByGroup(P4240_x101Parm.buff[j], caster, takers[i], behavior)
                            }
                        }
                    }
                }
            }
        }
    }

    private onActionBehaviorDelay(behavior: SkillBehavior, caster: ICaster, takers: BattleUnit[]): void {
        if (!takers[this.hitIndex]) {
            //寻找1次新的目标
            takers = this.onBehaviorSelectTargets(behavior, caster);
            this.hitIndex = 0;
            //如果还是没有目标，就直接结束
            if (!takers[this.hitIndex]) {
                return
            }
        }
        super.actionBehavior(behavior, caster, [takers[this.hitIndex]])
        this.hitIndex++
    }

    /***技能动作播放完毕 */
    public skillCompleteHandler(): void {
        if (this.fightTimeCheck) {
            this.fightTimeCheck.destoryTimeCheck();
            this.fightTimeCheck = null;
        }
    }
}

export class MeiDuShaMonsterSkill3 extends FightSkillInfo {
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner)
        let param: { rate: number, buff: string[] } = behavior.cfg.param;
        if (param?.buff && this.selectUnits) {
            for (let i = 0; i < this.selectUnits.length; i++) {
                let P4240_p101Parm: { rate: number } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P4240_p101)
                let P4240_x101Parm: { buff: string[] } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P4240_x101)
                let rate = param.rate
                if (P4240_p101Parm?.rate) {
                    rate = P4240_p101Parm?.rate
                }
                if (owner.battleLogic.randomMgr.isRandTrue(rate)) {
                    for (let j = 0; j < param.buff.length; j++) {
                        owner.battleLogic.buffMgr.buffControlByGroup(param.buff[j], owner, this.selectUnits[i], behavior)
                    }

                    if (P4240_x101Parm?.buff) {
                        for (let j = 0; j < P4240_x101Parm.buff.length; j++) {
                            owner.battleLogic.buffMgr.buffControlByGroup(P4240_x101Parm.buff[j], owner, this.selectUnits[i], behavior)
                        }
                    }
                }
            }
        }
    }
}
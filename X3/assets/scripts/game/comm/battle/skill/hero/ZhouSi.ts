import { Handler } from "../../../../../core/utils/Handler";
import { DamageVo } from "../../DamageVo";
import { FightTimeCheck } from "../../FightTimeCheck";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";
import { AbnormalType, PassivitySkillFlag } from "../SkillEnum";

export class ZhouSiSkill3 extends FightSkillInfo {
    /***技能开始 */
    public beginSkillHandler(): void {
        let P3320_x101Parm = this.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P3320_x101)
        if (P3320_x101Parm) {
            this.skill.owner.setAbnormalStatus(AbnormalType.Invincible)
            this.skill.owner.setAbnormalStatus(AbnormalType.ImmuneControl)
        }
    }

    private fightTimeCheck: FightTimeCheck;
    /***宙斯3技能对目标的伤害需要有随机延迟 */
    protected hurtHandler(behavior: SkillBehavior, taker: BattleUnit, damageVo: DamageVo): void {
        let param: { randomDelay: number, buff: string, rate: number } = behavior.cfg.param;
        let delay = this.skill.owner.battleLogic.randomMgr.randomInt(0, param.randomDelay)
        if (param && param.buff) {
            if (taker.battleLogic.randomMgr.isRandTrue(param.rate || 10000)) {
                this.skill.owner.battleLogic.buffMgr.buffControlByGroup(param.buff, behavior.owner, taker, behavior)
            }
        }
        this.fightTimeCheck = this.skill.battleLogic.createTimeCheck(delay, Handler.create(this, this.delayHurtHandler, [behavior, taker, damageVo]))
    }

    //命中的添加雷霆BUFF
    private delayHurtHandler(behavior: SkillBehavior, taker: BattleUnit, damageVo: DamageVo): void {
        super.hurtHandler(behavior, taker, damageVo)
        let param: { interval: number, num: number } = behavior.cfg.param;
        if (param?.interval && param?.num) {
            this.fightTimeCheck = this.skill.battleLogic.createTimeCheck(param.interval, Handler.create(this, super.hurtHandler, [behavior, taker, damageVo], false), param.num - 1)
        }
    }

    protected fightFormulaHandler(behavior: SkillBehavior, caster: ICaster, taker: BattleUnit, isReal: boolean = false, damgeValue: number = 0): void {
        let num = this.selectUnits?.length || 0;
        let P3320_x101Parm: { num: number, amount: number } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P3320_x101)
        if (P3320_x101Parm?.amount && num <= P3320_x101Parm.num) {
            behavior.tempAddDamageValue = (P3320_x101Parm.num - num + 1) / P3320_x101Parm.num * P3320_x101Parm?.amount;
        }
        super.fightFormulaHandler(behavior, caster, taker, isReal, damgeValue)
    }

    /***技能动作播放完毕 */
    public skillCompleteHandler(): void {
        if (this.fightTimeCheck) {
            this.fightTimeCheck.destoryTimeCheck()
        }

        let P3320_x101Parm = this.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P3320_x101)
        if (P3320_x101Parm) {
            this.skill.owner.clearAbnormalStatus(AbnormalType.Invincible)
            this.skill.owner.clearAbnormalStatus(AbnormalType.ImmuneControl)
        }
    }
}
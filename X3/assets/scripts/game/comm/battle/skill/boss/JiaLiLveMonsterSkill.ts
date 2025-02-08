import { Handler } from "../../../../../core/utils/Handler";
import { MathUtils } from "../../../../../core/utils/MathUtils";
import { Attribute } from "../../../../modules/attr/AttrEnum";
import { DamageVo } from "../../DamageVo";
import { FightTimeCheck } from "../../FightTimeCheck";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";

export class JiaLiLveMonsterSkill2 extends FightSkillInfo {
    private fightTimeCheck: FightTimeCheck
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        let param: { doubleRate: number, cireRate: number, doubleDelay: number } = behavior.cfg.param;
        if (param && param.cireRate) {
            //暴击概率加成
            behavior.pushTempAttr(Attribute.CRI_RATE, param.cireRate)
        }
        super.beginBehaviorEffect(behavior, owner);
        if (param && param.doubleRate) {
            //触发额外1次的概率
            let b = owner.battleLogic.randomMgr.isRandTrue(param.doubleRate)
            if (b) {
                this.fightTimeCheck = this.skill.battleLogic.createTimeCheck(param.doubleDelay, Handler.create(this, this.onDoubleBehaviorEffect, [behavior, owner]))
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

export class JiaLiLveMonsterSkill3 extends FightSkillInfo {

    /***公式计算的处理 */
    protected fightFormulaHandler(behavior: SkillBehavior, caster: ICaster, taker: BattleUnit): void {
        //amount:5000;
        let param: { amount: number } = behavior.cfg.param;
        if (param && param.amount) {
            let dis = MathUtils.distance(behavior.skillTarget.pos, taker.pos);
            let radius = +behavior.cfg.rangeParam.radius;
            let disPer = 1 - dis / radius;
            let value = Math.floor(Math.min(param.amount * disPer, +param.amount))
            behavior.tempAddDamageValue += value;
        }
        super.fightFormulaHandler(behavior, caster, taker)
    }

    /***伽利略3技能对目标的伤害需要有随机延迟 */
    protected hurtHandler(behavior: SkillBehavior, taker: BattleUnit, damageVo: DamageVo): void {
        let param: { randomDelay: number, effectDelay: number } = behavior.cfg.param;
        let delay = this.skill.owner.battleLogic.randomMgr.randomInt(0, param.randomDelay);
        this.skill.battleLogic.createTimeCheck(delay, Handler.create(this, this.delayShowHurt, [behavior, taker, damageVo]))
    }

    protected delayShowHurt(behavior: SkillBehavior, taker: BattleUnit, damageVo: DamageVo): void {
        behavior.showSkillEffect(taker)

        let param: { randomDelay: number, effectDelay: number } = behavior.cfg.param;
        this.skill.battleLogic.createTimeCheck(param.effectDelay, Handler.create(this, (taker: BattleUnit, damageVo: DamageVo) => {
            if (taker.attr.isAlive()) {
                damageVo.caster.battleLogic.hurt(damageVo)
            }
        }, [taker, damageVo]))
    }
}
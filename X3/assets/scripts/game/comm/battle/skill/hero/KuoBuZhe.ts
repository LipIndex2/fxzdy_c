import { BattleUnit } from "../../unit/battle/BattleUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";
import { SkillTargetType, TargetFaction } from "../SkillEnum";
import { SkillUtils } from "../SkillUtils";

export class KuoBuZheSkill3 extends FightSkillInfo {
    /****额外增加的伤害 */
    private amount: number = 0;

    /***技能开始 */
    public beginSkillHandler(): void {
        this.amount = 0;
    }

    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner);
        let param: { buff: string; num: number, amount: number } = behavior.cfg.param;
        if (param && this.selectUnits.length > 0) {
            owner.battleLogic.buffMgr.buffControlByGroup(param.buff, owner, this.selectUnits[0], behavior)
            if (param.num > 1) {
                let targets = SkillUtils.skillTarget(SkillTargetType.Random, TargetFaction.EnemySide, owner, behavior.skillTarget as BattleUnit, 350, param.num)
                for (let i = 0; i < targets.length; i++) {
                    if (targets[i] != this.selectUnits[0]) {
                        owner.battleLogic.buffMgr.buffControlByGroup(param.buff, owner, targets[i], behavior)
                    }
                }
            }
        }
    }

    /***执行行为 */
    protected actionBehavior(behavior: SkillBehavior, caster: ICaster, takers: BattleUnit[]): void {
        let param: { amount: number } = behavior.cfg.param;
        if (param?.amount && this.selectUnits?.length == 1) {
            this.amount = param?.amount
        }
        super.actionBehavior(behavior, caster, takers)
    }

    /***公式计算的处理 */
    protected fightFormulaHandler(behavior: SkillBehavior, caster: ICaster, taker: BattleUnit, isReal: boolean = false, damgeValue: number = 0): void {
        if (this.amount) {
            behavior.tempAddDamageValue += this.amount;
        }
        super.fightFormulaHandler(behavior, caster, taker)
    }
}

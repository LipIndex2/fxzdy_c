import { PoolManager } from "../../../../../core/pool/PoolManager";
import { MathUtils } from "../../../../../core/utils/MathUtils";
import BattleConstantConfig from "../../config/BattleConstantConfig";
import { DamageVo } from "../../DamageVo";
import { FightFormula } from "../../FightFormula";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { MonsterUnit } from "../../unit/battle/MonsterUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";
import { SkillTargetType, TargetFaction } from "../SkillEnum";
import { SkillUtils } from "../SkillUtils";

export class FaLiKongMoZhaoHuanWuSkill1 extends FightSkillInfo {
    /***目标被选取 */
    protected onBehaviorSelectTargets(behavior: SkillBehavior, owner: ICaster, num: number = -1): BattleUnit[] {
        let param: { dis: number } = behavior.cfg.param;
        if (param?.dis) {
            let summonParentUnit = owner.battleLogic.getBatteUintByUid(owner.caster.summon.byUid)
            let units = super.onBehaviorSelectTargets(behavior, owner, num)
            let maxDis = 0;
            let selectUnit: BattleUnit = null
            for (let i = 0; i < units.length; i++) {
                if (units[i].isActive) {
                    let dis = MathUtils.distance(units[i].pos, summonParentUnit.pos)
                    if (dis > param.dis && dis > maxDis) {
                        maxDis = dis;
                        selectUnit = units[i];
                    }
                }
            }

            if (selectUnit) {
                return [selectUnit];
            }
            else {
                return units;
            }
        }
        else {
            return super.onBehaviorSelectTargets(behavior, owner, num)
        }
    }
}

//引导结束后会返回战场并释放一次毁灭性攻击
export class FaLiKongMoSkill2 extends FightSkillInfo {
    private isEndSkill: boolean = false
    /***技能开始 */
    public beginSkillHandler(): void {
        this.isEndSkill = false;
    }

    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner)
        let param: { kill: number, monster: number, amount: number } = behavior.cfg.param;
        if (param) {
            if (param.kill && !this.isEndSkill) {
                //秒杀
                let targets = SkillUtils.skillTarget(SkillTargetType.Nearset, TargetFaction.EnemySide, owner, behavior.skillTarget as BattleUnit, 99999)
                for (let i = 0; i < targets.length; i++) {
                    let damageVo = PoolManager.getItem(DamageVo)
                    damageVo.status = BattleConstantConfig.Normal;
                    damageVo.skillInfo = this.skill;
                    damageVo.value = targets[i].attr.maxHp * 100;
                    targets[i].hurt(damageVo)
                }
            }
            if (param.monster) {
                //场上怪物剩余数量0则终止
                let has: boolean = false
                let targets = SkillUtils.skillTarget(SkillTargetType.Nearset, TargetFaction.OurSide, owner, behavior.skillTarget as BattleUnit, 99999, 999) as MonsterUnit[]
                for (let i = 0; i < targets.length; i++) {
                    if (!targets[i].isDeath && targets[i].cfg.id == param.monster) {
                        has = true;
                        break
                    }
                }

                if (!has) {
                    this.isEndSkill = true;
                    //击退眼球会使首领提前结束引导使伤害降低
                    (owner as BattleUnit).endChargedAction();

                    let targets = SkillUtils.skillTarget(SkillTargetType.Nearset, TargetFaction.EnemySide, owner, behavior.skillTarget as BattleUnit, 99999)
                    for (let i = 0; i < targets.length; i++) {
                        let damageVo: DamageVo = FightFormula.fight(behavior, owner, targets[i], param.amount);
                        owner.battleLogic.hurt(damageVo)
                    }
                }
            }
        }
    }
}


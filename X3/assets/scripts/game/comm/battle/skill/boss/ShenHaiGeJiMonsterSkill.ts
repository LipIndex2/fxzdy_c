import { PoolManager } from "../../../../../core/pool/PoolManager";
import { Handler } from "../../../../../core/utils/Handler";
import BattleConstantConfig from "../../config/BattleConstantConfig";
import { DamageVo } from "../../DamageVo";
import { FightFormula } from "../../FightFormula";
import { FightTimeLoop } from "../../FightTimeLoop";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";
import { PassivitySkillFlag, SkillTargetType, TargetFaction, SkillEffectPos, EffectLayer } from "../SkillEnum";
import { SkillUtils } from "../SkillUtils";

/***引导施法对全体队友治疗，持续5s引导期间每秒治疗自身攻击力25%的生命值 */
export class ShenHaiGeJiMonsterSkill2 extends FightSkillInfo {
    public timer: FightTimeLoop

    /***技能开始 */
    public beginSkillHandler(): void {
        let P6330_s203Parm = this.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P6330_s203)
        if (P6330_s203Parm) {
            this.skill.owner["canMoveSkill2"] = true;
        }
    }

    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner)

        let param: { amount: number; interval: number, maxTime: number } = behavior.cfg.param;
        if (param) {
            this.timer = this.skill.battleLogic.createTimeCheck(param.interval, Handler.create(this, this.onHealHandler, [behavior, owner], false), Math.floor(param.maxTime / param.interval), true)
        }
    }

    private onHealHandler(behavior: SkillBehavior, owner: ICaster): void {
        let hurt = 0;
        let param: { amount: number; interval: number, maxTime: number } = behavior.cfg.param;
        let P6330_x101Parm: { behavior: string, amount: number } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P6330_x101)
        let targets = SkillUtils.skillTarget(SkillTargetType.Nearset, TargetFaction.OurSide, owner, behavior.skillTarget as BattleUnit, 350, 999)
        if (targets) {
            for (let i = 0; i < targets.length; i++) {
                let takerHp = targets[i].hp;
                let takerMaxHp = targets[i].hpMax;
                let healHp = FightFormula.heal(behavior, owner, targets[i], param.amount / BattleConstantConfig.getRandBase);
                owner.battleLogic.heal(healHp)
                targets[i].createFightEffect(63300008, SkillEffectPos.Player_Move, targets[i], EffectLayer.BgLayer, false, targets[i].dirction)
                let healValue = healHp.value;//最终治疗量
                if (P6330_x101Parm?.amount)
                    hurt += Math.max(healValue - (takerMaxHp - takerHp), 0)
            }
        }

        if (P6330_x101Parm?.behavior) {
            let behavior = SkillBehavior.createBehavior(P6330_x101Parm.behavior);
            let units = SkillUtils.behaviorRangeTargerts(behavior, owner, owner as BattleUnit)
            if (units?.length > 0 && hurt > 0) {
                hurt = hurt / units.length;
                for (let i = 0; i < units.length; i++) {
                    if (units[i].isActive) {
                        let damageVo: DamageVo = FightFormula.fight(behavior, owner, units[i], hurt * P6330_x101Parm.amount, { atk: true, hit: true, real: true });
                        owner.battleLogic.hurt(damageVo)
                    }
                }
            }
        }
    }

    /***技能动作播放完毕 */
    public skillCompleteHandler(): void {
        this.skill.owner["canMoveSkill2"] = false;
        if (this.timer)
            this.timer.destoryTimeCheck()
        this.timer = null;
    }
}

/***为附近所有友方增加15%减伤持续6s，期间每秒一次均摊友军的生命百分比，可以在深海吟唱期间使用此技能 */
export class ShenHaiGeJiMonsterSkill3 extends FightSkillInfo {
    public timer: FightTimeLoop
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner)

        let param: { interval: number, maxTime: number } = behavior.cfg.param;
        if (param) {
            if (this.timer)
                this.timer.destoryTimeCheck()
            this.timer = this.skill.battleLogic.createTimeCheck(param.interval, Handler.create(this, this.onHealHandler, [behavior, owner], false), Math.floor(param.maxTime / param.interval), true)
        }
    }

    private onHealHandler(behavior: SkillBehavior, owner: ICaster): void {
        let targets = SkillUtils.skillTarget(SkillTargetType.Nearset, TargetFaction.OurSide, owner, behavior.skillTarget as BattleUnit, 350, 999)
        if (!targets)
            return;

        if (!(owner as BattleUnit).isActive)
            return

        let teamHp: number = 0;
        let unitNum: number = 0;
        for (let i = 0; i < targets.length; i++) {
            if (targets[i].isActive) {
                teamHp += targets[i].attr.hp / targets[i].attr.maxHp;
                unitNum++;
            }
        }
        let hpNum = teamHp / unitNum;
        for (let i = 0; i < targets.length; i++) {
            if (targets[i].isActive) {

                let newHp = Math.floor(targets[i].attr.maxHp * hpNum);
                if (newHp - targets[i].attr.hp > 0) {
                    //补到平均血量
                    let healHp = FightFormula.heal(behavior, owner, targets[i], newHp - targets[i].attr.hp, false);
                    owner.battleLogic.heal(healHp)
                }
                else if (newHp - targets[i].attr.hp < 0) {
                    //扣到平均血量
                    let damage = PoolManager.getItem(DamageVo)
                    damage.caster = owner;
                    damage.target = targets[i];
                    damage.status = BattleConstantConfig.SpecialHurt;
                    damage.value = targets[i].attr.hp - newHp
                    owner.battleLogic.hurt(damage);
                }
            }
        }
    }

    /***技能动作播放完毕 */
    public skillCompleteHandler(): void {
    }
}


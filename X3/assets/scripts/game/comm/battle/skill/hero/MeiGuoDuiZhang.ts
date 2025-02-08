import { v2 } from "cc";
import { Handler } from "../../../../../core/utils/Handler";
import { MathUtils } from "../../../../../core/utils/MathUtils";
import { CollisionUtils } from "../../../math/CollisionUtils";
import { BattleUtils } from "../../BattleUtils";
import BattleConstantConfig from "../../config/BattleConstantConfig";
import { DamageVo } from "../../DamageVo";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";
import { FightTimeCheck } from "../../FightTimeCheck";
import { Vec2 } from "cc";
import { SkillUtils } from "../SkillUtils";
import { SkillTargetType, TargetFaction } from "../SkillEnum";
import { SortUtils } from "../../../../../core/utils/SortUtils";

export class MeiGuoDuiZhangSkill2 extends FightSkillInfo {
    private activeNum: number = 0;
    private totalHurtmap: { [index: number]: number } = {};
    private totalNummap: { [index: number]: number } = {};

    /**释放主动技能 */
    protected activeSkill(behavior: SkillBehavior, effectParam: { skill: string }, caster: BattleUnit) {
        let param: { num: number } = behavior.cfg.param;
        if (param?.num) {
            this.activeNum++;
            if (this.activeNum >= param.num) {
                super.activeSkill(behavior, effectParam, caster)
                this.activeNum = 0;
            }
        }
        else
            super.activeSkill(behavior, effectParam, caster)
    }

    protected hurtHandler(behavior: SkillBehavior, taker: BattleUnit, damageVo: DamageVo): void {
        let param: { amount: number } = behavior.cfg.param;
        if (param?.amount) {
            let num = this.totalNummap[behavior.skillGroupIndex]
            if (num) {
                damageVo.value = Math.floor(damageVo.value * (1 + param.amount * num / BattleConstantConfig.getRandBase))
            }
        }
        super.hurtHandler(behavior, taker, damageVo)
        if (!this.totalHurtmap[behavior.skillGroupIndex])
            this.totalHurtmap[behavior.skillGroupIndex] = 0;
        this.totalHurtmap[behavior.skillGroupIndex] += damageVo.value;

        if (!this.totalNummap[behavior.skillGroupIndex])
            this.totalNummap[behavior.skillGroupIndex] = 0;
        this.totalNummap[behavior.skillGroupIndex]++;
    }

    /**治疗固定值 */
    protected healValue(behavior: SkillBehavior, effectParam: { amount: number, buff?: string[], healType?: number }, caster: ICaster, takers: BattleUnit[]) {
        let value = this.totalHurtmap[behavior.skillGroupIndex];
        if (value) {
            super.healValue(behavior, { amount: Math.floor(value * effectParam.amount / BattleConstantConfig.getRandBase) }, caster, takers)
        }
    }
}

export class MeiGuoDuiZhangSkill3 extends FightSkillInfo {
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        let param: { isFlash: number, repelRange: number } = behavior.cfg.param;
        if (param?.isFlash) {
            if (!owner.caster.isAttacking && owner.caster.selectMainTarget && owner.caster.selectMainTarget.teamId != owner.teamId) {
                let dis = MathUtils.distance(owner.caster.selectMainTarget.pos, this.skill.owner.pos)
                if (dis > param.repelRange) {
                    super.beginBehaviorEffect(behavior, owner);
                }
            }
        }
        else {
            super.beginBehaviorEffect(behavior, owner);
        }
    }
}

export class MeiGuoDuiZhangSkill31 extends FightSkillInfo {
    private moveTimeCheck: FightTimeCheck;

    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        let param: { speed: number, behavior: string, repel: number; repelRange: number } = behavior.cfg.param;
        if (param?.speed) {
            super.beginBehaviorEffect(behavior, owner);
            if (behavior.selectUnits?.length) {
                let target = behavior.selectUnits[0]
                let moveDistance = param.speed / 1000 * BattleUtils.frameDeltaMs;
                let vec = CollisionUtils.calVecTemp(owner.pos, target.pos, moveDistance);
                this.moveTimeCheck = this.skill.battleLogic.createTimeCheck(16, new Handler(this, this.onMoveHandler, [v2(vec.x, vec.y), target, behavior]), -1, true)
            }
        }
        else {
            super.beginBehaviorEffect(behavior, owner);
        }
    }

    private onMoveHandler(moveVec: Vec2, target: BattleUnit, behavior: SkillBehavior): void {
        if (target?.isActive) {
            let dis = MathUtils.distance(target.pos, this.skill.owner.pos)
            if (dis <= target.attr.size) {
                let param: { speed: number, behavior: string } = behavior.cfg.param;
                if (param?.behavior) {
                    if (this.moveTimeCheck)
                        this.moveTimeCheck.isReadyToRemove = true;
                }
            }
            else
                this.skill.owner.forceMove(moveVec)
        }
        else {
            if (this.moveTimeCheck)
                this.moveTimeCheck.isReadyToRemove = true;
        }
    }

    /***技能动作播放完毕 */
    public skillCompleteHandler(): void {
        if (this.moveTimeCheck)
            this.moveTimeCheck.isReadyToRemove = true;
    }
}

export class MeiGuoDuiZhangXSkill1 extends FightSkillInfo {
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner);
        let param: { buff: string } = behavior.cfg.param;
        if (param?.buff) {
            let units = owner.battleLogic.getUnitsByTeamId(owner.teamId);
            SortUtils.sortBy2(units, ["formationSort"], [true], false)
            if (units[0] == owner) {
                owner.battleLogic.buffMgr.buffControlByGroup(param.buff, owner, owner as BattleUnit, behavior)
            }
        }
    }
}
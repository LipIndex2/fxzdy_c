import { TableManager } from "../../../../../core/table/TableManager";
import { MathUtils } from "../../../../../core/utils/MathUtils";
import { ServerEnums } from "../../../../../libs/extras/ServerEnums";
import { CollisionUtils } from "../../../math/CollisionUtils";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { HeroUnit } from "../../unit/battle/HeroUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";
import { BuffGroupFlagType } from "../SkillEnum";

export class ZhanZhengZhiYing extends HeroUnit {
    protected updateAI() {
        super.updateAI();
        if (!this._moveVec.isCrtl && this.skillInfo && this.skillInfo.skillIndex == 2 && this.selectMainTarget) {
            let dis = MathUtils.distance(this.pos, this.selectMainTarget.pos)
            if (dis > 50) {
                let vec = CollisionUtils.calVecTemp(this.pos, this.selectMainTarget.pos, this.moveDistance);
                this._moveVec.setMoveVec(vec);
            }
        }
    }

    // /****技能释放的其他条件检查 */
    // protected skillOtherConditionCheckHandler(skill: SkillData): boolean {
    //     if (skill.skillIndex == 2 && this._moveVec.isCrtl) {
    //         let units = UnitSearchUtils.getUnitsByCircle(this, SkillUtils.getTeamIdByFaction(this.teamId, TargetFaction.EnemySide), 9999999999);
    //         if (!units || units.length == 0 || !this.isTargetAhead(200, units)) {
    //             return false
    //         }
    //     }
    //     return true;
    // }

    protected isTargetAhead(lookaheadDistance: number, targets: BattleUnit[]) {
        let directionAngle = MathUtils.angleXY(0, 0, this._moveVec.ctrlVec.x, this._moveVec.ctrlVec.y)
        // 将角度转换为弧度，便于后续计算
        const angleRad = directionAngle * Math.PI / 180;

        // 计算单位前方中心点的新坐标
        const aheadCenterX = this.pos.x + lookaheadDistance * Math.cos(angleRad);
        const aheadCenterY = this.pos.y + lookaheadDistance * Math.sin(angleRad);

        // BattleDebugManager.ins().showRangeCircle2(null, aheadCenterX, aheadCenterY, 100)

        // 检查每个目标是否在前方区域
        for (const target of targets) {
            // 判断目标是否在单位前方的矩形区域内
            if (Math.abs(target.pos.x - aheadCenterX) <= 100 &&
                Math.abs(target.pos.y - aheadCenterY) <= 100) {
                // 简化碰撞检测，实际应用中可能需要更精确的碰撞算法
                return true;
            }
        }

        return false;
    }

    protected attackActionComplete(isForce: boolean): void {
        if (isForce && this.skillInfo && this.skillInfo.skillIndex == 2) {
            return
        }
        super.attackActionComplete(isForce)
    }
}

export class ZhanZhengZhiYingSkill1 extends FightSkillInfo {
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        let param: { behavior: string } = behavior.cfg.param;
        let groups = this.skill.owner.battleLogic.buffMgr.getAllBuffGroupByFlag(BuffGroupFlagType.ZhanZhengZhiYing, this.skill.owner)
        if (param?.behavior && groups?.length > 0) {
            this.onNewBehaviorHandler(param.behavior, behavior, owner, this.skill)
        }
        else
            super.beginBehaviorEffect(behavior, owner)
    }
}

//天界战马效果结束后获得奔腾【奔腾：下一次挥砍或冲锋造成额外伤害，伤害加成依据于本次天界战马期间的移动总距离，至多可提升500%】
export class ZhanZhengZhiYingSkill2 extends FightSkillInfo {
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner)
        let param: { addPassivity: string } = behavior.cfg.param;
        if (param && param.addPassivity && owner instanceof BattleUnit) {
            owner.attr.addOtherPassiveSkill(param.addPassivity)
        }
    }
}

export class ZhanZhengZhiYingSkill3 extends FightSkillInfo {
    private abnormal: number = 0;
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner)
        let param: { abnormal: number } = behavior.cfg.param;
        if (param && param.abnormal && owner instanceof BattleUnit) {
            this.abnormal = param.abnormal;
            owner.setAbnormalStatus(param.abnormal)
        }
    }

    /***技能动作播放完毕 */
    public skillCompleteHandler(): void {
        if (this.abnormal)
            (this.skill.owner as BattleUnit).clearAbnormalStatus(this.abnormal)
    }
}

export class ZhanZhengZhiYingPassivitySkill1 extends FightSkillInfo {
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        if (!behavior.skillTarget)
            return
        let param: { career: string, buff: string } = behavior.cfg.param;
        let targetUnit = owner.battleLogic.getBatteUintByUid(behavior.skillTarget.uid)
        if (!param?.career || targetUnit.career == ServerEnums.Career[param.career]) {
            super.beginBehaviorEffect(behavior, owner)
            if (param.buff) {
                owner.battleLogic.buffMgr.buffControlByGroup(param.buff, targetUnit, owner as BattleUnit, behavior, null, targetUnit)
            }
        }
    }
}

export class ZhanZhengZhiYingXSkill1 extends FightSkillInfo {
    private skillLv: number = 0;
    private maxSkillId: string
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner)
        let param: { lvBuffs: string[] } = behavior.cfg.param;
        if (param?.lvBuffs && owner instanceof BattleUnit && behavior.selectUnits?.length) {
            if (!this.maxSkillId) {
                for (let j = 0; j < owner.attr.passSkills.length; j++) {
                    if (owner.attr.passSkills[j].cfg.group == "5330_p101") {
                        this.maxSkillId = owner.attr.passSkills[j].skillId;
                        let cfg = TableManager.getDataById(table.battle.SkillConfig, this.maxSkillId)
                        if (cfg) {
                            this.skillLv = cfg.level - 1;
                        }
                        break;
                    }
                }
            }
            for (let i = 0; i < behavior.selectUnits.length; i++) {
                owner.battleLogic.buffMgr.buffControlByGroup(param.lvBuffs[this.skillLv], owner, behavior.selectUnits[i], behavior)
            }
        }
    }
}
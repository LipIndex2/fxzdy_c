import { Vec2 } from "cc";
import { TableManager } from "../../../../../core/table/TableManager";
import { Handler } from "../../../../../core/utils/Handler";
import { MathUtils } from "../../../../../core/utils/MathUtils";
import { BattleDebugManager } from "../../BattleDebugManager";
import UnitSearchUtils from "../../collisions/UnitSearchUtils";
import { FightTimeCheck } from "../../FightTimeCheck";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { PointTarget } from "../PointTarget";
import { SkillBehavior } from "../SkillBehavior";
import { PassivitySkillFlag, TargetFaction } from "../SkillEnum";
import { SkillUtils } from "../SkillUtils";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { DamageVo } from "../../DamageVo";

export class YeYingMonsterSkill1 extends FightSkillInfo {
    private fightTimeCheck: FightTimeCheck
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner);

        let P4230_s203Parm: { doubleRate: number[], doubleDelay: number, num: number[] } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P4230_s203)
        if (P4230_s203Parm) {
            if (P4230_s203Parm && P4230_s203Parm.doubleRate) {
                //触发额外1次的概率
                let num = 0;
                for (let i = 0; i < P4230_s203Parm.doubleRate.length; i++) {
                    let b = owner.battleLogic.randomMgr.isRandTrue(+P4230_s203Parm.doubleRate[i])
                    if (b) {
                        num += +P4230_s203Parm.num[i];
                    }
                }
                if (num) {
                    this.fightTimeCheck = this.skill.battleLogic.createTimeCheck(P4230_s203Parm.doubleDelay, Handler.create(this, this.onDoubleBehaviorEffect, [behavior, owner], false), num, false)
                }
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

export class YeYingMonsterSkill2 extends FightSkillInfo {
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner)
        let param: { missileId: string } = behavior.cfg.param;
        if (param && param.missileId) {
            for (let i = 0; i < this.selectUnits.length; i++) {
                if (this.selectUnits[i].isActive)
                    this.missile(behavior, param, owner, this.selectUnits[i])
            }
        }
    }
}

export class YeYingMonsterPassivitySkill1 extends YeYingMonsterSkill2 {
}

export class YeYingMonsterSkill3 extends FightSkillInfo {
    private fightTimeCheck: FightTimeCheck
    private fightTimeCheck2: FightTimeCheck;//实际伤害的计时器
    private hurtInterval: number = 0;
    private hurtRadius: number = 0;
    private hurtAngle: number = 0;
    private nextFightTimeCheck: FightTimeCheck

    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        let param: { angle: number, missileId: string, randomDelay: number, hurtInterval: number } = behavior.cfg.param;
        if (param && param.missileId) {
            //interval 第2组的间隔
            // this.nextFightTimeCheck = BattleManager.ins().createTimeCheck(param.interval, Handler.create(this, this.onMissileGroupHandler, [behavior, owner], false), 1, true)
            this.onMissileGroupHandler(behavior, owner)
            let P4230_p101Parm: { hurtInterval: number } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P4230_p101)
            if (P4230_p101Parm) {
                this.hurtInterval = P4230_p101Parm.hurtInterval;
            }
            else this.hurtInterval = param.hurtInterval;
            this.hurtRadius = TableManager.getDataById(table.battle.MissileConfig, param.missileId).distance;
            this.hurtAngle = param.angle
            this.fightTimeCheck2 = this.skill.battleLogic.createTimeCheck(param.hurtInterval, Handler.create(this, this.checkNextTime, [behavior, owner,]))
        }
    }

    private checkNextTime(behavior: SkillBehavior, owner: ICaster): void {
        let atkPoint = (owner as BattleUnit).getAtkPoint(false) as Vec2
        let atkAngle = MathUtils.angle(atkPoint, behavior.skillTarget.pos);

        BattleDebugManager.ins().showRangeArc2(null, atkPoint.x, atkPoint.y, atkAngle, this.hurtRadius, this.hurtAngle)
        let units = UnitSearchUtils.getUnitsByArcParam(owner.battleLogic.unitCollisionsManager, atkPoint, SkillUtils.getTeamIdByFaction(owner.teamId, TargetFaction.EnemySide), atkAngle, { radius: this.hurtRadius, angle: this.hurtAngle });
        this.actionBehavior(behavior, owner, units)
        this.fightTimeCheck2 = this.skill.battleLogic.createTimeCheck(this.hurtInterval, Handler.create(this, this.checkNextTime, [behavior, owner]))
    }

    /***持续伤害有错落 */
    protected hurtHandler(behavior: SkillBehavior, taker: BattleUnit, damageVo: DamageVo): void {
        let delay = this.skill.owner.battleLogic.randomMgr.randomInt(0, 30)
        this.skill.battleLogic.createTimeCheck(delay, Handler.create(this, super.hurtHandler, [behavior, taker, damageVo]))
    }

    private onMissileGroupHandler(behavior: SkillBehavior, owner: ICaster): void {
        //将angel角度分成angelNum，在time时间射num次 ，向前方发射
        let param: { time: number, num: number, angelNum: number } = behavior.cfg.param;
        if (param && param.num) {
            let addNum = 0;
            let P4230_p101Parm: { num: number, angelNum: number } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P4230_p101)
            if (P4230_p101Parm) {
                addNum = P4230_p101Parm.num || 0
            }
            this.fightTimeCheck = this.skill.battleLogic.createTimeCheck(param.time / (param.num + addNum), Handler.create(this, this.onMissileHandler, [behavior, owner], false), param.num - 1 + addNum, true)
        }
    }

    /***远程非指向型范围攻击；有子弹直线弹道；引导释放向目标扇形范围发射大量子弹，每颗子弹造成120%伤害 */
    private onMissileHandler(behavior: SkillBehavior, owner: ICaster): void {
        let param: { angle: number, angelNum: number, missileId: string, fy: number, fx: number } = behavior.cfg.param;

        let addNum = 0;
        let P4230_p101Parm: { num: number, angelNum: number } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P4230_p101)
        if (P4230_p101Parm) {
            addNum = P4230_p101Parm.angelNum || 0
        }
        var bulletNum = param.angelNum + addNum;
        var oneAngel: number = param.angle * 2 / bulletNum || 0;

        let fy = +param.fy || 0;
        let fx = +param.fx || 0;

        let atkPoint = (owner as BattleUnit).getAtkPoint(false) as Vec2

        var maxAngle = bulletNum > 1 ? oneAngel * (bulletNum - 1) : 0;
        var beginAngle = 0;
        if (maxAngle > 0) {
            if (atkPoint.x > behavior.skillTarget.pos.x)
                beginAngle = -param.angle;
            else
                beginAngle = -param.angle + 30;
        }


        for (var i = 0; i < bulletNum; i++) {
            var angle = beginAngle + i * oneAngel;
            var endPoint = MathUtils.getPointByDisAndAngle(atkPoint.x + fx, atkPoint.y + fy, behavior.skillTarget.pos.x, behavior.skillTarget.pos.y,
                2000, angle);
            let pointTarget = new PointTarget(owner.battleLogic)
            pointTarget.teamId = SkillUtils.getTeamIdByFaction(owner.teamId, TargetFaction.EnemySide);
            pointTarget.setPoint(endPoint.x, endPoint.y);
            this.missile(behavior, param, owner, [pointTarget])
        }
    }

    /***技能动作播放完毕 */
    public skillCompleteHandler(): void {
        if (this.fightTimeCheck) {
            this.fightTimeCheck.destoryTimeCheck();
            this.fightTimeCheck = null;
        }

        if (this.fightTimeCheck2) {
            this.fightTimeCheck2.destoryTimeCheck();
            this.fightTimeCheck2 = null;
        }

        // if (this.nextFightTimeCheck) {
        //     this.nextFightTimeCheck.destoryTimeCheck();
        //     this.nextFightTimeCheck = null;
        // }
    }
}
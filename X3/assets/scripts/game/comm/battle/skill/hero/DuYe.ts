import { Vec2 } from "cc";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { HeroUnit } from "../../unit/battle/HeroUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { PassivitySkillData } from "../PassivitySkillData";
import { SkillBehavior } from "../SkillBehavior";
import { SkillData } from "../SkillData";
import { BuffGroupFlagType, PassivitySkillFlag, TargetFaction } from "../SkillEnum";
import { SkillUtils } from "../SkillUtils";
import { HeroShowUnit } from "../../show/HeroShowUnit";
import { ActorState } from "../../enum/BattleEnum";
import { DamageVo } from "../../DamageVo";
import BattleConstantConfig from "../../config/BattleConstantConfig";
import { PoolManager } from "../../../../../core/pool/PoolManager";
import { BattleUtils } from "../../BattleUtils";
import { v2 } from "cc";

export class DuYeShow extends HeroShowUnit {
    public isPossess: boolean = false;//是否支配状态
    protected setStateHandler(actionName: string, loop: boolean, timeScaler?: number): void {
        if (this.isPossess) {
            if (this._state == ActorState.Attack) {
                actionName += "1";
                this.setAlpha(1)
            }
            else {
                this.setAlpha(0)
            }
        }
        super.setStateHandler(actionName, loop, timeScaler);
    }

    public setPossess(v: boolean): void {
        this.isPossess = v;
        this.setOtherVisible(!v)
        if (v)
            this.setAlpha(0)
        else
            this.setAlpha(1)
    }
}

export class DuYe extends HeroUnit {
    public isPossess: boolean = false;//是否支配状态
    public possessSkillData: PassivitySkillData
    public possessTarget: BattleUnit;
    public possessAmount: number
    public possessRevive: number
    private skill2Index: number = 0;
    protected getActiveSkill(): SkillData {
        let skill = super.getActiveSkill();
        if (skill && skill.skillIndex == 2 && this.attr.exActiveSkills && this.attr.exActiveSkills[skill.skillId].length) {
            let num = this.attr.exActiveSkills[skill.skillId].length;
            let index = 0;
            let P1340_s305Parm = this.attr.getPassiveSkillFlag(PassivitySkillFlag.P1340_s305)
            if (P1340_s305Parm) {
                index = this.skill2Index;
                this.skill2Index++;
                if (this.skill2Index == 3) {
                    this.skill2Index = 0;
                }
            }
            else
                index = this.battleLogic.randomMgr.randomInt(0, num)
            if (index) {
                skill = this.attr.exActiveSkills[skill.skillId][index - 1]
            }
        }

        return skill;
    }

    /***当前状态是否能移动攻击 */
    public canMoveAttack(): boolean {
        if (this.skillInfo?.cfg.belongType == "1340_p1") {
            return true;
        }
        return super.canMoveAttack();
    }

    /****判断能否发动技能 */
    protected checkCanActivateSkills(): boolean {
        if (this.skillInfoCtrl?.cfg.belongType == "1340_p1") {
            return true;
        }
        return super.checkCanActivateSkills();
    }

    /****技能释放的其他条件检查 */
    protected skillOtherConditionCheckHandler(skill: SkillData): boolean {
        let b = super.skillOtherConditionCheckHandler(skill)
        if (!b)
            return false;

        if (skill && skill.skillIndex != 2 && this.isPossess)
            return false;
        return true;
    }

    public enterFight(teamEnter: boolean = true): boolean {
        if (this.isBeginToFight)
            return false
        this.skill2Index = 0;
        return super.enterFight(teamEnter)
    }

    /***脱离战斗 */
    public exitFight(): void {
        super.exitFight()
        if (this.isPossess) {
            //触发过的话，脱战要重新计算过复活的CD
            this.showUnit()?.setPossess(false);
            this.detach()
        }
    }

    /***获取当前绑定的对应显示单位，不一定有值 */
    public showUnit(): DuYeShow {
        return super.showUnit() as DuYeShow;
    }

    /**是否能移动 */
    protected canMove(): boolean {
        return !this.isPossess && super.canMove();
    }

    /***是否可以选中 */
    public canSelect(): boolean {
        return !this.isPossess && super.canSelect()
    }

    public setMoveTarget(targetPoint: Vec2, force: boolean = false): number {
        if (this.isPossess)
            return 0;
        return super.setMoveTarget(targetPoint, force)
    }

    /**更新位置 */
    public updatePos(): void {
        if (this.isPossess && this.possessTarget) {
            this.setPosXYForce(this.possessTarget.pos.x, this.possessTarget.pos.y)
        }
        return super.updatePos()
    }

    /**更新AI */
    protected updateAI() {
        super.updateAI()
        if (this.isPossess && this.possessTarget) {
            if (!this.possessTarget.isActive) {
                let x = this.possessTarget.pos.x + this.battleLogic.randomMgr.randomInt(-100, 100);
                let y = this.possessTarget.pos.y + this.battleLogic.randomMgr.randomInt(-100, 100);
                let lifeStealHp = Math.floor(this.hpMax * this.possessRevive / BattleConstantConfig.getRandBase)
                let lifeStealHpDamageVo = PoolManager.getItem(DamageVo)
                lifeStealHpDamageVo.skillInfo = this.possessSkillData;
                lifeStealHpDamageVo.caster = this;
                lifeStealHpDamageVo.target = this;
                lifeStealHpDamageVo.status = BattleConstantConfig.Heal;
                lifeStealHpDamageVo.value = lifeStealHp
                this.battleLogic.heal(lifeStealHpDamageVo);

                let pos = BattleUtils.setPosNotBlockPos(this.battleLogic.fightType, v2(x, y))
                this.setPosXYForce(pos.x, pos.y)
                // this.setPosXYForce(x, y)
                this.detach();
                this.showUnit()?.setPossess(false);
            }
            else {
                this.selectHatredTarget = this.possessTarget.selectHatredTarget
                this.selectMainTarget = this.possessTarget.selectMainTarget
            }
        }
    }

    public setPossess(target: BattleUnit): void {
        this.skill2Index = 0;
        this.isPossess = true;
        this.showUnit()?.setPossess(true);
        this.possessTarget = target;
        this.stopAction()
        this.setPosXYForce(this.possessTarget.pos.x, this.possessTarget.pos.y)
    }

    /**
     * 脱离
     */
    public detach(): void {
        if (this.isPossess) {
            let groups = this.battleLogic.buffMgr.getAllBuffGroupByFlag(BuffGroupFlagType.DuYe, this)
            for (let i = 0; i < groups.length; i++) {
                groups[i].removeAll()
            }

            let P1340_p104Parm: { buff: string } = this.attr.getPassiveSkillFlag(PassivitySkillFlag.P1340_p104)
            if (P1340_p104Parm?.buff) {
                this.possessTarget.attr.removeBuffById(P1340_p104Parm.buff)
            }

            let P1340_x101Parm: { buffId: string } = this.attr.getPassiveSkillFlag(PassivitySkillFlag.P1340_x101)
            if (P1340_x101Parm?.buffId) {
                this.attr.removeBuffById(P1340_x101Parm.buffId)
            }

            this.possessSkillData.cd = this.possessSkillData.cdMax;
            this.isPossess = false;
            this.possessTarget = null;
            this.possessSkillData = null;
        }
    }

    /***目标收到伤害后回调被攻击者 */
    public onTargetHurt(damageVo?: DamageVo): void {
        if (damageVo && this.isPossess && this.possessTarget && this.possessAmount && damageVo.skillInfo?.skillIndex == 2) {
            //附身2技能造成伤害时
            let lifeStealHp = Math.floor(damageVo.value * this.possessAmount / BattleConstantConfig.getRandBase)
            let lifeStealHpDamageVo = PoolManager.getItem(DamageVo)
            lifeStealHpDamageVo.skillInfo = damageVo.skillInfo
            lifeStealHpDamageVo.caster = damageVo.originalCaster;
            lifeStealHpDamageVo.target = this.possessTarget;
            lifeStealHpDamageVo.status = BattleConstantConfig.Heal;
            lifeStealHpDamageVo.value = lifeStealHp
            this.battleLogic.heal(lifeStealHpDamageVo);
        }
    }

    /***攻击完成 */
    protected attackActionComplete(isForce: boolean): void {
        let skillInfo = this.skillInfo;
        if (skillInfo && skillInfo.cfg.belongType == "1340_p1") {
            if (!isForce)
                super.attackActionComplete(isForce);
        }
        else
            super.attackActionComplete(isForce)
    }
}

export class DuYePassivitySkill1 extends FightSkillInfo {
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner)
        let param: { targetType: number, die: number, amount: number, revive: number, buff: string } = behavior.cfg.param;
        if (param) {
            if (owner instanceof DuYe) {
                if (param.die == 1 && param.targetType) {
                    let targetUnits = SkillUtils.skillTarget(param.targetType, TargetFaction.OurSide, owner, owner, 9999999, 1, { notSelf: 1, notSummon: 1, notPet: 1, notHeros: [1340] });
                    if (!targetUnits || !targetUnits.length) {
                        //找不到1个目标，死亡
                        return
                    }

                    //被动刚触发，将CD设置到无限大
                    behavior.skill.cd = 9999999999999;
                    owner.possessSkillData = behavior.skill as PassivitySkillData;
                    owner.attr.removeAllBuffs()
                    let P1340_x101Parm: { buffId: string } = owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P1340_x101)
                    if (P1340_x101Parm?.buffId) {
                        owner.battleLogic.buffMgr.buffControlByGroup(P1340_x101Parm.buffId, owner, owner, behavior, null, owner)
                    }

                    owner.battleLogic.buffMgr.buffControlByGroup(param.buff, owner, owner, behavior);
                }
                else if (param.targetType) {
                    //隐身
                    let targetUnits = SkillUtils.skillTarget(param.targetType, TargetFaction.OurSide, owner, owner, 9999999, 1, { notSelf: 1, notSummon: 1, notPet: 1, notHeros: [1340] });
                    if (targetUnits?.length) {
                        //存在则复活
                        owner.possessAmount = param.amount;
                        owner.setPossess(targetUnits[0]);
                        if (param.revive)
                            owner.possessRevive = param.revive


                        let P1340_p104Parm: { buff: string } = owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P1340_p104)
                        if (P1340_p104Parm?.buff) {
                            owner.battleLogic.buffMgr.buffControlByGroup(P1340_p104Parm.buff, owner, targetUnits[0], behavior, null, owner)
                        }
                    }
                    else {
                        //不存在就死亡
                        let groups = owner.battleLogic.buffMgr.getAllBuffGroupByFlag(BuffGroupFlagType.DuYe, owner)
                        for (let i = 0; i < groups.length; i++) {
                            groups[i].removeAll()
                        }
                        return
                    }
                }
            }
        }
    }
}
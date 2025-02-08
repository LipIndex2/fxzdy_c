import RandomUtils from "../../../../../core/utils/RandomUtils";
import { BattleUtils } from "../../BattleUtils";
import { DamageVo } from "../../DamageVo";
import { ActorState, MonsterType, UnitType } from "../../enum/BattleEnum";
import { HeroShowUnit } from "../../show/HeroShowUnit";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { HeroUnit } from "../../unit/battle/HeroUnit";
import { MonsterUnit } from "../../unit/battle/MonsterUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";
import { SkillBuff } from "../SkillBuff";
import { SkillData } from "../SkillData";
import { AbnormalType, BuffGroupFlagType, PassivitySkillFlag } from "../SkillEnum";

export class WeiLaShow extends HeroShowUnit {
    /***大招形态 */
    private _isSkill3: boolean = false;
    private toUpdateAction: boolean = false
    public get isSkill3(): boolean {
        return this._isSkill3;
    }
    public set isSkill3(value: boolean) {
        if (this._isSkill3 != value) {
            this.toUpdateAction = true;
        }
        this._isSkill3 = value;
    }

    protected setStateHandler(actionName: string, loop: boolean, timeScaler?: number): void {
        if (this.isSkill3 && this._state != ActorState.Die && this._state != ActorState.Vertigo) {
            //大招形态，维持大招的动作
            actionName = "skill02"
        }
        else {
            if (this._state == ActorState.Attack && this.unitData.skillInfo.skillIndex == 0) {
                if (RandomUtils.randomBoolean()) {
                    actionName += 2;
                }
            }
        }

        super.setStateHandler(actionName, loop, timeScaler)
        this.toUpdateAction = false;
    }

    /***动作播放完毕 */
    protected nodeActionComplete(aniName: string): void {
        super.nodeActionComplete(aniName)
        if (this._state == ActorState.Running) {
            if (this.toUpdateAction) {
                this.setStateHandler("move", true, this._spineNode.runTimeScale)
            }
        }
        else if (this._state == ActorState.Idle) {
            if (this.toUpdateAction) {
                this.setStateHandler("idle", true, this._spineNode.runTimeScale)
            }
        }
    }

    public updateBuff(buff: SkillBuff): void {
        super.updateBuff(buff)
        if (buff.skillBuffGroup.cfg.flag == BuffGroupFlagType.WeiLa) {
            this.isSkill3 = true;
        }
    }

    public removeBuff(buff: SkillBuff): void {
        super.removeBuff(buff)
        if (buff.skillBuffGroup.cfg.flag == BuffGroupFlagType.WeiLa) {
            this.isSkill3 = false;
        }
    }
}

export class WeiLa extends HeroUnit {
    /***大招形态 */
    private _isSkill3: boolean = false;
    /****技能释放的其他条件检查 */
    protected skillOtherConditionCheckHandler(skill: SkillData): boolean {
        let b = super.skillOtherConditionCheckHandler(skill)
        if (!b)
            return false;

        let groups = this.battleLogic.buffMgr.getAllBuffGroupByFlag(BuffGroupFlagType.WeiLa, this)
        let P4310_s203Parm = this.attr.getPassiveSkillFlag(PassivitySkillFlag.P4310_s203)
        if (this._isSkill3 && groups && skill.skillIndex == 0) {
            return false
        }
        else if (this._isSkill3 && groups && skill.skillIndex == 1 && !P4310_s203Parm) {
            return false
        }
        return true;
    }

    /**设置异常状态 */
    public setAbnormalStatus(type: AbnormalType, param?: any) {
        super.setAbnormalStatus(type, param)
        if (!this.attr.canAttack()) {
            let groups = this.battleLogic.buffMgr.getAllBuffGroupByFlag(BuffGroupFlagType.WeiLa, this);
            if (groups) {
                for (let i = 0; i < groups.length; i++) {
                    groups[i].removeAll()
                }
            }
        }
    }

    public updateBuff(buff: SkillBuff): void {
        super.updateBuff(buff)
        if (buff.skillBuffGroup.cfg.flag == BuffGroupFlagType.WeiLa) {
            this._isSkill3 = true;
        }
    }

    public removeBuff(buff: SkillBuff): void {
        super.removeBuff(buff)
        if (buff.skillBuffGroup.cfg.flag == BuffGroupFlagType.WeiLa) {
            this._isSkill3 = false;
        }
    }

    /**处理其他事情 */
    protected doOther() {
        if (!this._isSkill3)
            super.doOther()
    }
}

export class WeiLaPassivitySkill1 extends FightSkillInfo {
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner)
        let param: { buff: string } = behavior.cfg.param;
        if (param?.buff) {
            let buffGroups = owner.battleLogic.buffMgr.getBuffGroupByGroup(param.buff, owner.casterUid)
            for (let i = 0; i < buffGroups.length; i++) {
                buffGroups[i].removeAll()
            }
        }
    }
}

export class WeiLaSkill3 extends FightSkillInfo {
    private bossTime: number = 0;
    private heroTime: number = 0;
    private monsterTime: number = 0;
    private buff: string
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner)
        let param: { buff: string } = behavior.cfg.param;
        if (param?.buff)
            this.buff = param?.buff;
        let P4310_x101_param: { boss: number, hero: number, monster: number } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P4310_x101)
        if (P4310_x101_param) {
            this.bossTime = P4310_x101_param.boss;
            this.heroTime = P4310_x101_param.hero;
            this.monsterTime = P4310_x101_param.monster;
        }
    }

    /***buff执行前 */
    public buffBeforce(buff: SkillBuff): void {
        if (buff.skillBuffGroup.cfg.flag == BuffGroupFlagType.WeiLa) {
            buff.battleLogic.buffMgr.buffControlByGroup(this.buff, this.skill.owner, this.skill.owner, buff.skillBehavior)
        }
    }

    /***buff执行伤害后 */
    public buffHurtAfter(damageVo: DamageVo): void {
        if (damageVo && damageVo.target?.isDeath) {
            let taker = damageVo.target
            let groups = taker.battleLogic.buffMgr.getAllBuffGroupByFlag(BuffGroupFlagType.WeiLa, damageVo.caster as BattleUnit);
            if (groups) {
                for (let i = 0; i < groups.length; i++) {
                    let addTime = 0;
                    if (taker.type == UnitType.Boss) {
                        addTime = this.bossTime
                    }
                    else if (taker.type == UnitType.Hero) {
                        addTime = this.heroTime
                    }
                    else if (taker.type == UnitType.Monster) {
                        if ((taker as MonsterUnit).cfg.monsterType == MonsterType.Elite) {
                            addTime = this.bossTime
                        }
                        else
                            addTime = this.monsterTime
                    }
                    groups[i].addBuffTime(BattleUtils.getFrameByTime(addTime))
                }
            }
        }
    }
}
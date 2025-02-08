import { PoolManager } from "../../../../../core/pool/PoolManager";
import { TableManager } from "../../../../../core/table/TableManager";
import { SortUtils } from "../../../../../core/utils/SortUtils";
import BattleConstantConfig from "../../config/BattleConstantConfig";
import { DamageVo } from "../../DamageVo";
import { ActorState, UnitType } from "../../enum/BattleEnum";
import { HeroShowUnit } from "../../show/HeroShowUnit";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { HeroUnit } from "../../unit/battle/HeroUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";
import { SkillBuff } from "../SkillBuff";
import { BuffGroupFlagType, PassivitySkillFlag, SkillTargetType, TargetFaction } from "../SkillEnum";
import { SkillUtils } from "../SkillUtils";

export class HuangXiongShow extends HeroShowUnit {
    /***是否变身形态 */
    private _isHuangXiongChange: boolean = false;
    private toUpdateAction: boolean = false
    public get isHuangXiongChange(): boolean {
        return this._isHuangXiongChange;
    }
    public set isHuangXiongChange(value: boolean) {
        if (this._isHuangXiongChange != value) {
            this.toUpdateAction = true;
        }
        this._isHuangXiongChange = value;
    }

    protected setStateHandler(actionName: string, loop: boolean, timeScaler?: number): void {
        if (this.isHuangXiongChange && (!this.unitData.skillInfo || this.unitData.skillInfo.skillIndex == 0)) {
            actionName += "2";
        }
        super.setStateHandler(actionName, loop, timeScaler)
        this.toUpdateAction = false;
    }

    protected getActionEffectData(): table.battle.SkillEffectConfig {
        if (this.isHuangXiongChange && this.unitData.skillInfo.skillIndex == 0) {
            let P1230_x101Parm: { behavior: string } = this.unitData.attr.getPassiveSkillFlag(PassivitySkillFlag.P1230_x101)
            if (P1230_x101Parm?.behavior) {
                return TableManager.getDataById(table.battle.SkillEffectConfig, "1230_x1")
            }
        }
        return this.unitData.skillInfo.getActionEffectData()
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
        if (buff.skillBuffGroup.cfg.flag == BuffGroupFlagType.HuangXiong) {
            this.isHuangXiongChange = true;
        }
    }

    public removeBuff(buff: SkillBuff): void {
        super.removeBuff(buff)
        if (buff.skillBuffGroup.cfg.flag == BuffGroupFlagType.HuangXiong) {
            this.isHuangXiongChange = false;
        }
    }
}

export class HuangXiong extends HeroUnit {
    /***坦克伙伴 */
    public tankFriend: HeroUnit;
    public tankFriendSkillId: string

    /***脱离战斗 */
    public exitFight(): void {
        super.exitFight()
        if (this.tankFriend && this.tankFriendSkillId)
            this.tankFriend.attr.removePassiveSkill(this.tankFriendSkillId)
        this.tankFriend = null;
        this.tankFriendSkillId = null;
    }
}

export class HuangXiongSkill1 extends FightSkillInfo {
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        let param: { hpAmount: number } = behavior.cfg.param;
        if (param?.hpAmount && owner instanceof BattleUnit) {
            super.beginBehaviorEffect(behavior, owner);
            if (behavior.selectUnits?.length) {
                let damageVo = PoolManager.getItem(DamageVo)
                damageVo.skillInfo = behavior.skill;
                damageVo.caster = owner;
                damageVo.target = owner;
                damageVo.value = Math.ceil(owner.hpMax * behavior.selectUnits.length * param.hpAmount / BattleConstantConfig.getRandBase);
                damageVo.status = BattleConstantConfig.Heal;
                owner.battleLogic.heal(damageVo);
            }
        }
        else {
            let P1230_x101Parm: { behavior: string } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P1230_x101)
            if (P1230_x101Parm?.behavior) {
                this.onNewBehaviorHandler(P1230_x101Parm.behavior, behavior, owner, behavior.skill, behavior.skillTarget);
            }
            else {
                super.beginBehaviorEffect(behavior, owner);
            }
        }
    }
}

export class HuangXiongSkill2 extends FightSkillInfo {
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner);
        let param: { buff: string } = behavior.cfg.param;
        if (param?.buff && owner instanceof HuangXiong && owner.tankFriend?.isActive) {
            owner.battleLogic.buffMgr.buffControlByGroup(param.buff, owner, owner.tankFriend, behavior, null, owner);
        }
    }
}

export class HuangXiongPassivitySkill1 extends FightSkillInfo {
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner);
        let param: { addSkill: string, buff: string, buff2: string } = behavior.cfg.param;
        if (param?.addSkill) {
            let units = SkillUtils.skillTarget(SkillTargetType.Nearset, TargetFaction.OurSide, owner, owner as BattleUnit, 2000, 0)
            let heros: HeroUnit[] = []
            for (let i = 0; i < units.length; i++) {
                if (units[i].type == UnitType.Hero && units[i].uid != owner.casterUid && units[i].isActive) {
                    heros.push(units[i] as HeroUnit)
                }
            }
            if (heros.length > 0) {
                let target: HeroUnit = SortUtils.sortBy2(heros, ["seatSort"], [true], false)[0];
                (owner as HuangXiong).tankFriendSkillId = param.addSkill;
                (owner as HuangXiong).tankFriend = target;
                target.attr.addOtherPassiveSkillByFightSkill(param.addSkill, this);
                if (param.buff2) {
                    owner.battleLogic.buffMgr.buffControlByGroup(param.buff2, this.skill.owner, target, behavior)
                }
            }
        }
        if (param?.buff) {
            owner.battleLogic.buffMgr.buffControlByGroup(param.buff, this.skill.owner, owner as BattleUnit, behavior)
        }
    }
}
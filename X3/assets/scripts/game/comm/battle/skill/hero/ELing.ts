import { v2 } from "cc";
import { Handler } from "../../../../../core/utils/Handler";
import { MathUtils } from "../../../../../core/utils/MathUtils";
import { FightTimeCheck } from "../../FightTimeCheck";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";
import { Vec2 } from "cc";
import { AbnormalType, BuffGroupFlagType, PassivitySkillFlag } from "../SkillEnum";
import { SkillBuff } from "../SkillBuff";
import { ActorState } from "../../enum/BattleEnum";
import { AttrEnum } from "../../attribute/AttrEnum";
import { HeroShowUnit } from "../../show/HeroShowUnit";
import { TableManager } from "../../../../../core/table/TableManager";
import { ActorUnitNode } from "../../node/ActorUnitNode";

export class ELingShow extends HeroShowUnit {
    /***是否变身形态 */
    private _isELingChange: boolean = false;
    private toUpdateAction: boolean = false
    public get isELingChange(): boolean {
        return this._isELingChange;
    }
    public set isELingChange(value: boolean) {
        if (this._isELingChange != value) {
            this.toUpdateAction = true;
        }
        this._isELingChange = value;
    }

    protected setStateHandler(actionName: string, loop: boolean, timeScaler?: number): void {
        if (this.unitData.skillInfo && this.unitData.skillInfo.skillIndex == 2) {
            let P2230_p101Parm: { buffs: string[] } = this.unitData.attr.getPassiveSkillFlag(PassivitySkillFlag.P2230_p101)
            if (P2230_p101Parm && P2230_p101Parm.buffs) {
                actionName += "2";
            }
        }
        else if (this.isELingChange) {
            actionName += "2";
        }
        super.setStateHandler(actionName, loop, timeScaler)
        this.toUpdateAction = false;
    }

    protected getActionEffectData(): table.battle.SkillEffectConfig {
        let P2230_p101Parm: { buffs: string[] } = this.unitData.attr.getPassiveSkillFlag(PassivitySkillFlag.P2230_p101)
        if (this.isELingChange || (this.unitData.skillInfo.skillIndex == 2 && P2230_p101Parm?.buffs)) {
            return TableManager.getDataById(table.battle.SkillEffectConfig, this.unitData.skillInfo.cfg.anim + "0")
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
    }

    public updateBuff(buff: SkillBuff): void {
        super.updateBuff(buff)
        if (buff.skillBuffGroup.cfg.flag == BuffGroupFlagType.ELing) {
            this.isELingChange = true;
        }
    }

    public removeBuff(buff: SkillBuff): void {
        super.removeBuff(buff)
        if (buff.skillBuffGroup.cfg.flag == BuffGroupFlagType.ELing) {
            this.isELingChange = false;
            if (!this.node?.isLoaded) return;
            if (this.node instanceof ActorUnitNode) {
                let trackTime = this.node.spine.getState().getCurrent(0).trackTime
                this.setState(this._state, this._animKey)
                this.node.spine.getState().getCurrent(0).trackTime = 0;
                this.node.spine.getState().getCurrent(0).animationStart = trackTime;
            }
        }
    }
}

export class ELingSkill2 extends FightSkillInfo {
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        let param: { buffs: string[] } = behavior.cfg.param;
        if (param && param.buffs) {
            for (let i = 0; i < param.buffs.length; i++) {
                owner.battleLogic.buffMgr.buffControlByGroup(param.buffs[i], owner, owner as BattleUnit, behavior)
            }
        }
        super.beginBehaviorEffect(behavior, owner)
    }
}

export class ELingSkill3 extends FightSkillInfo {
    private fightTimeCheck: FightTimeCheck
    private beginPos: Vec2
    private firstEndIndex: number = 6;//第1阶段是否结束
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner)
        let param: { dis: number, time: number } = behavior.cfg.param;
        if (param && owner instanceof BattleUnit) {
            let speed = param.dis / (param.time / 16);
            let radians = MathUtils.getRadians(owner.pos.x, owner.pos.y, behavior.skillTarget.pos.x, behavior.skillTarget.pos.y);
            let moveVec = v2(speed * Math.cos(radians), speed * Math.sin(radians))
            this.beginPos = v2(owner.pos.x, owner.pos.y);
            this.fightTimeCheck = this.skill.battleLogic.createTimeCheck(16, new Handler(this, this.firstHurtHandler, [behavior, owner, moveVec]), this.firstEndIndex)
            owner.clearAllAbnormalStatusByType(AbnormalType.lowHatred);
            owner.setAbnormalStatus(AbnormalType.lowHatred)
        }
    }

    private firstHurtHandler(behavior: SkillBehavior, owner: BattleUnit, moveVec: Vec2): void {
        owner.forceMove(moveVec)
        this.firstEndIndex--;
        if (this.firstEndIndex == 0) {
            let P2230_p101Parm: { amount: number, hold: number } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P2230_p101)
            if (P2230_p101Parm && P2230_p101Parm.amount) {
                this.fightTimeCheck = this.skill.battleLogic.createTimeCheck(P2230_p101Parm.hold, new Handler(this, this.holdHandler, [behavior, owner]))
            }
            owner.clearAllAbnormalStatusByType(AbnormalType.lowHatred);
        }
    }

    private holdHandler(behavior: SkillBehavior, owner: BattleUnit): void {
        super.beginBehaviorEffect(behavior, owner)
        let param: { dis: number, time: number } = behavior.cfg.param;
        if (param && owner instanceof BattleUnit) {
            let speed = param.dis / (param.time / 16);
            let radians = MathUtils.getRadians(owner.pos.x, owner.pos.y, this.beginPos.x, this.beginPos.y);
            let moveVec = v2(speed * Math.cos(radians), speed * Math.sin(radians))
            this.fightTimeCheck = this.skill.battleLogic.createTimeCheck(16, new Handler(this, this.secondHurtHandler, [behavior, owner, moveVec]), 6)
        }
    }

    private secondHurtHandler(behavior: SkillBehavior, owner: BattleUnit, moveVec: Vec2): void {
        owner.forceMove(moveVec)
    }

    /***公式计算的处理 */
    protected fightFormulaHandler(behavior: SkillBehavior, caster: ICaster, taker: BattleUnit, isReal: boolean = false, damgeValue: number = 0): void {
        let P2230_p101Parm: { amount: number, hold: number, buffs: string[] } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P2230_p101)
        let P2230_x101Parm: { cirBuff: string, dodBuff: string } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P2230_x101)
        if (P2230_p101Parm && P2230_p101Parm.amount && this.firstEndIndex == 0) {
            if (P2230_p101Parm.buffs) {
                for (let i = 0; i < P2230_p101Parm.buffs.length; i++)
                    caster.battleLogic.buffMgr.buffControlByGroup(P2230_p101Parm.buffs[i], caster, caster as BattleUnit, behavior)

                if (P2230_x101Parm) {
                    //拥有专武
                    if (P2230_x101Parm.cirBuff) {
                        let dodRate = Math.ceil((caster as BattleUnit).getAttrValue(AttrEnum.DOD_RATE))
                        for (let j = 0; j < dodRate; j++) {//按闪避率增加暴击率
                            caster.battleLogic.buffMgr.buffControlByGroup(P2230_x101Parm.cirBuff[j], caster, caster as BattleUnit, behavior)
                        }
                    }
                    if (P2230_x101Parm.dodBuff) {
                        caster.battleLogic.buffMgr.buffControlByGroup(P2230_x101Parm.dodBuff, caster, caster as BattleUnit, behavior)
                    }
                }
            }
            super.fightFormulaHandler(behavior, caster, taker, isReal, P2230_p101Parm.amount)
        }
        else {
            super.fightFormulaHandler(behavior, caster, taker, isReal, damgeValue)
        }
    }

    /***技能动作播放完毕 */
    public skillCompleteHandler(): void {
        this.firstEndIndex = 6;
        if (this.fightTimeCheck) {
            this.fightTimeCheck.destoryTimeCheck();
            this.fightTimeCheck = null;
        }
    }
}

export class ELingZhaoHuanWuSkill1 extends FightSkillInfo {
    protected addBuff(behavior: SkillBehavior, effectParam: { buffId: string, delay?: number }, caster: ICaster, takers: BattleUnit[]) {
        let summonParentUnit = caster.battleLogic.getBatteUintByUid(caster.caster.summon.byUid)
        if (summonParentUnit?.selectMainTarget) {
            super.addBuff(behavior, effectParam, caster, [summonParentUnit.selectMainTarget as BattleUnit])
        }
    }
}
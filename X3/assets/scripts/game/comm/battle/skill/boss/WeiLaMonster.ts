import RandomUtils from "../../../../../core/utils/RandomUtils";
import { ActorState } from "../../enum/BattleEnum";
import { MonsterShowUnit } from "../../show/MonsterShowUnit";
import { MonsterUnit } from "../../unit/battle/MonsterUnit";
import { SkillBuff } from "../SkillBuff";
import { SkillData } from "../SkillData";
import { BuffGroupFlagType, PassivitySkillFlag, AbnormalType } from "../SkillEnum";

export class WWeiLaMonsterShow extends MonsterShowUnit {
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

export class WeiLaMonster extends MonsterUnit {
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
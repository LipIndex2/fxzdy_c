import { TableManager } from "../../../../../core/table/TableManager";
import { ActorState } from "../../enum/BattleEnum";
import { MonsterShowUnit } from "../../show/MonsterShowUnit";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";
import { SkillBuff } from "../SkillBuff";
import { BuffGroupFlagType, PassivitySkillFlag } from "../SkillEnum";

export class HeYaShowMonster extends MonsterShowUnit {
    /***是否变身形态 */
    private _isHeYaChange: boolean = false;
    private toUpdateAction: boolean = false
    public get isHeYaChange(): boolean {
        return this._isHeYaChange;
    }
    public set isHeYaChange(value: boolean) {
        if (this._isHeYaChange != value) {
            this.toUpdateAction = true;
        }
        this._isHeYaChange = value;
    }

    protected setStateHandler(actionName: string, loop: boolean, timeScaler?: number): void {
        if (this.isHeYaChange) {
            actionName += "2";
        }
        super.setStateHandler(actionName, loop, timeScaler)
        this.toUpdateAction = false;
    }

    protected getActionEffectData(): table.battle.SkillEffectConfig {
        if (this.isHeYaChange) {
            return TableManager.getDataById(table.battle.SkillEffectConfig, this.unitData.skillInfo.cfg.anim + "1")
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
        if (buff.skillBuffGroup.cfg.flag == BuffGroupFlagType.HeYa) {
            this.isHeYaChange = true;
        }
    }

    public removeBuff(buff: SkillBuff): void {
        super.removeBuff(buff)
        if (buff.skillBuffGroup.cfg.flag == BuffGroupFlagType.HeYa) {
            this.isHeYaChange = false;
        }
    }
}

/***
 * 展开猩红领域净化周围区域内所有友方单位，分别获得赫娅10%最大生命值的护盾，次效果只作用于自己时护盾值翻倍
 */
export class HeYaMonsterSkill3 extends FightSkillInfo {
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner)
        if (this.selectUnits) {
            let param: { targetBuff: string, myBuff: string } = behavior.cfg.param;
            if (param && param.targetBuff) {
                for (let i = 0; i < this.selectUnits.length; i++) {
                    if (this.selectUnits.length == 1) {
                        if (this.selectUnits[i] == owner) {
                            //和雅1个的话是双倍
                            owner.battleLogic.buffMgr.buffControlByGroup(param.myBuff, owner, this.selectUnits[i], behavior)
                        }
                    }
                    else {
                        owner.battleLogic.buffMgr.buffControlByGroup(param.targetBuff, owner, this.selectUnits[i], behavior)
                    }
                }

                let P1120_p104Parm: { buff: string } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P1120_p104)
                if (P1120_p104Parm && P1120_p104Parm.buff) {
                    owner.battleLogic.buffMgr.buffControlByGroup(P1120_p104Parm.buff, owner, owner as BattleUnit, behavior)
                }
            }
        }
    }
}
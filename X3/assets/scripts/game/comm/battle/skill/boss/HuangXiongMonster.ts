import { TableManager } from "../../../../../core/table/TableManager";
import { ActorState } from "../../enum/BattleEnum";
import { MonsterShowUnit } from "../../show/MonsterShowUnit";
import { HeroUnit } from "../../unit/battle/HeroUnit";
import { MonsterUnit } from "../../unit/battle/MonsterUnit";
import { SkillBuff } from "../SkillBuff";
import { PassivitySkillFlag, BuffGroupFlagType } from "../SkillEnum";

export class HuangXiongMonsterShow extends MonsterShowUnit {
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

export class HuangXiongMonster extends MonsterUnit {
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
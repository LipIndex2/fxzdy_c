import { DamageVo } from "../../DamageVo";
import { MonsterShowUnit } from "../../show/MonsterShowUnit";
import { MonsterUnit } from "../../unit/battle/MonsterUnit";
import { FightSkillInfo } from "../FightSkillInfo";

export class NuoWaZhaoHuanWuShow extends MonsterShowUnit {
    private isKillMe: boolean = false
    protected onDie(damageVo?: DamageVo) {
        this.isKillMe = false;
        if (!damageVo) {
            this.isKillMe = true;
            this.visible = false;
        }
        super.onDie(damageVo)
    }

    /***死亡动作播放完回调 */
    protected onDieActionComplete(): void {
        if (this.isKillMe) {
            this.visible = false;
        }
        else
            super.onDieActionComplete()
    }
}

export class NuoWaZhaoHuanWu extends MonsterUnit {
    /***选择目标 */
    protected checkSelectTarget(): void {
        if (!this.skillInfo)
            return;

        let unit = this.battleLogic.getBatteUintByUid(this.summon.byUid)
        if (unit?.isActive) {
            let ridiculeTarget = this.battleLogic.buffMgr.getRidiculeTarget(this);//嘲讽目标
            if (ridiculeTarget)
                this.selectHatredTarget = ridiculeTarget;
            else if (unit.selectMainTarget?.teamId != this.teamId) {
                this.selectHatredTarget = this.selectMainTarget = unit.selectMainTarget;
            }
            else
                this.selectHatredTarget = this.selectMainTarget = null;
        }
    }
}
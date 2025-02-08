import { MathUtils } from "../../../../../core/utils/MathUtils";
import { BattleUtils } from "../../BattleUtils";
import { DamageVo } from "../../DamageVo";
import { MonsterShowUnit } from "../../show/MonsterShowUnit";
import { ISummonData } from "../../unit/battle/ISummonData";
import { MonsterUnit } from "../../unit/battle/MonsterUnit";

export class BoSaiDongZhuanHuanWuShow extends MonsterShowUnit {
    private isKillMe: boolean = false
    protected onDie(damageVo?: DamageVo) {
        this.isKillMe = false;
        if (!damageVo) {
            this.isKillMe = true;
            this.visible = false;
            this.onDieActionComplete()
            return
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

    protected setStateHandler(actionName: string, loop: boolean, timeScaler?: number): void {
        if (this.unitData.skillInfo?.skillIndex == 0) {
            actionName = "skill01"
        }
        super.setStateHandler(actionName, loop, timeScaler)
    }
}

export class BoSaiDongZhuanHuanWu extends MonsterUnit {
    private saveTimeFrame: number = -1;
    /****判断能否发动技能 */
    protected checkCanActivateSkills(): boolean {
        if (this.skillInfoCtrl) {
            return true;
        }
        return super.checkCanActivateSkills();
    }

    protected updateSkillCD(): void {
        //更新技能CD
        this._attr.updateSkillCD();
        if (!this.battleLogic.isInBattle()) {
            let skill = this.attr.getSkillByIndex(1, true);
            if (skill && skill.preCD) {
                skill.preCD--;
            }
        }
    }

    /**修正移动位置 */
    onBeforUpdatePos(): void {
        if (this.skillInfo && this.skillInfo.skillIndex == 0) {

        }
        else {
            super.onBeforUpdatePos()
        }
    }

    /***攻击完成 */
    protected attackActionComplete(isForce: boolean): void {
        if (isForce) {
            if (this.skillInfo && this.skillInfo.skillIndex == 0) {
                return
            }
        }
        super.attackActionComplete(isForce)
    }

    public setSummonData(data: ISummonData): void {
        super.setSummonData(data)
        let exData: { saveTime: number } = data.exData
        if (exData?.saveTime) {
            this.saveTimeFrame = BattleUtils.getFrameByTime(exData.saveTime);
        }
    }


    /**更新AI */
    public update(): boolean {
        let b = super.update()
        if (b) {
            if (this.saveTimeFrame > 0) {
                this.saveTimeFrame--
                if (this.saveTimeFrame == 0) {
                    this.toDie()
                }
            }
        }
        return b;
    }
}


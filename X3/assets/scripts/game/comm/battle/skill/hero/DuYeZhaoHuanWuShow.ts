import { DamageVo } from "../../DamageVo";
import { MonsterShowUnit } from "../../show/MonsterShowUnit";

export class DuYeZhaoHuanWuShow extends MonsterShowUnit {
    private isKillMe: boolean = false
    protected onDie(damageVo?: DamageVo) {
        this.isKillMe = false;
        if (damageVo && damageVo.caster?.casterUid == this.uid) {
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
import { DamageVo } from "../../DamageVo";
import { MonsterShowUnit } from "../../show/MonsterShowUnit";

export class WuTouQiShiZhaoHuanWuShow extends MonsterShowUnit {
    private isKillMe: boolean = false
    protected onDie(damageVo?: DamageVo) {
        this.isKillMe = false;
        if (!damageVo) {
            this.isKillMe = true;
            this.visible = false;
        }
        super.onDie(damageVo)
    }

    public fadeIn(v: number): void {
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
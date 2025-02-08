import { DamageVo } from "../DamageVo";
import { FightFormula } from "../FightFormula";
import { SkillBuff } from "../skill/SkillBuff";
import { BossUnit } from "../unit/battle/BossUnit";
/***
 * 一定层数后爆炸的BUFF
 * num 非BOSS外需要的层数
 * bossNum boss需要的层数q
 * amount 伤害系数
 */
export class BoomLayerBuff extends SkillBuff {

    /***是否爆炸后 */
    private isBoom: boolean = false;
    protected buffHandler(): void {
        let effectParam: { amount: number, num: number, bossNum: number } = this.effectParm1;
        if (effectParam) {
            if (this.target instanceof BossUnit && this.layer >= effectParam.bossNum) {
                this.boomHandler(effectParam.amount);
            }
            else if (this.layer >= effectParam.num) {
                this.boomHandler(effectParam.amount);
            }
        }
    }

    protected boomHandler(amount: number): void {
        let damageVo: DamageVo = FightFormula.fight(this.skillBehavior, this.caster, this.target, amount)
        damageVo.buffInfo = this;
        this.caster.battleLogic.hurt(damageVo)
        this.isBoom = true;
        let effectParam: { buff: string } = this.effectParm1;
        if (effectParam && effectParam.buff) {
            //添加BUFF
            this.battleLogic.buffMgr.buffControlByGroup(effectParam.buff, this.caster, this.target, this.skillBehavior)
        }
        this.active()
    }

    active() {
        if (this.isBoom)
            super.active()
        else {
            //首次添加随机增加层数
            if (!this.isAlive())
                return
            let effectParam: { random: number[] } = this.effectParm1;
            this.layer += this.caster.battleLogic.randomMgr.randomInt(+effectParam.random[0] - 1, +effectParam.random[1] - 1)
            this.buffHandler();
        }
    }

    dispose() {
        this.isBoom = false;
        super.dispose()
    }
}
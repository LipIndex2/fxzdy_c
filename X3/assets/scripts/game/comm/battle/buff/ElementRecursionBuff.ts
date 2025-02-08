import ArrayUtils from "../../../../core/utils/ArrayUtils";
import { Handler } from "../../../../core/utils/Handler";
import BattleConstantConfig from "../config/BattleConstantConfig";
import { FightFormula } from "../FightFormula";
import { FightTimeCheck } from "../FightTimeCheck";
import { SkillBuff } from "../skill/SkillBuff";
import { BuffType } from "../skill/SkillEnum";
import { SkillUtils } from "../skill/SkillUtils";

export class ElementRecursionBuff extends SkillBuff {
    private boomTimer: FightTimeCheck
    /**提取需要克隆的字段 */
    public getCloneData(): any {
        return this.skillBuffGroup.cfg.id;
    }

    /**设置需要克隆的字段 */
    public setCloneData(skillBuffGroupId: string): void {
        //添加了相同的组别就传递给其他
        let effectParam: { amount: number, type: string, value: number, dieTransfer: number, num: number, sameTransfer: number, sameTransferAmount: number } = this.effectParm1;
        if (effectParam.sameTransfer) {
            //获取附近可传递的对象
            let randomUnits = SkillUtils.skillTarget(this.cfg.targetType, this.cfg.targetFaction, this.target, this.target, this.cfg.range, this.cfg.num)
            let b = false
            a: while (randomUnits?.length) {
                let newUnit = randomUnits.shift();
                if (!newUnit.isActive || newUnit.uid == this.target.uid) {
                    continue
                }
                //传递相同BUFF，失败的话，目标爆炸
                let newTargetBuffs = this.battleLogic.buffMgr.getBuffListByEffect(newUnit, BuffType.ElementRecursion)
                if (newTargetBuffs) {
                    for (let i = 0; i < newTargetBuffs.length; i++) {
                        let targetBuffParam: { type: string, value: number } = newTargetBuffs[i].effectParm1;
                        if (targetBuffParam?.type == "xingjue" && targetBuffParam.value == effectParam.value) {
                            //存在重复的
                            break a;
                        }
                    }
                }

                //无重复的添加
                b = true;
                this.battleLogic.buffMgr.buffControlByGroup(skillBuffGroupId, this.caster, newUnit, this.skillBehavior)
                break
            }

            if (!b) {
                //爆炸
                let damage = FightFormula.fight(this.skillBehavior, this.caster, this.target, effectParam.sameTransferAmount);
                damage.status = BattleConstantConfig.ForceSkill
                this.target.battleLogic.hurt(damage)
            }
        }
    }

    protected buffHandler(): void {
        if (this.isReadyToRemove)
            return
        if (this.boomTimer)
            this.boomTimer.isReadyToRemove = true;
        this.boomTimer = this.battleLogic.createTimeCheck(200, new Handler(this, this.boom, null, false))
    }

    protected boom(): void {
        let effectParam: { buff: string, type: string, value: number, dieTransfer: number, num: number, sameTransfer: number } = this.effectParm1;
        if (effectParam) {
            let numArr: number[] = [];
            let buffs = this.battleLogic.buffMgr.getBuffListByEffect(this.target, BuffType.ElementRecursion)
            for (let i = 0; i < buffs.length; i++) {
                if (!buffs[i].isReadyToRemove) {
                    let buffParam: { type: string, value: number } = buffs[i].effectParm1;
                    if (buffParam?.type == "xingjue") {
                        ArrayUtils.iPush(numArr, buffParam.value);
                    }
                }
            }
            if (numArr.length == effectParam.num) {
                //爆炸后移除
                // let damage = FightFormula.fight(this.skillBehavior, this.caster, this.target, effectParam.amount);
                // damage.status = BattleConstantConfig.ForceSkill
                // this.target.battleLogic.hurt(damage)
                // damage.skillInfo?.fightSkillInfo?.buffAfterExData(this, { elementRecursionBoom: true })
                this.battleLogic.buffMgr.buffControlByGroup(effectParam.buff, this.caster, this.target, this.skillBehavior)
                this.skillBehavior.skill?.fightSkillInfo?.buffAfterExData(this, { elementRecursionBoom: true })
                if (this.target.isDeath && effectParam.dieTransfer) {
                    //死亡传递则不处理，因为有死亡传递时，已经传递了1次
                    return
                }

                let newBuffIds: string[] = []
                buffs = this.battleLogic.randomMgr.randomAry(buffs)
                for (let i = 0; i < buffs.length; i++) {
                    if (!buffs[i].isReadyToRemove) {
                        let buffParam: { type: string, value: number } = buffs[i].effectParm1;
                        if (buffParam?.type == "xingjue") {
                            buffs[i].isReadyToRemove = true;
                            newBuffIds.push(buffs[i].skillBuffGroup.cfg.id)
                        }
                    }
                }

                if (newBuffIds.length > 0) {
                    //获取附近可传递的对象
                    let randomUnits = SkillUtils.skillTarget(this.cfg.targetType, this.cfg.targetFaction, this.target, this.target, this.cfg.range, this.cfg.num)
                    for (let i = 0; i < newBuffIds.length; i++) {
                        while (randomUnits?.length) {
                            let newUnit = randomUnits.shift();
                            if (!newUnit.isActive || newUnit.uid == this.target.uid) {
                                continue
                            }
                            this.battleLogic.buffMgr.buffControlByGroup(newBuffIds[i], this.caster, newUnit, this.skillBehavior)
                            break
                        }
                    }
                }
            }
        }
    }

    public remove(): void {
        super.remove()
        if (this.boomTimer)
            this.boomTimer.isReadyToRemove = true;
    }
}
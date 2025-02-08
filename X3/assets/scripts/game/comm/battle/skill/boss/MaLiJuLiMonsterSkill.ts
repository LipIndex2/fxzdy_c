import BattleConstantConfig from "../../config/BattleConstantConfig";
import { DamageVo } from "../../DamageVo";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";
import { PassivitySkillFlag } from "../SkillEnum";

enum Color {
    Red = 1,
    Blue = 2,
    Green = 4,
    Purple = 8,
}

export class MaLiJuLiMonsterSkill1 extends FightSkillInfo {
    private nextPingZiType: number = 0;
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner)
        let pingZiType = this.skill.owner["pingZiType"];
        let lastPingZiType = this.skill.owner["lastPingZiType"];
        let nowPingZiParm: { lv?: string[], zi?: string[] } = this.skill.owner["nowPingZiParm"];
        let b = false
        let param: { hong: string[], lan: string[], type1: number[], type2: number[] } = behavior.cfg.param;
        let missileParam: { missile: number } = behavior.cfg.param;
        let P3210_s203Parm: { type1: number[], type2: number[], buffs: string[], behavior: string[] } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P3210_s203)
        let P3210_p101Parm: { type1: number[], type2: number[], buffs: string[], behavior: string[] } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P3210_p101)
        let P3210_p104Parm: { type1: number[], type2: number[], buffs: string[], behavior: string[] } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P3210_p104)
        if (this.selectUnits) {
            for (let i = 0; i < this.selectUnits.length; i++) {
                if (this.selectUnits[i].isActive && param) {
                    if (!missileParam.missile && !param.type1) {
                        //发射对应颜色的子弹
                        b = true
                        switch (pingZiType) {
                            case Color.Red:
                                this.missile(behavior, { missileId: param.hong[1] }, this.skill.owner, this.selectUnits[i])
                                break
                            case Color.Blue:
                                this.missile(behavior, { missileId: param.lan[1] }, this.skill.owner, this.selectUnits[i])
                                break
                            case Color.Green:
                                this.missile(behavior, { missileId: nowPingZiParm.lv[1] }, this.skill.owner, this.selectUnits[i])
                                break
                            case Color.Purple:
                                this.missile(behavior, { missileId: nowPingZiParm.zi[1] }, this.skill.owner, this.selectUnits[i])
                                break
                        }
                    }
                    else if (missileParam.missile) {
                        //子弹行为对每个单位执行BUFF处理
                        let isActMagre = false;
                        if (P3210_s203Parm) {
                            //子弹伤害，根据被动合成前后2个瓶子生成新的效果
                            isActMagre = this.checkMagrePingZiHandler(missileParam.missile, lastPingZiType, P3210_s203Parm, this.selectUnits[i], behavior, true)
                        }

                        if (!isActMagre && P3210_p101Parm) {
                            //子弹伤害，根据被动合成前后2个瓶子生成新的效果
                            isActMagre = this.checkMagrePingZiHandler(missileParam.missile, lastPingZiType, P3210_p101Parm, this.selectUnits[i], behavior, true)
                        }

                        if (!isActMagre && P3210_p104Parm) {
                            //子弹伤害，根据被动合成前后2个瓶子生成新的效果
                            isActMagre = this.checkMagrePingZiHandler(missileParam.missile, lastPingZiType, P3210_p104Parm, this.selectUnits[i], behavior, true)
                        }
                    }
                }
            }
        }

        if (missileParam?.missile) {
            //子弹的行为触发了
            let isActMagre = false;
            //子弹行为忽略命中单位执行行为
            if (P3210_s203Parm) {
                //子弹伤害，根据被动合成前后2个瓶子生成新的效果
                isActMagre = this.checkMagrePingZiHandler(missileParam.missile, lastPingZiType, P3210_s203Parm, owner as BattleUnit, behavior, false)
            }

            if (!isActMagre && P3210_p101Parm) {
                //子弹伤害，根据被动合成前后2个瓶子生成新的效果
                isActMagre = this.checkMagrePingZiHandler(missileParam.missile, lastPingZiType, P3210_p101Parm, owner as BattleUnit, behavior, false)
            }

            if (!isActMagre && P3210_p104Parm) {
                //子弹伤害，根据被动合成前后2个瓶子生成新的效果
                isActMagre = this.checkMagrePingZiHandler(missileParam.missile, lastPingZiType, P3210_p104Parm, owner as BattleUnit, behavior, false)
            }

            this.skill.owner["lastPingZiType"] = missileParam.missile;
        }

        if (b && param) {
            let rateArr: number[] = []
            let rateTypes: number[] = []
            //添加概率权重
            if (param.hong) {
                rateArr.push(+param.hong[0])
                rateTypes.push(Color.Red)
            }
            if (param.lan) {
                rateArr.push(+param.lan[0])
                rateTypes.push(Color.Blue)
            }
            let rateIndex = owner.battleLogic.randomMgr.randomProbability(rateArr)
            this.nextPingZiType = rateTypes[rateIndex]
            this.skill.owner["nowPingZiParm"] = null;
        }
    }

    /***检查合成瓶子 */
    private checkMagrePingZiHandler(type1: number, type2: number, parm: { type1: number[], type2: number[], buffs: string[], behavior: string[] }, target: BattleUnit, behavior: SkillBehavior, isBuff: boolean): boolean {
        for (let j = 0; j < parm.type1.length; j++) {
            if ((type1 == +parm.type1[j] && type2 == +parm.type2[j]) || (type2 == +parm.type1[j] && type1 == +parm.type2[j])) {
                if (isBuff) {
                    if (parm.buffs && parm.buffs[j]) {
                        target.battleLogic.buffMgr.buffControlByGroup(parm.buffs[j], this.skill.owner, target, behavior)
                    }
                }
                else {
                    if (parm.behavior && parm.behavior[j]) {
                        SkillBehavior.createBehaviorAndActionEffect(parm.behavior[j], this.skill.owner, target, this.skill)
                    }
                }
                return true
            }
        }
        return false
    }

    /***技能动作播放完毕 */
    public skillCompleteHandler(): void {
        //技能技术随机下1个瓶子的类型
        this.skill.battleLogic.sendEvent("setPingZiType", this.skill.owner.uid, this.nextPingZiType, null)
        // if (this.skill.owner instanceof MaLiJuLi) {
        //     this.skill.owner.setPingZiType(this.nextPingZiType, null)
        // }
    }
}


export class MaLiJuLiMonsterSkill2 extends FightSkillInfo {

    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner)
        let param: { lv: string[] } = behavior.cfg.param;
        let P3210_p104Parm: { type1: number[], type2: number[], buffs: string[], behavior: string[], rate: number, zi: string[] } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P3210_p104)
        // if (this.skill.owner instanceof MaLiJuLi) {
        if (param?.lv) {
            let b = false
            if (P3210_p104Parm?.rate) {
                b = owner.battleLogic.randomMgr.isRandTrue(P3210_p104Parm.rate)
                if (b) {
                    this.skill.battleLogic.sendEvent("setPingZiType", this.skill.owner.uid, Color.Purple, P3210_p104Parm)//  this.skill.owner.setPingZiType(Color.Purple, P3210_p104Parm)
                }
            }
            if (!b)
                this.skill.battleLogic.sendEvent("setPingZiType", this.skill.owner.uid, Color.Green, param)//   this.skill.owner.setPingZiType(Color.Green, param)
        }
        // }
    }
}

export class MaLiJuLiMonsterSkill3 extends FightSkillInfo {
    private amount: number = 0;
    /***技能开始 */
    public beginSkillHandler(): void {
        this.amount = 0;
        let P3210_x101Parm = this.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P3210_x101)
        if (P3210_x101Parm) {
            this.skill.owner["canMoveSkill3"] = true;
        }
    }

    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner)
        let param: { amount: number, rate: number; behavior: string[] } = behavior.cfg.param;
        if (param?.amount) {
            if (this.selectUnits) {
                for (let i = 0; i < this.selectUnits.length; i++) {
                    if (this.selectUnits[i].isActive) {
                        let b = owner.battleLogic.randomMgr.isRandTrue(param.rate)
                        if (b) {
                            let behavirorIndex = owner.battleLogic.randomMgr.randomInt(0, param.behavior.length - 1)
                            SkillBehavior.createBehaviorAndActionEffect(param.behavior[behavirorIndex], this.skill.owner, this.selectUnits[i], this.skill)
                        }
                    }
                }
            }
        }
    }

    protected hurtHandler(behavior: SkillBehavior, taker: BattleUnit, damageVo: DamageVo): void {
        let param: { amount: number[] } = behavior.cfg.param;
        if (param && param.amount) {
            //子弹伤害
            let value = this.amount >= param.amount.length ? param.amount[param.amount.length - 1] : param.amount[this.amount]
            damageVo.value = Math.ceil(damageVo.value * value / BattleConstantConfig.getRandBase)
            super.hurtHandler(behavior, taker, damageVo)
            this.amount++;
        }
        else
            super.hurtHandler(behavior, taker, damageVo)
    }

    /***技能动作播放完毕 */
    public skillCompleteHandler(): void {
        this.skill.owner["canMoveSkill3"] = false;
    }
}
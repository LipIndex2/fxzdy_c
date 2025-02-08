import { Handler } from "../../../../../core/utils/Handler";
import { BattleCommandType } from "../../BattleCommand";
import BattleConstantConfig from "../../config/BattleConstantConfig";
import { DamageVo } from "../../DamageVo";
import { ActorUnitNode } from "../../node/ActorUnitNode";
import { HeroShowUnit } from "../../show/HeroShowUnit";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { HeroUnit } from "../../unit/battle/HeroUnit";
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

export class MaLiJuLiShow extends HeroShowUnit {
    /***当前瓶子类型，1红，2蓝，4绿，8紫 */
    public pingZiType: number = 1;

    /***初始化监听的战斗指令 */
    protected initCommand(): void {
        super.initCommand();
        this.unitData.battleLogic.command.reg(BattleCommandType.maLiJuLi, this.uid, new Handler(this, this.updatePingZiModel))
    }

    protected onSpineLoaded(): void {
        super.onSpineLoaded();
        this.updatePingZiModel();
    }

    private updatePingZiModel(): void {
        if (!this.pingZiType)
            return

        if (this.node instanceof ActorUnitNode) {
            let slot1 = this.node.findSlot("pingzi_1");
            if (slot1)
                slot1.color.a = 0
            let slot2 = this.node.findSlot("pingzi_2");
            if (slot2)
                slot2.color.a = 0
            let slot3 = this.node.findSlot("pingzi_4");
            if (slot3)
                slot3.color.a = 0
            let slot4 = this.node.findSlot("pingzi_8");
            if (slot4)
                slot4.color.a = 0

            let nowSlot = this.node.findSlot("pingzi_" + this.pingZiType);
            if (nowSlot)
                nowSlot.color.a = 1
        }
    }
}


export class MaLiJuLi extends HeroUnit {
    /***当前瓶子类型，1红，2蓝，4绿，8紫 */
    public pingZiType: number = 1;
    public lastPingZiType: number = 0;
    /***当前瓶子的参数 */
    public nowPingZiParm: { lv?: string[], zi?: string[] };
    public canMoveSkill3: boolean = false
    /**更新AI */
    protected attack() {
        let b = super.attack()
        if (b) {
            let P3210_x101Parm = this.attr.getPassiveSkillFlag(PassivitySkillFlag.P3210_x101)
            if (P3210_x101Parm && this.skillInfo.skillIndex == P3210_x101Parm.skillIndex) {
                this.attr.triggerAllBehavoirs()
                this.skillInfo = null;
                this._attackEndTime = 0
            }
        }
        return b;
    }

    public setPingZiType(nextPingZiType: number, param: { lv?: string[], zi?: string[] }): void {
        if (nextPingZiType) {
            this.pingZiType = nextPingZiType;
            this.nowPingZiParm = param;
            this.battleLogic.command.send(BattleCommandType.maLiJuLi, this.uid)
        }
    }

    /****判断能否发动技能 */
    protected checkCanActivateSkills(): boolean {
        return this.isBeginToFight && !this.battleLogic.isSafe && !this.isAttacking && (!this._moveVec.isCrtl || this.isMoveAttack || this.canMoveSkill3)
    }
}

export class MaLiJuLiSkill1 extends FightSkillInfo {
    private nextPingZiType: number = 0;
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: MaLiJuLi): void {
        if (this.skill.owner instanceof MaLiJuLi) {
            super.beginBehaviorEffect(behavior, owner)
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
                            switch (this.skill.owner.pingZiType) {
                                case Color.Red:
                                    this.missile(behavior, { missileId: param.hong[1] }, this.skill.owner, this.selectUnits[i])
                                    break
                                case Color.Blue:
                                    this.missile(behavior, { missileId: param.lan[1] }, this.skill.owner, this.selectUnits[i])
                                    break
                                case Color.Green:
                                    this.missile(behavior, { missileId: this.skill.owner.nowPingZiParm.lv[1] }, this.skill.owner, this.selectUnits[i])
                                    break
                                case Color.Purple:
                                    this.missile(behavior, { missileId: this.skill.owner.nowPingZiParm.zi[1] }, this.skill.owner, this.selectUnits[i])
                                    break
                            }
                        }
                        else if (missileParam.missile) {
                            //子弹行为对每个单位执行BUFF处理
                            let isActMagre = false;
                            if (P3210_s203Parm) {
                                //子弹伤害，根据被动合成前后2个瓶子生成新的效果
                                isActMagre = this.checkMagrePingZiHandler(missileParam.missile, this.skill.owner.lastPingZiType, P3210_s203Parm, this.selectUnits[i], behavior, true)
                            }

                            if (!isActMagre && P3210_p101Parm) {
                                //子弹伤害，根据被动合成前后2个瓶子生成新的效果
                                isActMagre = this.checkMagrePingZiHandler(missileParam.missile, this.skill.owner.lastPingZiType, P3210_p101Parm, this.selectUnits[i], behavior, true)
                            }

                            if (!isActMagre && P3210_p104Parm) {
                                //子弹伤害，根据被动合成前后2个瓶子生成新的效果
                                isActMagre = this.checkMagrePingZiHandler(missileParam.missile, this.skill.owner.lastPingZiType, P3210_p104Parm, this.selectUnits[i], behavior, true)
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
                    isActMagre = this.checkMagrePingZiHandler(missileParam.missile, this.skill.owner.lastPingZiType, P3210_s203Parm, owner, behavior, false)
                }

                if (!isActMagre && P3210_p101Parm) {
                    //子弹伤害，根据被动合成前后2个瓶子生成新的效果
                    isActMagre = this.checkMagrePingZiHandler(missileParam.missile, this.skill.owner.lastPingZiType, P3210_p101Parm, owner, behavior, false)
                }

                if (!isActMagre && P3210_p104Parm) {
                    //子弹伤害，根据被动合成前后2个瓶子生成新的效果
                    isActMagre = this.checkMagrePingZiHandler(missileParam.missile, this.skill.owner.lastPingZiType, P3210_p104Parm, owner, behavior, false)
                }

                this.skill.owner.lastPingZiType = missileParam.missile;
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
                this.skill.owner.nowPingZiParm = null;
            }
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
        if (this.skill.owner instanceof MaLiJuLi) {
            this.skill.owner.setPingZiType(this.nextPingZiType, null)
        }
    }
}


export class MaLiJuLiSkill2 extends FightSkillInfo {

    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner)
        let param: { lv: string[] } = behavior.cfg.param;
        let P3210_p104Parm: { type1: number[], type2: number[], buffs: string[], behavior: string[], rate: number, zi: string[] } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P3210_p104)
        if (this.skill.owner instanceof MaLiJuLi) {
            if (param?.lv) {
                let b = false
                if (P3210_p104Parm?.rate) {
                    b = owner.battleLogic.randomMgr.isRandTrue(P3210_p104Parm.rate)
                    if (b) {
                        this.skill.owner.setPingZiType(Color.Purple, P3210_p104Parm)
                    }
                }
                if (!b)
                    this.skill.owner.setPingZiType(Color.Green, param)
            }
        }
    }
}

export class MaLiJuLiSkill3 extends FightSkillInfo {
    private amount: number = 0;
    /***技能开始 */
    public beginSkillHandler(): void {
        this.amount = 0;
        let P3210_x101Parm = this.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P3210_x101)
        if (P3210_x101Parm) {
            (this.skill.owner as MaLiJuLi).canMoveSkill3 = true;
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
            // this.amount *= param.amount / BattleConstantConfig.getRandBase;
        }
        else
            super.hurtHandler(behavior, taker, damageVo)
    }

    /***技能动作播放完毕 */
    public skillCompleteHandler(): void {
        (this.skill.owner as MaLiJuLi).canMoveSkill3 = false;
    }
}
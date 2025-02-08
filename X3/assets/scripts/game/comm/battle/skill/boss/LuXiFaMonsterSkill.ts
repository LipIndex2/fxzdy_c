import { Handler } from "../../../../../core/utils/Handler";
import { FightTimeCheck } from "../../FightTimeCheck";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";
import { SkillBuff } from "../SkillBuff";
import { SkillBuffGroup } from "../SkillBuffGroup";
import { PassivitySkillFlag, BuffType } from "../SkillEnum";

/***
 * 路西法的左轮手枪有着已被固定的攻击速度，每超出上限1%攻速会转化为1%攻击力；此外，进入战斗后累积受到最大生命值50%的伤害后进入隐匿状态持续3秒，解除自身所有不利状态并清除当前仇恨并且隐匿不打断自身攻击效果
 *  */
export class LuXiFaMonsterSkill2 extends FightSkillInfo {
}

export class LuXiFaMonsterSkill3 extends FightSkillInfo {
    private fightTimeCheck: FightTimeCheck
    private buffs: SkillBuffGroup[] = []
    protected hurtDelayHandler(behavior: SkillBehavior, effectParam: { amount: number, buff: string[] }, caster: ICaster, takers: BattleUnit[]): void {
        let param: { delay: number, buff: string } = behavior.cfg.param;
        if (param && param.delay) {
            let selectTarget = takers.concat();
            let P4340_x101Parm = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P4340_x101)
            if (P4340_x101Parm && behavior.cfg.num > selectTarget.length) {
                let num = behavior.cfg.num - selectTarget.length;
                while (num > 0) {
                    let index = caster.battleLogic.randomMgr.randomInt(0, takers.length - 1)
                    selectTarget.push(takers[index])
                    num--;
                }
            }

            for (let i = 0; i < selectTarget.length; i++) {
                let buff = caster.battleLogic.buffMgr.buffControlByGroup(param.buff, caster, selectTarget[i], behavior)
                if (buff)
                    this.buffs.push(buff)
            }
            this.fightTimeCheck = this.skill.battleLogic.createTimeCheck(param.delay, Handler.create(this, super.hurtDelayHandler, [behavior, effectParam, caster, selectTarget]))
        }
        else
            super.hurtDelayHandler(behavior, effectParam, caster, takers)
    }

    public buffBeforce(buff: SkillBuff): void {
        super.buffBeforce(buff)
        if (buff.effectType == BuffType.FlagBuff && buff.cfg.effectParam.type == "luxifa") {
            this.skill.battleLogic.sendEvent("showBlackComp", this.skill.owner.uid)
            // if (this.skill.owner instanceof LuXiFaMonster)
            //     this.skill.owner.showUnit()?.showBlackComp()
        }
    }

    /***技能动作播放完毕 */
    public skillCompleteHandler(): void {
        for (let i = 0; i < this.buffs.length; i++) {
            this.buffs[i].removeAll();
        }
        this.buffs.length = 0;

        if (this.fightTimeCheck) {
            this.fightTimeCheck.destoryTimeCheck();
            this.fightTimeCheck = null;
        }

        this.skill.battleLogic.sendEvent("hideBlackComp", this.skill.owner.uid)
        // if (this.skill.owner instanceof LuXiFaMonster)
        //     this.skill.owner.showUnit()?.hideBlackComp()
    }
}

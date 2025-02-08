import BattleConstantConfig from "../../config/BattleConstantConfig";
import { DamageVo } from "../../DamageVo";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { SkillBehavior } from "../SkillBehavior";
import { BuffGroupFlagType, BuffType, PassivitySkillFlag } from "../SkillEnum";

/***武圣形态下使用青龙斩时消耗当前所有战意每层战意使本次伤害提升10%，且本次攻击享受战意的暴击率加成 */
export class GuanYuMonsterSkill2 extends FightSkillInfo {
    protected hurtHandler(behavior: SkillBehavior, taker: BattleUnit, damageVo: DamageVo): void {
        let hasSkill3 = this.skill.owner.battleLogic.buffMgr.getBuffGroupByFlag(BuffGroupFlagType.GuanYu, this.skill.owner);
        if (hasSkill3) {
            //处于武圣形态
            let buffs = this.skill.owner.battleLogic.buffMgr.getBuffListByEffect(this.skill.owner, BuffType.ZhanYi);
            if (buffs) {
                let num = 0;
                for (let i = 0; i < buffs.length; i++) {
                    num += buffs[i].layer;
                }
                //计算战意的层数
                let P2310_p104Parm: { minDis: number, amount: number } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P2310_p104)
                if (P2310_p104Parm) {
                    damageVo.value = Math.ceil(damageVo.value * (1 + P2310_p104Parm.amount * num / BattleConstantConfig.getRandBase));
                }

                //释放后移除所有战意
                let zhanyiBuffGroup = this.skill.owner.battleLogic.buffMgr.getBuffGroupByFlag(BuffGroupFlagType.GuanYuZhanYi, this.skill.owner);
                zhanyiBuffGroup?.removeAll()

                // for (let i = 0; i < buffs.length; i++) {
                //     buffs[i].isReadyToRemove = true;
                // }
            }
        }
        super.hurtHandler(behavior, taker, damageVo)
    }
}
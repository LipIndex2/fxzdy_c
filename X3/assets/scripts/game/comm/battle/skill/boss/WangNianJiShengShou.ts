import { BattleUnit } from "../../unit/battle/BattleUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";
import { SkillBuff } from "../SkillBuff";
import { AbnormalType, BuffType } from "../SkillEnum";

/***若当前角色正在引导施法，则当前正在引导的技能立即被打断，并进入CD，同时CD时间增加10秒 */
export class WangNianJiShengShouSkill2 extends FightSkillInfo {
    private cdBuff: string
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        let param: { buff: string } = behavior.cfg.param;
        if (param?.buff) {
            this.cdBuff = param.buff;
        }
        super.beginBehaviorEffect(behavior, owner)
    }

    /***buff执行后 */
    public buffBeforce(buff: SkillBuff): void {
        super.buffBeforce(buff)
        if (this.cdBuff && buff.effectType == BuffType.Abnormal && buff.effectParm1.type == AbnormalType.Silent) {
            if (buff.target.skillInfo?.skillIndex != 0 && buff.target.isAttacking) {
                //打断增加CD
                buff.battleLogic.buffMgr.buffControlByGroup(this.cdBuff, this.skill.owner, buff.target)
            }
        }
    }
}
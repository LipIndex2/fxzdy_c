import { BattleUnit } from "../../unit/battle/BattleUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";
import { BuffType } from "../SkillEnum";

/***阿努比斯 目标于猝死期间死亡，则为阿努比斯返还5s心脏称重的冷却时间 */
export class ANuBiSiMonsterPassivitySkill1 extends FightSkillInfo {
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner)

        let param: { buff: string } = behavior.cfg.param;
        if (param && param.buff) {
            let buffs = owner.battleLogic.buffMgr.getBuffListByEffect(behavior.skillTarget as BattleUnit, BuffType.SuddenDeath);
            if (buffs && buffs.length > 0) {
                owner.battleLogic.buffMgr.buffControlByGroup(param.buff, owner, owner as BattleUnit, behavior)
            }
        }
    }
}

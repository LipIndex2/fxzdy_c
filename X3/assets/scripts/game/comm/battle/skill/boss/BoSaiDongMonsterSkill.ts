import { MathUtils } from "../../../../../core/utils/MathUtils";
import ObjectUtils from "../../../../../core/utils/ObjectUtils";
import { AttrEnum } from "../../attribute/AttrEnum";
import BattleConstantConfig from "../../config/BattleConstantConfig";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";
import { PassivitySkillFlag } from "../SkillEnum";
import { BoSaiDongMonster } from "./BoSaiDongMonster";

export class BoSaiDongMonsterSkill2 extends FightSkillInfo {
    protected summon(behavior: SkillBehavior,
        effectParam: { id: number, x: number, y: number, num?: number, randomFix?: number, isMapPoint?: number, time?: number, attr?: number, attrAmount?: number },
        caster: BoSaiDongMonster, takers: BattleUnit[]) {

        let behaviorEffectParam: { totalAmount: number, amount: number, saveTime: number } = behavior.cfg.param
        if (behaviorEffectParam?.totalAmount)//记录召唤物目标
        {
            let totalAmount = behaviorEffectParam.totalAmount
            let P3220_p101Parm: { totalAmount: number } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P3220_p101);
            if (P3220_p101Parm?.totalAmount) {
                totalAmount = P3220_p101Parm.totalAmount;
            }
            caster.skill2TeamHurtTargetValue = Math.ceil(totalAmount * caster.battleLogic.getTeamInitAttrValue(caster.teamId, AttrEnum.ATK) / BattleConstantConfig.getRandBase);
        }


        //清除召唤物目标
        caster.battleLogic.teamHurtBoSaiDongMap[caster.teamId] = 0;

        let s203Buff = null;
        let P3220_p101Parm: { buff: string[] } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P3220_p101)
        if (P3220_p101Parm?.buff) {
            s203Buff = P3220_p101Parm.buff;
        }

        let P3220_x101Parm: { summon: number } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P3220_x101)
        if (P3220_x101Parm?.summon) {
            let newParam: { id: number, attr: number, x: number, y: number, num?: number } = ObjectUtils.copy(effectParam) as any
            ObjectUtils.mergeSameObj(newParam, P3220_x101Parm)
            newParam.id = P3220_x101Parm.summon;
            super.summon(behavior, newParam, caster, takers, { amount: behaviorEffectParam.amount, buff: s203Buff, saveTime: behaviorEffectParam.saveTime });
        }
        else {
            super.summon(behavior, effectParam, caster, takers, { amount: behaviorEffectParam.amount, buff: s203Buff, saveTime: behaviorEffectParam.saveTime });
        }
    }
}

export class BoSaiDongMonsterSkill3 extends FightSkillInfo {
    /***击退 */
    protected repel(behavior: SkillBehavior, caster: ICaster, taker: BattleUnit, repel: number): void {
        let effectParam: { min: number, range: number } = behavior.cfg.param;
        if (effectParam?.min) {
            let distance = MathUtils.distance(caster.caster.pos, taker.pos);
            if (effectParam.range < distance) {
                repel = Math.min(Math.floor(effectParam.min / distance * repel), repel)
            }
        }
        if (repel)
            super.repel(behavior, caster, taker, repel)
    }
}
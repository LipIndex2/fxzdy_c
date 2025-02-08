import ObjectUtils from "../../../../../core/utils/ObjectUtils";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { SkillBehavior } from "../SkillBehavior";
import { PassivitySkillFlag } from "../SkillEnum";


export class LiLiSiMonsterSkill3 extends FightSkillInfo {
    protected summon(behavior: SkillBehavior,
        effectParam: { id: number, x: number, y: number, num?: number, randomFix?: number, isMapPoint?: number, time?: number, attr?: number, attrAmount?: number },
        caster: BattleUnit, takers: BattleUnit[]) {
        let param: { bossRate: number, bossId: number, attr?: number } = behavior.cfg.param
        let P3140_p101Parm: { halo: string[], num: number, bossRate: number, bossId: number, attr?: number, bossNum: number } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P3140_p101)
        let b = false;
        if (param && param.bossRate) {
            if (caster.battleLogic.randomMgr.isRandTrue(param.bossRate)) {
                //大恶魔
                let newParam: { id: number, attr: number, x: number, y: number, num?: number } = ObjectUtils.copy(effectParam) as any
                ObjectUtils.mergeSameObj(newParam, param)
                newParam.id = param.bossId;
                newParam.attr = param.attr;
                super.summon(behavior, newParam, caster, takers);
                b = true
            }
        }

        if (!b && P3140_p101Parm?.bossRate) {
            //精英恶魔
            if (caster.battleLogic.randomMgr.isRandTrue(P3140_p101Parm.bossRate)) {
                let newParam: { id: number, attr: number, x: number, y: number, num?: number } = ObjectUtils.copy(effectParam) as any
                ObjectUtils.mergeSameObj(newParam, P3140_p101Parm)
                newParam.id = P3140_p101Parm.bossId;
                newParam.attr = P3140_p101Parm.attr;
                newParam.num = P3140_p101Parm.bossNum;
                super.summon(behavior, newParam, caster, takers);
                b = true
            }
        }

        if (!b && P3140_p101Parm?.num) {
            //小恶魔数量
            let newParam: { id: number, attr: number, x: number, y: number, num?: number } = ObjectUtils.copy(effectParam) as any
            newParam.num = P3140_p101Parm.num;
            super.summon(behavior, newParam, caster, takers);
            b = true
        }

        if (!b)
            super.summon(behavior, effectParam, caster, takers);

        if (P3140_p101Parm?.halo) {
            //为恶魔添加光环
            let summons = caster.battleLogic.unitProcessor.getSummons(caster.uid)
            for (let i = 0; i < summons.length; i++) {
                if (summons[i].isActive)
                    for (let j = 0; j < P3140_p101Parm.halo.length; j++) {
                        caster.battleLogic.haloMgr.addHalo(P3140_p101Parm.halo[j], caster, summons[i], behavior)
                    }
            }
        }

        let P3140_x101Parm: { buff1: string, buff2: string } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P3140_x101)
        if (P3140_x101Parm?.buff2) {
            let summons = caster.battleLogic.unitProcessor.getSummons(caster.uid)
            for (let i = 0; i < summons.length; i++) {
                if (summons[i].isActive)
                    caster.battleLogic.buffMgr.buffControlByGroup(P3140_x101Parm?.buff2, caster, summons[i], behavior)
            }
        }
    }
}
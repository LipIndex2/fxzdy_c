import { FightType } from "../../enum/FightType";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { PassivitySkillData } from "../PassivitySkillData";
import { SkillBehavior } from "../SkillBehavior";
import { WuTouQiShiMonster } from "./WuTouQiShiMonster";

export class WuTouQiShiMonsterSkill2 extends FightSkillInfo {
    /***目标被选取 */
    protected onBehaviorSelectTargets(behavior: SkillBehavior, owner: ICaster): BattleUnit[] {
        let param: { random: number[], randomPvp: number[], battleType: string[] } = behavior.cfg.param;
        if (param?.random?.length > 1) {
            let isPvp = false;
            for (let i = 0; i < param.battleType.length; i++) {
                let fightType = FightType[param.battleType[i]]
                if (fightType == owner.battleLogic.fightType) {
                    isPvp = true;
                    break
                }
            }
            let numMin = +param.random[0];
            let numMax = +param.random[1];
            if (isPvp) {
                numMin = +param.randomPvp[0];
                numMax = +param.randomPvp[1];
            }
            let num = owner.battleLogic.randomMgr.randomInt(numMin, numMax)
            let newUnits: BattleUnit[] = [];
            let units = super.onBehaviorSelectTargets(behavior, owner);
            if (units) {
                let unitNum = Math.min(units.length, num);
                for (let i = 0; i < unitNum; i++) {
                    newUnits.push(units[i])
                }
            }
            return newUnits;
        }
        else
            return super.onBehaviorSelectTargets(behavior, owner)
    }
}

export class WuTouQiShiMonsterSkill3 extends FightSkillInfo {
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: WuTouQiShiMonster): void {
        if (owner.isPossess && !owner.possessCanSkill3) {
            return
        }
        else
            super.beginBehaviorEffect(behavior, owner)
    }
}

export class WuTouQiShiMonsterPassivitySkill1 extends FightSkillInfo {
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: WuTouQiShiMonster): void {
        super.beginBehaviorEffect(behavior, owner)
        let param: { dieBuff: string, skill3: number } = behavior.cfg.param;
        if (param) {
            if (param.dieBuff) {
                owner.attr.removeAllBuffs()
                owner.possessSkillData = behavior.skill as PassivitySkillData;
                owner.beginToPossess = true;
                owner.battleLogic.buffMgr.buffControlByGroup(param.dieBuff, owner, owner, behavior);
            }
        }

        if (behavior.cfg.effectType == "summon") {
            owner.beginToPossess = false;
            owner.possessCanSkill3 = param?.skill3 == 1 ? true : false;
            let summon = owner.battleLogic.getSummons(owner.uid)
            if (summon?.length)
                owner.setPossess(summon[0]);
        }
    }
}
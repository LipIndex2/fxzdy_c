import ObjectUtils from "../../../../../core/utils/ObjectUtils";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { HeroUnit } from "../../unit/battle/HeroUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";
import { SkillData } from "../SkillData";
import { PassivitySkillFlag } from "../SkillEnum";
import { SkillHalo } from "../SkillHalo";

export class SunWuKong extends HeroUnit {
    private nowExSkills: SkillData[]
    protected getActiveSkill(): SkillData {
        let skill = super.getActiveSkill();
        if (skill && skill.skillIndex == 0 && this.attr.exActiveSkills && this.attr.exActiveSkills[skill.skillId].length) {
            let P2430_s201Parm: { amount: number, skill: string[] } = this.attr.getPassiveSkillFlag(PassivitySkillFlag.P2430_s201)
            if (!this.nowExSkills && P2430_s201Parm?.skill) {
                this.nowExSkills = [];
                let num = this.attr.exActiveSkills[skill.skillId].length;
                for (let i = 0; i < num; i++) {
                    if (P2430_s201Parm.skill.indexOf(this.attr.exActiveSkills[skill.skillId][i].skillId) != -1) {
                        this.nowExSkills.push(this.attr.exActiveSkills[skill.skillId][i])
                    }
                }
            }

            if (this.nowExSkills) {
                let index = 0;
                index = this.battleLogic.randomMgr.randomInt(0, this.nowExSkills.length)
                if (index) {
                    skill = this.nowExSkills[index - 1]
                }
            }
        }
        return skill;
    }
}

export class SunWuKongSkill1 extends FightSkillInfo {
    protected hurtDelayHandler(behavior: SkillBehavior, effectParam: { amount: number, buff?: string[], repel?: number, delay?: number }, caster: ICaster, takers: BattleUnit[]): void {
        let P2430_s201Parm: { amount: number, skill: string[] } = caster.caster.attr.getPassiveSkillFlag(PassivitySkillFlag.P2430_s201)
        if (P2430_s201Parm?.amount) {
            let newParam: { amount: number, skill: string[] } = ObjectUtils.copy(effectParam) as any
            ObjectUtils.mergeSameObj(newParam, P2430_s201Parm)
            super.hurtDelayHandler(behavior, newParam, caster, takers)
        }
        else
            super.hurtDelayHandler(behavior, effectParam, caster, takers)
    }
}

export class SunWuKongSkill3 extends FightSkillInfo {
    /***光环执行伤害前 */
    public haloHandlerBeforce(halo: SkillHalo): void {
        let param: { buff: string, buff2: string, haloAddBuff: string } = halo.skillBehavior.cfg.param
        if (halo.units?.length == 1 && param?.haloAddBuff) {
            this.skill.owner.battleLogic.buffMgr.buffControlByGroup(param.haloAddBuff, this.skill.owner, this.skill.owner, halo.skillBehavior);
        }
    }
}

export class SunWuKongPassivitySkill1 extends FightSkillInfo {
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner);
        let param: { buff: string, buff2: string } = behavior.cfg.param;
        if (param?.buff) {
            if (param.buff2) {
                let targetBuffs = owner.battleLogic.buffMgr.getBuffGroupByGroup(param.buff2, owner.casterUid)
                if (targetBuffs?.length) {
                    return
                }
            }

            let skillGroup = owner.battleLogic.buffMgr.buffControlByGroup(param.buff, owner, owner as BattleUnit, behavior);
            if (param.buff2) {
                let layer = skillGroup.buffs[0].layer;
                let maxLayer = skillGroup.buffs[0].cfg.layer;
                if (layer >= maxLayer) {
                    skillGroup.removeAll()
                    owner.battleLogic.buffMgr.buffControlByGroup(param.buff2, owner, owner as BattleUnit, behavior);
                }
            }
        }
    }
}
import { Handler } from "../../../../../core/utils/Handler";
import { DamageVo } from "../../DamageVo";
import { DirctionType } from "../../enum/BattleEnum";
import { FightTimeCheck } from "../../FightTimeCheck";
import { HeroShowUnit } from "../../show/HeroShowUnit";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { HeroUnit } from "../../unit/battle/HeroUnit";
import { BulletUnit } from "../../unit/bullet/BulletUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";
import { SkillData } from "../SkillData";
import { BuffGroupFlagType, BuffType } from "../SkillEnum";

export class MaErSiShow extends HeroShowUnit {
    /***攻击完成 */
    protected attackActionComplete(isForce: boolean, skillInfo: SkillData, isStopSkillEffect: boolean = true): void {
        if (isForce && skillInfo?.skillIndex == 2) {
            this.skillEffectGoToAndPlay("loopEnd")
            super.attackActionComplete(isForce, skillInfo, false)
        }
        else
            super.attackActionComplete(isForce, skillInfo, isStopSkillEffect)
    }
}

export class MaErSi extends HeroUnit {
    public isSkill3: boolean = false;
    checkBeHurtHandler(damageVo: DamageVo): boolean {
        if (this.isSkill3 && damageVo.caster instanceof BulletUnit) {
            //3技能免疫正面的子弹伤害
            if (damageVo.caster.moveVec.x < 0 && this.dirction == DirctionType.Left) {
                return false
            }
            else if (damageVo.caster.moveVec.x > 0 && this.dirction == DirctionType.Rigth) {
                return false
            }
            return true
        }
        else
            return super.checkBeHurtHandler(damageVo);
    }
}

export class MaErSiSkill2 extends FightSkillInfo {
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner)
        let param: { buff: string, random: number[] } = behavior.cfg.param;
        if (param?.buff) {
            let buffs = owner.battleLogic.buffMgr.getBuffListByEffect(this.skill.owner, BuffType.ZhanYi);
            if (buffs) {
                for (let i = 0; i < buffs.length; i++) {
                    if (buffs[i].layer >= buffs[i].cfgLayer) {
                        owner.battleLogic.buffMgr.buffControlByGroup(param.buff, owner, owner as BattleUnit, behavior)
                    }
                }
            }
        }
    }

    /**行为产生buff */
    protected addBuff(behavior: SkillBehavior, effectParam: { buffId: string, delay?: number }, caster: ICaster, takers: BattleUnit[]) {
        let param: { buff: string, random: number[] } = behavior.cfg.param;
        if (param?.random) {
            let num = caster.battleLogic.randomMgr.randomInt(param.random[0], param.random[1])
            for (let i = 0; i < num; i++) {
                super.addBuff(behavior, effectParam, caster, takers)
            }
        }
        else
            super.addBuff(behavior, effectParam, caster, takers)
    }
}

export class MaErSiSkill3 extends FightSkillInfo {
    private fightCheckTimer: FightTimeCheck;
    private behaviorId: string;
    private behavior: SkillBehavior;
    private behaviorEnd: boolean = false
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner);
        let param: { ignoreBullet: number, behavior: string, time: number } = behavior.cfg.param;
        if (param?.ignoreBullet) {
            if (owner instanceof MaErSi) {
                owner.isSkill3 = true;
            }
        }
        if (param?.behavior) {
            this.behaviorEnd = false;
            this.behaviorId = param?.behavior
            this.behavior = behavior
            this.fightCheckTimer = owner.battleLogic.createTimeCheck(param.time, new Handler(this, this.onSkillNextHurt, [behavior]))
        }
    }

    private onSkillNextHurt(behavior: SkillBehavior): void {
        if (!this.behaviorEnd)
            this.onNewBehaviorHandler(this.behaviorId, behavior, this.skill.owner, this.skill)
        this.behaviorEnd = true;
        if (this.fightCheckTimer)
            this.fightCheckTimer.isReadyToRemove = true;
    }

    /***技能动作播放完毕 */
    public skillCompleteHandler(): void {
        let groups = this.skill.owner.battleLogic.buffMgr.getAllBuffGroupByFlag(BuffGroupFlagType.MeRsI, this.skill.owner)
        for (let i = 0; i < groups.length; i++) {
            groups[i].removeAll()
        }

        if (this.skill.owner instanceof MaErSi) {
            this.skill.owner.isSkill3 = false;
        }

        this.onSkillNextHurt(this.behavior);
    }
}


import { BattleUtils } from "../../BattleUtils";
import { DamageVo } from "../../DamageVo";
import { UnitType, MonsterType } from "../../enum/BattleEnum";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { MonsterUnit } from "../../unit/battle/MonsterUnit";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";
import { SkillBuff } from "../SkillBuff";
import { PassivitySkillFlag, BuffGroupFlagType } from "../SkillEnum";

export class WeiLaMonsterPassivitySkill1 extends FightSkillInfo {
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner)
        let param: { buff: string } = behavior.cfg.param;
        if (param?.buff) {
            let buffGroups = owner.battleLogic.buffMgr.getBuffGroupByGroup(param.buff, owner.casterUid)
            for (let i = 0; i < buffGroups.length; i++) {
                buffGroups[i].removeAll()
            }
        }
    }
}

export class WeiLaMonsterSkill3 extends FightSkillInfo {
    private bossTime: number = 0;
    private heroTime: number = 0;
    private monsterTime: number = 0;
    private buff: string
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner)
        let param: { buff: string } = behavior.cfg.param;
        if (param?.buff)
            this.buff = param?.buff;
        let P4310_x101_param: { boss: number, hero: number, monster: number } = behavior.skill.owner.attr.getPassiveSkillFlag(PassivitySkillFlag.P4310_x101)
        if (P4310_x101_param) {
            this.bossTime = P4310_x101_param.boss;
            this.heroTime = P4310_x101_param.hero;
            this.monsterTime = P4310_x101_param.monster;
        }
    }

    /***buff执行前 */
    public buffBeforce(buff: SkillBuff): void {
        if (buff.skillBuffGroup.cfg.flag == BuffGroupFlagType.WeiLa) {
            buff.battleLogic.buffMgr.buffControlByGroup(this.buff, this.skill.owner, this.skill.owner, buff.skillBehavior)
        }
    }

    /***buff执行伤害后 */
    public buffHurtAfter(damageVo: DamageVo): void {
        if (damageVo && damageVo.target?.isDeath) {
            let taker = damageVo.target
            let groups = taker.battleLogic.buffMgr.getAllBuffGroupByFlag(BuffGroupFlagType.WeiLa, damageVo.caster as BattleUnit);
            if (groups) {
                for (let i = 0; i < groups.length; i++) {
                    let addTime = 0;
                    if (taker.type == UnitType.Boss) {
                        addTime = this.bossTime
                    }
                    else if (taker.type == UnitType.Hero) {
                        addTime = this.heroTime
                    }
                    else if (taker.type == UnitType.Monster) {
                        if ((taker as MonsterUnit).cfg.monsterType == MonsterType.Elite) {
                            addTime = this.bossTime
                        }
                        else
                            addTime = this.monsterTime
                    }
                    groups[i].addBuffTime(BattleUtils.getFrameByTime(addTime))
                }
            }
        }
    }
}
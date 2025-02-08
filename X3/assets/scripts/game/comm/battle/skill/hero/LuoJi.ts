import { Vec2 } from "cc";
import { TableManager } from "../../../../../core/table/TableManager";
import { IBattleUnitData } from "../../../../modules/battle/vo/IBattleUnitData";
import { MonsterBattleAttr } from "../../attribute/MonsterBattleAttr";
import { BattleUtils } from "../../BattleUtils";
import BattleConstantConfig from "../../config/BattleConstantConfig";
import { DamageVo } from "../../DamageVo";
import { UnitType } from "../../enum/BattleEnum";
import { HeroShowUnit } from "../../show/HeroShowUnit";
import { BattleUnit } from "../../unit/battle/BattleUnit";
import { HeroUnit } from "../../unit/battle/HeroUnit";
import { MonsterUnit } from "../../unit/battle/MonsterUnit";
import { BehaviorUtils } from "../BehaviorUtils";
import { FightSkillInfo } from "../FightSkillInfo";
import { ICaster } from "../ICaster";
import { SkillBehavior } from "../SkillBehavior";
import { SkillData } from "../SkillData";
import { AbnormalType, EffectLayer, PassivitySkillFlag, SkillEffectPos, TargetFaction } from "../SkillEnum";
import { SkillUtils } from "../SkillUtils";
import { v2 } from "cc";

export class LuoJiShow extends HeroShowUnit {
    protected updateHpBar(): void {
        super.updateHpBar()
        if ((this.unitData as LuoJi).illusionUnit) {
            this._hpBar.onHide()
        }
    }
}

export class LuoJi extends HeroUnit {
    public illusionUnit: HeroUnit;
    /***幻化的目标是否选过技能2 */
    private isIllusionUnitSelectSkill: boolean = false
    /****超过这个时间且不在2技能中取消幻化 */
    // private timeToSkill: number = 0

    public setIllusionUnit(unit: HeroUnit, timeToSkill: number): void {
        this.isIllusionUnitSelectSkill = false;
        // this.timeToSkill = BattleUtils.getFrameByTime(timeToSkill + 500)//增加500毫秒容错
        this.illusionUnit = unit
        this.illusionUnit.attr.hp = this.attr.hp;
        this.illusionUnit.updateHpBar();
        this.setAbnormalStatus(AbnormalType.notSelect)
        this.visible = false;
    }

    public removeIllusionUnit(): void {
        if (this.illusionUnit) {
            let lastPos = LuoJiUtils.illuseionChangeUidPosMap[this.uid];
            if (lastPos)
                this.pos.set(lastPos.x, lastPos.y);
            this.illusionUnit.attr.resetBuff()
            this.illusionUnit.removeUnit()
            this.illusionUnit = null
            this.clearAbnormalStatus(AbnormalType.notSelect)
            this.visible = true;
        }
    }

    /**处理其他事情 */
    protected doOther() {
        if (this.illusionUnit)
            return false;
        super.doOther()
    }

    /***进行攻击 */
    protected attack(): boolean {
        if (this.illusionUnit)
            return false;
        let b = super.attack()
        return b;
    }

    public update(): boolean {
        let b = super.update()
        if (b && this.illusionUnit) {
            // this.timeToSkill--;
            this.attr.hp = this.illusionUnit.attr.hp;
            this.attr.normalMaxHp = this.illusionUnit.attr.normalMaxHp;
            this.attr.maxHp = this.illusionUnit.attr.getAddMaxHp();
            this.updateHpBar()
            if (this.attr.isDeath()) {
                this.removeIllusionUnit()
                this.onDie()
            }
            else {
                if (this.isIllusionUnitSelectSkill && (!this.illusionUnit.skillInfo || this.illusionUnit.skillInfo.skillIndex != 2)) {
                    //幻化的目标选过技能2，但更换了技能，证明技能2已经被释放,终止幻化
                    this.removeIllusionUnit();
                }
                else if (this.illusionUnit.skillInfo?.skillIndex == 2 && !this.isIllusionUnitSelectSkill) {
                    //幻化的目选择了技能2
                    this.isIllusionUnitSelectSkill = true;
                }
                // if ( this.timeToSkill <= 0 &&  (!this.illusionUnit.skillInfo || this.illusionUnit.skillInfo.skillIndex != 2)) {
                //     this.removeIllusionUnit();
                // }
                // else {
                //     if (this.isIllusionUnitSelectSkill && (!this.illusionUnit.skillInfo || this.illusionUnit.skillInfo.skillIndex != 2)) {
                //         //幻化的目标选过技能2，但更换了技能，证明技能2已经被释放,终止幻化
                //         this.removeIllusionUnit();
                //     }
                //     else if (this.illusionUnit.skillInfo?.skillIndex == 2 && !this.isIllusionUnitSelectSkill) {
                //         //幻化的目选择了技能2
                //         this.isIllusionUnitSelectSkill = true;
                //     }
                // }
            }
        }
        return b;
    }

    /**更新位置 */
    public updatePos(): void {
        super.updatePos()
        if (this.illusionUnit && this._moveVec.isCrtl) {
            this.illusionUnit.pos.set(this.pos.x, this.pos.y)
        }
        else if (this.illusionUnit) {
            this.pos.set(this.illusionUnit.pos.x, this.illusionUnit.pos.y)
        }
    }

    /***脱离战斗 */
    public exitFight(): void {
        if (this.isBeginToFight) {
            this.removeIllusionUnit()
        }
        LuoJiUtils.clearSkill3(this.uid)
        super.exitFight()
    }
}

export class LuoJiUtils {
    public static skill3UidMap: { [uid: number]: { [uid: number]: number } } = {};

    /***记录对应施法者的3技能对某个目标的统计次数 */
    public static saveSkill3(fighterUid: number, targetUid: number): void {
        if (!this.skill3UidMap[fighterUid])
            this.skill3UidMap[fighterUid] = {};

        if (!this.skill3UidMap[fighterUid][targetUid])
            this.skill3UidMap[fighterUid][targetUid] = 0;
        this.skill3UidMap[fighterUid][targetUid]++;
    }

    public static getSkill3Count(fighterUid: number, targetUid: number): number {
        if (!this.skill3UidMap[fighterUid])
            return 0;
        if (!this.skill3UidMap[fighterUid][targetUid])
            return 0;
        return this.skill3UidMap[fighterUid][targetUid];
    }

    public static clearSkill3(fighterUid: number): void {
        delete this.skill3UidMap[fighterUid]
    }

    public static illuseionChangeUidPosMap: { [uid: number]: Vec2 } = {}
    public static illusionHandler(behavior: SkillBehavior, owner: LuoJi, target: BattleUnit, timeToSkill: number, effect?: { low: number[], up: number[] }): void {
        if (owner.illusionUnit)
            return;

        let heroId: number = 0;
        let heroUnit: BattleUnit = target;
        if (heroUnit instanceof HeroUnit) {
            heroId = heroUnit.attr.getConfigId()
        }
        else if (heroUnit instanceof MonsterUnit) {
            heroId = (heroUnit.attr as MonsterBattleAttr).heroId
        }

        if (heroId) {
            let P3321_x101Parm: { buff: string } = owner.caster.attr.getPassiveSkillFlag(PassivitySkillFlag.P3321_x101)
            if (P3321_x101Parm?.buff) {
                //幻化前添加的BUFF
                owner.battleLogic.buffMgr.buffControlByGroup(P3321_x101Parm.buff, owner, owner as BattleUnit, behavior, null, owner);
            }

            //幻化近战时记录幻化前的坐标
            let heroCfg = TableManager.getDataById(table.hero.HeroConfig, heroId);
            if (heroCfg.attackRange == "MELEE") {
                this.illuseionChangeUidPosMap[owner.uid] = v2(owner.pos.x, owner.pos.y);
            }
            else {
                this.illuseionChangeUidPosMap[owner.uid] = null;
            }

            //找洛基的槽位3被动技能的等级
            let skillLevel: number = 0;
            for (let i = 0; i < owner.caster.attr.originalSkillIds.length; i++) {
                let skillData = owner.caster.attr.getPassSkillById(owner.caster.attr.originalSkillIds[i])
                if (skillData && skillData.ownerSkillData instanceof SkillData && skillData.ownerSkillData.cfg.belongType == "3321_p1") {
                    skillLevel = skillData.level;
                    break
                }
            }


            let skill1Id = heroCfg.skill0 + "01";
            let skill2Id = null;
            while (skillLevel) {
                let tempSkillId = heroCfg.skill2 + (skillLevel < 10 ? "0" + skillLevel : skillLevel);
                if (TableManager.getDataById(table.battle.SkillConfig, tempSkillId)) {
                    skill2Id = tempSkillId
                    break
                }
                skillLevel--;
            }
            let skillIds = [skill1Id]
            if (skill2Id)
                skillIds.push(skill2Id)

            let data: IBattleUnitData = {
                configId: heroId,
                type: UnitType.Hero,
                level: owner.caster.attr.lv,
                stage: 0,
                star: 0,
                attrs: owner.caster.attr.attrs,
                position: owner.caster.formationPosition,
                monsterResourceId: 0,
                skillIds: skillIds,
            };
            let copyUnit = owner.battleLogic.unitProcessor.createOneHero(SkillUtils.getTeamIdByFaction(owner.teamId, TargetFaction.OurSide), data)
            copyUnit.setPosXY(owner.pos.x, owner.pos.y)
            copyUnit.formationPos = owner.caster.formationPos.clone();
            copyUnit.attr.updateMaxPreCD(2, timeToSkill);
            (owner.caster as LuoJi).setIllusionUnit(copyUnit, timeToSkill);
            if (effect && effect.up && effect.low) {
                owner.caster.showUnit()?.createFightEffect(effect.up[0], SkillEffectPos.Player_Move, owner.caster, EffectLayer.RoleLayer, false, owner.caster.dirction);
                owner.caster.showUnit()?.createFightEffect(effect.low[0], SkillEffectPos.Player_Move, owner.caster, EffectLayer.BgLayer, false, owner.caster.dirction);
            }
        }
    }
}

export class LuoJiSkill2 extends FightSkillInfo {
    /***是否已经选过1次攻击力最高的目标 */
    private isAtkTop: boolean = false;
    /***目标被选取 */
    protected onBehaviorSelectTargets(behavior: SkillBehavior, owner: ICaster, num: number = -1): BattleUnit[] {
        let param: { targetType: number } = behavior.cfg.param;
        if (param?.targetType && !this.isAtkTop) {
            this.isAtkTop = true;
            return BehaviorUtils.getBehaviorTargets(behavior, owner, num, param.targetType);
        }
        return super.onBehaviorSelectTargets(behavior, owner, num)
    }

    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner)
        //处理幻化
        let P3321_x101Parm: { buff: string, time: number, low: number[], up: number[] } = owner.caster.attr.getPassiveSkillFlag(PassivitySkillFlag.P3321_x101)
        if (P3321_x101Parm?.buff) {
            if (behavior.selectUnits?.length) {
                LuoJiUtils.illusionHandler(behavior, owner as LuoJi, behavior.selectUnits[0], P3321_x101Parm.time, { low: P3321_x101Parm.low, up: P3321_x101Parm.up })
            }
        }
    }

    /**技能重置，如重新进战 */
    public resetSkill(): void {
        super.resetSkill();
        this.isAtkTop = false;
    }
}

export class LuoJiSkill3 extends FightSkillInfo {
    protected hurtHandler(behavior: SkillBehavior, taker: BattleUnit, damageVo: DamageVo): void {
        let param: { hp: number, amount: number } = behavior.cfg.param;
        if (param?.amount) {
            let casterUid = behavior.owner.casterUid
            if (this.skill.owner.summon) {
                casterUid = this.skill.owner.summon.byUid;
            }
            let num = LuoJiUtils.getSkill3Count(casterUid, taker.uid);
            damageVo.value = damageVo.value + Math.ceil(damageVo.value * num * param.amount / BattleConstantConfig.getRandBase);
            if (taker.type == UnitType.Monster && (taker as MonsterUnit).isBoss) {
                //最大生命值
                damageVo.value = Math.min(damageVo.value, behavior.skill.owner.hpMax)
            }
            LuoJiUtils.saveSkill3(casterUid, taker.uid);
        }
        super.hurtHandler(behavior, taker, damageVo)
    }
}

export class LuoJiPassivitySkill1 extends FightSkillInfo {
    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        super.beginBehaviorEffect(behavior, owner)
        let param: { buff: string, Illusion: number, time: number } = behavior.cfg.param;
        if (param?.buff) {
            owner.battleLogic.buffMgr.buffControlByGroup(param.buff, owner, owner as BattleUnit, behavior);
        }

        if (param?.Illusion) {
            //幻化
            LuoJiUtils.illusionHandler(behavior, owner as LuoJi, behavior.skillTarget as BattleUnit, param.time)
        }
    }

    protected summon(behavior: SkillBehavior,
        effectParam: { id: number, x: number, y: number, num?: number, randomFix?: number, isMapPoint?: number, time?: number, attr?: number, attrAmount?: number, delay?: number },
        caster: BattleUnit, takers: BattleUnit[], exData?: any, notSumm: boolean = false) {

        if (!caster.battleLogic.isInBattle() || caster.hp == 0) {
            return
        }

        super.summon(behavior, effectParam, caster, takers, exData, notSumm);

        let skill = caster.attr.getSkillByIndex(2, true)
        let summons = caster.battleLogic.getSummons(this.skill.owner.casterUid)
        for (let i = 0; i < summons.length; i++) {
            if (summons[i].attr.getConfigId() == effectParam.id) {
                summons[i].attr.addSkill(skill.skillId);
            }
        }
    }
}
import { Vec2 } from "cc";
import { Handler } from "../../../../core/utils/Handler";
import { MathUtils } from "../../../../core/utils/MathUtils";
import { DamageVo } from "../DamageVo";
import { FightFormula } from "../FightFormula";
import BattleConstantConfig from "../config/BattleConstantConfig";
import { DirctionType } from "../enum/BattleEnum";
import { BattleUnit } from "../unit/battle/BattleUnit";
import { HeroUnit } from "../unit/battle/HeroUnit";
import { BaseSkillData } from "./BaseSkillData";
import { BehaviorUtils } from "./BehaviorUtils";
import { ICaster } from "./ICaster";
import { SkillBehavior } from "./SkillBehavior";
import { PointTarget } from "./PointTarget";
import { v2 } from "cc";
import { PoolManager } from "../../../../core/pool/PoolManager";
import { ITarget } from "./ITarget";
import { PassivitySkillUtils } from "./PassivitySkillUtils";
import { AbnormalType, LeaderSkillTriggerType, PassivitySkillType } from "./SkillEnum";
import { ISummonData } from "../unit/battle/ISummonData";
import { TableManager } from "../../../../core/table/TableManager";
import { BulletUnit } from "../unit/bullet/BulletUnit";
import BulletFactory from "../unit/bullet/BulletFactory";
import { SkillBuff } from "./SkillBuff";
import { FightTimeCheck } from "../FightTimeCheck";
import { PassivitySkillData } from "./PassivitySkillData";
import { SkillHalo } from "./SkillHalo";

export class FightSkillInfo {
    public skill: BaseSkillData;
    protected selectUnits: BattleUnit[];
    /***技能开始 */
    public beginSkillHandler(): void {
    }

    /***开始触发行为 */
    public beginBehaviorEffect(behavior: SkillBehavior, owner: ICaster): void {
        let isPassivitySkill: boolean = false;
        if (behavior.skill instanceof PassivitySkillData) {
            isPassivitySkill = true
        }
        if (this.skill?.owner) {
            PassivitySkillUtils.checkPassSkillCon(PassivitySkillType.ConType_29, this.skill.owner, this.skill.owner.selectMainTarget?.unit, this.skill, isPassivitySkill);
            PassivitySkillUtils.checkPassSkillCon(PassivitySkillType.ConType_30, this.skill.owner.selectMainTarget?.unit, this.skill.owner, this.skill, isPassivitySkill);
        }
        this.selectUnits = behavior.selectUnits = this.onBehaviorSelectTargets(behavior, owner);
        this.actionBehavior(behavior, owner, this.selectUnits)
        if (this.skill && this.skill.owner)
            PassivitySkillUtils.checkPassSkillCon(PassivitySkillType.ConType_20, this.skill.owner, this.skill.owner.selectMainTarget?.unit, this.skill, isPassivitySkill);
    }

    /***目标被选取 */
    protected onBehaviorSelectTargets(behavior: SkillBehavior, owner: ICaster, num: number = -1): BattleUnit[] {
        return BehaviorUtils.getBehaviorTargets(behavior, owner, num);
    }

    /***执行行为 */
    protected actionBehavior(behavior: SkillBehavior, caster: ICaster, takers: BattleUnit[]): void {
        let func = this[behavior.effectType] as Function;
        if (behavior.effectType == "collision") {
            //冲撞的话是移动到某个点
            func.call(this, behavior, behavior.effectParam, caster, behavior.skillTarget);
        }
        else if ((takers && takers.length)) {
            if (func)
                func.call(this, behavior, behavior.effectParam, caster, takers);
            else {
                for (let i = 0; i < takers.length; i++) {
                    behavior.showSkillEffect(takers[i])
                }
            }
        }
        else if (behavior.effectType == "charged") {
            //蓄力忽略目标
            if (func)
                func.call(this, behavior, behavior.effectParam, caster, takers);
        }

        if (behavior.cfg.behavior) {
            for (let i = 0; i < behavior.cfg.behavior.length; i++) {
                //触发额外的行为
                let delayTime = 0
                if (behavior.cfg.behaviorDelay) {
                    delayTime = + behavior.cfg.behaviorDelay[i] || 0;
                }
                if (delayTime > 0) {
                    caster.battleLogic.createTimeCheck(delayTime, Handler.create(this, this.onNewBehaviorHandler, [behavior.cfg.behavior[i], behavior, caster, behavior.skill], false))
                }
                else {
                    this.onNewBehaviorHandler(behavior.cfg.behavior[i], behavior, caster, behavior.skill)
                }
            }
        }

        let shakeParm: { times: number, offset: number, speed: number, mode: number; delay: number } = behavior.cfg.shake
        if (shakeParm) {
            if (shakeParm.delay) {
                caster.battleLogic.createTimeCheck(shakeParm.delay, Handler.create(this, () => {
                    caster.battleLogic.effectMgr.shake(shakeParm.times, shakeParm.offset, shakeParm.speed, shakeParm.mode);
                }, [shakeParm]))
            }
            else
                caster.battleLogic.effectMgr.shake(shakeParm.times, shakeParm.offset, shakeParm.speed, shakeParm.mode);
        }
    }

    public onNewBehaviorHandler(behaviorId: string, ownerBehavior: SkillBehavior, caster: ICaster, belongSkill: BaseSkillData, target?: ITarget, exData?: any): void {
        const newBehavior = SkillBehavior.createBehavior(behaviorId, 0, belongSkill);
        if (newBehavior) {
            newBehavior.index = 0;
            newBehavior.setCaster(caster)
            if (target) {
                newBehavior.skillTarget = target;
                newBehavior.skillTargetUid = target.uid
            }
            else if (ownerBehavior) {
                newBehavior.skillTarget = ownerBehavior.skillTarget;
                newBehavior.skillTargetUid = ownerBehavior.skillTargetUid
            }
            newBehavior.exData = exData;
            newBehavior.actionEffect();
        }
    }

    /**伤害 */
    protected hurt(behavior: SkillBehavior, effectParam: { amount: number, buff?: string[], repel?: number, delay?: number }, caster: ICaster, takers: BattleUnit[]): void {
        if (effectParam.delay)
            this.skill.battleLogic.createTimeCheck(effectParam.delay, Handler.create(this, this.hurtDelayHandler, [behavior, effectParam, caster, takers]))
        else
            this.hurtDelayHandler(behavior, effectParam, caster, takers)

    }

    protected hurtDelayHandler(behavior: SkillBehavior, effectParam: { amount: number, buff?: string[], repel?: number, delay?: number }, caster: ICaster, takers: BattleUnit[]): void {
        if (!caster.inScene()) {
            return
        }

        if (behavior?.skill)
            caster.battleLogic.buffMgr.getHurtToHeal(caster, behavior.skill.skillIndex);
        PassivitySkillUtils.checkPassSkillCon(PassivitySkillType.ConType_34, caster.caster, caster.caster, behavior?.skill);
        for (let i = 0, len = takers.length; i < len; i++) {
            let taker = takers[i];
            if (taker instanceof BattleUnit) {
                if (taker.isActive) {

                    if (taker.battleLogic.buffMgr.getHasNotHurtBySkillSubType(taker, behavior.skill?.getSubType(), 1)) {
                        //判断是否免疫伤害
                        taker.showUnit()?.showOtherNum("zudang")
                        continue;
                    }

                    if (taker.battleLogic.haloMgr.getHasNotHurtBySkillSubType(taker, behavior.skill?.getSubType())) {
                        //判断是否免疫伤害
                        taker.showUnit()?.showOtherNum("zudang")
                        continue;
                    }


                    if (effectParam.repel) {
                        this.repel(behavior, caster, taker, effectParam.repel)
                    }
                    this.fightFormulaHandler(behavior, caster, taker);
                    if (effectParam.buff) {
                        for (let j = 0; j < effectParam.buff.length; j++)
                            caster.battleLogic.buffMgr.buffControlByGroup(effectParam.buff[j], caster, taker, behavior)
                    }
                }
            }
        }
    }

    /***击退 */
    protected repel(behavior: SkillBehavior, caster: ICaster, taker: BattleUnit, repel: number): void {
        if (caster instanceof BulletUnit) {
            taker.repel(caster.caster.pos, repel)
        }
        else {
            taker.repel(caster.pos, repel)
        }
    }

    /**真实伤害 */
    protected realHurt(behavior: SkillBehavior, effectParam: { amount: number, buff?: string[] }, caster: ICaster, takers: BattleUnit[]): void {
        for (let i = 0, len = takers.length; i < len; i++) {
            let taker = takers[i];
            if (taker.attr.isAlive()) {
                this.fightFormulaHandler(behavior, caster, taker, true);
                if (effectParam.buff) {
                    for (let j = 0; j < effectParam.buff.length; j++)
                        caster.battleLogic.buffMgr.buffControlByGroup(effectParam.buff[j], caster, taker, behavior)
                }
            }
        }
    }

    /***公式计算的处理 */
    protected fightFormulaHandler(behavior: SkillBehavior, caster: ICaster, taker: BattleUnit, isReal: boolean = false, damgeValue: number = 0,
        exData?: any): void {
        if (!taker)
            return
        let damageVo: DamageVo = FightFormula.fight(behavior, caster, taker, damgeValue == 0 ? behavior.damageValue : damgeValue, { real: isReal }, exData);
        behavior.tempAddDamageValue = 0;
        let effectParam: { hurtType: number, isPassThrough: number } = behavior.effectParam
        if (effectParam?.hurtType) {
            damageVo.hurtType = effectParam.hurtType;
        }
        if (effectParam?.isPassThrough) {
            damageVo.isPassThrough = effectParam.isPassThrough == 1;
        }
        this.hurtHandler(behavior, taker, damageVo);
    }

    /**按当前血量扣血*/
    protected hurtCurHp(behavior: SkillBehavior, effectParam: { amount: number }, caster: ICaster, takers: BattleUnit[]): void {
        for (let i = 0, len = takers.length; i < len; i++) {
            let taker = takers[i];
            if (taker.attr.isAlive()) {
                let damageVo = PoolManager.getItem(DamageVo)
                damageVo.skillInfo = behavior.skill;
                damageVo.caster = caster;
                damageVo.target = taker;
                damageVo.status = BattleConstantConfig.Normal;
                damageVo.value = Math.floor(taker.attr.hp * effectParam.amount / BattleConstantConfig.getRandBase)
                this.hurtHandler(behavior, taker, damageVo);
            }
        }
    }

    protected hurtHpMax(behavior: SkillBehavior, effectParam: { amount: number, real: number, buff: string[], buffDelay?: number, maxTeamAmount: number, isKill: number }, caster: ICaster, takers: BattleUnit[]): void {
        for (let i = 0, len = takers.length; i < len; i++) {
            let taker = takers[i];
            if (taker.attr.isAlive()) {
                let damageVo: DamageVo = FightFormula.hurtHpMax(behavior, caster, taker, effectParam.amount, effectParam.real);
                if (effectParam.isKill) {
                    damageVo.isKill = true;
                }
                if (effectParam.maxTeamAmount) {
                    let attack = 0;
                    let units = caster.battleLogic.unitProcessor.getUnitsByTeamId(caster.teamId)
                    for (let i = 0; i < units.length; i++) {
                        if (units[i].isActive) {
                            attack += units[i].atk;
                        }
                    }
                    damageVo.value = Math.min(Math.ceil(attack * effectParam.maxTeamAmount / BattleConstantConfig.getRandBase), damageVo.value)
                }
                this.hurtHandler(behavior, takers[i], damageVo);
                if (effectParam.buff) {
                    for (let j = 0; j < effectParam.buff.length; j++)
                        if (effectParam.buffDelay)
                            this.skill.battleLogic.createTimeCheck(effectParam.buffDelay, Handler.create(this, this.addBuffHandler, [behavior, effectParam, caster, [taker]]))
                        else
                            caster.battleLogic.buffMgr.buffControlByGroup(effectParam.buff[j], caster, taker, behavior)
                }
            }
        }
    }

    /***队伍的总攻击力 */
    protected teamHurt(behavior: SkillBehavior, effectParam: { amount: number, buff?: string[], buffDelay?: number }, caster: ICaster, takers: BattleUnit[]): void {
        for (let i = 0, len = takers.length; i < len; i++) {
            let taker = takers[i];
            if (taker.attr.isAlive()) {
                let damageVo: DamageVo = FightFormula.teamHurt(behavior, caster, taker, behavior.damageValue);
                this.hurtHandler(behavior, takers[i], damageVo);
                if (effectParam.buff) {
                    for (let j = 0; j < effectParam.buff.length; j++)
                        if (effectParam.buffDelay)
                            this.skill.battleLogic.createTimeCheck(effectParam.buffDelay, Handler.create(this, this.addBuffHandler, [behavior, effectParam, caster, [taker]]))
                        else
                            caster.battleLogic.buffMgr.buffControlByGroup(effectParam.buff[j], caster, taker, behavior)
                }
            }
        }
    }

    protected hurtHandler(behavior: SkillBehavior, taker: BattleUnit, damageVo: DamageVo): void {
        if (taker.attr.isAlive()) {
            damageVo.caster.battleLogic.hurt(damageVo)
            behavior.showSkillEffect(taker)
        }
    }

    /***复活 */
    protected revive(behavior: SkillBehavior, effectParam: { amount: number, buff: string[], healType: number }, caster: ICaster, takers: BattleUnit[]): void {
        for (let i = 0, len = takers.length; i < len; i++) {
            let taker = takers[i];
            if (!taker.isActive) {
                behavior.showSkillEffect(taker)
                let skillAmount: number = Math.ceil(taker.attr.maxHp * effectParam.amount / BattleConstantConfig.getRandBase);
                let hp = FightFormula.heal(behavior, caster, taker, skillAmount, false)
                if (effectParam.healType)
                    hp.healType = effectParam.healType
                caster.battleLogic.heal(hp);
                taker.rebirth(false)

                if (effectParam.buff) {
                    for (let j = 0; j < effectParam.buff.length; j++)
                        caster.battleLogic.buffMgr.buffControlByGroup(effectParam.buff[j], caster, taker, behavior)
                }
            }
        }
    }

    /**治疗固定值 */
    protected healValue(behavior: SkillBehavior, effectParam: { amount: number, buffId?: string[], healType?: number }, caster: ICaster, takers: BattleUnit[]) {
        for (let i = 0, len = takers.length; i < len; i++) {
            let taker = takers[i];
            if (taker.attr.isAlive()) {
                behavior.showSkillEffect(taker)
                let skillAmount: number = effectParam.amount;
                let hp = FightFormula.heal(behavior, caster, taker, skillAmount / BattleConstantConfig.getRandBase, false)
                if (effectParam.healType)
                    hp.healType = effectParam.healType
                hp.value = skillAmount;
                caster.battleLogic.heal(hp);

                if (effectParam.buffId) {
                    for (let j = 0; j < effectParam.buffId.length; j++)
                        caster.battleLogic.buffMgr.buffControlByGroup(effectParam.buffId[j], caster, taker, behavior)
                }
            }
        }
    }

    /**治疗 */
    protected heal(behavior: SkillBehavior, effectParam: { camp?: number, campValue?: number, amount: number, buff?: string[], healType: number }, caster: ICaster, takers: BattleUnit[]) {
        for (let i = 0, len = takers.length; i < len; i++) {
            let taker = takers[i];
            if (taker.attr.isAlive()) {
                behavior.showSkillEffect(taker)
                let skillAmount: number = effectParam.amount;
                if (effectParam.camp) {
                    //阵营治疗加成
                    if (taker instanceof HeroUnit && taker.camp == +effectParam.camp) {
                        skillAmount += +effectParam.campValue;
                    }
                }
                let hp = FightFormula.heal(behavior, caster, taker, skillAmount / BattleConstantConfig.getRandBase, true)
                if (effectParam.healType)
                    hp.healType = effectParam.healType
                caster.battleLogic.heal(hp);

                if (effectParam.buff) {
                    for (let j = 0; j < effectParam.buff.length; j++)
                        caster.battleLogic.buffMgr.buffControlByGroup(effectParam.buff[j], caster, taker, behavior)
                }
            }
        }
    }

    /***队长技补血 */
    protected teamHealMax(behavior: SkillBehavior, effectParam: { amount: number, buff: string[], healType: number }, caster: ICaster, takers: BattleUnit[]): void {
        for (let i = 0, len = takers.length; i < len; i++) {
            let taker = takers[i];
            if (taker.attr.isAlive()) {
                let hp = FightFormula.teamHealMax(behavior, caster, taker, behavior.damageValue);
                if (effectParam.healType)
                    hp.healType = effectParam.healType
                caster.battleLogic.heal(hp);
                behavior.showSkillEffect(taker)
                if (effectParam.buff) {
                    for (let j = 0; j < effectParam.buff.length; j++)
                        caster.battleLogic.buffMgr.buffControlByGroup(effectParam.buff[j], caster, taker, behavior)
                }
            }
        }
    }

    /**按当前血量百分比治疗 */
    protected healNowHp(behavior: SkillBehavior, effectParam: { amount: number, healType: number, buff: string }, caster: ICaster, takers: BattleUnit[]) {
        for (let i = 0, len = takers.length; i < len; i++) {
            let taker = takers[i];
            if (taker.attr.isAlive()) {
                behavior.showSkillEffect(taker)
                let skillAmount: number = Math.ceil(taker.attr.hp * effectParam.amount / BattleConstantConfig.getRandBase);
                let hp = FightFormula.heal(behavior, caster, taker, skillAmount, false)
                if (effectParam.healType)
                    hp.healType = effectParam.healType
                caster.battleLogic.heal(hp);


                if (effectParam.buff) {
                    for (let j = 0; j < effectParam.buff.length; j++)
                        caster.battleLogic.buffMgr.buffControlByGroup(effectParam.buff[j], caster, taker, behavior)
                }
            }
        }
    }

    /**按当前已损失的百分比治疗 */
    protected healCurHp(behavior: SkillBehavior, effectParam: { amount: number, healType: number, buff: string }, caster: ICaster, takers: BattleUnit[]) {
        for (let i = 0, len = takers.length; i < len; i++) {
            let taker = takers[i];
            if (taker.attr.isAlive()) {
                behavior.showSkillEffect(taker)
                let skillAmount: number = Math.ceil((taker.attr.maxHp - taker.attr.hp) * effectParam.amount / BattleConstantConfig.getRandBase);
                let hp = FightFormula.heal(behavior, caster, taker, skillAmount, false)
                if (effectParam.healType)
                    hp.healType = effectParam.healType
                caster.battleLogic.heal(hp);


                if (effectParam.buff) {
                    for (let j = 0; j < effectParam.buff.length; j++)
                        caster.battleLogic.buffMgr.buffControlByGroup(effectParam.buff[j], caster, taker, behavior)
                }
            }
        }
    }

    /**按最大值恢复血量 */
    protected healMaxHp(behavior: SkillBehavior, effectParam: { amount: number, healType: number, buff: string }, caster: ICaster, takers: BattleUnit[]) {
        for (let i = 0, len = takers.length; i < len; i++) {
            let taker = takers[i];
            if (taker.attr.isAlive()) {
                behavior.showSkillEffect(taker)
                let skillAmount: number = Math.ceil(taker.attr.maxHp * effectParam.amount / BattleConstantConfig.getRandBase);
                let hp = FightFormula.heal(behavior, caster, taker, skillAmount, false)
                if (effectParam.healType)
                    hp.healType = effectParam.healType
                caster.battleLogic.heal(hp);

                if (effectParam.buff) {
                    for (let j = 0; j < effectParam.buff.length; j++)
                        caster.battleLogic.buffMgr.buffControlByGroup(effectParam.buff[j], caster, taker, behavior)
                }
            }
        }
    }

    /**发射子弹组 */
    protected missileGroup(behavior: SkillBehavior, effectParam: { group: string, fix?: number, fiy?: number, notAtkPoint?: number, notHurtPoint?: number }, caster: ICaster, takers: ITarget[] | ITarget) {
        caster.battleLogic.gunGroupMgr.create(behavior, effectParam, caster)
    }

    /**发射子弹 */
    public missile(behavior: SkillBehavior, effectParam: { missileId: string, fix?: number, fiy?: number, exData?: any, notAtkPoint?: number, staticPos?: { x: number, y: number } }, caster: ICaster, takers: ITarget[] | ITarget) {
        if (!caster || !caster.caster?.isActive) {
            return
        }

        takers = takers instanceof Array ? takers : [takers];
        for (let i = 0; i < takers.length; i++) {
            this.missileHandler(behavior, effectParam, caster, takers[i])
            if (behavior.skill) {
                let doubleMissileDatas: { interval: number, num: number }[] = caster.battleLogic.buffMgr.getDoubleMissile(caster, behavior.skill.skillIndex);
                if (doubleMissileDatas) {
                    for (let j = 0; j < doubleMissileDatas.length; j++) {
                        this.skill.battleLogic.createTimeCheck(doubleMissileDatas[j].interval, Handler.create(this, this.missileHandler, [behavior, effectParam, caster, takers[i]], false), doubleMissileDatas[j].num)
                    }
                }
            }
        }
    }

    protected missileHandler(behavior: SkillBehavior, effectParam: { missileId: string, notHurtPoint?: number, notAtkPoint?: number, fix?: number, fiy?: number, exData?: any, staticPos?: { x: number, y: number } }, caster: ICaster, taker: ITarget): BulletUnit {
        let fighter = caster.battleLogic.getBatteUintByUid(caster.casterUid)
        let unit = BulletFactory.createBulletUnit(effectParam.missileId, caster.teamId, taker.teamId, caster.fightType, fighter);

        if (!unit) return;

        if (!effectParam.notHurtPoint && !taker.hurtPoint)
            return;

        unit.exData = effectParam.exData;
        unit.casterUid = caster.casterUid;
        unit.targetUid = taker.uid;
        unit.behavior = behavior;
        unit.skill = behavior.skill;
        let atkPos: Vec2
        if (effectParam.staticPos) {
            atkPos = v2(effectParam.staticPos.x + (+effectParam.fix || 0), effectParam.staticPos.y + (+effectParam.fiy || 0))
        }
        else
            atkPos = effectParam.notAtkPoint ? v2(caster.pos.x + (+effectParam.fix || 0), caster.pos.y + (+effectParam.fiy || 0)) : v2(caster.atkPoint.x + (+effectParam.fix || 0), caster.atkPoint.y + (+effectParam.fiy || 0));
        unit.initParam(behavior.atk, effectParam.notHurtPoint ? taker.pos : taker.hurtPoint, atkPos, caster, taker);
        caster.battleLogic.unitProcessor.addBullet(unit);
        if (caster instanceof BattleUnit) {
            PassivitySkillUtils.updatePassSkillFunction(caster, PassivitySkillType.ConType_16, "setMissileNum", 1, effectParam.missileId);
            if (taker instanceof BattleUnit)
                PassivitySkillUtils.checkPassSkillCon(PassivitySkillType.ConType_16, caster, taker as any);
            else
                PassivitySkillUtils.checkPassSkillCon(PassivitySkillType.ConType_16, caster, caster);
            PassivitySkillUtils.checkLeaderSkillCon(LeaderSkillTriggerType.Bullet, caster.teamId, caster, caster, 1)
        }

        return unit
    }

    protected randomBuff(behavior: SkillBehavior, effectParam: { buff: string[], num: number }, caster: ICaster, takers: BattleUnit[]) {
        let buffIds = caster.battleLogic.randomMgr.randomAry(effectParam.buff)
        let num = effectParam.num || 1;
        for (let i = 0; i < num; i++) {
            this.addBuff(behavior, { buffId: buffIds[i] }, caster, takers);
        }
    }


    /**行为产生buff */
    protected addBuff(behavior: SkillBehavior, effectParam: { buffId: string, delay?: number }, caster: ICaster, takers: BattleUnit[]) {
        for (let i = 0; i < takers.length; i++) {//特效先添加，BUFF效果再生效
            behavior.showSkillEffect(takers[i])
        }
        if (effectParam.delay)
            this.skill.battleLogic.createTimeCheck(effectParam.delay, Handler.create(this, this.addBuffHandler, [behavior, effectParam, caster, takers]))
        else
            this.addBuffHandler(behavior, effectParam, caster, takers);
    }

    private addBuffHandler(behavior: SkillBehavior, effectParam: { buffId: string }, caster: ICaster, takers: BattleUnit[]): void {
        for (let i = 0; i < takers.length; i++) {
            caster.battleLogic.buffMgr.buffControlByGroup(effectParam.buffId, caster, takers[i], behavior)
        }
    }

    private jumpTimerCheckArr: FightTimeCheck[] = []
    /***跳跃 */
    protected jump(behavior: SkillBehavior, effectParam: { behavior: string, time: number, delay: number, height: number }, caster: ICaster, takers: BattleUnit[]): void {
        let targetPoint = takers?.[0]?.pos
        let fightTimeCheck = BehaviorUtils.jump(targetPoint.x, targetPoint.y, effectParam.height, effectParam.time, effectParam.delay, caster as BattleUnit, new Handler(this, () => {
            this.onNewBehaviorHandler(effectParam.behavior, behavior, caster, behavior.skill)
        }));

        if (fightTimeCheck) {
            this.jumpTimerCheckArr.push(fightTimeCheck)
        }
    }

    protected createMonster(behavior: SkillBehavior, effectParam: { id: number, x: number, y: number, num?: number, randomFix?: number, isMapPoint?: number, time?: number, attr?: number, attrAmount?: number, delay?: number, isSplitMonster?: number },
        caster: BattleUnit, takers: BattleUnit[], exData?: any): void {
        this.summon(behavior, effectParam, caster, takers, exData, true)
    }

    /**
     * 在释放者附近（X,Y偏移）召唤 1只怪
     * 
     *  */
    protected summon(behavior: SkillBehavior,
        effectParam: { id: number, x: number, y: number, num?: number, randomFix?: number, minRandomFix?: number, isMapPoint?: number, time?: number, attr?: number, attrAmount?: number, delay?: number, isSplitMonster?: number },
        caster: BattleUnit, takers: BattleUnit[], exData?: any, notSumm: boolean = false) {
        if (caster?.isDeath)
            return

        let num = effectParam.num || 1;
        let randomFix = effectParam.randomFix || 0;
        let minRandomFix = effectParam.minRandomFix || 0;
        for (let i = 0; i < num; i++) {
            let x = +effectParam.x || 0;
            let y = +effectParam.y || 0;
            if (randomFix != 0) {

                let v2c = MathUtils.getRandomPointInCircle(randomFix, x, y, minRandomFix, caster.battleLogic.randomMgr.seedRandom())
                x = v2c.x;
                y = v2c.y;
                // x += caster.battleLogic.randomMgr.randomInt(-randomFix, randomFix) + minRandomFix;
                // y += caster.battleLogic.randomMgr.randomInt(-randomFix, randomFix) + minRandomFix;
            }

            //计算继承属性
            let attr = null;
            let fighter = caster.battleLogic.getBatteUintByUid(caster.casterUid)
            if (!fighter)
                return

            if (effectParam.attr && fighter.isActive) {
                attr = {}
                for (let key in effectParam) {
                    let cfg = TableManager.getDataById(table.battle.AttributeConfig, key)
                    if (cfg) {
                        if (effectParam.attr == 1) {
                            attr[cfg.tid] = Math.ceil(fighter.getAttrValue(cfg.tid) * +effectParam[key] / BattleConstantConfig.getRandBase)
                        }
                        else if (effectParam.attr == 2) {
                            attr[cfg.tid] = Math.ceil(fighter.getAttrValueNoBuff(cfg.tid) * +effectParam[key] / BattleConstantConfig.getRandBase)
                        }
                    }
                }
            }
            else if (effectParam.attrAmount && fighter.isActive) {
                attr = fighter.getNowAllAttr(effectParam.attrAmount)
            }

            let summonData: ISummonData = null;
            // if (!notSumm) {
            summonData = {
                isSummon: !notSumm,
                time: effectParam.time,
                attr: attr,
                byUid: fighter.casterUid,
                delay: effectParam.delay,
                isSplitMonster: effectParam.isSplitMonster == 1 ? true : false,
                exData: exData,
                effect: behavior.cfg.modelId ? { modelIds: behavior.cfg.modelId, animPosType: behavior.cfg.animPosType } : null
                // }
            }

            if (effectParam.isSplitMonster) {
                caster.caster.addSplitMonsterNum(1)
            }

            if (effectParam.isMapPoint == 1) {
                //地图坐标
                caster.battleLogic.createMonster(effectParam.id, x, y, caster.teamId, fighter.dirction, 1, summonData);
            }
            else {
                if (caster.dirction == DirctionType.Left) {
                    caster.battleLogic.createMonster(effectParam.id, caster.pos.x + x, caster.pos.y + y, caster.teamId, fighter.dirction, 1, summonData);
                }
                else {
                    caster.battleLogic.createMonster(effectParam.id, caster.pos.x - x, caster.pos.y + y, caster.teamId, fighter.dirction, 1, summonData);
                }
            }
        }
    }

    /**蓄力 */
    protected charged(behavior: SkillBehavior, effectParam: any, caster: BattleUnit, takers: BattleUnit[]) {
        caster.beginCharge(behavior)
    }

    /**冲撞 */
    protected collision(behavior: SkillBehavior, effectParam: { time: number, dis: number, isTargetPos: number, amount: number, behavior: string }, caster: BattleUnit, target: PointTarget) {
        let angle = MathUtils.angle(caster.pos, target.pos);
        if (!effectParam.isTargetPos) {
            let p = MathUtils.getCoordinates(angle, effectParam.dis)
            p.x += caster.pos.x;
            p.y += caster.pos.y;
            caster.beginCollision(effectParam.dis / effectParam.time, p as Vec2, effectParam);
        }
        else {
            caster.beginCollision(caster.attr.moveSpeed * 2, v2(target.pos.x + caster.battleLogic.randomMgr.randomInt(-20, 20), target.pos.y + caster.battleLogic.randomMgr.randomInt(-20, 20)), effectParam);
        }
    }

    /**添加被动技能标记 */
    protected addPassivity(behavior: SkillBehavior, effectParam: { flag: string }, caster: BattleUnit, takers: BattleUnit[]) {
        for (let i = 0; i < takers.length; i++) {
            takers[i].attr.addPassiveSkillFlag(effectParam.flag, behavior)
        }
    }

    protected addHalo(behavior: SkillBehavior, effectParam: { buffId: string[] }, caster: BattleUnit, takers: BattleUnit[]): void {
        for (let i = 0; i < takers.length; i++) {
            for (let j = 0; j < effectParam.buffId.length; j++) {
                caster.battleLogic.haloMgr.addHalo(effectParam.buffId[j], caster, takers[i], behavior)
            }
        }
    }

    /**添加被动技能 */
    protected pushPassivity(behavior: SkillBehavior, effectParam: { skill: string }, caster: BattleUnit, takers: BattleUnit[]) {
        for (let i = 0; i < takers.length; i++) {
            takers[i].attr.addOtherPassiveSkill(effectParam.skill)
        }
    }

    /**释放主动技能 */
    protected activeSkill(behavior: SkillBehavior, effectParam: { skill: string, skillId?: string, exSkillId?: string, exSkillOdId?: string }, caster: BattleUnit) {
        var acitvaSkillIndex: string = effectParam.skill
        if (acitvaSkillIndex)
            caster.usePassActiveSkillSkill(acitvaSkillIndex)

        var acitvaSkillId: string = effectParam.skillId
        if (acitvaSkillId)
            caster.usePassActiveSkillSkill(acitvaSkillId, [0, 1])

        var acitvaExSkillId: string = effectParam.exSkillId
        if (acitvaExSkillId)
            caster.usePassActiveSkillSkill(acitvaExSkillId, [0, 1, effectParam.exSkillOdId])
    }

    /***技能动作播放完毕 */
    public skillCompleteHandler(): void {
        for (let i = 0; i < this.jumpTimerCheckArr.length; i++) {
            this.jumpTimerCheckArr[i].isReadyToRemove = true;
        }
        this.jumpTimerCheckArr.length = 0;
    }

    /***光环执行伤害前 */
    public haloHandlerBeforce(halo: SkillHalo): void {

    }

    /***光环执行伤害后 */
    public haloHandlerAfter(damageVo: DamageVo): void {

    }

    /***buff执行前 */
    public buffBeforce(buff: SkillBuff): void {
        if (buff.caster instanceof BattleUnit) {
            buff.caster.buffBeforce(buff)
        }
    }

    /***buff执行后 */
    public buffAfter(buff: SkillBuff): void {
        if (buff.caster instanceof BattleUnit) {
            buff.caster.buffAfter(buff)
        }
    }

    /***buff执行伤害后 */
    public buffHurtAfter(damageVo: DamageVo): void {

    }

    /***buff执行某行为后 */
    public buffAfterExData(buff: SkillBuff, data: any): void {

    }

    /***目标收到伤害后回调被攻击者 */
    public onTargetHurt(damageVo?: DamageVo): void {
    }

    /**技能重置，如脱战 */
    public resetSkill(): void {

    }

    /**检查BUFF是否能被触发，要看对应BUFF有无接入，不一定有 */
    public checkBuffCanActive(skillBuff: SkillBuff): boolean {
        return true
    }
}
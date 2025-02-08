import { BattleUnit } from "../unit/battle/BattleUnit";
import { SkillData } from "./SkillData";
import { MathUtils } from "../../../../core/utils/MathUtils";
import BattleConstantConfig from "../config/BattleConstantConfig";
import { BehaviorRangeType, SearchType, SkillTargetType, TargetFaction } from "./SkillEnum";
import { SkillBehavior } from "./SkillBehavior";
import UnitSearchUtils from "../collisions/UnitSearchUtils";
import { ICaster } from "./ICaster";
import { SortUtils } from "../../../../core/utils/SortUtils";
import { ITarget } from "./ITarget";
import { Vec2 } from "cc";
import { PointTarget } from "./PointTarget";
import { PoolManager } from "../../../../core/pool/PoolManager";
import { DamageVo } from "../DamageVo";
import ArrayUtils from "../../../../core/utils/ArrayUtils";
import { BattleDebugManager } from "../BattleDebugManager";
import { OtherSkillUnit } from "../unit/other/OtherSkillUnit";
import { BulletUnit } from "../unit/bullet/BulletUnit";
import { MonsterType, UnitType } from "../enum/BattleEnum";
import { BattleLogic } from "../BattleLogic";
import ObjectUtils from "../../../../core/utils/ObjectUtils";
import { MonsterUnit } from "../unit/battle/MonsterUnit";


export class SkillUtils {

    /**对敌方队伍Id */
    static emenyTeamMap = { 1: 2, 2: 1 };

    /**获取目标队伍Id */
    static getTeamIdByFaction(teamId: number, targetFaction: number) {
        switch (targetFaction) {
            case TargetFaction.EnemySide:
                return this.emenyTeamMap[teamId];
            case TargetFaction.OurSide:
                return teamId;
            case TargetFaction.Both:
                return TargetFaction.Both
            default:
                return this.emenyTeamMap[teamId]; //这里是敌方，并未处理双方情况（不了解什么情况下会用到双方）
        }
    }

    /**检索主目标 */
    static searchTarget(skill: SkillData, caster: BattleUnit): ITarget {
        let param: { heroFirst?: number, notSelf?: number, noRepeat?: number } = skill.cfg.targetParam;

        let units: BattleUnit[];
        let searchRange = caster.searchRange()
        let targetFaction = skill.cfg.targetFaction;
        let isCharm = caster.battleLogic.buffMgr.checkIsCharm(caster);

        if (isCharm) {
            //魅惑中，假如目标是敌人，则改成队友
            if (targetFaction == TargetFaction.EnemySide) {
                targetFaction = TargetFaction.OurSide;
                if (!param)
                    param = {}
                else {
                    param = ObjectUtils.copy(param)
                }
                param.notSelf = 1;
            }
        }
        let targetTeamId = this.getTeamIdByFaction(caster.teamId, targetFaction);
        switch (skill.searchType) {
            case SearchType.MainTarget:
                {
                    if (isCharm) {
                        let targets = UnitSearchUtils.getUnitsByCircle(caster, targetTeamId, searchRange);
                        units = this.behaviorFilterNearsetOrFarthest(SkillTargetType.Nearset, caster, targets, param?.heroFirst);
                        break
                    }
                    else {
                        if (caster.selectMainTarget)
                            return caster.selectMainTarget;
                        else if (caster.selectHatredTarget)
                            return caster.selectHatredTarget;
                        else
                            return UnitSearchUtils.getNearestBattleUnit(caster, targetTeamId, searchRange);
                    }
                }
            case SearchType.Now:
                return caster;
            case SearchType.Random:
                {
                    let targets = UnitSearchUtils.getUnitsByCircle(caster, targetTeamId, searchRange);
                    if (targets.length == 0)
                        return null;
                    units = this.behaviorFilterRandom(caster, targets, param?.heroFirst)
                    break
                }
            case SearchType.Nearset:
            case SearchType.NearsetPoint:
                {
                    if (skill.searchType == SearchType.NearsetPoint) {
                        let target: ITarget = UnitSearchUtils.getNearestBattleUnit(caster, targetTeamId, searchRange);
                        if (!target)
                            return null;
                        let pointTarget = new PointTarget(caster.battleLogic)
                        pointTarget.setPoint(target.pos.x, target.pos.y);
                        pointTarget.teamId = target.teamId;
                        return pointTarget;
                    }
                    else {
                        let targets = UnitSearchUtils.getUnitsByCircle(caster, targetTeamId, searchRange);
                        units = this.behaviorFilterNearsetOrFarthest(SkillTargetType.Nearset, caster, targets, param?.heroFirst);
                    }
                    break
                }
            case SearchType.Farthest:
                {
                    let targets = UnitSearchUtils.getUnitsByCircle(caster, targetTeamId, searchRange);
                    units = this.behaviorFilterNearsetOrFarthest(SkillTargetType.Farthest, caster, targets, param?.heroFirst);
                    break
                }
            case SearchType.Hp_Most:
                {
                    let targets = UnitSearchUtils.getUnitsByCircle(caster, targetTeamId, searchRange);
                    if (targets)
                        units = SortUtils.sortBy2(targets, ["hpPercen"], [false], false)
                    break;
                }
            case SearchType.HpMax_Most:
                {
                    let targets = UnitSearchUtils.getUnitsByCircle(caster, targetTeamId, searchRange);
                    if (targets)
                        units = SortUtils.sortBy2(targets, ["maxHp"], [false], false)
                    break;
                }
            case SearchType.Hp_Lowest:
                {
                    let targets = UnitSearchUtils.getUnitsByCircle(caster, targetTeamId, searchRange);
                    if (targets)
                        units = SortUtils.sortBy2(targets, ["hpPercen"], [true], false)
                    break;
                }
            case SearchType.Def_Most:
                {
                    let targets = UnitSearchUtils.getUnitsByCircle(caster, targetTeamId, searchRange);
                    if (targets)
                        units = SortUtils.sortBy2(targets, ["def"], [false], false)
                    break;
                }
            case SearchType.Atk_Most:
                {
                    let targets = UnitSearchUtils.getUnitsByCircle(caster, targetTeamId, searchRange);
                    if (targets)
                        units = SortUtils.sortBy2(targets, ["atk"], [false], false)
                    break;
                }
            case SearchType.Atk_Init_Most:
                {
                    let targets = UnitSearchUtils.getUnitsByCircle(caster, targetTeamId, searchRange);
                    if (targets)
                        units = SortUtils.sortBy2(targets, ["atkInit"], [false], false)
                    break;
                }
            case SearchType.MOST_DENSE:
                {
                    let targets = UnitSearchUtils.getUnitsByCircle(caster, targetTeamId, searchRange);
                    if (targets.length == 0)
                        return null;
                    let target = UnitSearchUtils.getMostDenseTarget(targets, skill.cfg.targetParam?.radius || 150)
                    return target;
                }
            case SearchType.MOST_DENSE_AREA:
                {
                    let targets = UnitSearchUtils.getUnitsByCircle(caster, targetTeamId, searchRange);
                    if (targets.length == 0)
                        return null;
                    let p = UnitSearchUtils.getMostDenseArea(targets, skill.cfg.targetParam?.radius || 150)
                    let pointTarget = new PointTarget(caster.battleLogic)
                    pointTarget.teamId = targetTeamId;
                    pointTarget.setPoint(p.x, p.y);
                    return pointTarget;
                }
            case SearchType.MOST_DENSE_AREA_ARC:
                {
                    let p = UnitSearchUtils.getMostDenseArcArea(caster.battleLogic.unitCollisionsManager, targetTeamId, skill.cfg.atkPoint ? caster.atkPoint as Vec2 : caster.pos, skill.cfg.targetParam?.radius || 150, skill.cfg.targetParam?.angle || 90);
                    let pointTarget = new PointTarget(caster.battleLogic)
                    pointTarget.teamId = targetTeamId;
                    pointTarget.setPoint(p.x, p.y);
                    return pointTarget;
                }
            case SearchType.MOST_DENSE_ARC:
                {
                    let p = UnitSearchUtils.getMostDenseArcTarget(caster.battleLogic.unitCollisionsManager, targetTeamId, caster, skill.cfg.targetParam?.radius || 150, skill.cfg.targetParam?.angle || 90);
                    if (!p) {
                        return null;
                    }
                    let pointTarget = new PointTarget(caster.battleLogic)
                    pointTarget.teamId = targetTeamId;
                    pointTarget.setPoint(p.x, p.y);
                    return pointTarget;
                }
            case SearchType.MOST_DENSE_AREA_RECT_ANGLE:
                {
                    let p: { x: number, y: number, angle: number } = UnitSearchUtils.getMostDenseRectArea(caster.battleLogic.unitCollisionsManager, targetTeamId, skill.cfg.atkPoint ? caster.atkPoint as Vec2 : caster.pos,
                        skill.cfg.targetParam?.width || 150, skill.cfg.targetParam?.height || 150, skill.cfg.targetParam?.radius || 150);
                    let pointTarget = new PointTarget(caster.battleLogic)
                    pointTarget.teamId = targetTeamId;
                    pointTarget.angle = p.angle;
                    pointTarget.isMoveToPoint = true;
                    pointTarget.setPoint(p.x, p.y);
                    return pointTarget;
                }
            case SearchType.Die:
                return this.getDieUnit(caster, this.getTeamIdByFaction(caster.teamId, targetFaction), searchRange);
            case SearchType.Summon:
                let target = UnitSearchUtils.getSummonUnitByCircle(caster, this.getTeamIdByFaction(caster.teamId, targetFaction), searchRange, skill.cfg.targetParam.summon);
                if (!target) {
                    if (caster.selectHatredTarget)
                        return caster.selectHatredTarget;
                    else
                        return UnitSearchUtils.getNearestBattleUnit(caster, this.getTeamIdByFaction(caster.teamId, targetFaction), searchRange);
                }
                return target
            case SearchType.Foremost:
                {
                    let targets = UnitSearchUtils.getUnitsByCircle(caster, targetTeamId, searchRange);
                    if (targets)
                        units = SortUtils.sortBy2(targets, ["formationSort"], [true], false)
                    break;
                }
        }

        if (units && param)
            this.filterTargets(param as any, units, caster, null, skill.skillId);

        if (units?.length)
            return units[0];

        return null;
    }

    static filterTargets(param: {
        rate: number, career: number, sex: string, onlySummon: number, hero: number, heros: number[], attackRange: string, heroFirst: number,
        notSelf: number, notFirstSelf: number, notSummon: number, notHeros: number[], notPet: number, notFirstBuffGroup: string, notSelectTarget: number,
        notMove: number, triggerScenes: number[], monsterType: string, noRepeat: number,
    }, units: BattleUnit[], caster: ICaster, selectTarget?: ITarget, skillId?: string): void {

        if (param?.noRepeat && skillId) {
            //优先短时间内不重复
            for (let i = 0; i < units.length; i++) {
                let b = caster.battleLogic.checkNoRepeatSearchTargetMap(caster.casterUid, units[i].uid, skillId, param.noRepeat);
                if (units.length > 1 && !b) {
                    units.splice(i, 1)
                    i--;
                }
                else {
                    break;
                }
            }
        }

        if (param.career) {
            //需要为某职业
            for (let i = 0; i < units.length; i++) {
                if (units[i].career != param.career) {
                    units.splice(i, 1)
                    i--;
                }
            }
        }

        if (param.notMove) {
            //过滤没在移动的单位
            for (let i = 0; i < units.length; i++) {
                if (!units[i].isMoveing) {
                    units.splice(i, 1)
                    i--;
                }
            }
        }

        if (param.triggerScenes) {
            //触发的场景
            for (let i = 0; i < units.length; i++) {
                if (param.triggerScenes.indexOf(caster.battleLogic.fightType) == -1) {
                    units.splice(i, 1)
                    i--;
                }
            }
        }

        if (param.notSelf) {
            //不包含自己
            for (let i = 0; i < units.length; i++) {
                if (units[i].uid == caster.casterUid) {
                    units.splice(i, 1)
                    i--;
                }
            }
        }

        if (param.notSelectTarget && selectTarget) {
            //非选中的目标
            for (let i = 0; i < units.length; i++) {
                if (units[i].uid == selectTarget.uid) {
                    units.splice(i, 1)
                    i--;
                }
            }
        }

        if (param.notFirstSelf) {
            //自身不优先
            for (let i = 0; i < units.length; i++) {
                if (units.length > 1 && units[i].uid == caster.casterUid) {
                    units.splice(i, 1)
                    i--;
                }
            }
        }

        if (param.notFirstBuffGroup) {
            //BUFF自身不优先
            for (let i = 0; i < units.length; i++) {
                if (units.length > 1 && units[i].attr.hasBuffGroup(param.notFirstBuffGroup)) {
                    units.splice(i, 1)
                    i--;
                }
            }
        }

        if (param.notSummon) {
            //非召唤物
            for (let i = 0; i < units.length; i++) {
                if (units[i].summon) {
                    units.splice(i, 1)
                    i--;
                }
            }
        }

        if (param.notPet) {
            //非宠物
            for (let i = 0; i < units.length; i++) {
                if (units[i].type == UnitType.Pet) {
                    units.splice(i, 1)
                    i--;
                }
            }
        }

        if (param.sex) {
            //按性别
            for (let i = 0; i < units.length; i++) {
                if (!units[i].sex || units[i].sex != param.sex) {
                    units.splice(i, 1)
                    i--;
                }
            }
        }

        if (param.onlySummon) {
            //只能是召唤物
            for (let i = 0; i < units.length; i++) {
                if (param.onlySummon == 1 && !units[i].summon) {
                    units.splice(i, 1)
                    i--;
                }
            }
        }

        if (param.hero) {
            //配置ID
            for (let i = 0; i < units.length; i++) {
                if (param.hero && units[i].attr.getConfigId() != param.hero) {
                    units.splice(i, 1)
                    i--;
                }
            }
        }

        if (param.heros) {
            //配置ID
            for (let i = 0; i < units.length; i++) {
                if (param.heros?.length > 0 && param.heros.indexOf(units[i].attr.getConfigId()) == -1) {
                    units.splice(i, 1)
                    i--;
                }
            }
        }

        if (param.notHeros) {
            //不能包含某个配置ID
            for (let i = 0; i < units.length; i++) {
                if (param.notHeros && param.notHeros.indexOf(units[i].attr.getConfigId()) != -1) {
                    units.splice(i, 1)
                    i--;
                }
            }
        }

        if (param.attackRange) {
            //攻击范围
            for (let i = 0; i < units.length; i++) {
                if (units[i].getAttackRange() != param.attackRange) {
                    units.splice(i, 1)
                    i--;
                }
            }
        }

        if (param.monsterType) {
            //怪物类型
            for (let i = 0; i < units.length; i++) {
                let u: MonsterUnit = units[i] as MonsterUnit;
                if (param.monsterType != u.monsterType) {
                    units.splice(i, 1)
                    i--;
                }
            }
        }
    }

    /**找到范围内已死亡的单位 */
    static getDieUnit(caster: BattleUnit, teamId: number, radius: number): BattleUnit {
        let units = caster.battleLogic.unitProcessor.getUnitsByTeamId(teamId)
        if (units.length == 0)
            return null
        for (let i = 0; i < units.length; i++) {
            if (!units[i].isActive && units[i].canSelect() && !units[i].summon && units[i].type != UnitType.Pet && units[i].attr.canReviveBySkill()) {
                let dis = MathUtils.distance(caster.pos, units[i].pos)
                if (dis <= radius)
                    return units[i]
            }
        }
        return null
    }

    /**技能目标 */
    static skillTarget(targetType: number, targetFaction: number, caster: ICaster, searchTarget: BattleUnit, range: number = 0, num: number = 1, targetParam?: any): BattleUnit[] {

        if (num == 0)
            num = 999999;

        switch (targetType) {
            case SkillTargetType.SEARCH_TARGET:
                return [searchTarget];
            case SkillTargetType.SELF:
                if (caster instanceof BattleUnit)
                    return [caster];
                else
                    return null
            default:
                {
                    let targetTeamId = this.getTeamIdByFaction(caster.teamId, targetFaction);
                    let targets = UnitSearchUtils.getUnitsByCircle(caster, targetTeamId, range);
                    if (targets.length == 0)
                        return null;
                    return this.behaviorFilterTargertsByTargetType(caster, targets, targetType, targetParam, num, searchTarget);
                }
        }
    }

    /**行为单位过滤 */
    static behaviorFilterTargertsByTargetType(caster: ICaster, targets: BattleUnit[], targetType: SkillTargetType, targetParam: any, num: number = 1, searchTarget?: ITarget, isCharm: boolean = false): BattleUnit[] {
        num = num == 0 ? 999999 : num;
        if (!caster) return [];
        if (!targets?.length) return [];
        let units: BattleUnit[];

        let param: {
            rate: number, career: number, sex: string, onlySummon: number, hero: number, heros: number[], attackRange: string, heroFirst: number,
            notSelf: number, notSummon: number, notHeros: number[], notPet: number
        } = targetParam;

        if (isCharm) {
            if (!param)
                param = {} as any
            param.notSelf = 1;
        }

        switch (targetType) {
            case SkillTargetType.SEARCH_TARGET:
                if (targets?.length && searchTarget?.unit) {
                    let searchTargetIndex = targets.indexOf(searchTarget.unit)
                    if (searchTargetIndex != -1) {
                        targets.splice(searchTargetIndex, 1)
                        targets.unshift(searchTarget.unit)
                    }
                }
                units = targets;//targets.slice(0, num);
                break
            case SkillTargetType.Random:
                units = this.behaviorFilterRandom(caster, targets, param?.heroFirst);
                break
            case SkillTargetType.SELF:
                units = [caster as BattleUnit];
                break
            case SkillTargetType.Nearset:
            case SkillTargetType.Farthest:
                units = this.behaviorFilterNearsetOrFarthest(targetType, caster, targets, param?.heroFirst);
                break
            case SkillTargetType.LOWEST_HP:
                units = this.behaviorFilterLowestHp(caster, targets, param);
                break
            case SkillTargetType.MOST_HP:
                units = this.behaviorFilterLowestHp(caster, targets, param, false);
                break
            case SkillTargetType.Atk_Most:
                {
                    units = this.behaviorFilterMostAtk(targets, param?.heroFirst)
                    break
                }
            case SkillTargetType.Def_Most:
                {
                    units = this.behaviorFilterMostDef(targets, param?.heroFirst)
                    break
                }
            case SkillTargetType.Summon:
                {
                    units = []
                    for (let i = 0; i < targets.length; i++) {
                        if (targets[i].summon) {
                            if (num > units.length)
                                units.push(targets[i])
                            else {
                                break
                            }
                        }
                    }
                    break
                }
        }


        if (units && param) {
            this.filterTargets(param as any, units, caster, searchTarget)
        }

        if (units)
            return units.slice(0, num);
        return null
    }

    /***随机目标 */
    private static behaviorFilterRandom(caster: ICaster, targets: BattleUnit[], heroFirst: number = 0): BattleUnit[] {
        if (!targets)
            return null
        let units: BattleUnit[];
        if (heroFirst) {
            let summons: BattleUnit[] = [];
            let notSummons: BattleUnit[] = [];
            for (let i = 0; i < targets.length; i++) {
                if (targets[i].isSummon)
                    summons.push(targets[i])
                else
                    notSummons.push(targets[i])
            }
            notSummons = caster.battleLogic.randomMgr.randomAry(notSummons)
            summons = caster.battleLogic.randomMgr.randomAry(summons)
            units = notSummons.concat(summons)
        }
        else
            units = caster.battleLogic.randomMgr.randomAry(targets)

        return units
    }

    /***最远或者最近 */
    public static behaviorFilterNearsetOrFarthest(targetType: SkillTargetType, caster: ICaster, targets: BattleUnit[], heroFirst: number = 0): BattleUnit[] {
        let units: BattleUnit[];
        if (!targets)
            return null

        for (let i = 0; i < targets.length; i++) {
            if (targets[i] && caster) {
                let dis: number = Vec2.distance(targets[i].pos, caster.pos)
                targets[i]["findLatelyEntity_dis"] = dis;
            }
        }
        if (targetType == SkillTargetType.Nearset) {
            if (heroFirst) {
                //优先选择英雄
                targets = SortUtils.sortBy2(targets, ["isSummon", "findLatelyEntity_dis"], [true, true], false)
            }
            else {
                targets = SortUtils.sortBy2(targets, ["findLatelyEntity_dis"], [true], false);
            }
        }
        else {
            if (heroFirst) {
                //优先选择英雄
                targets = SortUtils.sortBy2(targets, ["isSummon", "findLatelyEntity_dis"], [true, false], false)
            }
            else {
                targets = SortUtils.sortBy2(targets, ["findLatelyEntity_dis"], [false], false);
            }
        }
        units = targets
        return units
    }

    /***血量最少 */
    private static behaviorFilterLowestHp(caster: ICaster, targets: BattleUnit[], targetParam: { rate: number, sex: string, heroFirst: number }, isLowest: boolean = true): BattleUnit[] {
        let units: BattleUnit[];
        if (targetParam?.heroFirst)
            targets = SortUtils.sortBy2(targets, ["isSummon", "hpPercen"], [true, isLowest], false);
        else
            targets = SortUtils.sortBy2(targets, ["hpPercen"], [isLowest], false);
        if (targetParam) {
            let param: { rate: number, max?: number } = targetParam;
            if (param.rate != undefined) {
                let tNum = 0
                let rate = param.rate
                let hurtMaxHp: number = 0
                if (param.max) {
                    hurtMaxHp = Math.ceil(param.max / BattleConstantConfig.getRandBase * caster.atk)
                }
                for (let i = 0; i < targets.length; i++) {
                    if (targets[i].attr.hpPercentage <= rate && (hurtMaxHp == 0 || targets[i].attr.hp <= hurtMaxHp)) {
                        tNum++;
                    }
                }
                units = targets.slice(0, tNum)
            }
        }
        if (!units)
            units = targets
        return units
    }

    /***攻击力最高 */
    private static behaviorFilterMostAtk(targets: BattleUnit[], heroFirst: number = 0): BattleUnit[] {
        let units: BattleUnit[];
        if (heroFirst)
            targets = SortUtils.sortBy2(targets, ["isSummon", "atk"], [true, false], false);
        else
            targets = SortUtils.sortBy2(targets, ["atk"], [false], false);
        units = targets
        return units
    }

    /***防御最高 */
    private static behaviorFilterMostDef(targets: BattleUnit[], heroFirst: number = 0): BattleUnit[] {
        let units: BattleUnit[];
        if (heroFirst)
            targets = SortUtils.sortBy2(targets, ["isSummon", "def"], [true, false], false);
        else
            targets = SortUtils.sortBy2(targets, ["def"], [false], false);
        units = targets
        return units
    }

    /**
     * 行为范围筛选
     * @param behavior 行为对象
     * @param caster 施法者
     * @param skillTarget 技能选中的目标
     * @returns 范围内的单位
     */
    static behaviorRangeTargerts(behavior: SkillBehavior, caster: ICaster, skillTarget: ITarget): BattleUnit[] {
        let cfg = behavior.cfg;
        let targetFaction = cfg.targetFaction;
        let isCharm = caster.battleLogic.buffMgr.checkIsCharm(caster.caster);
        if (isCharm) {
            //魅惑中，假如目标是敌人，则改成队友
            if (targetFaction == TargetFaction.EnemySide) {
                targetFaction = TargetFaction.OurSide;
            }
        }

        let teamId = this.getTeamIdByFaction(caster.teamId, targetFaction);
        let fromPos = caster.pos;
        if (caster instanceof BulletUnit && behavior.cfg.effectParam?.notAtkPoint) {
            fromPos = caster.caster.pos;
        }
        let targetPos = skillTarget ? (!behavior.cfg.effectParam?.notHurtPoint ? skillTarget.hurtPoint : skillTarget.pos) : null;

        switch (cfg.rangeType) {
            case BehaviorRangeType.SELF:
                if (caster instanceof BattleUnit) {
                    return [caster];
                }
                else {
                    let casterUnit = caster.battleLogic.getBatteUintByUid(caster.casterUid);
                    return casterUnit ? [casterUnit] : null;
                }
            case BehaviorRangeType.SELF_RECTANGLE_ANGEL:
                if (!skillTarget) return null;
                {
                    let atkAngle = +cfg.rangeParam.angle;
                    return UnitSearchUtils.getUnitsByRect2Param(caster.battleLogic.unitCollisionsManager, fromPos, teamId, atkAngle, cfg.rangeParam);
                }
            case BehaviorRangeType.SELF_RECTANGLE:
                if (!skillTarget) return null;
                {
                    // targetPos = skillTarget.pos;
                    let atkAngle = MathUtils.angle(fromPos as Vec2, targetPos as Vec2);
                    return UnitSearchUtils.getUnitsByRectParam(caster.battleLogic.unitCollisionsManager, fromPos, teamId, atkAngle, cfg.rangeParam);
                }
            case BehaviorRangeType.SELF_RECTANGLE_ANGLE:
                if (!skillTarget) return null;
                {
                    if (skillTarget instanceof PointTarget) {
                        let atkAngle = skillTarget.angle != null ? skillTarget.angle : MathUtils.angle(fromPos as Vec2, targetPos as Vec2);
                        return UnitSearchUtils.getUnitsByRectParam(caster.battleLogic.unitCollisionsManager, fromPos, teamId, atkAngle, cfg.rangeParam);
                    }
                    else {
                        let atkAngle = MathUtils.angle(fromPos as Vec2, targetPos as Vec2);
                        return UnitSearchUtils.getUnitsByRectParam(caster.battleLogic.unitCollisionsManager, fromPos, teamId, atkAngle, cfg.rangeParam);
                    }
                }
            case BehaviorRangeType.SELF_RECTANGLE_And_RECTANGLE:
                if (!skillTarget) return null;
                {
                    let atkAngle = MathUtils.angle(fromPos as Vec2, targetPos as Vec2);
                    return UnitSearchUtils.getUnitsByRectAndRectParam(caster.battleLogic.unitCollisionsManager, fromPos, teamId, atkAngle, cfg.rangeParam);
                }
            case BehaviorRangeType.SELF_TRAGET_RECTANGLE_POINT:
                if (!skillTarget) return null;
                {
                    let atkAngle = MathUtils.angle(fromPos as Vec2, targetPos as Vec2);
                    return UnitSearchUtils.getUnitsByRectParam(caster.battleLogic.unitCollisionsManager, fromPos, teamId, atkAngle, { width: cfg.rangeParam.width, height: MathUtils.distance(fromPos, targetPos as Vec2) + 40 });
                }
            case BehaviorRangeType.TRAGET_RECTANGLE:
                if (!skillTarget) return null;
                {
                    let atkAngle = MathUtils.angle(fromPos as Vec2, targetPos as Vec2);
                    return UnitSearchUtils.getUnitsByRectParam(caster.battleLogic.unitCollisionsManager, skillTarget.pos, teamId, atkAngle, cfg.rangeParam);
                }
            case BehaviorRangeType.SELF_CIRCLE:
                BattleDebugManager.ins().showRangeCircle(null, fromPos.x, fromPos.y, cfg.rangeParam.radius)
                return UnitSearchUtils.getUnitsByCircleParam(caster.battleLogic.unitCollisionsManager, fromPos, teamId, cfg.rangeParam);
            case BehaviorRangeType.TARGET_CIRCLE:
                if (!skillTarget) return null;
                BattleDebugManager.ins().showRangeCircle(null, skillTarget.pos.x, skillTarget.pos.y, cfg.rangeParam.radius)
                return UnitSearchUtils.getUnitsByCircleParam(caster.battleLogic.unitCollisionsManager, skillTarget.pos, teamId, cfg.rangeParam);
            case BehaviorRangeType.SELF_ARC:
                if (!skillTarget) return null;
                {
                    let atkAngle = MathUtils.angle(fromPos as Vec2, targetPos as Vec2);
                    BattleDebugManager.ins().showRangeArc(null, fromPos.x, fromPos.y, atkAngle, cfg.rangeParam.radius, cfg.rangeParam.angle)
                    return UnitSearchUtils.getUnitsByArcParam(caster.battleLogic.unitCollisionsManager, fromPos, teamId, atkAngle, cfg.rangeParam);
                }
            case BehaviorRangeType.TRAGET_ARC:
                if (!skillTarget) return null;
                {
                    let atkAngle = MathUtils.angle(fromPos as Vec2, targetPos as Vec2);
                    return UnitSearchUtils.getUnitsByArcParam(caster.battleLogic.unitCollisionsManager, skillTarget.pos, teamId, atkAngle, cfg.rangeParam);
                }
            case BehaviorRangeType.TRAGET_POINT:
                if (!skillTarget) return null;
                if (skillTarget instanceof PointTarget) {
                    return [skillTarget as any];
                }
                else {
                    let pointTarget = new PointTarget(caster.battleLogic)
                    pointTarget.setPoint(skillTarget.pos.x, skillTarget.pos.y);
                    pointTarget.teamId = skillTarget.teamId;
                    return [pointTarget as any];
                }
            case BehaviorRangeType.SELF_XY:
                {
                    if (caster instanceof BattleUnit)
                        return this.getSelfXy(caster.battleLogic, fromPos, caster.teamId, caster.dirction, cfg.rangeParam) as any;
                    else
                        return this.getSelfXy(caster.battleLogic, fromPos, caster.teamId, 1, cfg.rangeParam) as any;
                }
            case BehaviorRangeType.SELF_RANDOM_POINT:
                {
                    if (!skillTarget) return null;
                    let pointTargetArr: PointTarget[] = []
                    let num = cfg.num || 1;
                    for (let i = 0; i < num; i++) {
                        let pointTarget = new PointTarget(caster.battleLogic)
                        let xy = MathUtils.getRandomPointInEllipse(cfg.rangeParam.radiusX, cfg.rangeParam.radiusY, fromPos.x, fromPos.y, caster.battleLogic.randomMgr.seedRandom())
                        pointTarget.setPoint(xy.x, xy.y);
                        pointTarget.teamId = skillTarget.teamId;
                        BattleDebugManager.ins().showRangeEllipse(null, fromPos.x, fromPos.y, cfg.rangeParam.radiusX, cfg.rangeParam.radiusY)
                        pointTargetArr.push(pointTarget)
                    }
                    return pointTargetArr as any;
                }
            case BehaviorRangeType.SKILL_TARGET:
            default:
                if (!skillTarget || !skillTarget.unit) return [skillTarget as any];
                return [skillTarget.unit];
        }
    }

    private static getSelfXy(battleLogic: BattleLogic, fromPos: Vec2, teamId: number, dir: number, param: { x: number[], y: number[] }): PointTarget[] {
        let arr: PointTarget[] = []
        for (let i = 0; i < param.x.length; i++) {
            let x = fromPos.x + +param.x[i] * dir;
            let y = fromPos.y + +param.y[i];

            let pointTarget = new PointTarget(battleLogic)
            pointTarget.setPoint(x, y);
            pointTarget.teamId = teamId;
            arr.push(pointTarget)
        }
        return arr
    }

    /**安全区治愈 */
    static safeAreaHeal(takers: BattleUnit[]) {
        let healPrec = BattleConstantConfig.safeAreaHeal;
        for (let i = 0; i < takers.length; i++) {
            const taker = takers[i];
            if (!taker.attr.isFullHp()) {
                if (taker.isDeath) {
                    taker.rebirth();
                } else {
                    let hp = Math.ceil(taker.attr.maxHp * healPrec / BattleConstantConfig.getRandBase);
                    let damageVo = PoolManager.getItem(DamageVo)
                    damageVo.target = taker;
                    damageVo.status = BattleConstantConfig.SafeAreaHeal;
                    damageVo.value = hp
                    taker.battleLogic.heal(damageVo);
                }
            }
        }
    }

    static checkSkillSubType(typeMask: number, value: number): boolean {
        return (value & +typeMask) === +typeMask;
    }
}
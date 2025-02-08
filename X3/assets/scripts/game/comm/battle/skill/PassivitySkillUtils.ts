import G from "../../../../core/comm/G";
import HpStateUtils from "../../battleEx/HpStateUtils";
import { AttrEnum } from "../attribute/AttrEnum";
import UnitSearchUtils from "../collisions/UnitSearchUtils";
import BattleConstantConfig from "../config/BattleConstantConfig";
import { HpShowType } from "../config/BattleSetting";
import { UnitType } from "../enum/BattleEnum";
import { BattleUnit } from "../unit/battle/BattleUnit";
import { BulletUnit } from "../unit/bullet/BulletUnit";
import { ExSkillData } from "./ExSkillData";
import { PassivitySkillData } from "./PassivitySkillData";
import { SkillData } from "./SkillData";
import { LeaderSkillTriggerType, PassivitySkillStatusType, PassivitySkillType, TargetFaction } from "./SkillEnum";
import { SkillUtils } from "./SkillUtils";

export class PassivitySkillUtils {

    /***
     * 检查队长技能是否被触发
     *  */
    public static checkLeaderSkillCon(type: number, teamId: number, from: BattleUnit, target: BattleUnit, ...arg: any): boolean {
        let skillList: ExSkillData[] = from.battleLogic.leaderSkillList.concat(from.battleLogic.collectSkillList as any[]);
        //触发
        var isActiva: boolean = false;
        for (let i = 0; i < skillList.length; i++) {
            var skillInfo = skillList[i]
            if (skillInfo.triggerType == type && (!teamId || skillInfo.teamId == teamId)) {
                let triggerParam: { career: number[] } = skillInfo.cfg.triggerParam;
                if (!triggerParam.career || triggerParam.career.indexOf(from.career) != -1) {
                    switch (skillInfo.triggerType) {
                        case LeaderSkillTriggerType.Bullet:
                            skillInfo.setMissileNum(arg[0]);//增加的子弹数量
                            break
                        case LeaderSkillTriggerType.Damage:
                            skillInfo.setHurtNum(arg[0]);//增加的伤害
                            break
                        case LeaderSkillTriggerType.Move:
                            skillInfo.setMoveDistance(from.uid, arg[0]);//增加的移动距离
                            break
                        case LeaderSkillTriggerType.SkillNum:
                            skillInfo.setSkillNum(arg[0]);//技能使用次数
                            break
                    }

                    if (skillInfo.isActive()) {
                        //触发次数
                        var times: number = this.checkLeaderSkill(skillInfo, from, target, ...arg)
                        if (times) {
                            //触发了
                            skillInfo.refreshCD();
                            for (var o: number = 0; o < times; o++) {
                                isActiva = true;
                                if (!skillInfo.isOnce || !skillInfo.cfg.once)
                                    skillInfo.actionSkill(target);
                            }
                        }
                    }
                }
            }
        }
        return isActiva;
    }

    /***
   * 判断被动技能触发
   */
    private static checkLeaderSkill(info: ExSkillData, fighter: BattleUnit, target: BattleUnit, ...arg: any): number {
        switch (info.triggerType) {
            case LeaderSkillTriggerType.Bullet:
                //每射出N发子弹触发
                let triggerBulletParam: { num: number } = info.cfg.triggerParam;
                let num = info.executeMissileNum(+triggerBulletParam.num)
                if (num) {
                    //触发了
                    return num;
                }
                return 0
            case LeaderSkillTriggerType.SkillNum:
                //每射出N发子弹触发
                let triggerSkillNumParam: { num: number } = info.cfg.triggerParam;
                let skillNum = info.executeSkillNum(+triggerSkillNumParam.num)
                if (skillNum) {
                    //触发了
                    return skillNum;
                }
                return 0
            case LeaderSkillTriggerType.Damage:
                //增加的伤害
                let triggerDamageParam: { amount: number } = info.cfg.triggerParam;
                let targetHurt = Math.ceil(info.battleLogic.getTeamInitAttrValue(info.teamId, AttrEnum.ATK) * triggerDamageParam.amount / BattleConstantConfig.getRandBase);
                let hurt = info.executeHurtNum(targetHurt)
                if (hurt) {
                    //触发了
                    return hurt;
                }
                return 0
            case LeaderSkillTriggerType.Move:
                //累计移动距离统计
                let triggerMoveParam: { dis: number } = info.cfg.triggerParam;
                if (info.executeMoveDistance(+triggerMoveParam.dis)) {
                    //触发了
                    return 1;
                }
                return 0
            case LeaderSkillTriggerType.EnemyNum:
                //进战数量
                let triggerEnemyNumParam: { num: number } = info.cfg.triggerParam;
                let enemyUnits = info.battleLogic.getUnitsByTeamId(SkillUtils.getTeamIdByFaction(fighter.teamId, TargetFaction.OurSide))
                let enemyUnitNum = 0;
                for (let i = 0; i < enemyUnits.length; i++) {
                    if (enemyUnits[i].isActive && (enemyUnits[i].type == UnitType.Hero || enemyUnits[i].type == UnitType.Monster)) {
                        enemyUnitNum++;
                    }
                }
                if (enemyUnitNum >= triggerEnemyNumParam.num) {
                    //触发了
                    return 1;
                }
                return 0;
            case LeaderSkillTriggerType.FatalWound:
                //有单位受到致命伤
                let triggerFatalWoundParam: { targetFaction: number } = info.cfg.triggerParam;
                if (target.teamId == SkillUtils.getTeamIdByFaction(target.teamId, triggerFatalWoundParam.targetFaction)) {
                    //触发了
                    return 1;
                }
                return 0
            case LeaderSkillTriggerType.Hurt:
                //非召唤单位少于一定血量触发
                let triggerHurtParam: { hp: number, targetFaction: number, bossHp: number } = info.cfg.triggerParam;
                if (target.teamId == SkillUtils.getTeamIdByFaction(fighter.teamId, triggerHurtParam.targetFaction)) {
                    //触发了
                    if (target.type == UnitType.Boss) {
                        if (target.hpPercen * BattleConstantConfig.getRandBase <= triggerHurtParam.bossHp)
                            return 1;
                    }
                    else {
                        if (target.hpPercen * BattleConstantConfig.getRandBase <= triggerHurtParam.hp)
                            return 1;
                    }
                }
                return 0
        }
        return 0
    }

    /***检查被动是否触发 */
    public static checkPassSkillCon(type: number, from: BattleUnit, target: BattleUnit, ...arg: any): boolean {

        if (from instanceof BulletUnit) {
            from = from.caster;
        }

        if (!from || !from.attr || (type != PassivitySkillType.ConType_14 && type != PassivitySkillType.ConType_33 && from.attr.isDeath()))
            return false

        var hasOneActiva: boolean = false;//是否有1个激活了
        var skills: PassivitySkillData[] = from.attr.passSkills;
        for (var i: number = 0; i < skills.length; i++) {
            var skillInfo = skills[i]
            if (type == skillInfo.condition && skillInfo.isActive()) {
                //触发次数
                var times: number = this.checkPassivitySkill(from, target, skillInfo, ...arg)
                if (times) {
                    //触发了
                    skillInfo.refreshCD();
                    for (var o: number = 0; o < times; o++) {
                        //触发
                        var isActiva: boolean = false;
                        let behaviors = skillInfo.actionSkill();
                        if (behaviors) {
                            for (let i = 0; i < behaviors.length; i++) {
                                let behavior = behaviors[i];
                                behavior.setCaster(from);
                                if (target) {
                                    behavior.skillTargetUid = target.uid;
                                    behavior.skillTarget = target
                                }
                                behavior.actionEffect();
                                isActiva = true;
                            }

                            //触发技能
                            if (skillInfo.cfg.skills) {
                                for (var j = 0; j < skillInfo.cfg.skills.length; j++) {
                                    var acitvaSkillId: string = skillInfo.cfg.skills[j]
                                    from.usePassActiveSkillSkill(acitvaSkillId, skillInfo.cfg.skillParm)
                                    isActiva = true
                                }
                            }
                        }
                    }

                    if (isActiva) {
                        if (type == PassivitySkillType.ConType_1)
                            skillInfo.onceTrigger = true;

                        this.checkPassSkillCon(PassivitySkillType.ConType_7, from, target, skillInfo);
                    }
                }
            }
        }

        return hasOneActiva;
    }

    /***强制触发1次 */
    public static checkPassSkillConBySkillId(skillId: string, from: BattleUnit, target: BattleUnit, ...arg: any): boolean {

        if (from instanceof BulletUnit) {
            from = from.caster;
        }

        if (!from || !from.attr || from.attr.isDeath())
            return false

        var hasOneActiva: boolean = false;//是否有1个激活了
        var skills: PassivitySkillData[] = from.attr.passSkills;
        for (var i: number = 0; i < skills.length; i++) {
            var skillInfo = skills[i]
            if (skillInfo.skillId == skillId) {
                //触发次数
                var times: number = 1
                if (times) {
                    //触发了
                    skillInfo.refreshCD();
                    for (var o: number = 0; o < times; o++) {
                        //触发
                        var isActiva: boolean = false;
                        let behaviors = skillInfo.actionSkill();
                        if (behaviors) {
                            for (let i = 0; i < behaviors.length; i++) {
                                let behavior = behaviors[i];
                                behavior.setCaster(from);
                                if (target) {
                                    behavior.skillTargetUid = target.uid;
                                    behavior.skillTarget = target
                                }
                                behavior.actionEffect();
                                isActiva = true;
                            }

                            //触发技能
                            if (skillInfo.cfg.skills) {
                                for (var j = 0; j < skillInfo.cfg.skills.length; j++) {
                                    var acitvaSkillId: string = skillInfo.cfg.skills[j]
                                    from.usePassActiveSkillSkill(acitvaSkillId, skillInfo.cfg.skillParm)
                                    isActiva = true
                                }
                            }
                        }
                    }

                    if (isActiva) {
                        if (skillInfo.condition == PassivitySkillType.ConType_1)
                            skillInfo.onceTrigger = true;

                        this.checkPassSkillCon(PassivitySkillType.ConType_7, from, target, skillInfo);
                    }
                }
                break
            }
        }

        return hasOneActiva;
    }

    /***
    * 判断被动技能触发
    */
    private static checkPassivitySkill(fighter: BattleUnit, target: BattleUnit, info: PassivitySkillData, ...arg: any): number {

        var para: number = 0;
        var num: number = 0
        if (info.cfg.statusGroup) {
            para = info.cfg.statusGroup[0];
            num = info.cfg.statusGroup[1];
        }

        var t: number = 0;
        if (para == PassivitySkillStatusType.StatusType_1) {
            t = fighter.attr.hp / fighter.attr.maxHp * 10000;
            if (t <= num) {
            }
            else {
                return 0
            }
        }
        else if (target && para == PassivitySkillStatusType.StatusType_2) {
            t = target.attr.hp / target.attr.maxHp * 10000;
            if (t <= num) {
            }
            else {
                return 0
            }
        }
        else if (target && para == PassivitySkillStatusType.StatusType_3) {
            if (!fighter.battleLogic.randomMgr.isRandTrue(num)) {
                return 0
            }
        }
        else if (para == PassivitySkillStatusType.StatusType_4) {
            let selfHp = HpStateUtils.getCurHpByType(fighter.battleLogic.fightType, SkillUtils.getTeamIdByFaction(fighter.teamId, TargetFaction.OurSide), HpShowType.TOTAL);
            let selfMaxHp = HpStateUtils.getMaxHpByType(fighter.battleLogic.fightType, SkillUtils.getTeamIdByFaction(fighter.teamId, TargetFaction.OurSide), HpShowType.TOTAL);
            t = selfHp / selfMaxHp * 10000;
            if (t <= num) {
            }
            else {
                return 0
            }
        }

        switch (info.condition) {
            case PassivitySkillType.ConType_2:
                {
                    //技能释放时
                    let skillInfo: SkillData = arg[0];
                    if (info.cfg.conditionValue) {
                        if (!skillInfo || info.cfg.conditionValue.indexOf(skillInfo.skillIndex) == -1)
                            return 0;
                    }
                    return 1
                }
            case PassivitySkillType.ConType_3:
                {
                    //受到伤害时
                    let skillInfo: SkillData = arg[0];
                    if (info.cfg.conditionValue) {
                        if (!skillInfo || info.cfg.conditionValue.indexOf(skillInfo.skillIndex) == -1)
                            return 0;
                    }
                    return 1
                }
            case PassivitySkillType.ConType_4:
                {
                    //造成伤害时
                    let skillInfo: SkillData = arg[0];
                    if (info.cfg.conditionValue) {
                        if (!skillInfo || info.cfg.conditionValue.indexOf(skillInfo.skillIndex) == -1)
                            return 0;
                    }
                    return 1
                }
            case PassivitySkillType.ConType_6:
                {
                    //按时间触发
                    let isEnterBattle: number = info.cfg.conditionValue ? info.cfg.conditionValue[0] : 0;
                    if (isEnterBattle && !fighter.isBeginToFight) {
                        return 0;
                    }
                    return 1
                }
            case PassivitySkillType.ConType_17:
                {
                    //暴击时
                    let skillInfo: SkillData = arg[0];
                    if (info.cfg.conditionValue) {
                        if (!skillInfo || info.cfg.conditionValue.indexOf(skillInfo.skillIndex) == -1)
                            return 0;
                    }
                    return 1
                }
            case PassivitySkillType.ConType_7:
                {
                    //被动技能触发时
                    let skillInfo: PassivitySkillData = arg[0];
                    if (info.cfg.conditionValue) {
                        if (info.cfg.conditionValue.indexOf(skillInfo.cfg.group) != -1)
                            return 1;
                    }
                    return 0
                }
            case PassivitySkillType.ConType_8:
                {
                    //对目标添加BUFF组后对释放BUFF者进行触发
                    let buffGroupId: number = arg[0];
                    if (info.cfg.conditionValue) {
                        if (info.cfg.conditionValue.indexOf(buffGroupId) != -1)
                            return 1;
                    }
                    return 0
                }
            case PassivitySkillType.ConType_9:
                {
                    //技能释放完毕后
                    let skillInfo: SkillData = arg[0];

                    if (info.cfg.conditionValue) {
                        if (info.cfg.conditionValue2 && info.cfg.conditionValue2[1]) {
                            //技能ID
                            if (!skillInfo || info.cfg.conditionValue.indexOf(skillInfo.cfg.belongType) == -1)
                                return 0;
                        }
                        else if (!skillInfo || info.cfg.conditionValue.indexOf(skillInfo.skillIndex) == -1) {
                            return 0;
                        }
                    }
                    return 1
                }
            case PassivitySkillType.ConType_12:
                //累计移动时长统计
                if (info.executeMoveTime(+info.cfg.conditionValue[0], +info.cfg.conditionValue[1] || 0)) {
                    //触发了
                    return 1;
                }
                return 0
            case PassivitySkillType.ConType_21:
                //累计移动距离统计
                if (info.executeMoveDistance(+info.cfg.conditionValue[0])) {
                    //触发了
                    return 1;
                }
                return 0
            case PassivitySkillType.ConType_13:
                {
                    //队友被添加异常后（主要是BUFF表的abnormalType字段不为空的BUFF被添加）
                    let abnormalType: number = arg[0];
                    if (info.cfg.conditionValue) {
                        if (info.cfg.conditionValue.indexOf(abnormalType) != -1)
                            return 1;
                    }
                    return 0
                }
            case PassivitySkillType.ConType_15:
                {
                    //某人死亡时
                    let teamId: number = target.teamId;
                    if (info.cfg.conditionValue) {
                        if (info.cfg.conditionValue[0] == 1 && teamId == fighter.teamId) {
                            return 1;//队友
                        }
                        else if (info.cfg.conditionValue[0] == 2) {
                            return 1;//全部
                        }
                        return 0;
                    }
                    else {
                        if (teamId != fighter.teamId)//无配，默认是敌人为条件
                            return 1;
                        return 0;
                    }
                }
            case PassivitySkillType.ConType_16:
                //每射出N发子弹触发
                let num = info.executeMissileNum(+info.cfg.conditionValue[0])
                if (num) {
                    //触发了
                    return num;
                }
                return 0
            case PassivitySkillType.ConType_19:
                //累计的受到的伤害
                if (info.executeTotalHurt(+info.cfg.conditionValue[0], +info.cfg.conditionValue[1])) {
                    //触发了
                    return 1;
                }
                return 0
            case PassivitySkillType.ConType_29:
            case PassivitySkillType.ConType_20:
                {
                    //技能行为被触发时
                    let skillInfo: SkillData = arg[0];
                    let isPassivity: boolean = arg[1];
                    if (isPassivity && info.cfg.conditionValue2 && info.cfg.conditionValue2[0]) {
                        return 0;
                    }
                    if (info.cfg.conditionValue) {
                        if (info.cfg.conditionValue2 && info.cfg.conditionValue2[1]) {
                            //技能ID
                            if (info.cfg.conditionValue.indexOf(skillInfo.cfg.belongType) == -1)
                                return 0;
                        }
                        else if (info.cfg.conditionValue.indexOf(skillInfo.skillIndex) == -1) {
                            return 0;
                        }
                    }
                    return 1
                }
            case PassivitySkillType.ConType_23:
                //技能释放完毕的次数
                let skillInfo: SkillData = arg[0];
                if (skillInfo.skillIndex == +info.cfg.conditionValue[0] && info.executeSkillCompleteNum(+info.cfg.conditionValue[1])) {
                    //触发了
                    return 1;
                }
                return 0
            case PassivitySkillType.ConType_24:
                let haloId: string = arg[0];
                if (info.cfg.conditionValue) {
                    if (info.cfg.conditionValue.indexOf(haloId) != -1)
                        return 1;
                }
                return 0
            case PassivitySkillType.ConType_25:
                if (info.executeBlockNum(+info.cfg.conditionValue[0])) {
                    return 1;
                }
                return 0
            case PassivitySkillType.ConType_26:
                {
                    //造成治疗时
                    let skillInfo: SkillData = arg[0];
                    if (info.cfg.conditionValue) {
                        if (!skillInfo || info.cfg.conditionValue.indexOf(skillInfo.skillIndex) == -1)
                            return 0;
                    }
                    return 1
                }
            case PassivitySkillType.ConType_27:
                {
                    //一定时间后触发，判断附近的敌人是否小于等于个数
                    let range = info.cfg.conditionValue[0];
                    let num = info.cfg.conditionValue[1];
                    let units = UnitSearchUtils.getUnitsByCircle(fighter, SkillUtils.getTeamIdByFaction(fighter.teamId, TargetFaction.EnemySide), range);
                    if (!units || num >= units.length) {
                        return 1
                    }
                    return 0
                }
            case PassivitySkillType.ConType_28:
                {
                    //一定时间后触发，判断附近的敌人是否大于等于个数
                    let range = info.cfg.conditionValue[0];
                    let num = info.cfg.conditionValue[1];
                    let units = UnitSearchUtils.getUnitsByCircle(fighter, SkillUtils.getTeamIdByFaction(fighter.teamId, TargetFaction.EnemySide), range);
                    if (units && num <= units.length) {
                        return 1
                    }
                    return 0
                }
            case PassivitySkillType.ConType_31:
                //击杀数量达到N时触发
                if (info.executeSkillNum(+info.cfg.conditionValue[0], +info.cfg.conditionValue[1])) {
                    //触发了
                    return 1;
                }
                return 0
            case PassivitySkillType.ConType_33:
                {
                    fighter.attr.hp = +arg[0]
                    return 1
                }
            case PassivitySkillType.ConType_34:
                {
                    //造成伤害时
                    let skillInfo: SkillData = arg[0];
                    if (info.cfg.conditionValue) {
                        if (!skillInfo || info.cfg.conditionValue.indexOf(skillInfo.skillIndex) == -1)
                            return 0;
                    }
                    return 1
                }
            case PassivitySkillType.ConType_35:
                //助攻数量达到N时触发
                if (info.executeAssistNum(+info.cfg.conditionValue[0], +info.cfg.conditionValue[1])) {
                    //触发了
                    return 1;
                }
                return 0
            default:
                break
        }

        return 1;
    }

    /***场上有人死亡前的被动判断,检查存活的实体谁拥有其他人死亡时触发的BUFF */
    public static checkDiePassSkill(target: BattleUnit): void {
        let checkEntitys = target.battleLogic.unitProcessor.allUnits;
        for (var i: number = 0; i < checkEntitys.length; i++) {
            if (checkEntitys[i].isActive) {
                if (checkEntitys[i].teamId == target.teamId)
                    this.checkPassSkillCon(PassivitySkillType.ConType_11, checkEntitys[i], target);
                this.checkPassSkillCon(PassivitySkillType.ConType_15, checkEntitys[i], target);
            }
        }
    }

    /**目标被首次触发添加的光环后 */
    public static checkHaloFirstPassSkill(target: BattleUnit, haloId: string) {
        let checkEntitys = target.battleLogic.unitProcessor.allUnits;
        for (var i: number = 0; i < checkEntitys.length; i++) {
            if (checkEntitys[i].isActive) {
                if (checkEntitys[i].teamId == target.teamId)
                    this.checkPassSkillCon(PassivitySkillType.ConType_24, checkEntitys[i], target, haloId);
            }
        }
    }

    /**队友被添加异常后（主要是BUFF表的abnormalType字段不为空的BUFF被添加） */
    public static checkBuffAbnormalTypePassSkill(target: BattleUnit, abnormalType: number) {
        if (abnormalType) {
            let checkEntitys = target.battleLogic.unitProcessor.allUnits;
            for (var i: number = 0; i < checkEntitys.length; i++) {
                if (checkEntitys[i].isActive) {
                    if (checkEntitys[i].teamId == target.teamId)
                        this.checkPassSkillCon(PassivitySkillType.ConType_13, checkEntitys[i], target, abnormalType);
                }
            }
        }
    }

    /***场上有HP变动时 */
    public static checkHpChangePassSkill(target: BattleUnit): void {
        let checkEntitys = target.battleLogic.unitProcessor.allUnits;
        for (var i: number = 0; i < checkEntitys.length; i++) {
            this.checkPassSkillCon(PassivitySkillType.ConType_36, checkEntitys[i], target);
        }
    }

    /**根据functionname去对被动技能赋值 */
    public static updatePassSkillFunction(from: BattleUnit, type: number, funName: string, ...value): void {
        if (!from.attr)
            return
        var skills: PassivitySkillData[] = from.attr.passSkills;
        for (var i: number = 0; i < skills.length; i++) {
            if (!skills[i].cfg) {
                G.Logger.fight(`被动技能ID ${skills[i].skillId} 找不到`)
            }
            if (skills[i].cfg.condition == type) {
                skills[i][funName]["call"](skills[i], ...value);
            }
        }
    }
}
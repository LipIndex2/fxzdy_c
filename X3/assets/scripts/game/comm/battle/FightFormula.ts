import G from "../../../core/comm/G";
import { PoolManager } from "../../../core/pool/PoolManager";
import { MathUtils } from "../../../core/utils/MathUtils";
import { Attribute } from "../../modules/attr/AttrEnum";
import { HeroCampType, HeroCareerType } from "../../modules/hero/HeroEnum";
import { DamageVo } from "./DamageVo";
import BattleConstantConfig from "./config/BattleConstantConfig";
import { UnitType } from "./enum/BattleEnum";
import { ICaster } from "./skill/ICaster";
import { PassivitySkillUtils } from "./skill/PassivitySkillUtils";
import { SkillBehavior } from "./skill/SkillBehavior";
import { SkillBuff } from "./skill/SkillBuff";
import { SkillData } from "./skill/SkillData";
import { PassivitySkillType, SkillSubType, SkillType } from "./skill/SkillEnum";
import { SkillHalo } from "./skill/SkillHalo";
import { SkillUtils } from "./skill/SkillUtils";
import { BattleUnit } from "./unit/battle/BattleUnit";

/**
* 战斗公式
*/
export class FightFormula {

    /**
     * 根据属性类型获取属性
     * skillAttr buff加值
     * addValue 其他属性加值
     *  */
    public static getValueByType(type: string, target: BattleUnit, skillAttr?: { [attrId: number]: { value: number, per: number } }, addValue?: { [key: number]: number }): number {
        if (target instanceof BattleUnit) {
            const config = G.TableManager.getDataById(table.battle.AttributeConfig, type);
            var value = target.getAttrValue(config.tid)
            if (skillAttr && skillAttr[config.tid])
                value = +skillAttr[config.tid].value;

            if (addValue && addValue[config.tid])
                value = +addValue[type] || 0;

            if (config.max)
                value = Math.min(config.max, value);

            if (config.min != undefined)
                value = Math.max(config.min, value);

            return value;
        }
        return 0;
    }

    /***判断闪避 */
    private static checkMiss(skill: SkillBehavior, fighter: BattleUnit, target: BattleUnit, skillAttr?: { [attrId: number]: { value: number, per: number } }): boolean {
        //闪避率
        var miss: number = this.getValueByType(Attribute.DOD_RATE, target)
        //命中率
        var hit: number = this.getValueByType(Attribute.DOD_RES, fighter, skillAttr, skill.getTempAttr())
        //实际闪避率
        miss = 10000 - Math.max(0, Math.min(10000, 10000 + hit - miss));
        //判断闪避
        var rand: number = fighter.battleLogic.randomMgr.randomInt(0, BattleConstantConfig.getRandBase);
        if (rand <= miss) {
            //闪避
            return true
        }
        return false;
    }

    /***判断格挡 */
    private static checkBlock(skill: SkillBehavior, fighter: BattleUnit, target: BattleUnit, skillAttr?: { [attrId: number]: { value: number, per: number } }): boolean {
        //格挡率
        var blockCfg = this.getValueByType(Attribute.BLK_RATE, target);
        //抗格挡率
        var uBlockCfg = this.getValueByType(Attribute.BLK_RES, fighter, skillAttr, skill.getTempAttr());

        var block = blockCfg - uBlockCfg;
        //判断格挡
        var rand = fighter.battleLogic.randomMgr.randomInt(0, BattleConstantConfig.getRandBase);
        if (rand <= block) {
            //格挡
            return true
        }
        return false;
    }

    /***判断暴击 */
    private static checkCrit(skill: SkillBehavior, fighter: BattleUnit, target: BattleUnit, skillAttr?: { [attrId: number]: { value: number, per: number } }): boolean {

        if (skill && skill.skill instanceof SkillData) {
            let has = fighter.battleLogic.buffMgr.hasCirtBuffBySkillIndex(fighter, skill.skill.skillIndex)
            if (has)
                return true;
        }

        //暴击率
        var critCfg = this.getValueByType(Attribute.CRI_RATE, fighter, skillAttr, skill.getTempAttr());
        //抗暴率
        var uCritCfg = this.getValueByType(Attribute.CRI_RES, target);

        var crit = critCfg - uCritCfg;
        var rand = fighter.battleLogic.randomMgr.randomInt(0, BattleConstantConfig.getRandBase);
        if (rand <= crit) {
            return true
        }
        return false;
    }

    /***获取穿甲修正 */
    private static getChuanJiaValue(fighter: BattleUnit, target: BattleUnit, skillAttr: { [attrId: number]: { value: number, per: number } }, skill: SkillBehavior): number {
        //破甲
        let arpValue = this.getValueByType(Attribute.ARP, fighter, skillAttr, skill.getTempAttr())
        //抵抗破甲
        let arpResValue = this.getValueByType(Attribute.ARP_RES, target, skillAttr, skill.getTempAttr())
        //穿甲修正
        let chuanJiaValue = Math.max(0, 1 - (arpValue - arpResValue) / BattleConstantConfig.getRandBase);
        return chuanJiaValue
    }


    /***获取防御修正 */
    private static getDefValue(target: BattleUnit, skillAttr?: { [attrId: number]: { value: number, per: number } }, skill?: SkillBehavior): number {
        let defInc = this.getValueByType(Attribute.DEF_INC, target, skillAttr, skill?.getTempAttr());//防御增加
        let defDec = this.getValueByType(Attribute.DEF_DEC, target, skillAttr, skill?.getTempAttr());//防御减少
        //获取防御修正
        let defValue = Math.max(0, 1 + (defInc - defDec) / BattleConstantConfig.getRandBase);
        return defValue
    }

    /***获取技能类型修正 */
    private static getSkillTypeValue(fighter: BattleUnit, target: BattleUnit, skillAttr: { [attrId: number]: { value: number, per: number } }, skill: SkillBehavior): number {
        //技能类型修正
        let skillTypeValue: number = 1;
        if (skill && skill.skill instanceof SkillData) {
            if (skill.skill.type == SkillType.ATTACK) {
                //普攻增伤
                let badInc = this.getValueByType(Attribute.BAD_INC, fighter, skillAttr, skill.getTempAttr())
                //普攻减伤
                let badRes = this.getValueByType(Attribute.BAD_RES, target, skillAttr, skill.getTempAttr())
                skillTypeValue = Math.max(1 + (badInc - badRes) / BattleConstantConfig.getRandBase, 0)
            }
            else {
                //技能增伤
                let sdInc = this.getValueByType(Attribute.SD_INC, fighter, skillAttr, skill.getTempAttr())
                //技能减伤
                let sdRes = this.getValueByType(Attribute.SD_RES, target, skillAttr, skill.getTempAttr())
                skillTypeValue = Math.max(1 + (sdInc - sdRes) / BattleConstantConfig.getRandBase, 0)
            }
        }

        return skillTypeValue
    }

    /***获取种族修正 */
    private static getCampValue(fighter: BattleUnit, target: BattleUnit, skillAttr?: { [attrId: number]: { value: number, per: number } }, skill?: SkillBehavior): number {
        //种族修正
        let campValue = 1;
        if (target) {
            switch (target.camp) {
                case HeroCampType.Human:
                    //对人族伤害提升
                    campValue += this.getValueByType(Attribute.T_DMG_INC, fighter, skillAttr, skill?.getTempAttr()) / BattleConstantConfig.getRandBase
                    break
                case HeroCampType.God:
                    //对神裔伤害提升
                    campValue += this.getValueByType(Attribute.P_DMG_INC, fighter, skillAttr, skill?.getTempAttr()) / BattleConstantConfig.getRandBase
                    break
                case HeroCampType.Robot:
                    //对智械伤害提升
                    campValue += this.getValueByType(Attribute.M_DMG_INC, fighter, skillAttr, skill?.getTempAttr()) / BattleConstantConfig.getRandBase
                    break
                case HeroCampType.ExoticDemons:
                    //对异魔伤害提升
                    campValue += this.getValueByType(Attribute.S_DMG_INC, fighter, skillAttr, skill?.getTempAttr()) / BattleConstantConfig.getRandBase
                    break
            }
        }

        if (fighter) {
            switch (fighter.camp) {
                case HeroCampType.Human:
                    //来自人族伤害降低
                    campValue -= this.getValueByType(Attribute.T_DMG_RES, target, skillAttr, skill?.getTempAttr()) / BattleConstantConfig.getRandBase
                    break
                case HeroCampType.God:
                    //来自神裔伤害降低
                    campValue -= this.getValueByType(Attribute.P_DMG_RES, target, skillAttr, skill?.getTempAttr()) / BattleConstantConfig.getRandBase
                    break
                case HeroCampType.Robot:
                    //来自智械伤害降低
                    campValue -= this.getValueByType(Attribute.M_DMG_RES, target, skillAttr, skill?.getTempAttr()) / BattleConstantConfig.getRandBase
                    break
                case HeroCampType.ExoticDemons:
                    //来自异魔伤害降低
                    campValue -= this.getValueByType(Attribute.S_DMG_RES, target, skillAttr, skill?.getTempAttr()) / BattleConstantConfig.getRandBase
                    break
            }

        }

        campValue = Math.max(0, campValue);
        return campValue;
    }

    /***获取PVP伤害加成 */
    private static getPvpDamageAdd(fighter: BattleUnit, target: BattleUnit, skillAttr: { [attrId: number]: { value: number, per: number } }, skill: SkillBehavior): number {
        if (!fighter || !fighter.battleLogic.battleSetting.isPvpModel)
            return 1
        let damageAddValue = this.getValueByType(Attribute.PVP_DMG_INC, fighter, skillAttr, skill.getTempAttr()) / BattleConstantConfig.getRandBase//伤害加成
        let damageUddValue = this.getValueByType(Attribute.PVP_DMG_RES, target) / BattleConstantConfig.getRandBase//伤害减免
        //计算伤害加成
        return Math.max(0, 1 + (damageAddValue - damageUddValue));
    }

    /***获取伤害加成 */
    private static getDamageAdd(fighter: BattleUnit, target: BattleUnit, skillAttr: { [attrId: number]: { value: number, per: number } }, skill: SkillBehavior): number {
        if (!fighter)
            return 1
        let damageAddValue = this.getValueByType(Attribute.DMG_INC, fighter, skillAttr, skill.getTempAttr()) / BattleConstantConfig.getRandBase//伤害加成
        let damageUddValue = this.getValueByType(Attribute.DMG_RES, target) / BattleConstantConfig.getRandBase//伤害减免

        if (fighter.type == UnitType.Pet) {
            damageAddValue += this.getValueByType(Attribute.PET_DMG_INC, fighter, skillAttr, skill.getTempAttr()) / BattleConstantConfig.getRandBase//伤害加成
        }

        let dis = MathUtils.distance(fighter.pos, target.pos);
        if (dis > BattleConstantConfig.distanceValue) {
            //远程增伤
            damageAddValue += this.getValueByType(Attribute.RNG_DMG_INC, fighter, skillAttr, skill.getTempAttr()) / BattleConstantConfig.getRandBase
            damageUddValue += this.getValueByType(Attribute.RNG_DMG_RES, target) / BattleConstantConfig.getRandBase
        }
        else {
            //近战增伤
            damageAddValue += this.getValueByType(Attribute.ML_DMG_INC, fighter, skillAttr, skill.getTempAttr()) / BattleConstantConfig.getRandBase
            damageUddValue += this.getValueByType(Attribute.ML_DMG_RES, target) / BattleConstantConfig.getRandBase
        }

        switch (fighter.career) {
            case HeroCareerType.HeavyCavalry:
                damageAddValue += this.getValueByType(Attribute.RD_DMG_INC, fighter, skillAttr, skill.getTempAttr()) / BattleConstantConfig.getRandBase//伤害加成
                break
            case HeroCareerType.Grapple:
                damageAddValue += this.getValueByType(Attribute.FT_DMG_INC, fighter, skillAttr, skill.getTempAttr()) / BattleConstantConfig.getRandBase//伤害加成
                break
            case HeroCareerType.GeneVariant:
                damageAddValue += this.getValueByType(Attribute.MG_DMG_INC, fighter, skillAttr, skill.getTempAttr()) / BattleConstantConfig.getRandBase//伤害加成
                break
            case HeroCareerType.Shooter:
                damageAddValue += this.getValueByType(Attribute.MM_DMG_INC, fighter, skillAttr, skill.getTempAttr()) / BattleConstantConfig.getRandBase//伤害加成
                break
        }

        switch (target.career) {
            case HeroCareerType.HeavyCavalry:
                damageUddValue += this.getValueByType(Attribute.RD_DMG_RES, target) / BattleConstantConfig.getRandBase//伤害加成
                break
            case HeroCareerType.Grapple:
                damageUddValue += this.getValueByType(Attribute.FT_DMG_RES, target) / BattleConstantConfig.getRandBase//伤害加成
                break
            case HeroCareerType.GeneVariant:
                damageUddValue += this.getValueByType(Attribute.MG_DMG_RES, target) / BattleConstantConfig.getRandBase//伤害加成
                break
            case HeroCareerType.Shooter:
                damageUddValue += this.getValueByType(Attribute.MM_DMG_RES, target) / BattleConstantConfig.getRandBase//伤害加成
                break
        }

        if (SkillUtils.checkSkillSubType(SkillSubType.Range, skill?.skill?.getSubType())) {
            damageUddValue += this.getValueByType(Attribute.RANGE_DMG_RES, target) / BattleConstantConfig.getRandBase//范围伤害减免
        }
        //计算伤害加成
        return Math.max(0, 1 + (damageAddValue - damageUddValue));
    }

    /***获取攻击距离修正 */
    private static getDisValue(fighter: BattleUnit, target: BattleUnit, skillAttr: { [attrId: number]: { value: number, per: number } }, skill: SkillBehavior, distance: number = null): number {
        //攻击距离修正
        let disValue: number = 1;
        if (fighter && target) {
            let dis = distance == null ? MathUtils.distance(fighter.pos, target.pos) : distance;
            if (dis > BattleConstantConfig.distanceValue) {
                //远程防御
                let rngDef = this.getValueByType(Attribute.RNG_DEF, target, skillAttr, skill.getTempAttr()) / BattleConstantConfig.getRandBase
                disValue += rngDef;
            }
            else {
                //近战防御
                let mlDef = this.getValueByType(Attribute.ML_DEF, target, skillAttr, skill.getTempAttr()) / BattleConstantConfig.getRandBase
                disValue += mlDef;
            }
        }
        return disValue
    }


    //伤害.A = 攻击.A * 技能系数.A * （1 - 防御减伤.D）* 闪避修正 * 暴击修正 * buff状态修正 * 其他修正
    //防御减伤.D = 防御.D * 穿甲修正 * 格挡修正 / （攻击系数 * 攻击.A + 防御.D * 穿甲修正 * 格挡修正）
    //穿甲修正 = 1 + 防御增加.D - 防御减少.D - 护甲穿透.A
    //damageValue伤害系数
    //ignoreHit忽略命中判断
    static fight(skill: SkillBehavior, caster: ICaster, target: BattleUnit, damageValue: number = 0, ignoreData?: { atk?: boolean, hit?: boolean, real?: boolean },
        exData?: { isCrit: boolean }
    ): DamageVo {

        let damageVo = PoolManager.getItem(DamageVo)
        damageVo.skillInfo = skill.skill;
        damageVo.caster = caster
        damageVo.target = target
        damageVo.skillBehavior = skill;

        let skillAttr = caster.battleLogic.buffMgr.getSkillAttr(caster, skill);

        let fighter = caster.battleLogic.getBatteUintByUid(caster.casterUid)
        if (!fighter)
            return

        let missValue = 1;
        let blockValue: number = 1;
        let critValue: number = 1;
        damageVo.status = BattleConstantConfig.Normal;
        if (!ignoreData || !ignoreData.hit) {
            let isMiss = this.checkMiss(skill, fighter, target, skillAttr)
            if (isMiss) {
                //闪避修正
                missValue = BattleConstantConfig.baseMissValue / BattleConstantConfig.getRandBase;
                damageVo.status = BattleConstantConfig.Miss;
                PassivitySkillUtils.checkPassSkillCon(PassivitySkillType.ConType_22, target, damageVo.originalCaster, damageVo.skillInfo);
            }
            else {
                let isBlock = this.checkBlock(skill, fighter, target, skillAttr)
                if (isBlock) {
                    //格挡修正
                    let fightBlockValue = this.getValueByType(Attribute.BLK_DMG, fighter, skillAttr);
                    let targetBlockValue = this.getValueByType(Attribute.BLK_DMG_DEC, target);
                    blockValue = 1 + (BattleConstantConfig.baseBlockValue + Math.max(0, fightBlockValue - targetBlockValue)) / BattleConstantConfig.getRandBase
                    damageVo.status = BattleConstantConfig.Block;
                }

                let isCrit = this.checkCrit(skill, fighter, target, skillAttr)
                if (isCrit || exData?.isCrit) {
                    //是否免疫暴击
                    let has = caster.battleLogic.buffMgr.hasImmuneCriticalBuff(target, fighter)
                    if (!has) {
                        //暴击修正
                        let fightCritValue = this.getValueByType(Attribute.CRI_DMG, fighter, skillAttr);
                        let targetCritValue = this.getValueByType(Attribute.CRI_DMG_DEC, target);
                        critValue = (BattleConstantConfig.baseCritValue + Math.max(0, fightCritValue - targetCritValue)) / BattleConstantConfig.getRandBase
                        damageVo.status = BattleConstantConfig.Crit;
                    }
                }
            }
        }

        let attack = (!ignoreData || !ignoreData.atk) ? fighter?.atk : 1;
        let def = target.def;

        if (skill && skill.skill instanceof SkillData) {
            damageValue = caster.battleLogic.buffMgr.getSkillAmount(damageValue, caster, skill.skill.skillIndex, skill.skill.skillId);
            damageValue += caster.battleLogic.buffMgr.getAddSkillAmount(caster, skill.skill.skillIndex, skill.skill.skillId);
            damageValue += caster.battleLogic.haloMgr.getAddSkillAmount(caster, skill.skill.skillIndex, skill.skill.skillId);
        }

        //穿甲修正
        let chuanJiaValue = this.getChuanJiaValue(damageVo.originalCaster, target, skillAttr, skill)
        //防御修正
        let defValue = this.getDefValue(target, skillAttr, skill)
        //技能类型修正
        let skillTypeValue: number = this.getSkillTypeValue(damageVo.originalCaster, target, skillAttr, skill)
        //种族修正
        let campValue = this.getCampValue(damageVo.originalCaster, target, skillAttr, skill)

        //伤害.a = 攻击.a * 技能系数.a * （1 - 防御减伤.d）* 闪避修正 * 暴击修正 * buff状态修正 *  技能类型修正  *  种族修正 * 其他修正
        let attackValue = attack * (damageValue / BattleConstantConfig.getRandBase) * missValue * critValue * skillTypeValue * campValue;//伤害修正

        //伤害加成
        let damageAddValue = this.getDamageAdd(damageVo.originalCaster, target, skillAttr, skill)
        let damagePvpAddValue = this.getPvpDamageAdd(damageVo.originalCaster, target, skillAttr, skill)

        //计算伤害加成
        attackValue = attackValue * damageAddValue * damagePvpAddValue;
        damageVo.notDefValue = attackValue;

        if (ignoreData?.real || caster.battleLogic.buffMgr.hasChangeRealBuff(damageVo.originalCaster)) {
            //真实伤害
            damageVo.value = Math.floor(attackValue);
            damageVo.isRealHurt = true;
            return damageVo
        }

        //攻击距离修正
        let disValue: number = this.getDisValue(damageVo.originalCaster, target, skillAttr, skill)

        //攻击系数
        let baseAttackValue = BattleConstantConfig.baseAttackValue;
        //防御减伤.d = 攻击系数 * 攻击.a / （攻击系数 * 攻击.a + 防御.d * 穿甲修正 * 格挡修正 *  攻击距离修正）
        // 400/(100+400 ) 0.8
        // 300/(100+300) 0.75
        let defProValue = 1 - baseAttackValue * attack / (baseAttackValue * attack + def * blockValue * chuanJiaValue * defValue * disValue);//防御减伤

        let damage = Math.max(1, Math.floor(attackValue * (1 - defProValue)));
        damageVo.value = damage;
        // if (caster.teamId == 2)
        //     damageVo.value = 50000
        // if (caster.teamId == 2)
        //     damageVo.value = 5000000
        // if (caster.teamId == 1)
        //     damageVo.value = 9999999999
        return damageVo
    }

    /***忽略攻击力加成的纯系数伤害 */
    static fightNotAtk(skill: SkillBehavior, caster: ICaster, target: BattleUnit, damageValue: number = 0, ignoreData?: { real?: boolean }): DamageVo {

        let damageVo = PoolManager.getItem(DamageVo)
        damageVo.skillInfo = skill.skill;
        damageVo.caster = caster
        damageVo.target = target

        damageVo.status = BattleConstantConfig.Normal;
        let def = target.def;

        let attackValue = damageValue / BattleConstantConfig.getRandBase;//伤害修正
        damageVo.notDefValue = attackValue;

        if (ignoreData?.real || caster.battleLogic.buffMgr.hasChangeRealBuff(damageVo.originalCaster)) {
            //真实伤害
            damageVo.value = Math.floor(attackValue);
            damageVo.isRealHurt = true;
            return damageVo
        }

        //攻击系数
        let baseAttackValue = BattleConstantConfig.baseAttackValue;
        //防御减伤.d = 1 - 攻击系数 * 攻击.a / （攻击系数 * 攻击.a + 防御.d * 穿甲修正 * 格挡修正 *  攻击距离修正）
        let defProValue = 1 - baseAttackValue / (baseAttackValue + def);//防御减伤
        let damage = Math.max(1, Math.floor(attackValue * (1 - defProValue)));
        damageVo.value = damage;
        return damageVo
    }

    /***
     * 治疗
     * includeAtk 是否包含攻击力
     */
    static heal(skill: SkillBehavior, caster: ICaster, target: BattleUnit, damageValue: number = 0, includeAtk: boolean = true, notHero: boolean = false): DamageVo {
        let atk = 1;
        if (includeAtk && !notHero)
            atk = caster.atk;

        let hlInc = 0;
        if (!notHero) {
            let skillAttr = target.battleLogic.buffMgr.getSkillAttr(caster, skill);
            let fighter = target.battleLogic.getBatteUintByUid(caster.casterUid)
            if (fighter) {
                hlInc = this.getValueByType(Attribute.HL_INC, fighter, skillAttr) / BattleConstantConfig.getRandBase;//治愈率
            }
        }
        let hrDec = this.getValueByType(Attribute.HR_DEC, target)//减疗
        let hrInc = this.getValueByType(Attribute.HR_INC, target)//受愈

        let hp = atk * damageValue * (1 + hlInc) * Math.max(0, (1 + (hrInc - hrDec) / BattleConstantConfig.getRandBase))

        hp = Math.max(0, hp)

        let damageVo = PoolManager.getItem(DamageVo)
        damageVo.skillInfo = skill?.skill;
        damageVo.caster = caster
        damageVo.target = target
        damageVo.value = hp;
        damageVo.status = BattleConstantConfig.Heal;

        return damageVo
    }

    static teamHealMax(skill: SkillBehavior, caster: ICaster, target: BattleUnit, damageValue: number = 0): DamageVo {
        let hrDec = this.getValueByType(Attribute.HR_DEC, target)//减疗
        let hrInc = this.getValueByType(Attribute.HR_INC, target)//受愈

        let hp = damageValue * Math.max(0, (1 + (hrInc - hrDec) / BattleConstantConfig.getRandBase))

        hp = Math.max(0, hp)

        let damageVo = PoolManager.getItem(DamageVo)
        damageVo.skillInfo = skill.skill;
        damageVo.caster = caster
        damageVo.target = target
        damageVo.value = hp;
        damageVo.status = BattleConstantConfig.LeaderSkillHeal;

        return damageVo
    }

    static hurtHpMax(skill: SkillBehavior, caster: ICaster, target: BattleUnit, damageValue: number = 0, real: number): DamageVo {
        let damageVo = PoolManager.getItem(DamageVo)
        damageVo.skillInfo = skill.skill;
        damageVo.caster = caster;
        damageVo.target = target;
        damageVo.status = BattleConstantConfig.Normal;
        let def = target.def;
        let attackValue = Math.ceil(target.hpMax * damageValue / BattleConstantConfig.getRandBase)
        if (real) {
            damageVo.value = attackValue;
            damageVo.isRealHurt = true;
        }
        else {
            let defInc = this.getValueByType(Attribute.DEF_INC, target) / BattleConstantConfig.getRandBase;//防御增加
            let defDec = this.getValueByType(Attribute.DEF_DEC, target) / BattleConstantConfig.getRandBase;//防御减少

            //穿甲修正
            let chuanJiaValue = Math.max(0, 1 - defInc - defDec);
            let damageUddValue = this.getValueByType(Attribute.DMG_RES, target) / BattleConstantConfig.getRandBase//伤害减免
            //计算伤害加成
            attackValue = attackValue * Math.max(0, 1 - damageUddValue);
            let defProValue = 1 - BattleConstantConfig.baseAttackValue / (BattleConstantConfig.baseAttackValue + def * chuanJiaValue);//防御减伤
            let damage = Math.max(1, Math.floor(attackValue * (1 - defProValue)));
            damageVo.value = damage;
        }
        return damageVo
    }

    static teamHurt(skill: SkillBehavior, caster: ICaster, target: BattleUnit, damageValue: number = 0): DamageVo {
        let damageVo = PoolManager.getItem(DamageVo)
        damageVo.skillInfo = skill.skill;
        damageVo.caster = caster;
        damageVo.target = target;
        damageVo.status = BattleConstantConfig.LeaderSkillHurt;

        let attack = 0;

        let units = caster.battleLogic.unitProcessor.getUnitsByTeamId(caster.teamId)
        for (let i = 0; i < units.length; i++) {
            if (units[i].isActive) {
                attack += units[i].atk;
            }
        }

        let def = target.def;
        let attackValue = attack * (damageValue / BattleConstantConfig.getRandBase)//伤害修正

        let defInc = this.getValueByType(Attribute.DEF_INC, target) / BattleConstantConfig.getRandBase;//防御增加
        let defDec = this.getValueByType(Attribute.DEF_DEC, target) / BattleConstantConfig.getRandBase;//防御减少

        //穿甲修正
        let chuanJiaValue = Math.max(0, 1 - defInc - defDec);

        let damageUddValue = this.getValueByType(Attribute.DMG_RES, target) / BattleConstantConfig.getRandBase//伤害减免
        //计算伤害加成
        attackValue = attackValue * Math.max(0, 1 - damageUddValue);
        let defProValue = 1 - BattleConstantConfig.baseAttackValue * attack / (BattleConstantConfig.baseAttackValue * attack + def * chuanJiaValue);//防御减伤
        let damage = Math.max(1, Math.floor(attackValue * (1 - defProValue)));
        damageVo.value = damage;
        return damageVo
    }

    static buffHurt(skill: SkillBehavior, buff: SkillBuff | SkillHalo, caster: ICaster, target: BattleUnit, damageValue: number = 0, distance: number = 0, ignoreData?: { atk?: boolean, real?: boolean }): DamageVo {
        let damageVo = PoolManager.getItem(DamageVo)
        damageVo.skillInfo = skill.skill;
        damageVo.caster = caster
        damageVo.target = target
        damageVo.status = BattleConstantConfig.Normal;

        let skillAttr = caster.battleLogic.buffMgr.getSkillAttr(caster, skill);
        let fighter = caster.battleLogic.getBatteUintByUid(caster.casterUid)
        if (!fighter)
            fighter = caster as any;
        let attack = fighter ? ((!ignoreData || !ignoreData.atk) ? fighter.atk : 1) : 1;
        let def = target.def;

        if (skill) {
            if (skill.skill instanceof SkillData) {
                damageValue = caster.battleLogic.buffMgr.getSkillAmount(damageValue, caster, skill.skill.skillIndex, skill.skill.skillId);
                damageValue += caster.battleLogic.buffMgr.getAddSkillAmount(caster, skill.skill.skillIndex, skill.skill.skillId);
                damageValue += caster.battleLogic.haloMgr.getAddSkillAmount(caster, skill.skill.skillIndex, skill.skill.skillId);
            }
            damageValue += caster.battleLogic.buffMgr.getBuffAddDamage(caster, buff.cfg.group);
        }

        //穿甲修正
        let chuanJiaValue = this.getChuanJiaValue(damageVo.originalCaster, target, skillAttr, skill)
        //防御修正
        let defValue = this.getDefValue(target, skillAttr, skill)
        //技能类型修正
        let skillTypeValue: number = this.getSkillTypeValue(damageVo.originalCaster, target, skillAttr, skill)
        //种族修正
        let campValue = this.getCampValue(damageVo.originalCaster, target, skillAttr, skill)

        //伤害.a = 攻击.a * 技能系数.a * （1 - 防御减伤.d） * buff状态修正 *  技能类型修正  *  种族修正 * 异常类伤害修正
        let attackValue = attack * (damageValue / BattleConstantConfig.getRandBase) * skillTypeValue * campValue;//伤害修正

        //伤害加成
        let damageAddValue = this.getDamageAdd(damageVo.originalCaster, target, skillAttr, skill)
        let damagePvpAddValue = this.getPvpDamageAdd(damageVo.originalCaster, target, skillAttr, skill)
        //计算伤害加成
        attackValue = attackValue * damageAddValue * damagePvpAddValue;
        damageVo.notDefValue = attackValue;

        if (ignoreData?.real || caster.battleLogic.buffMgr.hasChangeRealBuff(damageVo.originalCaster)) {
            //真实伤害
            damageVo.value = Math.floor(attackValue);
            damageVo.isRealHurt = true;
            return damageVo
        }

        //攻击距离修正
        let disValue: number = this.getDisValue(damageVo.originalCaster, target, skillAttr, skill, distance)

        //攻击系数
        let baseAttackValue = BattleConstantConfig.baseAttackValue;
        //防御减伤.d = 1 - 攻击系数 * 攻击.a / （攻击系数 * 攻击.a + 防御.d * 穿甲修正 * 格挡修正 *  攻击距离修正）
        let defProValue = 1 - baseAttackValue * attack / (baseAttackValue * attack + def * chuanJiaValue * defValue * disValue);//防御减伤
        let damage = Math.max(1, Math.floor(attackValue * (1 - defProValue)));
        damageVo.value = damage;
        return damageVo
    }

    /***传入攻击计算防御后的伤害（非真伤） */
    static hurtToDef(value: number, caster: BattleUnit, target: BattleUnit): number {
        let fighter = caster.battleLogic.getBatteUintByUid(caster.casterUid)
        let attack = fighter.atk;

        //种族修正
        let campValue = this.getCampValue(caster, target)


        let def = target.def;
        //防御修正
        let defValue = this.getDefValue(target)
        //攻击系数
        let baseAttackValue = BattleConstantConfig.baseAttackValue;
        //防御减伤.d = 1 - 攻击系数 * 攻击.a / （攻击系数 * 攻击.a + 防御.d * 穿甲修正 * 格挡修正 *  攻击距离修正）
        let defProValue = 1 - baseAttackValue * attack / (baseAttackValue * attack + def * defValue);//防御减伤
        value = Math.min(caster.hpMax, Math.max(1, Math.floor(value * campValue * (1 - defProValue))));
        return value;
    }
}
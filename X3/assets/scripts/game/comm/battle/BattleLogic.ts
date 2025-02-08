import { Vec2 } from "cc";
import { PoolManager } from "../../../core/pool/PoolManager";
import { MathUtils } from "../../../core/utils/MathUtils";
import { AttrEnum } from "./attribute/AttrEnum";
import { BattleRandomMgr } from "./BattleRandomMgr";
import { BuffManager } from "./BuffManager";
import BattleConstantConfig from "./config/BattleConstantConfig";
import { DamageVo } from "./DamageVo";
import { DirctionType, HurtNumType, LeaderSkillype as LeaderSkillType, UnitType, WorldUnitTeam } from "./enum/BattleEnum";
import { FightType } from "./enum/FightType";
import { HaloManager } from "./HaloManager";
import { LeaderSkillData } from "./skill/LeaderSkillData";
import { BuffType } from "./skill/SkillEnum";
import { BaseLeaderSkillUnit } from "./unit/leaderSkill/BaseLeaderSkillUnit";
import { Handler } from "../../../core/utils/Handler";
import { BattleUtils } from "./BattleUtils";
import { FightTimeCheck } from "./FightTimeCheck";
import { FightTimeLoop } from "./FightTimeLoop";
import { BattleLogManager } from "./BattleLogManager";
import { BattleDropManager } from "./BattleDropManager";
import UnitCollisionsManager from "./collisions/UnitCollisionsManager";
import BattleProcessor from "./processor/BattleProcessor";
import UnitProcessor from "./processor/UnitProcessor";
import { BattleEasyLogManager } from "./BattleEasyLogManager";
import { FightSkillInfo } from "./skill/FightSkillInfo";
import { IBattleUnitDeadEventData, ICreateMonsterData } from "./interface/BattleInterface";
import BattleSettingMgr from "./BattleSettingMgr";
import { BattleUnit } from "./unit/battle/BattleUnit";
import { TeamUnit } from "./unit/TeamUnit";
import { TableManager } from "../../../core/table/TableManager";
import { ISummonData } from "./unit/battle/ISummonData";
import { AStarInstance } from "./astar/AStarInstance";
import { BattleAutoMgr } from "./BattleAutoMgr";
import BattleEffectMgr from "./BattleEffectMgr";
import { BattleShowManager } from "./show/BattleShowManager";
import { BattleCommand } from "./BattleCommand";
import { StringUtils } from "../../../core/utils/StringUtils";
import { FightManager } from "../../modules/fight/FightManager";
import { TimeManager } from "../../../core/time/TimeManager";
import { SkillData } from "./skill/SkillData";
import { OtherSkillData } from "./skill/OtherSkillData";
import { OtherSkillUnit } from "./unit/other/OtherSkillUnit";
import { HeroUnit } from "./unit/battle/HeroUnit";
import { SkillFactory } from "./skill/SkillFactory";
import { PetBattleData } from "./unit/battle/PetBattleData";
import { IBattlePetData } from "../../modules/battle/vo/IBattlePetData";
import ObjectUtils from "../../../core/utils/ObjectUtils";
import { GunGroupMgr } from "./GunGroupMgr";
import GIns from "../../GIns";
import { CollectSkillData } from "./skill/CollectSkillData";
import { IBattleEnterData } from "../../modules/battle/vo/IBattleEnterData";
import { HeroCareerType } from "../../modules/hero/HeroEnum";

export class BattleLogic {
    public fightType: FightType;
    public battleConfigId: number;
    public battleData: IBattleEnterData;
    public frameIndex: number = 0;
    /***是否隐藏式战斗 */
    public isHideBattle: boolean = false;
    /***是否跳过战斗战斗 */
    public isSkipBattle: boolean = false;
    /***是否后台跳过战斗战斗 */
    public isBlackSkipBattle: boolean = false;
    /***是否关闭战斗AI（索敌那些） */
    public isStopFightAi: boolean = false;
    /***是否从未开始过战斗，这个时候CD不走 */
    public isNerverbegin: boolean = true;
    /***只更新模型，其他暂停 */
    public isEndFight: boolean = false;
    /***是否结束了战斗 */
    public isBattleEnd: boolean = false;

    public battleProcessor: BattleProcessor;
    public unitProcessor: UnitProcessor;

    public buffMgr: BuffManager;
    public gunGroupMgr: GunGroupMgr;
    public haloMgr: HaloManager;
    public randomMgr: BattleRandomMgr;
    public logManager: BattleLogManager;
    public easyLogManager: BattleEasyLogManager;
    public dropManager: BattleDropManager
    public unitCollisionsManager: UnitCollisionsManager
    public battleSetting: BattleSettingMgr
    public aStar: AStarInstance
    public autoMgr: BattleAutoMgr;
    public effectMgr: BattleEffectMgr;
    public showMgr: BattleShowManager
    public command: BattleCommand

    public otherSkillList: OtherSkillData[] = []
    public otherSkillMap: { [skillId: string]: OtherSkillData } = {}
    public leaderSkillList: LeaderSkillData[] = []
    public collectSkillList: CollectSkillData[] = []
    public petBattleList: PetBattleData[] = []
    /***其他需要时间控制的东东 */
    private otherTimeCheck: FightTimeCheck[] = [];

    /***怪物是否无限仇恨 */
    public monsterHateInfinite: boolean = false
    /***是否能使用技能 */
    public canSkill: boolean = true;

    /***uid */
    private uidIndex: number = 10000000;
    /**进入战斗状态的开始时间 */
    public startBattleTime: number = 0;
    /**死亡BossUid */
    public deadBossUid: number = 0;
    /**死亡单位列表 */
    private deadUids: number[] = [];
    /**属性单位字典 */
    private verifyUidList: { unitId: number, checkSum: number }[] = [];
    /**单位死亡数据 事件 BATTLE_UNIT_DEAD_INFO*/
    private deadUnitDeadData: IBattleUnitDeadEventData[] = [];
    /**是否在安全区 */
    public isSafe: boolean = false;
    public mapCfg: table.map.MapidConfig;


    /**歼灭激光的双方队伍造成的累计伤害 */
    public teamHurtJianMieJiGuangMap: { [teamId: number]: number } = {}
    /**波塞冬的双方队伍造成的累计伤害 */
    public teamHurtBoSaiDongMap: { [teamId: number]: number } = {}
    /***是否观战者 */
    public isWatcher: boolean = false;

    /***队伍的默认技能列表 */
    private teamSkillListMap: { [teamId: number]: string[] } = {};

    public noRepeatSearchTargetMap: { [uid_skillId: string]: number } = {};

    public constructor () {
    }

    /***是否后台战斗 */
    public isBackBattle(): boolean {
        return this.isHideBattle || this.isBlackSkipBattle
    }

    /***是否不展示战斗显示单位 */
    public isNotShowBattleEffect(): boolean {
        return this.isBackBattle() || this.isSkipBattle
    }

    public get battleCfg(): table.battle.BattleConfig {
        return TableManager.getDataById(table.battle.BattleConfig, this.battleConfigId)
    }

    public setBattleData(data: IBattleEnterData): void {
        this.battleData = data;
        this.initTeamSkillHandler()
    }

    /***获取结束时间，按当前时间算 */
    public getInitEndTime(): number {
        return this.battleCfg.fightMaxSecond * 1000 + TimeManager.battleNow;
    }

    public init(fightType: FightType): void {
        this.fightType = fightType;

        this.unitProcessor = new UnitProcessor();
        this.battleProcessor = new BattleProcessor(this.unitProcessor);

        this.buffMgr = new BuffManager();
        this.gunGroupMgr = new GunGroupMgr()
        this.haloMgr = new HaloManager();
        this.logManager = new BattleLogManager()
        this.easyLogManager = new BattleEasyLogManager();
        this.dropManager = new BattleDropManager()
        this.randomMgr = new BattleRandomMgr();
        this.battleSetting = new BattleSettingMgr(fightType)
        this.autoMgr = new BattleAutoMgr()
        this.effectMgr = new BattleEffectMgr()
        this.showMgr = new BattleShowManager();
        this.command = new BattleCommand()
        this.randomMgr.setRandomSeed(Date.now())
        this.randomMgr.resRandomSeed()
        this.dropManager.battleLogic = this.logManager.battleLogic
            = this.easyLogManager.battleLogic = this.buffMgr.battleLogic = this.haloMgr.battleLogic = this.autoMgr.battleLogic
            = this.unitProcessor.battleLogic = this.battleProcessor.battleLogic = this.battleSetting.battleLogic = this.effectMgr.battleLogic
            = this.command.battleLogic = this.showMgr.battleLogic = this.gunGroupMgr.battleLogic = this;
    }

    public initMapData(mapCfg: table.map.MapidConfig, mapW: number, mapH: number): void {
        this.mapCfg = mapCfg;
        this.unitCollisionsManager = new UnitCollisionsManager();
        this.unitCollisionsManager.initMapData(mapCfg, mapW, mapH)
        this.unitCollisionsManager.battleLogic = this;

        this.canSkill = true;
        this.monsterHateInfinite = false;
        if (mapCfg.notSkill) {
            this.canSkill = false;
        }

        if (mapCfg.infiniteHate) {
            this.monsterHateInfinite = true;
        }
        this.autoMgr.enterScene();
    }

    public initAStar(): void {
        this.aStar = new AStarInstance(this.unitCollisionsManager);
    }

    private unitsTeamAttrMap: { [teamId: number]: { [key: number]: number } } = {}
    public begin(): void {
        this.initAStar()
        this.initFightPower()
        this.initUnitTeamAttr(WorldUnitTeam.Self)
        this.initUnitTeamAttr(WorldUnitTeam.Enemy)
    }

    /***初始化入门队伍的总属性 */
    private initUnitTeamAttr(team: number): void {
        this.unitsTeamAttrMap[team] = {};
        let units = this.getUnitsByTeamId(team)
        for (let i = 0; i < units.length; i++) {
            for (let key in units[i].attr.attrs) {
                if (!this.unitsTeamAttrMap[team][+key])
                    this.unitsTeamAttrMap[team][+key] = 0;
                this.unitsTeamAttrMap[team][+key] += units[i].getAttrValue(+key)
            }
        }
    }

    /***获取队伍的入门某类型的总属性 */
    public getTeamInitAttrValue(teamId: number, type: AttrEnum): number {
        if (!this.unitsTeamAttrMap[teamId]) return 0;
        return this.unitsTeamAttrMap[teamId][type] || 0;
    }

    /****当前调整值 */
    private nowFightPowerMod: number = 0;
    private fightPowerMods: { min: number, max: number, value: number }[] = [];
    /***设置推荐战力 */
    public initFightPower(): void {
        this.fightPowerMods.length = 0;
        if (this.battleCfg?.cpDamageMod) {
            let arr = StringUtils.strToArr(this.battleCfg.cpDamageMod, ";", ",");
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].length == 3)
                    this.fightPowerMods.push({ min: +arr[i][0], max: +arr[i][1], value: +arr[i][2] })
            }
            let teamFv = 0;
            for (let i = 0; i < this.unitProcessor.heroes.length; i++) {
                let hero = this.unitProcessor.heroes[i]
                teamFv += FightManager.ins().getHeroFight(hero.attr.getConfigId())
            }
            let rate = teamFv / this.battleCfg.power * 100;
            for (let k = 0; k < this.fightPowerMods.length; k++) {
                if (rate >= this.fightPowerMods[k].min && (this.fightPowerMods[k].max == -1 || rate <= this.fightPowerMods[k].max)) {
                    this.nowFightPowerMod = this.fightPowerMods[k].value / 100
                    break
                }
            }
        }
    }

    /***重置uid */
    public resUid(): void {
        this.uidIndex = 10000000;
    }

    /**单位Id */
    public createUid() {
        return ++this.uidIndex;
    }

    /**uid获取单位 */
    public getUnitByUid(uid: number) {
        return this.unitProcessor.getUnitByUid(uid);
    }

    /**uid获取战斗单位 */
    public getBatteUintByUid(uid: number) {
        if (!uid) return;
        return this.unitProcessor.getBattleUnitByUid(uid);
    }

    /**获取队伍坐标 */
    public getTeamPosByTeamId(teamId: number): Vec2 {
        return this.unitProcessor.getTeamById(teamId)?.pos;
    }

    /**获取队伍 */
    public getTeamByTeamId(teamId: number): TeamUnit {
        return this.unitProcessor.getTeamById(teamId);
    }

    /**根据队伍ID获取单位数组 */
    public getUnitsByTeamId(teamId: number): BattleUnit[] {
        return this.unitProcessor.getUnitsByTeamId(teamId);
    }

    public getSummons(uid: number = -1): BattleUnit[] {
        return this.unitProcessor.getSummons(uid);
    }

    public summonDieByHero(uid: number): void {
        let summons = this.unitProcessor.getSummons(uid);
        for (let i = 0; i < summons.length; i++) {
            if (summons[i].isActive)
                summons[i].toDie()
        }
    }

    /***关闭双方战斗AI（索敌那些） */
    public stopFightAi(): void {
        this.isStopFightAi = true;
        var units = this.unitProcessor.allUnits;
        for (var i: number = 0; i < units.length; i++) {
            units[i].stopAction();
        }
    }

    /***启动双方战斗AI（索敌那些） */
    public openFightAi(): void {
        this.isStopFightAi = false;
        this.startFight()
    }

    /****结束战斗，双方停止了AI包括移动的 */
    public endFight(): void {
        this.isEndFight = true;
        var units = this.unitProcessor.allUnits;
        for (var i: number = 0; i < units.length; i++) {
            units[i].endFight();
        }
        this.clear()
    }

    /****开始战斗 */
    public startFight(): void {
        this.isEndFight = false;
        this.isNerverbegin = false
        var units = this.unitProcessor.allUnits;
        for (var i: number = 0; i < units.length; i++) {
            units[i].startFight();
        }
    }

    public update(): void {
        this.buffMgr.update()
        this.haloMgr.update();
        this.gunGroupMgr.update();
        this.updateTimerCheck();
        if (!this.unitProcessor.herosAllDie()) {
            this.updateLeaderSkill();
            this.updateCollectSkill();
            this.updatePetList();
            this.updateOtherSkill()
        }
        this.autoMgr.update();
        this.frameIndex++;
    }

    public remove(): void {
        this.clear();
    }

    public clear(): void {
        this.maxHurtList = []
        this.deadBossUid = 0;
        this.otherTimeCheck.length = 0;
        this.deadUids.length = 0;
        this.isSafe = false;
        this.gunGroupMgr.clear()
        this.buffMgr.clear();
        this.haloMgr.clear();
        this.clearEvent();
        this.teamSkillListMap = {};
        this.teamHurtJianMieJiGuangMap = {};
        this.noRepeatSearchTargetMap = {}
        this.teamHurtBoSaiDongMap = {};
        this.verifyUidList = []
        // this.unitProcessor.resetContainer();
        // this.logManager.stop();
        // this.logManager.start();
        // this.easyLogManager.stop();
        // this.easyLogManager.start();
        // this.autoMgr.enterScene();
    }

    /***创建1个倒数的计时器 */
    public createTimeCheck(delay: number, endCallback: Handler, loopTimes: number = 1, isNowTrigger: boolean = false, isCallLater: boolean = false, completeCallback?: Handler): FightTimeLoop {
        var timeCheck = new FightTimeLoop()
        timeCheck.trigger = BattleUtils.getFrameByTime(delay)
        if (loopTimes == -1)
            loopTimes = 99999999;
        timeCheck.maxTime = timeCheck.trigger * loopTimes
        timeCheck.endCallback = endCallback;
        timeCheck.completeCallback = completeCallback;
        if (isNowTrigger)
            endCallback.run();
        timeCheck.isCallLater = isCallLater;
        this.addTimeCheck(timeCheck)
        return timeCheck
    }

    public addTimeCheck(t: FightTimeCheck): void {
        this.otherTimeCheck.push(t)
    }

    private updateTimerCheck(): void {
        for (var i: number = 0; i < this.otherTimeCheck.length; i++) {
            if (this.otherTimeCheck[i].isReadyToRemove) {
                this.otherTimeCheck.splice(i, 1)
                i--;
            }
            else if (this.otherTimeCheck[i].isCallLater) {
                this.otherTimeCheck[i].activeTriggerHandler()
                this.otherTimeCheck[i].isReadyToRemove = true;
            }
            else {
                this.otherTimeCheck[i].nextFrame();
            }
        }
    }

    /***处理伤害 */
    public hurt(damageVo: DamageVo): void {

        if (damageVo.target.attr.isInvincible()) {
            //无敌不受伤害
            return;
        }

        if (damageVo.isKill) {
            damageVo.target.hurt(damageVo, damageVo.caster.casterUid);
            return;
        }

        if (damageVo.status != BattleConstantConfig.Guard) {
            //非守护伤害
            //处理攻击方是英雄
            if (!(damageVo.skillInfo instanceof LeaderSkillData) && !(damageVo.skillInfo instanceof OtherSkillData)) {
                //存在攻击距离对伤害的加成
                if (damageVo.originalCaster && damageVo.originalCaster.attr.buffStatueByType(BuffType.AtkDisDamage)) {
                    let dis = MathUtils.distance(damageVo.originalCaster.pos, damageVo.target.pos)
                    let atkDisDamage = this.buffMgr.getAtkDisDamage(damageVo.originalCaster, dis)
                    damageVo.value *= atkDisDamage;
                }

                //反伤
                if (damageVo.status != BattleConstantConfig.SpecialHurt && damageVo.status != BattleConstantConfig.CounterAttack
                    && !damageVo.buffInfo) {
                    //反伤不能再被反伤,buff伤害不能被反伤,守护的伤害不能被反伤
                    this.buffMgr.checkCounterAttack(damageVo.originalCaster, damageVo.target, damageVo.notDefValue)
                }
            }

            damageVo.value = Math.floor(damageVo.value * (1 + this.buffMgr.getAddHurtByType(damageVo.target, damageVo.hurtType)))
            damageVo.value = Math.floor(damageVo.value * (1 + this.buffMgr.getAddHurtByAbnormal(damageVo.originalCaster, damageVo.target, damageVo.skillInfo?.skillIndex)))
            damageVo.value = Math.floor(damageVo.value * (1 + this.buffMgr.getAddHurtBySkill(damageVo.target, damageVo.skillInfo?.skillIndex)))
            damageVo.value = Math.floor(damageVo.value * (1 + this.buffMgr.getMoveSpeedDamage(damageVo.originalCaster)))
            damageVo.value = Math.floor(damageVo.value * (1 - this.buffMgr.getMoveSpeedDamageRes(damageVo.target)))
            damageVo.value = Math.floor(damageVo.value * (1 + this.buffMgr.getFlyAddHurt(damageVo.originalCaster, damageVo.target)))
            damageVo.value = Math.floor(damageVo.value * (1 + this.buffMgr.getUnitTypeAddHurt(damageVo.originalCaster, damageVo.target)))
            damageVo.value = Math.floor(damageVo.value * (1 + this.buffMgr.getOtherAddHurt(damageVo.originalCaster)))
            damageVo.value = Math.floor(damageVo.value * (1 - this.buffMgr.getRangedMeleeDamage(damageVo.originalCaster, damageVo.target)))
            damageVo.value = Math.floor(damageVo.value * (1 + this.buffMgr.getToTargetAddHurt(damageVo.originalCaster, damageVo.target)))
            damageVo.value = Math.floor(damageVo.value * (1 - this.buffMgr.getToTargetSubHurt(damageVo.originalCaster, damageVo.target)))
            damageVo.value = Math.floor(damageVo.value * (1 - this.buffMgr.getToTargetSubHurtByBuff(damageVo.originalCaster, damageVo.target)))
            damageVo.value = Math.floor(damageVo.value * (1 + this.buffMgr.getJobAddDamage(damageVo.originalCaster, damageVo.target)))
            damageVo.value = Math.floor(damageVo.value * (1 - this.buffMgr.getConditionAddDamage(damageVo.originalCaster, damageVo.target)))

            //计算战力碾压
            if (damageVo.originalCaster?.teamId == WorldUnitTeam.Self) {
                damageVo.value = Math.floor(damageVo.value * (1 + this.nowFightPowerMod))
            }
            else if (damageVo.target.teamId == WorldUnitTeam.Self) {
                damageVo.value = Math.floor(damageVo.value * (1 - this.nowFightPowerMod))
            }

            if (this.battleSetting.isPvpModel) {
                //PVP玩法重骑伤害减少30%
                if (damageVo.originalCaster.career == HeroCareerType.HeavyCavalry) {
                    damageVo.value = Math.floor(damageVo.value * (1 - 0.3));
                }
            }
        }

        if (damageVo.ignoreNotSelect || damageVo.target.canBeHurt()) {

            if (damageVo.target.checkBeHurtHandler(damageVo)) {
                if (damageVo.status != BattleConstantConfig.SpecialHurt && damageVo.status != BattleConstantConfig.Guard) {
                    damageVo.value = this.buffMgr.getDelayGuardHurt(damageVo.target, damageVo.originalCaster, damageVo.value)
                    damageVo.value = this.buffMgr.getGuardHurt(damageVo.target, damageVo.originalCaster, damageVo.value)
                }
                let damageValue = damageVo.value
                if (!damageVo.isPassThrough)
                    damageValue = this.buffMgr.updateShieldHp(damageVo.target, damageValue)
                damageVo.value = damageValue;
                damageVo.target.hurt(damageVo, damageVo.caster.casterUid);
                if (damageVo.caster.casterUid != damageVo.target.uid) {
                    this.saveOtherDamageMap(damageVo.caster.teamId, damageVo.value);
                }

                if (damageVo.status != BattleConstantConfig.SpecialHurt && damageVo.status != BattleConstantConfig.CounterAttack &&
                    damageVo.status != BattleConstantConfig.Guard && damageVo.originalCaster && !(damageVo.originalCaster instanceof BaseLeaderSkillUnit) && !(damageVo.originalCaster instanceof OtherSkillUnit)) {
                    let lifeSteal: number = damageVo.originalCaster.getAttrValue(AttrEnum.LIFE_STEAL)
                    if (damageVo.skillBehavior) {
                        let skillAttr = this.buffMgr.getSkillAttr(damageVo.originalCaster, damageVo.skillBehavior);
                        if (skillAttr)
                            lifeSteal += skillAttr[AttrEnum.LIFE_STEAL]?.value || 0;
                    }

                    if (lifeSteal) {
                        //计算吸血
                        let lifeStealHp = Math.floor(damageVo.value * lifeSteal / BattleConstantConfig.getRandBase)
                        let lifeStealHpDamageVo = PoolManager.getItem(DamageVo)
                        lifeStealHpDamageVo.skillInfo = damageVo.skillInfo
                        lifeStealHpDamageVo.caster = damageVo.originalCaster;
                        lifeStealHpDamageVo.target = damageVo.originalCaster;
                        lifeStealHpDamageVo.status = BattleConstantConfig.LifeSteal;
                        lifeStealHpDamageVo.value = lifeStealHp
                        this.heal(lifeStealHpDamageVo);
                    }
                }
            }
            else
                damageVo.value = 0;
        }
        else {
            damageVo.value = 0;
        }

        if (damageVo.value <= 0)
            return

        if (damageVo.originalCaster == damageVo.target && damageVo.ignoreSelfHurtText) {
            return
        }

        let damageScaleType: number = 1;
        let rate = damageVo.value / damageVo.target.attr.maxHp;
        if (rate >= BattleConstantConfig.crit3TextValue)
            damageScaleType = 3;
        else if (rate >= BattleConstantConfig.crit2TextValue)
            damageScaleType = 2;

        if (damageVo.status == BattleConstantConfig.Normal || damageVo.status == BattleConstantConfig.LeaderSkillHurt || damageVo.status == BattleConstantConfig.Block
            || damageVo.status == BattleConstantConfig.Miss || damageVo.status == BattleConstantConfig.SpecialHurt || damageVo.status == BattleConstantConfig.CounterAttack
            || damageVo.status == BattleConstantConfig.ForceNormal || damageVo.status == BattleConstantConfig.ForceSkill || damageVo.status == BattleConstantConfig.Guard) {
            let hurtType: number = HurtNumType.Hurt;
            if (damageVo.status == BattleConstantConfig.ForceSkill || (damageVo.status != BattleConstantConfig.ForceNormal && (!damageVo.skillInfo || damageVo.skillInfo.skillIndex != 0))) {
                hurtType = HurtNumType.Skill;
            }
            this.effectMgr.createNum(damageVo.isRealHurt ? HurtNumType.RealHurtNum : hurtType, damageVo.value, damageVo.target.hurtPoint as Vec2, hurtType == HurtNumType.Hurt ? 0 : damageVo.target.hurtNumHight * 0.3, damageVo.target.teamId == WorldUnitTeam.Enemy, damageScaleType);
        }
        else if (damageVo.status == BattleConstantConfig.Crit) {
            if (damageVo.skillInfo && damageVo.skillInfo.skillIndex == 0 && !damageVo.isRealHurt) {
                this.effectMgr.createNum(HurtNumType.CirtNormalHurt, damageVo.value, damageVo.target.hurtPoint as Vec2, damageVo.target.hurtNumHight * 0.3, null, damageScaleType);
            }
            else
                this.effectMgr.createNum(damageVo.isRealHurt ? HurtNumType.CirtRealHurtNum : HurtNumType.CirtHurt, damageVo.value, damageVo.target.hurtPoint as Vec2, damageVo.target.hurtNumHight * 0.6, damageScaleType);
        }
    }

    public checkNoRepeatSearchTargetMap(casterUid: number, targetUid: number, skillId: string, time: number): boolean {
        let targetFrame = BattleUtils.getFrameByTime(time);
        let saveFrame = this.noRepeatSearchTargetMap[casterUid + "_" + skillId + "_" + targetUid] || 0;
        if (!saveFrame || (this.frameIndex - saveFrame) >= targetFrame) {
            this.noRepeatSearchTargetMap[casterUid + "_" + skillId + "_" + targetUid] = this.frameIndex
            return true;
        }

        return false;
    }

    /***记录伤害统计列表 */
    protected saveOtherDamageMap(teamId: number, damageValue: number): void {
        if (!this.teamHurtJianMieJiGuangMap[teamId]) {
            this.teamHurtJianMieJiGuangMap[teamId] = 0;
        }
        this.teamHurtJianMieJiGuangMap[teamId] += damageValue

        if (!this.teamHurtBoSaiDongMap[teamId]) {
            this.teamHurtBoSaiDongMap[teamId] = 0;
        }
        this.teamHurtBoSaiDongMap[teamId] += damageValue
    }


    public heal(damageVo: DamageVo): void {
        if (this.buffMgr.checkCannotHeal(damageVo.target, damageVo.status))
            return

        let damageValue = this.buffMgr.updateHealShieldHp(damageVo.target, damageVo.value)
        damageVo.value = damageValue;
        damageVo.value = Math.floor(damageVo.value * (1 + this.buffMgr.getAddHealByType(damageVo.target, damageVo.healType)))
        damageVo.value = Math.floor(damageVo.value * (1 + this.buffMgr.getHealHpAmount(damageVo.caster, damageVo.target)))

        if (damageVo.originalCaster?.teamId == WorldUnitTeam.Self) {
            damageVo.value = Math.floor(damageVo.value * (1 + this.nowFightPowerMod))
        }

        if (damageValue > 0) {
            damageVo.target.heal(damageVo);
            this.effectMgr.createNum(HurtNumType.Heal, damageVo.value, damageVo.target.pos, damageVo.target.hurtNumHight);
        }
    }

    /***根据队伍ID进战 */
    public enterFight(teamId: number): void {
        let units = this.unitProcessor.getUnitsByTeamId(teamId)
        for (let i = 0; i < units.length; i++) {
            if (units[i].isActive && !units[i].isBeginToFight)
                units[i].enterFight(false)
        }
    }

    /**进入战斗 */
    public enterBattleState() {
        if (!this.isInBattle()) {
            for (let i = 0; i < this.leaderSkillList.length; i++) {
                this.leaderSkillList[i].enterBattleState()
            }
            for (let i = 0; i < this.collectSkillList.length; i++) {
                this.collectSkillList[i].enterBattleState()
            }
        }

        this.unitProcessor.readyDispose = false;
        if (!this.startBattleTime) {
            this.startBattleTime = this.frameIndex;
        }
    }

    /***己方已经激活的阵容 */
    private selfFormationActivationMap: { [id: number]: { cfg: table.battle.FormationSkillConfig, heros: HeroUnit[] } };
    /***敌方已经激活的阵容 */
    private enemyFormationActivationMap: { [id: number]: { cfg: table.battle.FormationSkillConfig, heros: HeroUnit[] } };
    /***更新阵容 */
    public updateFormation(): void {
        this.selfFormationActivationMap = {};
        this.enemyFormationActivationMap = {};
        let cfgs = TableManager.getAllData(table.battle.FormationSkillConfig);
        for (let i = 0; i < cfgs.length; i++) {
            let cfg = cfgs[i];
            this.updateFormationByTeam(cfg, WorldUnitTeam.Self)
            this.updateFormationByTeam(cfg, WorldUnitTeam.Enemy)
        }
    }

    private updateFormationByTeam(cfg: table.battle.FormationSkillConfig, worldUnitTeam: WorldUnitTeam): void {
        let heros: HeroUnit[] = []
        let units: BattleUnit[] = this.unitProcessor.getUnitsByTeamId(worldUnitTeam)
        for (let j = 0; j < units.length; j++) {
            if (units[j] instanceof HeroUnit && cfg.heros.indexOf(units[j].attr.getConfigId()) != -1) {
                heros.push(units[j] as HeroUnit)
            }
        }

        if (heros.length >= cfg.minNum) {
            if (worldUnitTeam == WorldUnitTeam.Self)
                this.selfFormationActivationMap[cfg.id] = { cfg: cfg, heros: heros };
            else
                this.enemyFormationActivationMap[cfg.id] = { cfg: cfg, heros: heros };

            if (cfg.skillId?.length) {
                for (let i = 0; i < heros.length; i++) {
                    for (let k = 0; k < cfg.skillId.length; k++)
                        heros[i].attr.addOtherPassiveSkill(cfg.skillId[k])
                }
            }

            if (cfg.heroPosSkillId?.length) {
                for (let i = 0; i < heros.length; i++) {
                    let index = cfg.heros.indexOf(units[i].attr.getConfigId())
                    if (index != -1) {
                        let skillId = cfg.heroPosSkillId[index]
                        if (skillId) {
                            heros[i].attr.addOtherPassiveSkill(skillId)
                        }
                    }
                }
            }
        }
    }

    /***根据队伍ID和阵容ID获取阵容 */
    public getFormationByTeamAndId(teamId: WorldUnitTeam, id: number): { cfg: table.battle.FormationSkillConfig, heros: HeroUnit[] } {
        if (teamId == WorldUnitTeam.Self) {
            if (!this.selfFormationActivationMap)
                return null
            return this.selfFormationActivationMap[id]
        }
        else {
            if (!this.enemyFormationActivationMap)
                return null
            return this.enemyFormationActivationMap[id];
        }
    }

    /**退出战斗 */
    public exitBattleState() {
        this.startBattleTime = 0;
    }

    /**是否在战斗状态 */
    public isInBattle(): boolean {
        return !!this.startBattleTime;
    }


    /***初始化其他技能 */
    public initOtherSkill(skillList: string[], teamId: number, isOnce: boolean = false): void {
        for (let i = 0; i < skillList.length; i++) {
            if (!this.otherSkillMap[skillList[i]]) {
                let skillData = new OtherSkillData()
                skillData.teamId = teamId;
                skillData.init(null, skillList[i], this)
                skillData.fightSkillInfo = SkillFactory.createFightSkillInfo(skillData.cfg.belongType)
                skillData.fightSkillInfo.skill = skillData
                if (skillData.cfg) {
                    this.otherSkillMap[skillList[i]] = skillData;
                    this.addOtherSkill(skillData);
                    if (!isOnce)
                        this.otherSkillList.push(skillData)
                    else {
                        this.useOtherSkill(skillData)
                    }
                }
            }
            else {
                if (isOnce)
                    this.useOtherSkill(this.otherSkillMap[skillList[i]])
            }

        }
    }

    private updateOtherSkill(): void {
        if (this.unitProcessor.herosAllDie())
            return

        for (var i: number = 0; i < this.otherSkillList.length; i++) {
            if (this.otherSkillList[i].isReadyToRemove) {
            }
            else {
                this.otherSkillList[i].nextFrame();
            }
        }
    }

    /***初始化宠物 */
    public initPets(isInit: boolean, datas: IBattlePetData[], teamId: number): void {
        if (isInit) {
            this.petBattleList = [];
            // for (let i = 0; i < this.unitProcessor.pets.length; i++) {
            //     for (let j = 0; j < petList.length; j++) {
            //         if (petList[j].configId != this.unitProcessor.pets[i].cfg.id) {
            //             this.unitProcessor.removePet(this.unitProcessor.pets[i])
            //             i--;
            //         }
            //     }
            // }
            this.unitProcessor.removePet()
        }
        if (datas) {
            for (let i = 0; i < datas.length; i++) {
                let petData = new PetBattleData()
                petData.uid = datas[i].uid;
                petData.battleLogic = this;
                petData.petId = datas[i].configId + "";
                petData.teamId = teamId;
                petData.attr = datas[i].attrs;
                petData.initSkills(datas[i].skillIds)
                if (petData.cfg)
                    this.petBattleList.push(petData)
            }
        }
    }

    private updatePetList(): void {
        for (var i: number = 0; i < this.petBattleList.length; i++) {
            if (this.petBattleList[i].isReadyToRemove) {
            }
            else {
                this.petBattleList[i].nextFrame();
            }
        }
    }

    /***使用队长技能 */
    public usePet(petData: PetBattleData): void {
        if (this.isEndFight)
            return
        this.unitProcessor.createPetUnit(petData);
    }


    /***初始化队长技能 */
    public initLeaderSkill(isInit: boolean, skillList: string[], teamId: number): void {
        if (isInit)
            this.leaderSkillList = [];
        for (let i = 0; i < skillList.length; i++) {
            let skillData = new LeaderSkillData()
            skillData.teamId = teamId;
            skillData.init(null, skillList[i], this)
            if (skillData.cfg) {
                skillData.fightSkillInfo = SkillFactory.createFightSkillInfo(skillData.cfg.belongType)
                skillData.fightSkillInfo.skill = skillData
                this.leaderSkillList.push(skillData)
            }
        }
    }

    private updateLeaderSkill(): void {
        for (var i: number = 0; i < this.leaderSkillList.length; i++) {
            if (this.leaderSkillList[i].isReadyToRemove) {
            }
            else {
                this.leaderSkillList[i].nextFrame();
            }
        }
    }

    public getSelfLeaderSkill(): LeaderSkillData {
        for (let i = 0; i < this.leaderSkillList.length; i++)
            if ((this.leaderSkillList[i].teamId == WorldUnitTeam.Self)) {
                return this.leaderSkillList[i]
            }
        return null
    }

    /***获取战队技能 */
    public getLeaderSkillById(id: string): LeaderSkillData {
        for (let i = 0; i < this.leaderSkillList.length; i++)
            if ((this.leaderSkillList[i].cfg.id + "") == id) {
                return this.leaderSkillList[i]
            }

        return null;
    }

    /***队长技能是否CD中 */
    public isLeaderSkillCD(): boolean {
        if (this.isInBattle) {
            let leaderSkillList = this.leaderSkillList
            for (let i = 0; i < leaderSkillList.length; i++) {
                if (leaderSkillList[i].cd > 0)
                    return true;
            }
        }

        return false;
    }

    /***使用队长技能 */
    public useLeaderSkill(skillData: LeaderSkillData): void {
        if (this.isEndFight)
            return
        this.unitProcessor.createLeaderUnits(skillData);
    }

    /***初始化收藏品技能 */
    public initCollectSkill(isInit: boolean, skillList: string[], teamId: number): void {
        // skillList = ["SCP_10001"];
        if (isInit)
            this.collectSkillList = [];
        for (let i = 0; i < skillList.length; i++) {
            let skillData = new CollectSkillData()
            skillData.teamId = teamId;
            skillData.init(null, skillList[i], this)
            if (skillData.cfg) {
                skillData.fightSkillInfo = SkillFactory.createFightSkillInfo(skillData.cfg.belongType)
                skillData.fightSkillInfo.skill = skillData
                this.collectSkillList.push(skillData)
            }
        }
    }

    /***使用收藏品技能 */
    public useCollectSkill(skillData: CollectSkillData): void {
        if (this.isEndFight)
            return
        this.unitProcessor.createCollectUnits(skillData);
    }

    private updateCollectSkill(): void {
        for (var i: number = 0; i < this.collectSkillList.length; i++) {
            if (this.collectSkillList[i].isReadyToRemove) {
            }
            else {
                this.collectSkillList[i].nextFrame();
            }
        }
    }

    /***获取收藏品技能 */
    public getCollectSkillById(id: string): CollectSkillData {
        for (let i = 0; i < this.collectSkillList.length; i++)
            if ((this.collectSkillList[i].cfg.id + "") == id) {
                return this.collectSkillList[i]
            }

        return null;
    }

    /***收藏品技能是否CD中 */
    public isCollectSkillCD(): boolean {
        if (this.isInBattle) {
            let collectSkillList = this.collectSkillList
            for (let i = 0; i < collectSkillList.length; i++) {
                if (collectSkillList[i].cd > 0)
                    return true;
            }
        }

        return false;
    }

    /***使用1个场景外的技能 */
    public useOtherSkill(skillData: OtherSkillData): void {
        if (this.isEndFight)
            return
        this.unitProcessor.useOtherSkillUnits(skillData);
    }

    public addOtherSkill(skillData: OtherSkillData): void {
        this.unitProcessor.createOtherSkillUnits(skillData);
    }

    /***创建怪物 */
    public createMonster(monsterId: number, x: number, y: number, teamId: number, dirction: DirctionType = DirctionType.Left, num: number = 1, summonData?: ISummonData): void {
        let monsterData: ICreateMonsterData = {} as any
        monsterData.monsterId = monsterId
        monsterData.pos = new Vec2(x, y)
        monsterData.idxs = []
        if (summonData?.isSplitMonster)
            monsterData.splitMonsterFatherUid = summonData.byUid;
        monsterData.summon = summonData?.isSummon ? summonData : null;
        monsterData.teamId = teamId;
        if (summonData && !summonData.isSummon)
            monsterData.isNotStatisticsHp = true;
        monsterData.attr = summonData?.attr
        monsterData.dirction = dirction;
        for (let i = 0; i < num; i++)
            monsterData.idxs.push(num)
        let monsterArr: ICreateMonsterData[] = [monsterData];
        this.unitProcessor.createMonsterUnits(monsterArr);
    }


    /**检测单位死亡 */
    public markBossDead(uid: number) {
        this.deadBossUid = uid;
    }

    /**添加怪物死亡数据 （玩法统计） */
    private pushUnitDead(teamId: WorldUnitTeam, unitType: UnitType, configId: number) {
        let data = {
            teamId,
            heroId: unitType == UnitType.Hero ? configId : null,
            monsterId: unitType != UnitType.Hero ? configId : null
        } as IBattleUnitDeadEventData

        this.deadUnitDeadData.push(data);
    }

    /**取出死亡单位Id */
    public popDeadUnitEventDatas() {
        if (!this.deadUnitDeadData.length) return null;
        let datas = this.deadUnitDeadData;
        this.deadUnitDeadData = [];
        return datas;
    }

    /**取出死亡单位Id */
    public popDeadUids() {
        if (!this.deadUids.length) return null;

        let uids = this.deadUids;
        this.deadUids = [];
        return uids;
    }

    /**检测单位死亡 */
    public markDead(uid: number, teamId: WorldUnitTeam, unitType: UnitType, configId: number) {
        this.unitProcessor.isDeadDirty = true;
        if (this.battleSetting.isSendUnitDead) {
            this.deadUids.push(uid);
        }

        if (teamId === WorldUnitTeam.Self ? this.battleSetting.isEventAttackerDead : this.battleSetting.isEventDefenderDead) {
            this.pushUnitDead(teamId, unitType, configId);
        }
    }

    /**记录检查验证的单位 */
    public markVerify(unit: BattleUnit) {
        if (this.battleData) {
            let checkSum = 0;
            for (let key in unit.attr.attrs) {
                let value = unit.attr.attrs[key];
                checkSum += value % this.battleData.randomSeed;
            }
            this.verifyUidList.push({ unitId: unit.uid, checkSum: checkSum })
        }
    }

    /**取出验证检查单位Id */
    public popVerifyUids() {
        if (!this.verifyUidList.length) return null;

        let uids = this.verifyUidList;
        this.verifyUidList = []
        return uids;
    }

    private _isAutoFight: boolean = false;
    public get isAutoFight(): boolean {
        return this._isAutoFight;
    }

    /***是否自动战斗,包括移动 */
    public set isAutoFight(value: boolean) {
        if (!value && this.isBackBattle()) {
            return
        }

        this._isAutoFight = value;
        if (!value) {
            this.autoMgr.stop()
        }
    }

    /***检查受击单位的仇恨分组传递仇恨 */
    public checkBattleUnitHateGroup(from: BattleUnit, hateTarget: BattleUnit): void {
        if (!from.hatredGroup)
            return
        let units = this.unitProcessor.getMonsterHateGroup(from.hatredGroup)
        if (units) {
            for (let i = 0; i < units.length; i++)
                if (units[i].isActive && !units[i].selectHatredTarget && !units[i].selectMainTarget) {
                    units[i].setMoveTarget(hateTarget.pos, true)
                }
        }
    }

    private eventHandlerMap: { [command: string]: Handler } = {};
    private eventUidMap: { [uid: string]: string[] } = {};
    public clearEvent(): void {
        this.eventHandlerMap = {};
        this.eventUidMap = {};
    }

    public regEvent(command: string, uid: number, handler: Handler): void {
        let key = command + "_" + uid;
        this.eventHandlerMap[key] = handler
        if (!this.eventUidMap[uid])
            this.eventUidMap[uid] = []
        this.eventUidMap[uid].push(key)
    }

    public sendEvent(command: string, uid: number, ...arg): void {
        let commands = this.eventHandlerMap[command + "_" + uid]
        if (commands) {
            commands.runWith(arg);
        }
    }

    public removeEvent(uid: number): void {
        let keys = this.eventUidMap[uid];
        if (keys) {
            for (let key of keys) {
                delete this.eventHandlerMap[key]
            }
        }
        delete this.eventUidMap[uid]
    }

    /***当前战斗状态是否能打开布阵 */
    public canOpenFormation(): boolean {
        return this.isSafe || GIns.mapMgr.isInMainCity();
    }

    /***超过上限的次数 */
    public maxHurtList: Vo.battle.FightUnitAbnormalHurtVo[] = []
    /***检查上限伤害 */
    public checkMaxHurtHandler(damage: DamageVo, target: BattleUnit): void {
        let value: number = damage.value;
        if (!damage.caster || !damage.caster.caster) {
            return
        }

        if (damage.isKill && damage.status == BattleConstantConfig.Kill) {
            //杀的不处理
            return
        }

        if (damage.caster.teamId == WorldUnitTeam.Enemy) {
            //只处理玩家自身
            return
        }

        if (this.maxHurtList.length == 5) {
            return
        }

        let maxHurt = damage.caster.caster.attr.maxHurt;
        if (maxHurt == -1 || value < maxHurt) {
            //没超过极限血量
            return
        }

        if (damage.caster.teamId == target.teamId) {
            //自己打自己队伍的不处理
            return
        }

        if (damage.skillInfo && damage.skillInfo.cfg.belongType && BattleConstantConfig.notSkillBelongIdExtremeRate.indexOf(damage.skillInfo.cfg.belongType) != -1) {
            //在技能的白名单内的不处理
            return
        }

        this.maxHurtList.push({ unitId: damage.caster.casterUid, abnormalHurt: damage.value })
    }

    private initTeamSkillHandler(): void {
        if (this.battleData?.teamSkillListMap) {
            for (let teamId in this.battleData.teamSkillListMap) {
                this.initTeamSkill(+teamId, this.battleData.teamSkillListMap[teamId])
            }
        }
    }

    /***初始化队伍技能 */
    public initTeamSkill(teamId: number, skills: string[], isAdd: boolean = false): void {
        if (isAdd)
            this.teamSkillListMap[teamId] = this.teamSkillListMap[teamId].concat(skills)
        else
            this.teamSkillListMap[teamId] = skills;
    }

    public getTeamSkillByTeamId(teamId: number): string[] {
        return this.teamSkillListMap[teamId] || [];
    }
}
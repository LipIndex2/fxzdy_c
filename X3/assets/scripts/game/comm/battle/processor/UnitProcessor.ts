import UnitFactory from "../factory/UnitFactory";
import { BaseUnit } from "../unit/BaseUnit";
import { TeamUnit } from "../unit/TeamUnit";
import { HeroUnit } from "../unit/battle/HeroUnit";
import { BulletUnit } from "../unit/bullet/BulletUnit";
import { UnitType, WorldUnitTeam } from "../enum/BattleEnum";
import { MineralUnit } from "../unit/MineralUnit";
import { ICreateMineralData, ICreateMonsterData, ICreatePetData } from "../interface/BattleInterface";
import BattleConstantConfig from "../config/BattleConstantConfig";
import { BattleUnit } from "../unit/battle/BattleUnit";
import { AreaUnit } from "../unit/AreaUnit";
import { IBattleUnitData } from "../../../modules/battle/vo/IBattleUnitData";
import { BaseLeaderSkillUnit } from "../unit/leaderSkill/BaseLeaderSkillUnit";
import { LeaderSkillData } from "../skill/LeaderSkillData";
import { SkillUtils } from "../skill/SkillUtils";
import { MathUtils } from "../../../../core/utils/MathUtils";
import { SortUtils } from "../../../../core/utils/SortUtils";
import { DropUnit } from "../unit/DropUnit";
import G from "../../../../core/comm/G";
import { BaseShowUnit } from "../show/BaseShowUnit";
import { FightType } from "../enum/FightType";
import { BattleLogic } from "../BattleLogic";
import { PoolManager } from "../../../../core/pool/PoolManager";
import { IMapInstance } from "../../../tiledMap/interface/IMapInstance";
import { SkillData } from "../skill/SkillData";
import { OtherSkillUnit } from "../unit/other/OtherSkillUnit";
import { OtherSkillData } from "../skill/OtherSkillData";
import { PetUnit } from "../unit/battle/PetUnit";
import { PetBattleData } from "../unit/battle/PetBattleData";
import { PetFactory } from "../factory/PetFactory";
import { AttrEnum } from "../attribute/AttrEnum";
import { MonsterUnit } from "../unit/battle/MonsterUnit";
import ArrayUtils from "../../../../core/utils/ArrayUtils";
import { CollectSkillData } from "../skill/CollectSkillData";
import { BaseCollectSkillUnit } from "../unit/collectSkill/BaseCollectSkillUnit";

export default class UnitProcessor {
    public battleLogic: BattleLogic;
    public mapIns: IMapInstance
    private fightType: FightType;
    private _teamMap: { [teamId: number]: TeamUnit };
    private _units: { [teamId: number]: BattleUnit[] };
    private _heros: HeroUnit[];
    private _bullets: BulletUnit[];
    private _minerals: MineralUnit[];
    private _leaderSkill: BaseLeaderSkillUnit[];
    private _collectSkill: BaseCollectSkillUnit[];
    private _otherSkill: OtherSkillUnit[];
    private _pets: PetUnit[];
    private _drops: DropUnit[];

    /**可解锁的障碍映射 */
    private _blockMap: { [key: number]: AreaUnit };

    //单位映射
    private _uidMap: { [key: number]: BaseUnit };

    //资源单位 （包括：怪物、矿产、宝箱）
    private _resIdToUid: { [key: string]: number };

    /**容器 */
    private _unitTypeMap: { [key: string]: BaseUnit[] };

    /***怪物仇恨分组 */
    private monsterHateGroupMap: { [group: number]: BattleUnit[] };

    /**等待销毁的单位 */
    private _waitDisposeUnit: BaseUnit[] = [];
    /**等待移除的UID */
    private _waitDisposeUid: number[] = [];

    /**是否有单位死亡 */
    public isDeadDirty: boolean;

    /***销毁时间（帧） */
    private disposeFrameTime: number = BattleConstantConfig.disposeMaxTime;

    constructor () {
        this.initContainer();
        BattleConstantConfig.init();
    }

    public setFightType(fightType: FightType): void {
        this.fightType = fightType;
    }

    /**初始化容器 */
    initContainer() {
        this._unitTypeMap = {};
        this._unitTypeMap[UnitType.Hero] = this._heros = [];
        this._unitTypeMap[UnitType.Monster] = [];
        this._unitTypeMap[UnitType.Bullet] = this._bullets = [];
        this._unitTypeMap[UnitType.Mineral] = this._minerals = [];
        this._unitTypeMap[UnitType.LeaderSkill] = this._leaderSkill = [];
        this._unitTypeMap[UnitType.CollectSkill] = this._collectSkill = [];
        this._unitTypeMap[UnitType.OtherSkill] = this._otherSkill = [];
        this._unitTypeMap[UnitType.Drop] = this._drops = [];
        this._unitTypeMap[UnitType.Pet] = this._pets = []
        this._uidMap = {};
        this._resIdToUid = {};
        this._blockMap = {};
        this._teamMap = {}
        this._units = {};
        this.monsterHateGroupMap = {}
        this._units[WorldUnitTeam.Self] = []
        this._units[WorldUnitTeam.Enemy] = []
    }

    /**重置容器 */
    resetContainer() {
        this.doDisposeUnits(true, true);
        for (const type in this._unitTypeMap) {
            this._unitTypeMap[type].length = 0;
        }
        this._uidMap = {};
        this._resIdToUid = {};
        this._blockMap = {};
        this._teamMap = {};
        this._waitDisposeUid.length = 0;
        this._units = {};
        this._units[WorldUnitTeam.Self] = []
        this._units[WorldUnitTeam.Enemy] = []
        this.monsterHateGroupMap = {}
        this.battleLogic.unitCollisionsManager.reset();
    }

    /**通过uid获取单位 */
    getUnitByUid(uid: number) {
        return this._uidMap[uid];
    }

    /**通过uid获取单位 */
    getBattleUnitByUid(uid: number): BattleUnit {
        let unit = this._uidMap[uid];
        if (unit instanceof BattleUnit) {
            return this._uidMap[uid] as BattleUnit;
        }
    }

    /** 获取团队单元*/
    get teamMap(): { [teamId: number]: TeamUnit } {
        return this._teamMap;
    }

    getTeamById(teamId: number): TeamUnit {
        return this._teamMap[teamId]
    }

    get myTeam(): TeamUnit {
        return this._teamMap[WorldUnitTeam.Self];
    }

    /***获取所有攻击单位 */
    get allUnits(): BattleUnit[] {
        return this._units[WorldUnitTeam.Self].concat(this._units[WorldUnitTeam.Enemy])
    }

    /** 获取英雄列表 */
    get heroes() {
        return this._heros;
    }

    /** 获取宠物列表 */
    get pets() {
        return this._pets;
    }

    /** 获取子弹列表 */
    get bullets() {
        return this._bullets;
    }

    /** 获取矿产 */
    get minerals() {
        return this._minerals;
    }

    /** 获取队长技能列表 */
    get leaderSkills() {
        return this._leaderSkill;
    }

    /** 获取收藏品技能列表 */
    get collectSkills() {
        return this._collectSkill
    }

    /** 其他技能列表 */
    get otherSkill() {
        return this._otherSkill
    }

    public getSummons(uid: number = -1): BattleUnit[] {
        let arr = []
        let units = this.allUnits;
        for (let i = 0; i < units.length; i++) {
            if (units[i].summon && units[i].isActive && (uid == -1 || units[i].summon.byUid == uid)) {
                arr.push(units[i])
            }
        }
        return arr;
    }

    /***玩家的英雄是否全部死亡 */
    public herosAllDie(): boolean {
        for (let i = 0; i < this.heroes.length; i++) {
            if (this.heroes[i].attr.isAlive()) {
                return false
            }
        }

        return true;
    }

    /**销毁 */
    public disposeShowUnit(unit: BaseShowUnit) {
    }

    /**销毁 */
    public disposeUnit(unit: BaseUnit) {
        this._waitDisposeUnit.push(unit);
    }

    /***攻击者的引用次数，主要是子弹 */
    public quoteUidMap: { [uid: string]: number } = {}
    /***是否可以销毁 */
    public readyDispose: boolean = true;
    /**确认销毁的时间戳 */
    public readyDisposeTime: number = 0;
    /**执行销毁 */
    public doDisposeUnits(force: boolean = false, ignoreQuote: boolean = false) {
        if (!force)
            if (!this._waitDisposeUnit.length || !this.readyDispose) return;

        let t = BattleConstantConfig.disposeMaxTime;
        if (force || (Date.now() - this.readyDisposeTime) > t) {

            for (let i = 0; i < this._waitDisposeUnit.length; i++) {
                let unit = this._waitDisposeUnit[i];
                if (!unit.isNeedDispose) {
                    //单位被重用了
                    this._waitDisposeUnit.splice(i, 1);
                    i--;
                    continue;
                }

                if (!ignoreQuote && this.quoteUidMap[this._waitDisposeUnit[i].uid]) {
                    //还有引用次数，先不删除
                    continue;
                }

                this._waitDisposeUnit.splice(i, 1);
                i--;


                let resId = unit.resId;
                if (resId && this._resIdToUid[resId]) {
                    delete this._resIdToUid[resId];
                }

                let uid = unit.uid;
                if (uid && this._uidMap[uid]) {
                    delete this._uidMap[uid];
                }

                let unitType = unit.type;
                let arr = this._unitTypeMap[unitType];
                if (arr) {
                    let index = arr.indexOf(unit);
                    if (index != -1) {
                        arr.splice(index, 1);
                        unit.dispose();
                    }
                }

                if (unit instanceof BattleUnit) {
                    this.removeUnits(unit)
                }
            }
        }
        // this.disposeFrameTime--
        // if (this.disposeFrameTime <= 0) {
        //     this.disposeFrameTime = BattleConstantConfig.disposeMaxTime;
        //     // for (let i = this._waitDisposeUid.length - 1; i >= 0; i--) {
        //     //     delete this._uidMap[this._waitDisposeUid[i]];
        //     // }
        // }
    }

    /***移除UID的引用 */
    public removeQuoteUid(uid: number): void {
        let num = this.quoteUidMap[uid]
        if (num) {
            num--;
            if (num <= 0)
                delete this.quoteUidMap[uid]
            else
                this.quoteUidMap[uid] = num;
        }
    }

    public loadTeam(teamId: number) {
        this._teamMap[teamId] = PoolManager.getItem(TeamUnit);
        this._teamMap[teamId].battleLogic = this.battleLogic;
        this._teamMap[teamId].teamId = teamId;
        this._teamMap[teamId].setPosXY(0, 0);

        let mapCfg = this.battleLogic.mapCfg;
        if (teamId == WorldUnitTeam.Enemy && mapCfg.enemyPos) {
            //设置敌人队伍坐标
            this._teamMap[teamId].setPosXY(mapCfg.enemyPos[0], mapCfg.enemyPos[1])
        }

    }

    /**创建英雄单位 */
    public createHeroes(teamId: number, arr: IBattleUnitData[]) {
        let pos = this._teamMap[teamId].pos;
        for (let i = 0; i < arr.length; i++) {
            let unit = UnitFactory.createHeroUnit(WorldUnitTeam.Self, arr[i], this.fightType);
            unit.setPosXY(pos.x, pos.y);
            this._heros.push(unit);
            this.addUnit(teamId, unit)
            this._uidMap[unit.uid] = unit;
        }

        // this._heros.sort((a, b) => {
        //     return b.seatSort - a.seatSort;
        // });
        if (!this._heros || this._heros.length == 0) {
            G.Logger.error("=======队伍英雄数量为0=======");
            return
        }
        SortUtils.sortBy2(this._heros, ["formationPosition"], [true], false)
        let n = this._heros.length;
        while (this._heros[0].formationPosition == 0 && n > 0) {
            this._heros.push(this._heros.shift())
            //阵位0置后
            n--;
        }

        this._teamMap[teamId].setHeroList(this._heros);
        this._teamMap[teamId].updateFormation();
    }

    public createOneHero(teamId: number, data: IBattleUnitData): HeroUnit {
        let unit = UnitFactory.createHeroUnit(teamId, data, this.fightType);
        this.addHero(unit)
        this._uidMap[unit.uid] = unit;
        return unit
    }

    public addHero(unit: HeroUnit): void {
        this._heros.push(unit);
        this.addUnit(unit.teamId, unit)
    }

    public removeUnits(unit: BattleUnit): void {
        if (unit) {
            this.removeMonsterHateGroup(unit)
            let teamUnits = this._units[unit.teamId]
            if (teamUnits) {
                let index = teamUnits.indexOf(unit);
                if (index != -1) {
                    teamUnits.splice(index, 1);
                    if (!unit.isDisposed)
                        unit.dispose()
                }
            }
        }
    }

    /**移除英雄单位 */
    public removeHero(unit: HeroUnit) {
        // let uid = unit.uid;
        // if (uid && this._uidMap[uid]) {
        //     delete this._uidMap[uid];
        // }
        let index = this._heros.indexOf(unit);
        if (index != -1) {
            this._heros.splice(index, 1);
        }
        unit.dispose();
        if (unit) {
            this.removeUnits(unit)
        }
    }

    /**移除宠物单位 */
    public removePet(unit: PetUnit = null) {
        if (unit) {
            let index = this._pets.indexOf(unit);
            if (index != -1) {
                this._pets.splice(index, 1);
            }
            unit.dispose();
            if (unit) {
                this.removeUnits(unit)
            }
        }
        else {
            while (this._pets.length) {
                unit = this._pets.shift()
                unit.dispose();
                if (unit) {
                    this.removeUnits(unit)
                }
            }
        }
    }

    /**加载安全区 */
    public loadSafeArea() {
        let objects = this.mapIns.getSafeAreaObjects();

        let arr = [];
        for (let i = 0; i < objects.length; i++) {
            let unit = UnitFactory.createAreaUnit(objects[i]);
            if (unit) {
                arr.push(unit);
            }
        }

        this.battleLogic.unitCollisionsManager.updateSafeAreaUnits(arr);
    }

    /** 加载地图分区域 */
    public loadArea() {
        let objects = this.mapIns.getAreaObjects();

        let arr = [];
        for (let i = 0; i < objects.length; i++) {
            let unit = UnitFactory.createAreaUnit(objects[i]);
            if (unit) {
                arr.push(unit);
            }
        }

        this.battleLogic.unitCollisionsManager.updateAreaUnits(arr);
    }

    /**加载障碍 */
    public loadBlock() {
        let objects = this.mapIns.getBlockObjects();

        let arr = [];
        for (let i = 0; i < objects.length; i++) {
            let unit = UnitFactory.createAreaUnit(objects[i]);
            if (unit) {
                arr.push(unit);
                if (unit.unlockId) {
                    this._blockMap[unit.unlockId] = unit;
                }
            }
        }
        this.battleLogic.unitCollisionsManager.updateBlockUnits(arr);
    }

    /**移除迷雾障碍 */
    public removeMistBlock(unlockId: number) {
        if (this._blockMap[unlockId]) {
            this.battleLogic.unitCollisionsManager.removeBlock(this._blockMap[unlockId]);
            this.battleLogic.aStar.cleanGridsBlockState(this._blockMap[unlockId].rect);
        }

        for (let teamId in this._units) {
            this._units[teamId].forEach(unit => {
                unit.updateBlockStatue();
            });
        }
    }

    /**创建矿产 */
    public createMineralUnits(arr: ICreateMineralData[]) {
        for (let i = 0; i < arr.length; i++) {
            let point = arr[i];
            const idx = 0;
            let resId = point.resourceId + "";

            let uid = this._resIdToUid[resId];
            if (uid && this._uidMap[uid]) {
                let unit: MineralUnit = this._uidMap[uid] as MineralUnit;
                unit.idxs = point.idxs;
                if (!point.isDead) {
                    unit.hpNum = point.idxs.length;
                    unit.resurgence();
                }
                else
                    unit.hpNum = 0;
            }
            else {
                let unit = UnitFactory.createMineralUnit(point, idx, this.fightType);
                if (unit) {
                    unit.idxs = point.idxs;
                    if (!point.isDead) {
                        unit.setHpNum(point.idxs.length)
                    }
                    else {
                        unit.setHpNum(0)
                    }
                    unit.resId = resId;
                    this._minerals.push(unit);
                    this._uidMap[unit.uid] = unit;
                    this._resIdToUid[resId] = unit.uid;
                }
            }
            // for (let j = 0; j < point.idxs.length; j++) {
            //     const idx = point.idxs[j];
            //     let resId = point.resourceId + "_" + idx;
            //     let uid = this._resIdToUid[resId];
            //     if (uid && this._uidMap[uid]) {
            //         this._uidMap[uid].resurgence();
            //         continue;
            //     }

            //     let unit = UnitFactory.createMineralUnit(point, idx);
            //     if (unit) {
            //         unit.resId = resId;
            //         this._minerals.push(unit);
            //         this._uidMap[unit.uid] = unit;
            //         this._resIdToUid[resId] = unit.uid;
            //     }
            // }
        }
    }

    /**创建怪物 */
    public createMonsterUnits(arr: ICreateMonsterData[]) {
        for (let i = 0; i < arr.length; i++) {
            let point = arr[i];
            for (let j = 0; j < point.idxs.length; j++) {
                const idx = point.idxs[j];
                let resId = point.resourceId + "_" + idx;
                let uid = this._resIdToUid[resId];
                if (uid && this._uidMap[uid]) {
                    this._uidMap[uid].resurgence();
                    continue;
                }
                let unit = UnitFactory.createMonsterUnit(point, idx, this.fightType);
                if (unit) {
                    if (point.notKilledResourceIdxs && point.notKilledResourceIdxs.indexOf(idx) == -1) {
                        //击杀过
                        unit.firstKill = true;
                    }
                    unit.dropRewards = point.drops
                    if (point.resourceId) {
                        unit.resId = resId;
                        this._resIdToUid[resId] = unit.uid;
                    }
                    unit.setSummonData(point.summon)
                    this.addUnit(unit.teamId, unit)
                    this._uidMap[unit.uid] = unit;
                }
            }
        }
    }

    /**创建敌方单位 */
    public createEnemyUnitsByBattleData(arr: IBattleUnitData[]) {
        let heros: HeroUnit[] = []
        for (let i = 0; i < arr.length; i++) {
            let unit = UnitFactory.createUnitByBattleData(WorldUnitTeam.Enemy, arr[i], this.fightType);
            if (unit) {
                this.addUnit(unit.teamId, unit)
                this._uidMap[unit.uid] = unit;
                if (unit instanceof HeroUnit) {
                    //英雄的敌人需要处理
                    let pos = this._teamMap[WorldUnitTeam.Enemy].pos;
                    unit.setPosXY(pos.x, pos.y);
                    heros.push(unit)
                }
            }
        }

        if (heros.length > 0) {
            heros.sort((a, b) => {
                return b.seatSort - a.seatSort;
            });

            let team = this._teamMap[WorldUnitTeam.Enemy]

            team.setHeroList(heros);
            team.calFormationPos(MathUtils.angle2Radians(225));
            team.updateFormation(true);
        }
    }

    /***添加仇恨分组 */
    protected addHateGroupMap(unit: BattleUnit): void {
        if (unit.hatredGroup) {
            if (!this.monsterHateGroupMap[unit.hatredGroup])
                this.monsterHateGroupMap[unit.hatredGroup] = []
            this.monsterHateGroupMap[unit.hatredGroup].push(unit)
        }
    }

    /***移除仇恨分组 */
    public removeMonsterHateGroup(unit: BattleUnit): void {
        if (unit.hatredGroup && this.monsterHateGroupMap[unit.hatredGroup]) {
            let list = this.monsterHateGroupMap[unit.hatredGroup]
            ArrayUtils.removeItem(list, unit);
        }
    }

    /***获取仇恨分组 */
    public getMonsterHateGroup(hatredGroup: number): BattleUnit[] {
        return this.monsterHateGroupMap[hatredGroup]
    }

    /**创建宠物实体 */
    public createPetUnit(petData: PetBattleData): void {
        let unit: PetUnit = UnitFactory.createPetUnit(petData, this.fightType)
        if (unit) {
            this.addUnit(petData.teamId, unit)
            this._uidMap[unit.uid] = unit;
            this._pets.push(unit);
        }
    }

    /**创建队长技能实体 */
    public createLeaderUnits(skillData: LeaderSkillData) {
        let unit: BaseLeaderSkillUnit = UnitFactory.createLeaderSkillUnit(skillData.cfg.id + "", skillData.teamId, SkillUtils.getTeamIdByFaction(skillData.teamId, skillData.cfg.targetFaction), this.fightType)
        if (unit) {
            this._leaderSkill.push(unit);
        }
    }

    /**创建收藏品技能实体 */
    public createCollectUnits(skillData: CollectSkillData) {
        let unit: BaseCollectSkillUnit = UnitFactory.createCollectSkillUnit(skillData.cfg.id + "", skillData.teamId, SkillUtils.getTeamIdByFaction(skillData.teamId, skillData.cfg.targetFaction), this.fightType)
        if (unit) {
            this._collectSkill.push(unit);
        }
    }

    /**创建其他的技能实体 */
    public createOtherSkillUnits(skillData: OtherSkillData) {
        let unit: OtherSkillUnit = UnitFactory.createOtherSkillUnit(skillData, skillData.teamId, SkillUtils.getTeamIdByFaction(skillData.teamId, skillData.cfg.targetFaction), this.fightType)
        if (unit) {
            this._uidMap[unit.uid] = unit;
            this._otherSkill.push(unit);
        }
    }

    /**使用其他的技能实体 */
    public useOtherSkillUnits(skillData: OtherSkillData) {
        let heroTeamUnit = this.getTeamById(WorldUnitTeam.Self)
        for (let i = 0; i < this._otherSkill.length; i++) {
            if (this._otherSkill[i].skillInfo.skillId == skillData.skillId) {
                this._otherSkill[i].setPosXY(heroTeamUnit.pos.x, heroTeamUnit.pos.y)
                let behaviors = this._otherSkill[i].skillInfo.actionSkill()
                for (let j = 0; j < behaviors.length; j++) {
                    let behavior = behaviors[j];
                    behavior.setCaster(this._otherSkill[i]);
                    behavior.actionEffect();
                }
                break
            }
        }
    }

    public addUnit(teamId: number, unit: BattleUnit): void {
        if (!this._units[teamId])
            this._units[teamId] = []
        this._units[teamId].push(unit)
        this.addHateGroupMap(unit)
    }

    public addBullet(unit: BulletUnit) {
        if (unit.caster) {
            if (!this.quoteUidMap[unit.caster.uid])
                this.quoteUidMap[unit.caster.uid] = 0;
            this.quoteUidMap[unit.caster.uid]++;
        }

        this._bullets.push(unit);
    }

    public addDrop(unit: DropUnit) {
        this._drops.push(unit);
    }

    public get drops(): DropUnit[] {
        return this._drops;
    }

    /**通过队伍id获取单位列表 */
    public getUnitsByTeamId(teamId: WorldUnitTeam) {
        return this._units[teamId] || [];
    }

    /***获取队伍的实时某类型的总属性 */
    public getTeamAttrValue(teamId: number, type: AttrEnum): number {
        let attack = 0;
        let units = this.getUnitsByTeamId(teamId)
        for (let i = 0; i < units.length; i++) {
            if (units[i].isActive) {
                attack += units[i].getAttrValue(type);
            }
        }

        return attack
    }

    /**通过矿单位列表 */
    public getMineralsUnits() {
        return this._minerals || [];
    }

    /**是否有存活单位，不计算召唤物和宠物 */
    public hasAlive(teamId: WorldUnitTeam) {
        let units = this.getUnitsByTeamId(teamId);
        for (let i = units.length - 1; i >= 0; i--) {
            if (teamId == WorldUnitTeam.Self) {
                if ((units[i].type == UnitType.Hero) && !units[i].summon && units[i].attr.isAlive()) {
                    return true;
                }
            }
            else {
                if ((units[i].type == UnitType.Hero || units[i].type == UnitType.Monster || units[i].type == UnitType.Boss) && !units[i].summon && units[i].attr.isAlive()) {
                    return true;
                }
            }
        }
        return false;
    }

    /***隐藏某个英雄 */
    public setUnitHide(uid: number, v: boolean): void {
        if (this._uidMap[uid] instanceof BattleUnit) {
            this._uidMap[uid].visible = !v;
        }
    }

    public clearUnitByResourceId(resourceId: string, idxs: number[]): void {
        for (let i = 0; i < idxs.length; i++) {
            let uid = this._resIdToUid[resourceId]
            if (!uid)
                uid = this._resIdToUid[resourceId + "_" + idxs[i]]
            let unit = this.getUnitByUid(uid)
            if (unit && !unit.isDisposed) {
                unit.needDispose()
            }
        }
        this.doDisposeUnits(true);
    }
}

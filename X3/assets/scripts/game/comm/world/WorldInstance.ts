import { IVec2 } from "cc";
import G from "../../../core/comm/G";
import FacadeManager from "../../../core/mvc/FacadeManager";
import BattleTimer from "../../../core/timer/BattleTimer";
import { GameTimer } from "../../../core/timer/GameTimer";
import { MathUtils } from "../../../core/utils/MathUtils";
import NotificationKey from "../../event/NotificationKey";
import GIns from "../../GIns";
import { IBattleEnterData } from "../../modules/battle/vo/IBattleEnterData";
import { IBattlePetData } from "../../modules/battle/vo/IBattlePetData";
import { IBattleUnitData } from "../../modules/battle/vo/IBattleUnitData";
import { CaptainSkillManager } from "../../modules/captainSkill/CaptainSkillManager";
import { HeroManager } from "../../modules/hero/HeroManager";
import { IMapInstance } from "../../tiledMap/interface/IMapInstance";
import { BattleLogic } from "../battle/BattleLogic";
import { BattleLogicManager } from "../battle/BattleLogicManager";
import { BattleManager } from "../battle/BattleManager";
import BattleConstantConfig from "../battle/config/BattleConstantConfig";
import BattleSetting from "../battle/config/BattleSetting";
import { WorldUnitTeam } from "../battle/enum/BattleEnum";
import { FightType } from "../battle/enum/FightType";
import { ICreateMineralData, ICreateMonsterData } from "../battle/interface/BattleInterface";
import BattleProcessor from "../battle/processor/BattleProcessor";
import UnitProcessor from "../battle/processor/UnitProcessor";
import { HeroShowUnit } from "../battle/show/HeroShowUnit";
import { BattleUnit } from "../battle/unit/battle/BattleUnit";
import { HeroUnit } from "../battle/unit/battle/HeroUnit";
import { TeamUnit } from "../battle/unit/TeamUnit";
import { ECollectiblesSkillTargetType } from "../../modules/collections/const/UICollectionsConfig";
import { TimeManager } from "../../../core/time/TimeManager";
import { BattleUtils } from "../battle/BattleUtils";
import { BattleShowUnit } from "../battle/show/BattleShowUnit";
import { DebugUtils } from "../../../core/utils/DebugUtils";


/**主世界实例 */
export default class WorldInstance {
    protected _playingMethod = FightType.TRUNK_MAP;
    protected _battleProcessor: BattleProcessor;
    protected _unitProcessor: UnitProcessor;
    //protected _hpStateProcessor: HpStateM;

    protected _battleData: IBattleEnterData;

    /**是否战斗已经结束 */
    protected _isEnd = false;
    /***是否准备进入场景，LOADING结束调用battleReadyHandler方法假如为true则是进入场景成功 */
    public isReadyEnter: boolean = false;

    /**是否等待主动复活 */
    protected _isWaitingActiveRebirth = false;
    /***是否跳过战斗 */
    public isSkipBattle: boolean = false

    public battleLogic: BattleLogic;

    /**地图实例 */
    private _mapIns: IMapInstance;
    public get mapIns(): IMapInstance {
        return this._mapIns;
    }
    public set mapIns(value: IMapInstance) {
        this._mapIns = value;
        if (this._unitProcessor)
            this._unitProcessor.mapIns = this._mapIns
    }

    get playingMethod() {
        return this._playingMethod;
    }

    get battleData() {
        return this._battleData;
    }

    /**设置玩法参数*/
    setPlayingMethodParams(type: FightType, data: IBattleEnterData) {
        this._battleData = data;
        this._playingMethod = type;
    }

    /**进入 */
    enterWorld(cfg: table.map.MapidConfig, width: number, height: number, isHide: boolean = false) {
        this._isEnd = false;
        this._isWaitingActiveRebirth = false;
        this.isReadyEnter = true

        this.battleLogic = BattleLogicManager.ins().get(this._playingMethod)
        this.battleLogic.isBattleEnd = false;
        if (this._battleData) {
            this.battleLogic.setBattleData(this._battleData);
            this.battleLogic.battleConfigId = this._battleData.battleConfigId;
            this.battleLogic.isWatcher = this._battleData.watcher;
        }
        this._unitProcessor = this.battleLogic.unitProcessor;
        this._unitProcessor.mapIns = this._mapIns
        this._battleProcessor = this.battleLogic.battleProcessor;

        this.battleLogic.initMapData(cfg, width, height);
        if (!isHide)
            BattleManager.ins().mainScene = this;

        this.onInitUnits();
        this.battleLogic.begin()
        this.initMapScale();
        if (!this.isSkipBattle) {
            BattleTimer.ins().logicLoop(this, this.onUpdate);
            BattleTimer.ins().frameLoop(1, this, this.onUpdateShow);
        }
    }

    /**初始化寻路映射 */
    initAStarMap(pos: IVec2) {
        if (!this.battleLogic?.aStar) return
        if (this.battleLogic?.aStar.isParseCompleted()) return;
        this.battleLogic?.aStar.continueInitGridsState(pos, 6);
        GameTimer.ins().frameLoop(1, this, this.onInitContinueInitAstar);
    }

    /**分帧初始化寻路映射 */
    onInitContinueInitAstar() {
        if (this.battleLogic?.aStar.isParseCompleted()) {
            GameTimer.ins().clear(this, this.onInitContinueInitAstar);
            return;
        }
        this.battleLogic?.aStar.continueInitGridsState();
    }

    /***隐藏战斗式进入下一场战斗 */
    enterWorldByHideNext(): void {
        this._isEnd = false;
        this._isWaitingActiveRebirth = false;
        this.isReadyEnter = true;
        this.battleLogic = BattleLogicManager.ins().get(this._playingMethod)
        if (this._battleData) {
            this.battleLogic.setBattleData(this._battleData);
            this.battleLogic.battleConfigId = this._battleData.battleConfigId;
        }
        this.battleLogic.clear()
        this.battleLogic.easyLogManager.clear();
        this.onInitUnits();
        this.resume();
        this.battleLogic.openFightAi()
    }

    /**隐藏战斗式开始一场战斗 */
    public enterWorldByHideStart(cfg: table.map.MapidConfig, width: number, height: number) {
        this.enterWorld(cfg, width, height, true)
        this.battleLogic.openFightAi()
    }

    /**跳过战斗式开始一场战斗 */
    public enterWorldBySkipStart(cfg: table.map.MapidConfig, width: number, height: number) {
        this.isSkipBattle = true;
        this.enterWorld(cfg, width, height, true)
        this.battleLogic.isBlackSkipBattle = true;
        this.battleLogic.openFightAi()
        this.beginSkipBattle();
    }

    private skipBattleTimeBegin = 0
    /***跳过当前战斗 */
    public skipNowBattle(): void {
        this.isSkipBattle = true;
        this.battleLogic.isSkipBattle = true;
        var units = this.battleLogic.showMgr.getAllUnits()
        for (let i = 0; i < units.length; i++) {
            let unit = units[i]
            if (unit instanceof BattleShowUnit) {
                unit.removeAllEffect()
            }
        }
        this.battleLogic.showMgr.setHideAll()
        BattleTimer.ins().clearAll(this)
        this.skipBattleTimeBegin = Date.now()
        this.doSkipBattleHandler()
    }

    private doSkipBattleHandler(): void {
        let timeBegin = Date.now()
        let frameTime = 0
        while (true) {
            this.onUpdate()
            frameTime += Date.now() - timeBegin;
            if (frameTime > 200) {
                GameTimer.ins().frameOnce(1, this, this.doSkipBattleHandler)
                break
            }
            if (this._isEnd) {
                this.skipBattleComplete()
                break
            }
        }
    }

    protected skipBattleComplete(): void {
        DebugUtils.isDebugMode() && console.log("================跳过战斗耗时=======================")
        DebugUtils.isDebugMode() && console.log(Date.now() - this.skipBattleTimeBegin)
        DebugUtils.isDebugMode() && console.log("================跳过战斗耗时=======================")

        this.battleLogic.isSkipBattle = false;
        BattleTimer.ins().logicLoop(this, this.onUpdate);
        BattleTimer.ins().frameLoop(1, this, this.onUpdateShow);
        var battleUnits = this.battleLogic.unitProcessor.allUnits
        for (let i = 0; i < battleUnits.length; i++) {
            let battleUnit = battleUnits[i]
            if (battleUnit.isActive) {
                battleUnit.visible = true;
            }
        }
        FacadeManager.ins().emit(NotificationKey.SKIP_NOW_BATTLE_COMPLETE, this.playingMethod);
    }

    private beginSkipBattle(): void {
        let endTimeSec = this.battleLogic.battleCfg.fightMaxSecond
        this.setBattleEndTime(TimeManager.serverNow + endTimeSec * 1000);
        let timeBegin = Date.now()
        let frameTime = 0
        while (true) {
            this.onUpdate()
            if (this._isEnd)
                break
        }
        DebugUtils.isDebugMode() && console.log("================跳过战斗耗时=======================")
        DebugUtils.isDebugMode() && console.log(Date.now() - timeBegin)
        DebugUtils.isDebugMode() && console.log("================跳过战斗耗时=======================")
    }

    protected getHeroUnitDatas(): IBattleUnitData[] {
        let heros: IBattleUnitData[] = []
        switch (this._playingMethod) {
            case FightType.LEAGUE_EXPLORE_MAP:
            case FightType.PET_DUNGEON_MAP:
                heros = GIns.settingsMgr.getHeroBattleDataForImage();
                break;
            default:
                //用默认主线阵容
                heros = HeroManager.ins().getInPosHeroBattleData();
                break;
        }
        return heros;
    }

    protected onInitUnits() {
        let heroes = this.getHeroUnitDatas();
        this._unitProcessor.setFightType(this._playingMethod)
        this._unitProcessor.resetContainer();
        this._unitProcessor.loadTeam(WorldUnitTeam.Self);
        this._unitProcessor.createHeroes(WorldUnitTeam.Self, heroes);
        this._unitProcessor.loadSafeArea();
        this._unitProcessor.loadArea();
        this._unitProcessor.loadBlock();

        this.initPetUnits(true, WorldUnitTeam.Self, GIns.petCfgMgr.getCurOnArrayPetSkillData())
        this.initLeaderSkill();
        this.initCollectSkill();
        this.updateFormation()
        // BattleManager.ins().initFormationSkill(heroes, TargetFaction.OurSide)
    }

    /***处理战斗保存的血量 */
    protected initSaveHp(): void {
        if (this.battleLogic?.battleSetting?.saveHp) {
            let heros = this.battleLogic.unitProcessor.heroes;
            for (let i = 0; i < heros.length; i++) {
                let hp = GIns.battleMgr.getSaveHeroHpByFightType(this.battleLogic.fightType, heros[i].uid)
                if (hp >= 0)
                    heros[i].setHpNotEvent(hp)
            }
        }
    }

    /***进入前的准备处理 */
    public battleReadyHandler() {
        if (this.isReadyEnter && !BattleSetting.showTransferAnim)
            G.FacadeManager.emit(NotificationKey.BATTLE_START);
    }

    protected initPetUnits(isInit: boolean, teamId: number, datas: IBattlePetData[]): void {
        BattleLogicManager.ins().get(this._playingMethod).initPets(isInit, datas, teamId)
    }

    private initLeaderSkill(): void {
        let leaderSkillData = CaptainSkillManager.ins().getCaptainData();
        if (leaderSkillData && leaderSkillData.skillIds)
            BattleLogicManager.ins().get(this._playingMethod).initLeaderSkill(true, leaderSkillData.skillIds, WorldUnitTeam.Self)
    }

    private initCollectSkill(): void {
        let skillIds = GIns.collectionsModel.context.getBattleSkill(ECollectiblesSkillTargetType.COLLECTIBLES).map(v => { return v.skillId; });
        BattleLogicManager.ins().get(this._playingMethod).initCollectSkill(true, skillIds, WorldUnitTeam.Self);
    }

    protected initMapScale(): void {
        if (!GIns.cameraAnimUtils.isTransferZoom)
            GIns.cameraAnimUtils.zoomInMap(600);
    }

    onUpdate() {
        for (let i = 0; i < BattleManager.ins().battleSpeed; i++) {
            this._battleProcessor.onUpdate();
            this.onCheckEnd();
        }
    }

    private onUpdateShow(): void {
        for (let i = 0; i < BattleManager.ins().battleSpeed; i++) {
            this._battleProcessor.updateShow();
        }
    }

    /**设置玩法结束时间 */
    setBattleEndTime(endTime: number) {
        this._battleData.endTime = endTime;
        this._battleData.endTimeFrame = BattleUtils.getFrameByTime(endTime - TimeManager.serverNow)
    }

    /**根据不同玩实现结束判断方式 */
    onCheckEnd() {
        if (this._isWaitingActiveRebirth) {
            return;
        }

        if (BattleSetting.isCanTimeRebirth) {
            let heroes = this._unitProcessor.heroes;
            for (let i = heroes.length - 1; i >= 0; i--) {
                if (heroes[i].isCanRebirth()) {
                    heroes[i].rebirth();
                }
            }
        }

        if (!this._unitProcessor.isDeadDirty) return;
        if (!this._unitProcessor.hasAlive(WorldUnitTeam.Self)) {
            FacadeManager.ins().emit(NotificationKey.TEAM_DIE, this.playingMethod);
            this._isWaitingActiveRebirth = true;

            let heroes = this.battleLogic.showMgr.getAllUnits() as any;
            for (let i = heroes.length - 1; i >= 0; i--) {
                if (heroes[i] instanceof HeroShowUnit)
                    heroes[i].hideRebirthBar(); //隐藏复活进度
            }

        }
        this._unitProcessor.isDeadDirty = false;
    }

    /**复活 */
    rebirth() {
        if (!BattleSetting.isCanActiveRebirth) return;

        let maxDis = BattleConstantConfig.greaterDistResetPos;
        let teamPos = this._unitProcessor.myTeam.pos;
        let heroes = this._unitProcessor.heroes;
        for (let i = heroes.length - 1; i >= 0; i--) {
            let unit = heroes[i];
            unit.rebirth();
            if (MathUtils.distance(unit.pos, teamPos) > maxDis) {
                if (this.battleLogic.unitCollisionsManager.isInBlock(unit.formationPos)) {
                    //如果位置在障碍内，传送到队伍中心
                    unit.setPosXY(teamPos.x, teamPos.y);
                } else {
                    //否认传送到自己的位置
                    unit.setPosXY(unit.formationPos.x, unit.formationPos.y);
                }
            }
        }

        this._isWaitingActiveRebirth = false;
    }

    /***隐藏战斗 */
    hide(): void {
        this.battleLogic.showMgr.clear();
        this.battleLogic.command.clear();
        this.battleLogic.effectMgr.stopShake()
    }

    /**停止战斗 */
    battleEnd() {
        if (this.battleLogic?.battleSetting?.saveHp) {
            let heros = this.battleLogic.unitProcessor.heroes;
            for (let i = 0; i < heros.length; i++) {
                GIns.battleMgr.saveHeroHpByFightType(this._playingMethod, heros[i])
            }
        }

        BattleLogicManager.ins().remove(this._playingMethod)
        BattleTimer.ins().clearAll(this);
        GameTimer.ins().clearAll(this);

        if (this.battleLogic) {
            this.battleLogic.showMgr.clear();
            this.battleLogic.command.clear();
        }
    }

    /**暂停 */
    pause() {
        BattleTimer.ins().clearAll(this);
    }

    /**继续战斗 */
    resume() {
        BattleTimer.ins().logicLoop(this, this.onUpdate);
        BattleTimer.ins().frameLoop(1, this, this.onUpdateShow);
    }


    teamMoveByAngle(angle: number) {
        if (this._battleProcessor) {
            this._battleProcessor.teamMoveByAngle(angle);
        }
    }

    transfer(pos: { x: number, y: number }) {
        if (this._battleProcessor) {
            this._battleProcessor.transfer(pos);
        }
    }

    createMineralUnits(arr: ICreateMineralData[]) {
        if (this._unitProcessor) {
            this._unitProcessor.createMineralUnits(arr);
        }
    }

    createMonsterUnits(arr: ICreateMonsterData[]) {
        if (this._unitProcessor) {
            this._unitProcessor.createMonsterUnits(arr);
        }
    }

    removeMistBlock(unlockId: number) {
        if (this._unitProcessor) {
            this._unitProcessor.removeMistBlock(unlockId);
        }
    }

    formationChanged() {
        if (this._unitProcessor) {
            let newHeroes = this.getHeroUnitDatas();
            let curHeroes = this._unitProcessor.heroes;

            let newMap: { [key: number]: IBattleUnitData } = {};
            for (let i = 0; i < newHeroes.length; i++) {
                const data = newHeroes[i];
                newMap[data.configId] = data;
            }

            let oldHero: HeroUnit[] = [];
            for (let i = 0; i < curHeroes.length; i++) {
                const unit = curHeroes[i];
                let heroId = unit.heroId;
                if (newMap[heroId]) {
                    //有则更新
                    unit.updateAttr(newMap[heroId]);
                    unit.updateSkills(newMap[heroId].skillIds);
                    delete newMap[heroId];
                } else {
                    oldHero.push(unit);
                }
            }

            //删除旧数据
            for (let i = 0; i < oldHero.length; i++) {
                this._unitProcessor.removeHero(oldHero[i]);
            }

            let keys = Object.keys(newMap);
            if (keys.length) {
                let newArr: IBattleUnitData[] = [];
                for (let i = 0; i < keys.length; i++) {
                    newArr.push(newMap[keys[i]]);
                }
                this._unitProcessor.createHeroes(WorldUnitTeam.Self, newArr);
            }

            let team = this.getHeroTeam()
            team.setHeroList(this.getHeros());
            team.updateFormation();

            this.initPetUnits(true, WorldUnitTeam.Self, GIns.petCfgMgr.getCurOnArrayPetSkillData())
            // this.initPetUnits(WorldUnitTeam.Self, [{ configId: 601, skillIds: ["PET601_s101", "PET601_s201"] }])
            this.initLeaderSkill();
            this.initCollectSkill();
            this.updateFormation()
            // BattleManager.ins().initFormationSkill(newHeroes, TargetFaction.OurSide)
        }
    }

    protected updateFormation(): void {
        this.battleLogic.updateFormation()
        this.checkStkBgm();
    }

    protected checkStkBgm(): void {
        if (!this.battleLogic.isNotShowBattleEffect()) {
            if (!BattleManager.ins().checkStkBgm()) {
                GIns.mapMgr.playMapMusic()
            }
        }
    }

    heroAttrChanged(heroId: number) {
        if (this._unitProcessor) {
            let curHeroes = this._unitProcessor.heroes;

            for (let i = 0; i < curHeroes.length; i++) {
                const unit = curHeroes[i];
                if (unit.heroId == heroId) {
                    let data = HeroManager.ins().getBattleDataByHeroId(heroId);
                    if (data) {
                        unit.updateAttr(data);
                        unit.updateSkills(data.skillIds);
                    }
                    break;
                }
            }
        }
    }

    leaderSkillChange(): void {
        this.initLeaderSkill()
    }

    collectSkillChange(): void {
        this.initCollectSkill()
    }

    petSkillChanged(): void {
        this.initPetUnits(true, WorldUnitTeam.Self, GIns.petCfgMgr.getCurOnArrayPetSkillData())
    }

    heroSkinChanged(heroId: number): void {
        if (this._unitProcessor) {
            let curHeroes = this._unitProcessor.heroes;

            for (let i = 0; i < curHeroes.length; i++) {
                const unit = curHeroes[i];
                if (unit.heroId == heroId) {
                    let data = HeroManager.ins().getBattleDataByHeroId(heroId);
                    if (data) {
                        unit.attr.skinId = data.modelId;
                        unit.showUnit()?.changeSpineNode(data.modelId)
                    }
                    break;
                }
            }
            this.checkStkBgm();
        }
    }

    getHeros(): HeroUnit[] {
        if (this._unitProcessor) {
            return this._unitProcessor.heroes;
        }
        return [];
    }

    getEmenys(): BattleUnit[] {
        if (this._unitProcessor) {
            return this._unitProcessor.getUnitsByTeamId(WorldUnitTeam.Enemy);
        }
        return [];
    }

    getHeroTeam(): TeamUnit {
        return this._unitProcessor.myTeam
    }

    getBattleProcessor(): BattleProcessor {
        return this._battleProcessor
    }

    cleanDefenders(): void {

    }

    clearFartherResources(cleanMap: { [resourceId: number]: Array<number> }): void {
        for (let resourceId in cleanMap) {
            this._unitProcessor.clearUnitByResourceId(resourceId, cleanMap[resourceId])
        }
    }
}
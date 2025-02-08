import BaseSingleton from "../../../core/base/BaseSingleton";
import FacadeManager from "../../../core/mvc/FacadeManager";
import NotificationKey from "../../event/NotificationKey";
import WorldInstance from "../world/WorldInstance";
import { IResourceParam } from "./interface/BattleInterface";
import { DEBUG } from "cc/env";
import { v2 } from "cc";
import { MoveCameraType } from "../../tiledMap/MapEnum";
import { HeroUnit } from "./unit/battle/HeroUnit";
import { BattleDebugManager } from "./BattleDebugManager";
import { SpineUnitNode } from "./node/SpineUnitNode";
import { BattleLogic } from "./BattleLogic";
import { BattleLogicManager } from "./BattleLogicManager";
import G from "../../../core/comm/G";
import UnitProcessor from "./processor/UnitProcessor";
import { Vec2 } from "cc";
import { PoolManager } from "../../../core/pool/PoolManager";
import { TableManager } from "../../../core/table/TableManager";
import { DropUnit, IDropUnitVo } from "./unit/DropUnit";
import RandomUtils from "../../../core/utils/RandomUtils";
import BattleShowFactory from "./factory/BattleShowFactory";
import { FightType } from "./enum/FightType";
import BattleSetting from "./config/BattleSetting";
import { HangUpModel } from "../../modules/hangup/model/HangUpModel";
import { BattleModel } from "../../modules/battle/model/BattleModel";
import GIns from "../../GIns";
import { SkillUtils } from "./skill/SkillUtils";
import { BattleUnit } from "./unit/battle/BattleUnit";
import { SkillTargetType } from "./skill/SkillEnum";
import { WorldUnitTeam } from "./enum/BattleEnum";
import { SkillData } from "./skill/SkillData";
import { FightSkillInfo } from "./skill/FightSkillInfo";
import { OtherSkillData } from "./skill/OtherSkillData";
import { HeroCareerType } from "../../modules/hero/HeroEnum";
import { ServerEnums } from "../../../libs/extras/ServerEnums";
import { NoOwnerItem } from "../../modules/backpack/vo/NoOwnerItem";

export class BattleManager extends BaseSingleton {
    private _mainScene: WorldInstance;
    /***当前战斗ID */
    public battleConfigId: number = 0;

    /***战斗倍速 */
    public battleSpeed: number = 1;
    /***当前前台的战斗逻辑 */
    public battleLogic: BattleLogic;

    // 初始化时
    protected onInit(): void {
        // G.Logger.setOpen(LogType.FIGHT)
    }

    private isFirst: boolean = true;


    cancelBattleIfExists(fightType: FightType) {
        const battleLogic = this.battleLogic;
        if (!battleLogic) {
            return;
        }

        if (battleLogic.fightType == FightType.LEAGUE_WAR) {
            BattleModel.ins().sendCancelBattle(battleLogic.battleConfigId)
        }
    }

    public set mainScene(mainScene: WorldInstance) {
        this.isPause = false;
        this._mainScene = mainScene;
        this.battleLogic = BattleLogicManager.ins().get(mainScene.playingMethod)

        BattleSetting.initByFightType(mainScene.playingMethod)
        //进入新的前台战斗时，结束对应玩法延迟结算
        this.removeHideBattleResult(mainScene.playingMethod);

        BattleDebugManager.ins().mainScene = mainScene;
        if (DEBUG)
            window["BattleManager"] = BattleManager.ins()

        if (BattleDebugManager.ins().isTestBattle)
            G.UIManager.open("BattleLogView")

        if (this.isFirst)
            this.battleLogic.isNerverbegin = false;
        this.isFirst = false;
    }

    public removeBattleLogic(): void {
        this.battleLogic = null;
        this._mainScene = null;
        this.battleConfigId = 0;
        BattleDebugManager.ins().mainScene = null;
    }

    public setBattleSpeed(speed: number): void {
        this.battleSpeed = speed;
        SpineUnitNode.TimeScale = speed;
    }

    /***获取援助英雄 */
    public getHelpHero(): HeroUnit {
        if (this._mainScene) {
            let heros = this._mainScene.getHeros()
            for (let i = 0; i < heros.length; i++) {
                if (heros[i].isHelpHero) {
                    return heros[i]
                }
            }
        }

        return null;
    }

    public get mainScene(): WorldInstance {
        return this._mainScene;
    }

    /***镜头是否锁定中 */
    public isLockCamera: boolean = false;
    /***锁定镜头 */
    public lockCamera(v: boolean): void {
        this.isLockCamera = v;
    }

    /***
     * 移动镜头
     */
    public moveCamera(x: number, y: number, isCtrlMove: boolean): void {
        if (this.isLockCamera && !isCtrlMove) {
            // event 镜头移动
            GIns.cameraAnimUtils.moveCameraScreenToMapCamerPos(true)
        }
        else if (this.isLockCamera && isCtrlMove) {
            //镜头锁定中的主动移动，用缓动的方式
            GIns.cameraAnimUtils.moveCameraScreenToMapPosTween(v2(x, y), 10, MoveCameraType.FIGHT_LOCK_CTRL_MOVE)
        }
        else if (isCtrlMove && !this.battleLogic.battleSetting.lockCamera)
            FacadeManager.ins().emit(NotificationKey.MAP_TEAN_POS_UPDATE, { x: x, y: y });
    }

    public isPause: boolean = false
    /***暂停战斗 */
    public pauseBattle() {
        this.isPause = true;
        this.mainScene.pause()
        var units = this.battleLogic.showMgr.getAllUnits()
        for (var i: number = 0; i < units.length; i++) {
            units[i].pauseModel();
        }
    }

    /**继续战斗 */
    public resumeBattle() {
        this.isPause = false;
        this.mainScene.resume()
        var units = this.battleLogic.showMgr.getAllUnits()
        for (var i: number = 0; i < units.length; i++) {
            units[i].resumeModel();
        }
    }

    /***关闭双方战斗AI（索敌那些） */
    public stopFightAi(): void {
        this.battleLogic?.stopFightAi()
    }

    /***启动双方战斗AI（索敌那些） */
    public openFightAi(): void {
        this.battleLogic?.openFightAi()
    }

    /****结束战斗，双方停止了AI包括移动的 */
    public endFight(): void {
        this.battleLogic?.endFight()
    }

    /****开始战斗 */
    public startFight(): void {
        this.battleLogic?.startFight();
    }

    /**是否有敌人在检索范围 （用于迷雾解锁） */
    public isNoEnemyInSearchRange() {
        if (this.battleLogic.isSafe) {
            //安全区必定解锁
            return true;
        }
        var heros = this._mainScene.getHeros();
        for (var i = 0; i < heros.length; i++) {
            if (heros[i].isActive) {
                if (this.battleLogic.unitCollisionsManager.getNearestEmenyUnit(heros[i], heros[i].searchRange())) {
                    return false;
                }
            }
        }
        return true;
    }

    /***获取奖励 */
    public getDrop(resourceId: number, resourceIdx: number): void {
        if (resourceId) {
            FacadeManager.ins().emit(NotificationKey.DRAW_RESOURCE_REWARD, { resourceId: resourceId, resourceIdx: resourceIdx } as IResourceParam);
        }
    }

    public get curUnitProcessor(): UnitProcessor {
        return this.battleLogic?.unitProcessor;
    }

    public get playingMethod(): FightType {
        return this.battleLogic?.fightType
    }

    /** 获取英雄列表 */
    get heroes() {
        return this.curUnitProcessor.heroes;
    }

    /***
     * 带特效的掉落
     * canGet：是否可以拾取
     */
    public createSuperDrop(itemsIds: { itemId: any, num: number }[], pos: Vec2, delayDestroy: number = -1, canGet: boolean = false) {
        BattleShowFactory.showEffectModel(10010040, pos, 1, false, false)
        BattleShowFactory.showEffectModel(10010041, pos, 1, true, false)
        let dir = 1
        for (let i = 0; i < itemsIds.length; i++) {
            let randPos = v2(pos.x + RandomUtils.randomInt(0, 100 * dir) + 85 * dir, pos.y + RandomUtils.randomInt(-100, 100) - 35)
            this.createDropUnit(itemsIds[i], randPos, dir, delayDestroy, canGet)
            dir *= -1;
        }
    }

    /***创建掉落 */
    private createDropUnit(item: { itemId: any, num: number }, pos: Vec2, dir: number, delayDestroy: number = -1, canGet: boolean = false): void {
        let unit = PoolManager.getItem(DropUnit);
        unit.setBattleLogic(this.battleLogic)
        let dropVo: IDropUnitVo = {} as any;
        let itemCfg = TableManager.getDataById(table.item.ItemConfig, item.itemId)
        if (itemCfg) {
            dropVo.iconPath = itemCfg.iconPath;
            dropVo.name = itemCfg.name;
            dropVo.quality = itemCfg.quality;
        }
        else {
            let dropCfg = TableManager.getDataById(table.battle.ClientDropConfig, item.itemId);
            if (!dropCfg)
                return
            dropVo.iconPath = dropCfg.iconPath;
            dropVo.name = dropCfg.name;
            dropVo.quality = dropCfg.quality;
        }
        unit.init(dropVo, pos, dir, delayDestroy, canGet);
        this.curUnitProcessor.addDrop(unit);
    }

    private hideOtherMap: { [key: number]: BattleLogic } = {}
    /***隐藏当前战斗 */
    public hideBattle(): void {
        this.battleLogic.isHideBattle = true;
        this.hideOtherMap[this.playingMethod] = this.battleLogic;
        if (this.playingMethod == FightType.TRUNK_INSTANCE) {
            G.FacadeManager.emit(NotificationKey.CLOSE_BATTLE_VIEW);
            GIns.hangUpModel.sendStartHangUp();
        }
        FacadeManager.ins().emit(NotificationKey.HIDE_BATTLE);
        this.removeBattleLogic();
    }

    /***移除隐藏战斗 */
    public removeHideBattle(fightType: FightType): void {
        delete this.hideOtherMap[fightType]
        FacadeManager.ins().emit(NotificationKey.REMOVE_HIDE_BATTLE, fightType);
    }

    /***中断隐藏战斗 */
    public stopHideBattle(fightType: FightType): void {
        let battleLogic = this.hideOtherMap[fightType]
        if (battleLogic && battleLogic.isHideBattle) {
            if (battleLogic.fightType == FightType.TRUNK_INSTANCE) {
                // GIns.hangUpModel.sendFinishHangUp();

                // 停止, 状态 2->1
                GIns.hangUpModel.sendCloseHangUp();
            }
            else {
                //....
            }

            if (!battleLogic.isEndFight) {
                GIns.battleModel.sendCancelBattle(battleLogic.battleConfigId);
            }
            delete this.hideOtherMap[fightType]
            FacadeManager.ins().emit(NotificationKey.REMOVE_HIDE_BATTLE, fightType);
        }
    }

    /***因为结束会比玩法的结算快，所以先记录隐藏战斗的玩法类型，在结算时判断存在则不弹结算框，等玩法后处理 */
    public delayBattleResultMap: { [key: number]: boolean } = {};
    /***一场战斗结束 */
    public onBattleComplete(fightType: FightType): void {
        if (this.hideOtherMap[fightType]?.isHideBattle) {
            this.hideOtherMap[fightType].endFight();
            this.delayBattleResultMap[fightType] = true;

            FacadeManager.ins().emit(NotificationKey.STOP_HIDE_BATTLE, fightType);
            if (DEBUG) {
                GIns.floatingTextMgr.showTipsInDebug(`有一场隐藏战斗结束`);
            }

        }
    }

    /****下1场隐藏战斗 */
    public nextHideBattle(fightType: FightType): void {
        let battleLogic = this.hideOtherMap[fightType]
        if (battleLogic && battleLogic.isHideBattle) {
            if (battleLogic.fightType == FightType.TRUNK_INSTANCE) {
                // 下一关
                let nextLevelId = GIns.hangUpModel.getMyNextLevelId();
                GIns.hangUpModel.sendChallengeTrunkInstance({
                    instanceId: nextLevelId
                }, true);

                return;
            }
            else {
                //....
            }
        }
    }

    /***开始1场隐藏战斗 */
    public beginHideBattle(battleId: number, ...parms): void {
        let cfg = TableManager.getDataById(table.battle.BattleConfig, battleId);
        if (cfg) {
            let battleLogic = this.hideOtherMap[FightType[cfg.fightType]] = BattleLogicManager.ins().get(FightType[cfg.fightType]);
            battleLogic.isHideBattle = true;
            if (FightType[cfg.fightType] == FightType.TRUNK_INSTANCE) {
                GIns.hangUpModel.sendStartHangUp();
                let nextLevelId = GIns.hangUpModel.getMyNextLevelId();
                GIns.hangUpModel.sendChallengeTrunkInstance({
                    instanceId: nextLevelId
                }, true);
            }
            else {
                //.....
            }
        }
    }

    public hasHideBattleResult(fightType: FightType): boolean {
        return this.delayBattleResultMap[fightType]
    }

    public removeHideBattleResult(fightType: FightType): void {
        delete this.delayBattleResultMap[fightType]
    }

    /***对单位添加技能 */
    public addSkillByUnit(unit: BattleUnit, skillId: string): void {
        unit.attr.addOtherPassiveSkill(skillId);
    }

    /***通过参数添加技能 */
    public addSkillByParam(effect: any, targetFaction: WorldUnitTeam, type: number, typeParam: any[]): void {
        if (!effect)
            return

        let skillEffect: { skill: string } = effect;
        if (skillEffect.skill) {
            this.addSkillByParamHandler(skillEffect, targetFaction, type, typeParam)
        }

        let teamSkillEffect: { teamSkill: string } = effect;
        if (teamSkillEffect.teamSkill) {
            this.addTeamSkillByParamHandler(teamSkillEffect, targetFaction)
        }

        let summonEffect: { summon: number } = effect;
        if (summonEffect.summon) {
            this.addSummonByParamHandler(summonEffect)
        }

        let buffEffect: { buff: string, targetType: SkillTargetType, targetFaction: number, num: number } = effect;
        if (buffEffect.buff) {
            this.addBuffByParamHandler(buffEffect, targetFaction, type, typeParam)
        }
    }

    private addSkillByParamHandler(skillEffect: { skill: string }, targetFaction: WorldUnitTeam, type: number, typeParam: any[]): void {
        let allUnits = this.curUnitProcessor.getUnitsByTeamId(targetFaction);
        for (let i = 0; i < allUnits.length; i++) {
            if (allUnits[i].attr.isAlive()) {
                if (type == 0) {
                    //全体
                    allUnits[i].attr.addOtherPassiveSkill(skillEffect.skill)
                }
                else if (type == 1 && typeParam[0] == allUnits[i].camp) {
                    //阵营
                    allUnits[i].attr.addOtherPassiveSkill(skillEffect.skill)
                }
                else if (type == 2 && typeParam[0] == ServerEnums.Career[allUnits[i].career]) {
                    //职业
                    allUnits[i].attr.addOtherPassiveSkill(skillEffect.skill)
                }
                else if (type == 3 && typeParam[0] == allUnits[i].attr.getConfigId()) {
                    //配置ID
                    allUnits[i].attr.addOtherPassiveSkill(skillEffect.skill)
                }
            }
        }
    }

    private addSummonByParamHandler(summonEffect: { summon: number, x?: number, y?: number, num?: number, randomFix?: number, teamId?: WorldUnitTeam }): void {
        let teamUnit = this.battleLogic.getTeamByTeamId(WorldUnitTeam.Self)

        let x = +summonEffect.x || 0;
        let y = +summonEffect.y || 0;
        if (summonEffect.randomFix != 0) {
            x += this.battleLogic.randomMgr.randomInt(-summonEffect.randomFix, summonEffect.randomFix);
            y += this.battleLogic.randomMgr.randomInt(-summonEffect.randomFix, summonEffect.randomFix);
        }

        this.battleLogic.createMonster(summonEffect.summon, teamUnit.pos.x + x, teamUnit.pos.y + y, summonEffect.teamId);
    }

    private addTeamSkillByParamHandler(skillEffect: { teamSkill: string }, targetFaction: WorldUnitTeam): void {
        this.battleLogic.initOtherSkill([skillEffect.teamSkill], targetFaction, true)
    }

    /***添加1个BUFF组*/
    public addBuffByParamHandler(buffEffect: { buff: string, targetType: SkillTargetType, targetFaction: number, num: number }, targetFaction: WorldUnitTeam, type: number, typeParam: any[]): void {
        let allUnits = this.curUnitProcessor.getUnitsByTeamId(targetFaction);
        for (let i = 0; i < allUnits.length; i++) {
            if ((type == 0) ||
                (type == 1 && typeParam[0] == allUnits[i].camp) ||
                (type == 2 && typeParam[0] == ServerEnums.Career[allUnits[i].career]) ||
                (type == 3 && typeParam[0] == allUnits[i].attr.getConfigId())
            ) {
                let num = buffEffect.num || 0;
                if (allUnits[i].isDeath && buffEffect.targetType == SkillTargetType.Die) {
                    allUnits[i].battleLogic.buffMgr.buffControlByGroup(buffEffect.buff, allUnits[i], allUnits[i], null, { notHero: true, includeDie: true })
                    num--;
                    if (num <= 0)
                        break
                }
                else if (allUnits[i].attr.isAlive()) {
                    let units = SkillUtils.skillTarget(buffEffect.targetType, buffEffect.targetFaction, allUnits[i], allUnits[i], 999999, num)
                    if (units) {
                        for (var j = 0; j < units.length; j++) {
                            units[j].battleLogic.buffMgr.buffControlByGroup(buffEffect.buff, allUnits[i], units[j], null, { notHero: true })
                        }
                    }
                }
            }
        }
    }

    /***添加1个BUFF组*/
    public addBuff(buffGroup: string, targetType: SkillTargetType, targetFaction: number, targetParam: any, num: number = 1): void {
        for (let i = 0; i < this.heroes.length; i++) {
            if (this.heroes[i].isDeath && targetType == SkillTargetType.Die) {
                this.heroes[i].battleLogic.buffMgr.buffControlByGroup(buffGroup, this.heroes[i], this.heroes[i], null, { notHero: true, includeDie: true })
                num--;
                if (num == 0)
                    break
            }
            else if (this.heroes[i].attr.isAlive()) {
                let units = SkillUtils.skillTarget(targetType, targetFaction, this.heroes[i], this.heroes[i], 999999, num, targetParam)
                if (units) {
                    for (var j = 0; j < units.length; j++) {
                        units[j].battleLogic.buffMgr.buffControlByGroup(buffGroup, this.heroes[i], units[j], null, { notHero: true })
                    }
                }
            }
        }
    }

    /***判断是否播放STK女团的BGM */
    public checkStkBgm(): boolean {
        let num = 0;
        if (this.battleLogic) {
            let formationData = this.battleLogic.getFormationByTeamAndId(WorldUnitTeam.Self, 1)
            if (formationData) {
                for (let i = 0; i < formationData.heros.length; i++) {
                    let exData: { skins: number[] } = formationData.cfg.exData
                    if (exData?.skins.length) {
                        let index = formationData.cfg.heros.indexOf(formationData.heros[i].attr.getConfigId())
                        if (exData.skins[index] == 0 || exData.skins[index] == formationData.heros[i].attr.skinId) {
                            num++;
                        }
                    }
                }

                if (num >= formationData.cfg.minNum) {
                    if (GIns.mapMgr.isMainCityId(GIns.mapMgr.getMapID())) {
                        GIns.audioMgr.playMusic("KPAbgm3")
                    }
                    else if (this.battleLogic.fightType == FightType.TRUNK_MAP) {
                        GIns.audioMgr.playMusic("KPAbgm2")
                    }
                    else {
                        GIns.audioMgr.playMusic("KPAbgm1")
                    }
                    return true;
                }
            }
        }

        return false;
    }

    /**判断是否显示战斗通用界面结算框 */
    public isPanelShow(fightType: FightType, args?: { items: NoOwnerItem[] }) {
        if (fightType == FightType.TRIAL) {
            return false
        }
        else if (fightType == FightType.TEAM_INSTANCE) {
            if (!args.items || args.items.length == 0) {
                return false;
            }
            return true;
        }
        return true;
    }

    /****战斗血量保存 */
    private heroHpMap: { [fightType: number]: { [uid: number]: number } } = {}
    public saveHeroHpByFightType(fightType: number, units: HeroUnit): void {
        if (!this.heroHpMap[fightType])
            this.heroHpMap[fightType] = {}
        this.heroHpMap[fightType][units.uid] = units.hp;
    }

    public clearSaveHeroHpByFightType(fightType: number): void {
        delete this.heroHpMap[fightType];
    }

    public getSaveHeroHpByFightType(fightType: number, uid: number): number {
        if (this.heroHpMap[fightType] && this.heroHpMap[fightType][uid] != null)
            return this.heroHpMap[fightType][uid];

        return -1
    }
}